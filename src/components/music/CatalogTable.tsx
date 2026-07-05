import { Fragment, useState, type MouseEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { catalog, collections } from '../../data/catalog';
import { parseAdds } from '../../lib/format';
import { trendRank, typeOf, typeRank, typeDotOf } from '../../lib/music';
import { asset } from '../../lib/assets';
import type { TrackFormat } from '../../types';
import './CatalogTable.css';

const fmtOptions: { label: string; value: 'All' | TrackFormat }[] = [
  { label: 'All', value: 'All' },
  { label: 'Singles', value: 'Single' },
  { label: 'Collabs', value: 'Collab' },
  { label: 'Albums', value: 'Album' },
  { label: 'EPs', value: 'EP' },
];

// "Singles" shows every single-track release (incl. collabs, which read as
// singles); "Collabs" narrows to collaborations only.
const matchesFmt = (rowFmt: TrackFormat, filter: string): boolean =>
  filter === 'All' ? true : filter === 'Single' ? rowFmt === 'Single' || rowFmt === 'Collab' : rowFmt === filter;

type SortKey = 'title' | 'type' | 'date' | 'streams' | 'rate' | 'adds' | 'trend';

const NoteIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export function CatalogTable() {
  const { state, update } = useApp();
  const [query, setQuery] = useState('');
  const sort = state.sort as SortKey;
  const dir = state.dir;
  const fmt = state.fmt || 'All';
  const expandedMap = state.expanded || {};

  const q = query.trim().toLowerCase();
  let order = catalog.map((r, i) => ({ r, i }));
  if (fmt !== 'All') order = order.filter((o) => matchesFmt(o.r.fmt, fmt));
  if (q) order = order.filter((o) => (o.r.title + ' ' + o.r.album).toLowerCase().includes(q));
  if (sort === 'title') order.sort((a, b) => a.r.title.localeCompare(b.r.title) * dir);
  else if (sort === 'streams') order.sort((a, b) => (a.r._s - b.r._s) * dir);
  else if (sort === 'date') order.sort((a, b) => (Date.parse(b.r.date) - Date.parse(a.r.date)) * dir);
  else if (sort === 'rate') order.sort((a, b) => (parseFloat(a.r.rate) - parseFloat(b.r.rate)) * dir);
  else if (sort === 'adds') order.sort((a, b) => (parseAdds(a.r.adds) - parseAdds(b.r.adds)) * dir);
  else if (sort === 'trend') order.sort((a, b) => (trendRank(a.r.status) - trendRank(b.r.status)) * dir);
  else if (sort === 'type') order.sort((a, b) => typeRank(a.r) - typeRank(b.r) || a.r.title.localeCompare(b.r.title));

  const toggleSort = (key: SortKey) =>
    update((s) => (s.sort === key ? { dir: (-s.dir) as 1 | -1 } : { sort: key, dir: 1 }));

  const arrow = (key: SortKey) => {
    if (sort !== key) return '↕';
    const up = key === 'date' ? dir === -1 : dir === 1;
    return up ? '↑' : '↓';
  };

  const columns: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
    { key: 'type', label: 'Format', align: 'left' },
    { key: 'date', label: 'Released', align: 'left' },
    { key: 'streams', label: 'Streams', align: 'right' },
    { key: 'rate', label: 'Save Rate', align: 'right' },
    { key: 'adds', label: 'Saves', align: 'right' },
    { key: 'trend', label: 'Trend', align: 'left' },
  ];

  return (
    <div className="catalog-table">
      <div className="catalog-table__toolbar">
        <label className="catalog-table__search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8f9299" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className="catalog-table__search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this catalog…"
          />
        </label>
        <div className="catalog-table__filter">
          {fmtOptions.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`catalog-table__filter-tab ${fmt === f.value ? 'catalog-table__filter-tab--active' : ''}`}
              onClick={() => update({ fmt: f.value })}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="catalog-table__count">
          {order.length} {order.length === 1 ? 'release' : 'releases'}
        </div>
      </div>

      <div className="catalog-table__scroll">
        <table className="catalog-table__table">
          <thead>
            <tr className="catalog-table__head-row">
              <th
                className={`catalog-table__th catalog-table__th--track ${sort === 'title' ? 'catalog-table__th--active' : ''}`}
                onClick={() => toggleSort('title')}
                aria-sort={sort === 'title' ? (dir === 1 ? 'ascending' : 'descending') : 'none'}
              >
                Track <span className="catalog-table__th-arrow">{arrow('title')}</span>
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`catalog-table__th ${c.align === 'right' ? 'catalog-table__th--right' : ''} ${sort === c.key ? 'catalog-table__th--active' : ''}`}
                  onClick={() => toggleSort(c.key)}
                  aria-sort={sort === c.key ? (arrow(c.key) === '↑' ? 'ascending' : 'descending') : 'none'}
                >
                  {c.label} <span className="catalog-table__th-arrow">{arrow(c.key)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.length === 0 && (
              <tr>
                <td colSpan={7} className="catalog-table__empty">
                  No releases match "{query}".
                </td>
              </tr>
            )}
            {order.map(({ r, i }) => {
              const isCollection = !!r.coll;
              const expanded = !!expandedMap[i];
              const tracks = r.coll ? collections[r.coll] || [] : [];
              // A collection row opens the full album breakdown; its chevron is a
              // separate target that just expands the tracklist inline.
              const active = isCollection ? i === state.albumSel : i === state.sel;
              const rowClick = isCollection
                ? () => update({ albumSel: i, sel: null, selTrack: null })
                : () => update({ sel: i, selTrack: null, albumSel: null });
              const toggleExpand = (e: MouseEvent) => {
                e.stopPropagation();
                update((s) => ({ expanded: { ...s.expanded, [i]: !(s.expanded || {})[i] } }));
              };
              return (
                <Fragment key={i}>
                  <tr
                    className={`catalog-table__row ${active ? 'catalog-table__row--active' : ''} ${expanded ? 'catalog-table__row--expanded' : ''}`}
                    onClick={rowClick}
                  >
                    <td className="catalog-table__td catalog-table__td--track">
                      {active && <div className="catalog-table__active-bar" />}
                      <div className="catalog-table__track-cell">
                        <div className={`catalog-table__icon ${isCollection ? 'catalog-table__icon--coll' : ''} ${r.img ? 'catalog-table__icon--cover' : ''}`}>
                          {r.img ? <img className="catalog-table__cover" src={asset(r.img)} alt="" loading="lazy" /> : <NoteIcon />}
                        </div>
                        <div className="catalog-table__track-text">
                          <div className="catalog-table__track-title">{r.title}</div>
                          <div className="catalog-table__track-album">{r.album}</div>
                        </div>
                        {isCollection && (
                          <button
                            type="button"
                            className={`catalog-table__chevron ${expanded ? 'catalog-table__chevron--open' : ''}`}
                            onClick={toggleExpand}
                            aria-label={expanded ? 'Collapse tracklist' : 'Expand tracklist'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="catalog-table__td">
                      <span className="catalog-table__pill">
                        <span className="catalog-table__pill-dot" style={{ background: typeDotOf(r) }} />
                        {typeOf(r)}
                      </span>
                    </td>
                    <td className="catalog-table__td catalog-table__td--date">{r.date}</td>
                    <td className="catalog-table__td catalog-table__td--num catalog-table__td--streams">{r.streams}</td>
                    <td className="catalog-table__td catalog-table__td--num">{r.rate}</td>
                    <td className="catalog-table__td catalog-table__td--num">{r.adds}</td>
                    <td className="catalog-table__td catalog-table__td--last">
                      <span className="catalog-table__pill catalog-table__pill--status">
                        <span className="catalog-table__pill-dot" style={{ background: r.statusDot }} />
                        {r.status}
                      </span>
                    </td>
                  </tr>

                  {isCollection &&
                    expanded &&
                    tracks.map((tk, ti) => (
                      <tr
                        key={`${i}-${ti}`}
                        className="catalog-table__row catalog-table__row--sub"
                        onClick={(e) => {
                          e.stopPropagation();
                          update({
                            sel: null,
                            albumSel: null,
                            selTrack: {
                              title: tk.name,
                              album: r.title,
                              date: r.date,
                              fmt: r.fmt,
                              streams: tk.streams,
                              rate: tk.rate,
                              adds: tk.adds,
                              skip: tk.skip,
                              growth: tk.growth,
                              market: tk.market,
                              status: tk.status,
                              statusDot: tk.statusDot,
                              _seed: (i + 1) * 7 + ti + 1,
                            },
                          });
                        }}
                      >
                        <td className="catalog-table__td catalog-table__td--track catalog-table__td--subtrack">
                          <div className="catalog-table__sub-cell">
                            <span className="catalog-table__sub-num">{String(ti + 1).padStart(2, '0')}</span>
                            <div className="catalog-table__track-text">
                              <div className="catalog-table__sub-name">{tk.name}</div>
                              <div className="catalog-table__track-album">{tk.dur}</div>
                            </div>
                          </div>
                        </td>
                        <td className="catalog-table__td" />
                        <td className="catalog-table__td" />
                        <td className="catalog-table__td catalog-table__td--num catalog-table__td--streams">{tk.streams}</td>
                        <td className="catalog-table__td catalog-table__td--num">{tk.rate}</td>
                        <td className="catalog-table__td catalog-table__td--num">{tk.adds}</td>
                        <td className="catalog-table__td catalog-table__td--last">
                          <span className="catalog-table__pill catalog-table__pill--status">
                            <span className="catalog-table__pill-dot" style={{ background: tk.statusDot }} />
                            {tk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
