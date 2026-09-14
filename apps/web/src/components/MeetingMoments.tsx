import { useEffect, useRef, useState } from 'react';
import {
  BookmarkPlus,
  Copy,
  ExternalLink,
  Play,
  Share2,
  X,
} from 'lucide-react';
import { formatTime } from '../../../../packages/shared/meeting';
import {
  meetingMomentSchema,
  momentSharePath,
  type MeetingMoment,
} from '../../../../packages/shared/recording';

export type MomentDraft = {
  requestId: number;
  start: number;
  end: number;
};

function storageKey(meetingId: string) {
  return `tavrex:moments:${meetingId}:v1`;
}

function mergeMoments(
  seeded: MeetingMoment[],
  stored: MeetingMoment[],
): MeetingMoment[] {
  const byId = new Map(seeded.map((moment) => [moment.id, moment]));
  stored.forEach((moment) => byId.set(moment.id, moment));
  return [...byId.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function MeetingMoments({
  meetingId,
  duration,
  seededMoments,
  draft,
  onCloseDraft,
  onSeek,
  seekDisabled,
}: {
  meetingId: string;
  duration: number;
  seededMoments: MeetingMoment[];
  draft: MomentDraft | null;
  onCloseDraft: () => void;
  onSeek: (time: number) => void;
  seekDisabled: boolean;
}) {
  const panel = useRef<HTMLElement>(null);
  const [moments, setMoments] = useState(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(meetingId));
      if (!raw) return seededMoments;
      const stored = meetingMomentSchema.array().safeParse(JSON.parse(raw));
      return stored.success
        ? mergeMoments(
            seededMoments,
            stored.data.filter(
              (moment) =>
                moment.meetingId === meetingId &&
                moment.endMs <= duration * 1000,
            ),
          )
        : seededMoments;
    } catch {
      return seededMoments;
    }
  });
  const [saveNotice, setSaveNotice] = useState('');
  const [copyState, setCopyState] = useState<{
    id: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!draft) return;
    window.requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  }, [draft]);

  function saveMoment(moment: MeetingMoment) {
    const next = mergeMoments(seededMoments, [...moments, moment]);
    setMoments(next);
    try {
      const seededIds = new Set(seededMoments.map((item) => item.id));
      window.localStorage.setItem(
        storageKey(meetingId),
        JSON.stringify(next.filter((item) => !seededIds.has(item.id))),
      );
      setSaveNotice('Moment saved to this meeting.');
    } catch {
      setSaveNotice('Moment saved for this visit. Browser storage is unavailable.');
    }
    onCloseDraft();
  }

  async function copyLink(moment: MeetingMoment) {
    const url = new URL(momentSharePath(moment), window.location.origin);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopyState({ id: moment.id, message: 'Link copied' });
    } catch {
      setCopyState({ id: moment.id, message: 'Copy failed — try again' });
    }
  }

  return (
    <section className="moments-card" id="meeting-moments" ref={panel}>
      <div className="moments-heading">
        <span className="moments-mark">
          <BookmarkPlus size={18} />
        </span>
        <div>
          <h2>
            Moments <span>{moments.length}</span>
          </h2>
          <p>Save the part worth returning to or sharing.</p>
        </div>
      </div>

      {draft && (
        <MomentComposer
          key={draft.requestId}
          meetingId={meetingId}
          duration={duration}
          draft={draft}
          onCancel={onCloseDraft}
          onSave={saveMoment}
        />
      )}

      <div className="moment-list" aria-label="Saved moments">
        {moments.length === 0 ? (
          <div className="moment-empty">
            <Share2 size={20} />
            <p>Use a transcript row or the player to save the first moment.</p>
          </div>
        ) : (
          moments.map((moment) => {
            const sharePath = momentSharePath(moment);
            return (
              <article className="moment-item" key={moment.id}>
                <button
                  className="moment-play"
                  aria-label={`Play ${moment.title} at ${formatTime(moment.startMs / 1000)}`}
                  disabled={seekDisabled}
                  onClick={() => onSeek(moment.startMs / 1000)}
                >
                  <Play size={14} />
                </button>
                <div className="moment-copy">
                  <h3>{moment.title}</h3>
                  {moment.note && <p>{moment.note}</p>}
                  <span>
                    {formatTime(moment.startMs / 1000)}–
                    {formatTime(Math.ceil(moment.endMs / 1000))} · Public link includes
                    this range
                  </span>
                </div>
                <div className="moment-actions">
                  <button
                    className="moment-action"
                    onClick={() => void copyLink(moment)}
                    aria-label={`Copy public link for ${moment.title}`}
                  >
                    <Copy size={14} /> Copy link
                  </button>
                  <a
                    className="moment-action"
                    href={sharePath}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open public view for ${moment.title}`}
                  >
                    <ExternalLink size={14} /> Open public view
                  </a>
                  {copyState?.id === moment.id && (
                    <span className="moment-copy-status" role="status">
                      {copyState.message}
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
      {saveNotice && (
        <p className="moment-save-notice" role="status">
          {saveNotice}
        </p>
      )}
    </section>
  );
}

function MomentComposer({
  meetingId,
  duration,
  draft,
  onCancel,
  onSave,
}: {
  meetingId: string;
  duration: number;
  draft: MomentDraft;
  onCancel: () => void;
  onSave: (moment: MeetingMoment) => void;
}) {
  const [title, setTitle] = useState(`Moment at ${formatTime(draft.start)}`);
  const [note, setNote] = useState('');
  const [start, setStart] = useState(String(Number(draft.start.toFixed(3))));
  const [end, setEnd] = useState(String(Number(draft.end.toFixed(3))));
  const [formError, setFormError] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const startSeconds = Number(start);
    const endSeconds = Number(end);
    if (
      !Number.isFinite(startSeconds) ||
      !Number.isFinite(endSeconds) ||
      startSeconds < 0 ||
      endSeconds <= startSeconds ||
      endSeconds > duration ||
      endSeconds - startSeconds > 60
    ) {
      setFormError(
        `Choose a range up to 60 seconds between 0:00 and ${formatTime(duration)}.`,
      );
      return;
    }
    const parsed = meetingMomentSchema.safeParse({
      id: crypto.randomUUID(),
      meetingId,
      startMs: Math.round(startSeconds * 1000),
      endMs: Math.round(endSeconds * 1000),
      title: title.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) {
      setFormError('Add a short title before saving this moment.');
      return;
    }
    onSave(parsed.data);
  }

  return (
    <form className="moment-composer" onSubmit={submit} noValidate>
      <div className="moment-composer-heading">
        <div>
          <span className="small-label">NEW MOMENT</span>
          <h3>Capture this part of the conversation</h3>
        </div>
        <button
          type="button"
          className="moment-close"
          onClick={onCancel}
          aria-label="Cancel moment"
        >
          <X size={17} />
        </button>
      </div>
      <label className="moment-title-field">
        Title
        <input
          value={title}
          maxLength={100}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </label>
      <label className="moment-note-field">
        Note <span>optional</span>
        <textarea
          value={note}
          maxLength={280}
          rows={2}
          placeholder="Why will this matter later?"
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      <div className="moment-range-fields">
        <label>
          Start (seconds)
          <input
            type="number"
            min="0"
            max={duration}
            step="0.001"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </label>
        <span aria-hidden="true">→</span>
        <label>
          End (seconds)
          <input
            type="number"
            min="0.001"
            max={duration}
            step="0.001"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </label>
        <span className="moment-range-preview">
          {formatTime(Number(start) || 0)}–
          {formatTime(Math.ceil(Number(end) || 0))}
        </span>
      </div>
      {formError && (
        <p className="moment-form-error" role="alert">
          {formError}
        </p>
      )}
      <p className="moment-share-hint">
        Anyone with the public link can view this title, note, range, and its
        transcript context.
      </p>
      <div className="moment-form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-button">
          <BookmarkPlus size={15} /> Save moment
        </button>
      </div>
    </form>
  );
}
