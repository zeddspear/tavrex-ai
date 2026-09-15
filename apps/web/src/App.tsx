import { useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  FileText,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  filterMeetings,
  formatTime,
  type Meeting,
} from '../../../packages/shared/meeting';
import {
  searchMeeting,
  searchMeetingLibrary,
} from '../../../packages/shared/search';
import { meetings } from './data/meetings';
import { searchDocuments } from './data/searchDocuments';
import {
  HighlightText,
  MeetingSearchResults,
} from './components/MeetingSearch';
import { RecordingMeeting } from './components/RecordingMeeting';
import { SharedMoment } from './components/SharedMoment';
import {
  UploadMeeting,
  UploadedLibrary,
  UploadedMeetingDetail,
} from './components/UploadMeeting';

function Brand() {
  return (
    <Link className="brand" to="/app" aria-label="Tavrex AI home">
      <span className="brand-mark">
        <AudioLines size={22} />
      </span>
      <span>
        tavrex<span className="brand-ai">AI</span>
      </span>
    </Link>
  );
}

function About() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="help-button">
        <CircleHelp size={17} /> About this demo <ChevronRight size={15} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>Meet your meeting workspace.</Dialog.Title>
          <Dialog.Description>
            Explore a real reference recording alongside original synthetic
            meeting examples.
          </Dialog.Description>
          <div className="about-body">
            <p>
              Search and filter the library, then open a meeting to explore its
              overview. The recorded demo includes playback and its imported
              transcript. Synthetic examples are labeled individually.
            </p>
            <p>
              Three prepared summary views, sourced action items, and public
              timestamped moments are available for the recorded demo. Upload
              processing is an upcoming checkpoint.
            </p>
            <p>No account is required. No private meeting data is exposed.</p>
          </div>
          <Dialog.Close
            className="icon-button dialog-close"
            aria-label="Close about dialog"
          >
            <X size={20} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          <Link to="/app" className="nav-link active">
            <LayoutGrid size={18} /> Meetings <span>{meetings.length}</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <ShieldCheck size={19} />
            <strong>A space to explore</strong>
            <p>
              Real and sample meetings.
              <br />
              No account needed.
            </p>
            <span className="small-label">ASSESSMENT DEMO</span>
          </div>
          <About />
          <div className="workspace-user">
            <span className="avatar guest">G</span>
            <div>
              <strong>Guest workspace</strong>
              <small>Public demo</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="page-column">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <span>Meetings</span>
          </div>
          <span className="demo-badge">
            <span /> Demo workspace
          </span>
        </header>
        <main id="main">{children}</main>
        <footer>
          Made for the moments that matter.
          <span>TAVREX AI · ASSESSMENT BUILD</span>
        </footer>
      </div>
    </div>
  );
}

