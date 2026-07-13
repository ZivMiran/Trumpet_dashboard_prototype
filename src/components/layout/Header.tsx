import { useApp } from '../../context/AppContext';
import { pageMeta } from '../../data/overview';
import { catalog } from '../../data/catalog';
import { notifications } from '../../data/notifications';
import { SearchIcon, BellIcon, NoteIcon, DownloadIcon } from '../icons';
import './Header.css';

export function Header() {
  const { state, update } = useApp();
  const { page, query, notifOpen, readAll } = state;
  const [pageTitle, pageSubtitle] = pageMeta[page];

  const unreadCount = notifications.filter((n) => n.unread && !readAll).length;
  const hasUnread = unreadCount > 0;

  const q = query.trim().toLowerCase();
  const searchResults = q
    ? catalog
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => (r.title + ' ' + r.album).toLowerCase().includes(q))
        .map(({ r, i }) => ({ ...r, i }))
    : [];
  const hasQuery = q.length > 0;
  const noResults = hasQuery && searchResults.length === 0;

  const goToResult = (i: number) =>
    catalog[i].coll
      ? update({ page: 'music', albumSel: i, sel: null, selTrack: null, query: '' })
      : update({ page: 'music', sel: i, selTrack: null, albumSel: null, query: '' });
  const clearSearch = () => update({ query: '' });
  const toggleNotif = () => update((s) => ({ notifOpen: !s.notifOpen }));

  return (
    <header className="header">
      {/* Keyed by page so the title settles in on every navigation. */}
      <div className="header__title-block" key={page}>
        <div className="header__title">{pageTitle}</div>
        <div className="header__subtitle">{pageSubtitle}</div>
      </div>

      <div className="header__search">
        <div className="header__search-box">
          <SearchIcon />
          <input
            className="header__search-input"
            value={query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search releases, songs, albums…"
          />
        </div>
        {hasQuery && (
          <>
            <div className="search-scrim" onClick={clearSearch} />
            <div className="search-results">
              {searchResults.map((r) => (
                <button key={r.title} type="button" className="search-result-row" onClick={() => goToResult(r.i)}>
                  <div className="search-result-row__icon"><NoteIcon /></div>
                  <div className="search-result-row__body">
                    <div className="search-result-row__title">{r.title}</div>
                    <div className="search-result-row__album">{r.album}</div>
                  </div>
                  <div className="search-result-row__streams">{r.streams}</div>
                </button>
              ))}
              {noResults && <div className="search-no-results">No matches for "{query}"</div>}
            </div>
          </>
        )}
      </div>

      <div className="header__actions">
        <button
          type="button"
          className={`bell-btn ${notifOpen ? 'bell-btn--open' : ''}`}
          onClick={toggleNotif}
        >
          <BellIcon />
          {hasUnread && <div className="bell-btn__dot" />}
        </button>
        <button type="button" className="export-btn">
          <DownloadIcon />
          Export
        </button>
      </div>
    </header>
  );
}
