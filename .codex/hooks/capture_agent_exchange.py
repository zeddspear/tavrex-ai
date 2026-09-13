#!/usr/bin/env python3
"""Capture Codex prompts and final responses in the 8x assignment format."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TOOL_NAME = "codex-cli"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )


def safe_component(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-.")
    return cleaned or "unknown"


def repository_root(cwd: str) -> Path:
    current = Path(cwd).resolve()
    for candidate in (current, *current.parents):
        if (candidate / ".git").exists():
            return candidate
    raise RuntimeError(f"could not find repository root from {cwd!r}")


def git_output(root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(root), *args],
        check=False,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else ""


def github_author(root: Path) -> str:
    remote = git_output(root, "remote", "get-url", "origin")
    match = re.search(r"github\.com[/:]([^/]+)/", remote)
    if match:
        return match.group(1)
    return git_output(root, "config", "user.name") or "unknown"


def find_log(log_dir: Path, session_id: str) -> Path | None:
    suffix = f"_{safe_component(session_id)}.md"
    matches = sorted(path for path in log_dir.glob(f"*{suffix}") if path.is_file())
    return matches[-1] if matches else None


def front_matter(
    *,
    session_id: str,
    date: str,
    author: str,
    model: str,
    project: str,
    total_exchanges: int,
    first_prompt_time: str,
    last_prompt_time: str,
) -> str:
    return (
        "---\n"
        f"session_id: {session_id}\n"
        f"date: {date}\n"
        f"author: {author}\n"
        f"model: {model}\n"
        f"tool: {TOOL_NAME}\n"
        f"project: {project}\n"
        f"total_exchanges: {total_exchanges}\n"
        f"first_prompt_time: {first_prompt_time}\n"
        f"last_prompt_time: {last_prompt_time}\n"
        "---\n"
    )


def create_log(
    root: Path,
    log_dir: Path,
    event: dict[str, Any],
    timestamp: str,
) -> Path:
    session_id = str(event["session_id"])
    date = timestamp[:10]
    stamp = timestamp[:19].replace("T", "_").replace(":", "-")
    path = log_dir / f"{stamp}_{safe_component(session_id)}.md"
    author = github_author(root)
    model = str(event.get("model") or "unknown")
    project = root.name
    header = front_matter(
        session_id=session_id,
        date=date,
        author=author,
        model=model,
        project=project,
        total_exchanges=0,
        first_prompt_time=timestamp,
        last_prompt_time=timestamp,
    )
    body = (
        f"\n# Session Log - {date}\n\n"
        f"Session: `{session_id[:8]}` | Project: `{project}` | Author: `{author}`\n\n"
        "---\n\n"
    )
    path.write_text(header + body, encoding="utf-8")
    return path


def update_summary(path: Path, total: int, last_prompt_time: str, model: str) -> None:
    content = path.read_text(encoding="utf-8")
    content = re.sub(
        r"(?m)^total_exchanges: .*?$", f"total_exchanges: {total}", content, count=1
    )
    content = re.sub(
        r"(?m)^last_prompt_time: .*?$",
        f"last_prompt_time: {last_prompt_time}",
        content,
        count=1,
    )
    content = re.sub(r"(?m)^model: .*?$", f"model: {model}", content, count=1)
    temporary = path.with_suffix(".md.tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def entry_numbers(content: str, entry_type: str) -> set[int]:
    pattern = rf"\[LOG_ENTRY type={entry_type} num=(\d+) session="
    return {int(value) for value in re.findall(pattern, content)}


def append_prompt(root: Path, event: dict[str, Any], timestamp: str) -> None:
    log_dir = root / ".agent-logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    session_id = str(event["session_id"])
    model = str(event.get("model") or "unknown")
    path = find_log(log_dir, session_id)
    if path is None:
        path = create_log(root, log_dir, event, timestamp)

    content = path.read_text(encoding="utf-8")
    prompt_numbers = entry_numbers(content, "PROMPT")
    number = max(prompt_numbers, default=0) + 1
    prompt = str(event.get("prompt") or "")
    entry = (
        f"[LOG_ENTRY type=PROMPT num={number} session={session_id[:8]}]\n"
        f"timestamp: {timestamp}\n"
        f"model: {model}\n\n"
        f"{prompt}\n\n\n"
    )
    with path.open("a", encoding="utf-8") as stream:
        stream.write(entry)
    update_summary(path, number, timestamp, model)


def append_response(root: Path, event: dict[str, Any], timestamp: str) -> None:
    log_dir = root / ".agent-logs"
    if not log_dir.exists():
        return
    session_id = str(event["session_id"])
    path = find_log(log_dir, session_id)
    if path is None:
        return

    content = path.read_text(encoding="utf-8")
    prompt_numbers = entry_numbers(content, "PROMPT")
    response_numbers = entry_numbers(content, "RESPONSE")
    pending = sorted(prompt_numbers - response_numbers)
    if not pending:
        return

    number = pending[-1]
    model = str(event.get("model") or "unknown")
    response = str(event.get("last_assistant_message") or "")
    entry = (
        f"[LOG_ENTRY type=RESPONSE num={number} session={session_id[:8]}]\n"
        f"timestamp: {timestamp}\n"
        f"model: {model}\n\n"
        f"{response}\n\n\n"
    )
    with path.open("a", encoding="utf-8") as stream:
        stream.write(entry)


def main() -> int:
    event = json.load(sys.stdin)
    root = repository_root(str(event.get("cwd") or Path.cwd()))
    timestamp = utc_now()
    event_name = event.get("hook_event_name")
    if event_name == "UserPromptSubmit":
        append_prompt(root, event, timestamp)
    elif event_name == "Stop":
        append_response(root, event, timestamp)

    # Stop hooks require JSON on stdout. An empty object is also harmless for prompt hooks.
    print("{}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"agent capture failed: {error}", file=sys.stderr)
        raise SystemExit(1)