function Avatars({ names }: { names: string[] }) {
  return (
    <div
      className="participants"
      aria-label={`Participants: ${names.join(', ')}`}
    >
      <div className="avatar-stack">
        {names.map((name, index) => (
          <span key={name} title={name} className={`avatar color-${index}`}>
            {name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
        ))}
      </div>
      <span>{names.length} people</span>
    </div>
  );
}

function Dashboard() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All meetings');
  const [sort, setSort] = useState('newest');
  useEffect(() => {
    document.title = 'Meetings · Tavrex AI';
  }, []);
  const normalizedQuery = query.trim();
  const filtered = filterMeetings(meetings, '', category).sort((a, b) =>
    sort === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date),
  );
  const searchResults = searchMeetingLibrary(
    meetings,
    searchDocuments,
    normalizedQuery,
    category,
  ).sort((a, b) =>
    sort === 'newest'
      ? b.meeting.date.localeCompare(a.meeting.date)
      : a.meeting.date.localeCompare(b.meeting.date),
  );
  const visibleCount = normalizedQuery ? searchResults.length : filtered.length;
  const featured = meetings[0];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">A LITTLE CLARITY, AFTER EVERY CALL</div>
          <h1>
            Your conversations.
            <br className="mobile-break" /> All connected.
          </h1>
          <p>The ideas, decisions, and next steps worth coming back to.</p>
        </div>
        <span className="library-count">
          <AudioLines size={18} /> {meetings.length} meetings in your library
        </span>
      </div>
      <div className="dashboard-upload">
        <Link className="primary-button" to="/app/upload">
          Upload recording <ArrowRight size={16} />
        </Link>
      </div>
      <section className="featured" aria-labelledby="featured-title">
        <div className="featured-copy">
          <div className="feature-kicker">
            <span className="sparkle-box">
              <Sparkles size={16} />
            </span>{' '}
            PICK UP WHERE THE CONVERSATION LEFT OFF
          </div>
          <h2 id="featured-title">{featured.title}</h2>
          <p>{featured.summary}</p>
          <Link className="primary-button" to={`/app/meetings/${featured.id}`}>
            Explore meeting <ArrowRight size={16} />
          </Link>
          <span className="feature-disclosure">
            {featured.provenance === 'reference-recording'
              ? 'Real recording · Imported transcript'
              : 'Synthetic demo · Sample analysis'}
          </span>
        </div>
        <div className="conversation-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-card art-source">
            <span className="art-icon">
              <AudioLines size={20} />
            </span>
            <div>
              <strong>A good conversation</strong>
              <span className="waveform">
                {Array.from({ length: 23 }, (_, i) => (
                  <i
                    key={i}
                    style={{ height: `${8 + ((i * 13 + 7) % 22)}px` }}
                  />
                ))}
              </span>
            </div>
            <span className="art-time">{formatTime(featured.duration)}</span>
          </div>
          <div className="art-connector" />
          <div className="art-card art-outcome">
            <span className="art-check">
              <Check size={17} />
            </span>
            <div>
              <strong>A clear next step</strong>
              <small>Start small. Make it useful.</small>
            </div>
            <Sparkles size={17} />
          </div>
          <span className="art-caption">
            LESS NOTE-TAKING. MORE UNDERSTANDING.
          </span>
        </div>
      </section>
      <section className="library" aria-labelledby="library-title">
        <div className="section-heading">
          <h2 id="library-title">
            Meeting library <span>{meetings.length}</span>
          </h2>
          <span className="muted">A little context goes a long way.</span>
        </div>
        <div className="library-toolbar">
          <div className="filters" aria-label="Filter meetings">
            {['All meetings', 'Product', 'Customer', 'Design'].map((item) => (
              <button
                key={item}
                className={category === item ? 'filter selected' : 'filter'}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="library-controls">
            <div className="search-input">
              <Search size={17} />
              <input
                aria-label="Search meetings"
                placeholder="Search titles, summaries, transcripts…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  aria-label="Clear search"
                  className="clear-search"
                  onClick={() => setQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <label className="sort-control">
              <ArrowDown size={15} />
              <span className="sr-only">Sort meetings</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>
        {!normalizedQuery && (
          <div className="list-header">
            <span>CONVERSATION</span>
            <span>PARTICIPANTS</span>
            <span>DURATION</span>
            <span>DATE</span>
            <span />
          </div>
        )}
        <div className="meeting-list" aria-live="polite">
          {normalizedQuery && searchResults.length ? (
            <MeetingSearchResults
              results={searchResults}
              query={normalizedQuery}
            />
          ) : !normalizedQuery && filtered.length ? (
            filtered.map((meeting) => (
              <MeetingRow key={meeting.id} meeting={meeting} />
            ))
          ) : (
            <div className="empty-state">
              <Search size={30} />
              <h3>No meetings found</h3>
              <p>
                Try a different title, summary phrase, transcript quote, or
                participant.
              </p>
              <button
                className="secondary-button"
                onClick={() => {
                  setQuery('');
                  setCategory('All meetings');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <div className="library-footer">
          <span>
            Showing {visibleCount} of {meetings.length} meetings
          </span>
          <span>
            <ShieldCheck size={14} /> 1 real recording · 3 synthetic examples
          </span>
        </div>
      </section>
      <UploadedLibrary query={query} />
      <div className="bottom-note">
        <span className="note-icon">
          <FileText size={19} />
        </span>
        <div>
          <strong>Your meetings, with a little more meaning.</strong>
          <p>
            Play the recorded demo, compare three summary views, and trace every
            action back to the conversation.
          </p>
        </div>
        <span className="small-label">EVIDENCE FIRST</span>
      </div>
    </>
  );
}

function MeetingRow({ meeting }: { meeting: Meeting }) {
  return (
    <Link className="meeting-row" to={`/app/meetings/${meeting.id}`}>
      <div className="meeting-name">
        <span className={`meeting-icon ${meeting.category.toLowerCase()}`}>
          <AudioLines size={21} />
        </span>
        <div>
          <div className="meeting-title">
            {meeting.title}
            <span className="category-tag">
              {meeting.provenance === 'reference-recording'
                ? 'Recorded demo'
                : meeting.category}
            </span>
          </div>
          <p>{meeting.summary}</p>
          <span className="mobile-meta">
            {formatTime(meeting.duration)} · {meeting.participants.length}{' '}
            participants
          </span>
        </div>
      </div>
      <Avatars names={meeting.participants} />
      <span className="duration">
        <Clock3 size={14} />
        {formatTime(meeting.duration)}
      </span>
      <span className="date">
        {new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(meeting.date))}
        <small>2026</small>
      </span>
      <ChevronRight size={17} className="row-arrow" />
    </Link>
  );
}

function MeetingPreview() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const meeting = meetings.find((item) => item.id === id);
  const searchQuery = searchParams.get('q')?.trim() ?? '';
  const timestampParameter = searchParams.get('t');
  const requestedTimestamp = Number(timestampParameter);
  const searchDocument = searchDocuments.find(
    (document) => document.meetingId === meeting?.id,
  );
  const searchMatches = meeting
    ? searchMeeting(meeting, searchDocument, searchQuery)
    : [];
  const initialSeek =
    meeting &&
    timestampParameter !== null &&
    Number.isFinite(requestedTimestamp) &&
    requestedTimestamp >= 0 &&
    requestedTimestamp <= meeting.duration
      ? requestedTimestamp
      : undefined;
  const [copyState, setCopyState] = useState('Copy overview');
  useEffect(() => {
    document.title = `${meeting?.title ?? 'Meeting not found'} · Tavrex AI`;
  }, [meeting]);
  useEffect(() => {
    if (!searchQuery || meeting?.provenance === 'reference-recording') return;
    window.requestAnimationFrame(() =>
      document
        .getElementById('search-context')
        ?.scrollIntoView({ block: 'start', behavior: 'auto' }),
    );
  }, [meeting, searchQuery]);
  if (!meeting)
    return id && /^[a-f0-9-]{36}$/.test(id) ? (
      <UploadedMeetingDetail key={id} id={id} />
    ) : (
      <NotFound />
    );
  if (meeting.provenance === 'reference-recording')
    return (
      <RecordingMeeting
        key={`${meeting.id}-${initialSeek ?? 'start'}`}
        meeting={meeting}
        initialSeek={initialSeek}
        searchQuery={searchQuery}
      />
    );
  async function copyOverview() {
    if (!meeting) return;
    try {
      await navigator.clipboard.writeText(
        `${meeting.title}\nSynthetic demo / sample analysis\n\n${meeting.summary}\n\n${meeting.takeaways.join('\n')}`,
      );
      setCopyState('Copied');
    } catch {
      setCopyState('Copy failed — try again');
    }
  }
  return (
    <>
      <Link to="/app" className="back-link">
        <ArrowLeft size={16} /> All meetings
      </Link>
      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            {meeting.category.toUpperCase()} · SYNTHETIC DEMO
          </div>
          <h1>{meeting.title}</h1>
          <div className="detail-meta">
            <span>
              <Clock3 size={15} />
              {formatTime(meeting.duration)} sample duration
            </span>
            <span>
              <Users size={15} />
              {meeting.participants.length} participants
            </span>
          </div>
        </div>
        <button
          className="secondary-button"
          onClick={() => void copyOverview()}
        >
          <Copy size={16} />
          <span aria-live="polite">{copyState}</span>
        </button>
      </div>
      <div className="preview-banner">
        <ShieldCheck size={18} />
        <p>
          Original synthetic meeting with sample analysis. Full recording
          playback and a complete transcript are not available for this example.
        </p>
      </div>
      {searchQuery && searchMatches.length > 0 && (
        <section
          className="meeting-search-context"
          id="search-context"
          aria-labelledby="meeting-search-context-title"
        >
          <div className="meeting-search-context-heading">
            <span>
              <Search size={17} />
            </span>
            <div>
              <span className="small-label">OPENED FROM SEARCH</span>
              <h2 id="meeting-search-context-title">
                Matching conversation context
              </h2>
            </div>
          </div>
          <p className="meeting-search-query">
            Showing evidence for “{searchQuery}”. Synthetic excerpts remain
            clearly labeled and do not imply available media.
          </p>
          <div className="meeting-search-context-list">
            {searchMatches.slice(0, 3).map((match) => (
              <article key={match.id}>
                <div>
                  <span>{match.kind}</span>
                  {match.speaker && <strong>{match.speaker}</strong>}
                  {match.timestamp !== undefined && (
                    <time>{formatTime(match.timestamp)} sample timestamp</time>
                  )}
                </div>
                <p>
                  <HighlightText text={match.text} query={searchQuery} />
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="overview-grid">
        <section className="overview-card">
          <div className="card-heading">
            <Sparkles size={19} />
            <h2>Meeting overview</h2>
            <span className="small-label">SAMPLE ANALYSIS</span>
          </div>
          <p className="lead-summary">{meeting.summary}</p>
          <h3>What matters</h3>
          <ol className="takeaways">
            {meeting.takeaways.map((text, index) => (
              <li key={text}>
                <span>0{index + 1}</span>
                {text}
              </li>
            ))}
          </ol>
        </section>
        <aside className="overview-card">
          <div className="card-heading">
            <Users size={19} />
            <h2>In the conversation</h2>
          </div>
          <div className="person-list">
            {meeting.participants.map((name, index) => (
              <div key={name}>
                <span className={`avatar color-${index}`}>
                  {name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
                <span>
                  {name}
                  <small>Fictional demo participant</small>
                </span>
              </div>
            ))}
          </div>
          <div className="next-step-note">
            <FileText size={18} />
            <p>
              Search can open labeled excerpts from this synthetic conversation.
              The recorded demo includes source-linked playback and action
              items.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <div className="empty-state not-found">
      <FileText size={34} />
      <h1>Meeting not found</h1>
      <p>This link doesn’t point to a meeting in the demo workspace.</p>
      <Link className="primary-button" to="/app">
        Back to meetings <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/share/:token" element={<SharedMoment />} />
      <Route
        path="*"
        element={
          <Shell>
            <Routes>
              <Route path="/" element={<Navigate to="/app" replace />} />
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/upload" element={<UploadMeeting />} />
              <Route path="/app/meetings/:id" element={<MeetingPreview />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  );
}
