import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AudioLines,
  BookmarkPlus,
  Clock3,
  FileText,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react';
import { formatTime, type Meeting } from '../../../../packages/shared/meeting';
import {
  activeSegment,
  boundedTime,
  momentRange,
  recordingSchema,
  type Recording,
} from '../../../../packages/shared/recording';
import { MeetingIntelligence } from './MeetingIntelligence';
import { MeetingMoments, type MomentDraft } from './MeetingMoments';
import './recording.css';

export function RecordingMeeting({
  meeting,
  initialSeek,
  searchQuery,
}: {
  meeting: Meeting;
  initialSeek?: number;
  searchQuery?: string;
}) {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let disposed = false;
    async function load() {
      try {
        const response = await fetch(`/recordings/${meeting.id}.json`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Recording unavailable');
        const result = recordingSchema.parse(await response.json());
        if (!disposed) setRecording(result);
      } catch {
        if (!disposed) setError(true);
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [meeting.id, attempt]);

  return (
    <>
      <Link to="/app" className="back-link">
        <ArrowLeft size={16} /> All meetings
      </Link>
      <div className="detail-heading recording-heading">
        <div>
          <div className="eyebrow">RECORDED DEMO · SEPTEMBER 13, 2026</div>
          <h1>{meeting.title}</h1>
          <div className="detail-meta">
            <span>
              <Clock3 size={15} />
              {formatTime(meeting.duration)}
            </span>
            <span>
              <Users size={15} />
              Two speakers
            </span>
            <span className="recording-ready">
              <span />
              Recording available
            </span>
          </div>
        </div>
        <span className="source-badge">
          <AudioLines size={16} /> Real recording
        </span>
      </div>
      {error ? (
        <section className="recording-load-state" role="alert">
          <FileText size={30} />
          <h2>We couldn’t load this meeting</h2>
          <p>
            Check your connection and try again. Your meeting is still in the
            library.
          </p>
          <button
            className="secondary-button"
            onClick={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          >
            <RotateCcw size={16} /> Retry meeting
          </button>
        </section>
      ) : recording ? (
        <RecordingExperience
          key={meeting.id}
          recording={recording}
          initialSeek={initialSeek}
          searchQuery={searchQuery}
        />
      ) : (
        <section className="recording-load-state" role="status">
          <LoaderCircle className="loading-icon" size={26} />
          <h2>Loading your conversation</h2>
          <p>Fetching the recording details and timestamped transcript…</p>
        </section>
      )}
    </>
  );
}

function RecordingExperience({
  recording,
  initialSeek,
  searchQuery,
}: {
  recording: Recording;
  initialSeek?: number;
  searchQuery?: string;
}) {
  const initialTime = boundedTime(initialSeek ?? 0, recording.duration);
  const video = useRef<HTMLVideoElement>(null);
  const pendingSeek = useRef<number | null>(
    initialSeek === undefined ? null : initialTime,
  );
  const transcript = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState(recording.duration);
  const [playing, setPlaying] = useState(false);
  const [state, setState] = useState<
    'loading' | 'ready' | 'buffering' | 'error'
  >('loading');
  const [speed, setSpeed] = useState(1);
  const [follow, setFollow] = useState(true);
  const [notice, setNotice] = useState('');
  const [mediaAttempt, setMediaAttempt] = useState(0);
  const [momentDraft, setMomentDraft] = useState<MomentDraft | null>(null);
  const momentRequest = useRef(0);
  const activeId = activeSegment(recording.segments, time);

  useEffect(() => {
    if (!follow || !playing || !activeId) return;
    const container = transcript.current;
    const row = container?.querySelector<HTMLElement>(
      `[data-segment-id="${CSS.escape(activeId)}"]`,
    );
    row?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, [activeId, follow, playing]);

  useEffect(() => {
    if (state !== 'loading' && state !== 'buffering') return;
    const timer = window.setTimeout(
      () =>
        setNotice(
          'The recording is taking longer than usual. Check your connection or reload the recording.',
        ),
      15000,
    );
    return () => window.clearTimeout(timer);
  }, [state, mediaAttempt]);

  function seek(timestamp: number) {
    const element = video.current;
    if (!element || state === 'error') return;
    const next = boundedTime(timestamp, duration);
    setNotice('');
    if (element.readyState < 1) pendingSeek.current = next;
    else element.currentTime = next;
    setTime(next);
  }

  function ready() {
    const element = video.current;
    if (!element) return;
    if (Number.isFinite(element.duration)) setDuration(element.duration);
    element.playbackRate = speed;
    if (pendingSeek.current !== null) {
      element.currentTime = boundedTime(pendingSeek.current, element.duration);
      pendingSeek.current = null;
    }
    setNotice('');
    setState('ready');
  }

  function retryMedia() {
    setMediaAttempt((value) => value + 1);
    pendingSeek.current = time;
    setNotice('');
    setPlaying(false);
    setState('loading');
    video.current?.load();
  }

  async function togglePlayback() {
    if (!video.current) return;
    if (!video.current.paused) {
      video.current.pause();
      return;
    }
    try {
      await video.current.play();
      setNotice('');
    } catch {
      setNotice(
        'Playback couldn’t start. Try Play again or use the video controls.',
      );
    }
  }

  function prepareMoment(start: number, selectedEnd?: number) {
    momentRequest.current += 1;
    const range = momentRange(start, duration, selectedEnd);
    setMomentDraft({
      requestId: momentRequest.current,
      start: range.startMs / 1000,
      end: range.endMs / 1000,
    });
  }

  function showSearchContext() {
    if (initialSeek === undefined) return;
    seek(initialSeek);
    const segmentId = activeSegment(recording.segments, initialSeek);
    const row = segmentId
      ? transcript.current?.querySelector<HTMLElement>(
          `[data-segment-id="${CSS.escape(segmentId)}"]`,
        )
      : null;
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  return (
    <div className="recording-layout">
      <section className="recording-column" aria-label="Meeting recording">
        {searchQuery && initialSeek !== undefined && (
          <div className="recording-search-arrival" id="search-context">
            <span>
              <Search size={16} /> Transcript match
            </span>
            <p>
              Opened at {formatTime(initialSeek)} for “{searchQuery}”.
            </p>
            <button onClick={showSearchContext}>View transcript context</button>
          </div>
        )}
        <div className="player-frame">
          <video
            ref={video}
            controls
            playsInline
            preload="metadata"
            poster={recording.posterUrl}
            src={recording.mediaUrl}
            aria-label="Demo meeting recording"
            onLoadedMetadata={ready}
            onCanPlay={() => {
              setState('ready');
              setNotice('');
            }}
            onTimeUpdate={() => setTime(video.current?.currentTime ?? 0)}
            onSeeking={() => {
              setTime(video.current?.currentTime ?? 0);
              setState('buffering');
            }}
            onSeeked={() => {
              if ((video.current?.readyState ?? 0) >= 2) {
                setState('ready');
                setNotice('');
              }
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onWaiting={() => setState('buffering')}
            onPlaying={() => setState('ready')}
            onError={() => {
              setState('error');
              setPlaying(false);
            }}
          />
          {state === 'error' && (
            <div className="media-error" role="alert">
              <FileText size={28} />
              <h2>Recording couldn’t load</h2>
              <p>Your transcript is still available.</p>
              <button className="secondary-button" onClick={retryMedia}>
                <RotateCcw size={16} /> Retry recording
              </button>
            </div>
          )}
        </div>
        <div className="player-toolbar">
          <button
            className="transport-button"
            aria-label={playing ? 'Pause recording' : 'Play recording'}
            disabled={state === 'error'}
            onClick={() => void togglePlayback()}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <span className="playback-time" aria-label="Playback position">
            {formatTime(time)} <span>/ {formatTime(Math.ceil(duration))}</span>
          </span>
          <button
            className="save-current-moment"
            onClick={() => prepareMoment(time)}
            aria-label={`Save current moment at ${formatTime(time)}`}
          >
            <BookmarkPlus size={15} /> Save moment
          </button>
          <label className="speed-control">
            Speed
            <select
              aria-label="Playback speed"
              value={speed}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSpeed(value);
                if (video.current) video.current.playbackRate = value;
              }}
            >
              {[0.75, 1, 1.25, 1.5, 2].map((value) => (
                <option key={value} value={value}>
                  {value}×
                </option>
              ))}
            </select>
          </label>
        </div>
        {(state === 'loading' || state === 'buffering') && (
          <div className="media-status" role="status">
            <LoaderCircle size={15} className="loading-icon" />
            {state === 'loading'
              ? 'Loading recording…'
              : 'Buffering recording…'}
          </div>
        )}
        {notice && (
          <div className="media-status" role="status">
            <p>{notice}</p>
            <button onClick={retryMedia} className="secondary-button">
              Reload recording
            </button>
          </div>
        )}
        <div className="recording-context">
          <div className="card-heading">
            <AudioLines size={19} />
            <h2>A quick recording walkthrough</h2>
          </div>
          <p>
            A short demonstration of recording controls and what happens after a
            call. Play the conversation, then use a transcript timestamp to
            return to the source.
          </p>
          <details className="source-note">
            <summary>About this recording</summary>
            <p>
              Supplied Fathom reference demo, with an imported transcript.
              Personal on-screen labels are removed from this public copy. This
              is real recorded media, not a Tavrex-generated transcription.
            </p>
          </details>
        </div>
        <MeetingMoments
          meetingId={recording.id}
          duration={duration}
          seededMoments={recording.moments}
          draft={momentDraft}
          onCloseDraft={() => setMomentDraft(null)}
          onSeek={seek}
          seekDisabled={state === 'error'}
        />
      </section>
      <MeetingIntelligence
        intelligence={recording.intelligence}
        onSeek={seek}
        seekDisabled={state === 'error'}
      />
      <section className="transcript-panel" aria-labelledby="transcript-title">
        <div className="transcript-header">
          <div>
            <h2 id="transcript-title">
              Transcript <span>{recording.segments.length} turns</span>
            </h2>
            <p>Click a timestamp to hear it in context.</p>
          </div>
          <label className="follow-control">
            <input
              type="checkbox"
              checked={follow}
              onChange={(event) => setFollow(event.target.checked)}
            />
            Follow playback
          </label>
        </div>
        <div
          className="transcript-scroll"
          ref={transcript}
          tabIndex={0}
          aria-label="Timestamped transcript"
        >
          <div className="transcript-source">
            <FileText size={14} /> Imported transcript · Original speaker
            timestamps
          </div>
          {recording.segments.length === 0 ? (
            <div className="transcript-empty">
              <FileText size={26} />
              <h3>No transcript available</h3>
              <p>You can still listen to the recording using the player.</p>
            </div>
          ) : (
            recording.segments.map((segment) => (
              <article
                key={segment.id}
                data-segment-id={segment.id}
                className={`transcript-turn ${activeId === segment.id ? 'is-active' : ''}`}
                aria-label={`${recording.speakers.find((speaker) => speaker.id === segment.speakerId)?.name} at ${formatTime(segment.start)}`}
              >
                <div className="turn-heading">
                  <span
                    className={`speaker-dot ${segment.speakerId === 'presenter' ? '' : 'speaker-two'}`}
                  />
                  <strong>
                    {
                      recording.speakers.find(
                        (speaker) => speaker.id === segment.speakerId,
                      )?.name
                    }
                  </strong>
                  <button
                    className="moment-trigger"
                    aria-label={`Save moment from transcript at ${formatTime(segment.start)}`}
                    onClick={() =>
                      prepareMoment(
                        segment.start,
                        Math.min(segment.start + 30, segment.end),
                      )
                    }
                  >
                    <BookmarkPlus size={13} />
                    <span>Save moment</span>
                  </button>
                  <button
                    className="timestamp-button"
                    aria-label={`Seek to ${formatTime(segment.start)}`}
                    aria-current={activeId === segment.id ? 'true' : undefined}
                    disabled={state === 'error'}
                    onClick={() => seek(segment.start)}
                  >
                    <Play size={11} />
                    {formatTime(segment.start)}
                  </button>
                </div>
                <div className="turn-text">
                  {segment.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
        <div className="transcript-footer">
          <span className="speaker-dot" /> Presenter{' '}
          <span className="speaker-dot speaker-two" /> Participant
          <span className="transcript-end">End of transcript</span>
        </div>
      </section>
    </div>
  );
}
