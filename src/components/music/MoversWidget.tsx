import { useApp } from '../../context/AppContext';
import { catalog, tfDefs } from '../../data/catalog';
import { fmtStreams } from '../../lib/format';
import type { Timeframe } from '../../types';
import './MoversWidget.css';

const moverTfs: Timeframe[] = ['1D', '1W', '1M', '1Y', 'All'];

export function MoversWidget() {
  const { state, update } = useApp();
  const moverTf = state.moverTf;
  const tfDef = tfDefs[moverTf];

  // Singles only — no albums or EPs (those are collections, flagged with `coll`).
  const topIdx = catalog
    .map((r, i) => ({ i, s: r._s, fmt: r.fmt }))
    .filter((o) => o.fmt === 'Single')
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((o) => o.i);

  const movers = topIdx.map((i, rank) => ({
    i,
    title: catalog[i].title,
    sub: `#${rank + 1} by streams · ${tfDef.phrase}`,
    streams: fmtStreams(catalog[i]._s * tfDef.f),
    spark: tfDef.spark,
    coll: !!catalog[i].coll,
    selected: catalog[i].coll ? i === state.albumSel : i === state.sel,
  }));

  // Singles open the track drawer; collections open the album breakdown.
  const openMover = (m: { i: number; coll: boolean }) =>
    m.coll
      ? update({ albumSel: m.i, sel: null, selTrack: null })
      : update({ sel: m.i, selTrack: null, albumSel: null });

  return (
    <div className="movers-widget">
      <div className="movers-widget__head">
        <div className="movers-widget__title">Top performing tracks</div>
        <div className="movers-widget__sub">your highest-streaming tracks — click to drill in</div>
        <div className="movers-widget__tabs">
          {moverTfs.map((t) => (
            <button
              key={t}
              type="button"
              className={`movers-widget__tab ${moverTf === t ? 'movers-widget__tab--active' : ''}`}
              onClick={() => update({ moverTf: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="movers-widget__grid">
        {movers.map((m) => (
          <div
            key={m.i}
            className={`movers-widget__card ${m.selected ? 'movers-widget__card--selected' : ''}`}
            onClick={() => openMover(m)}
          >
            <div className="movers-widget__card-top">
              <div className="movers-widget__icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="movers-widget__card-text">
                <div className="movers-widget__card-title">{m.title}</div>
                <div className="movers-widget__card-sub">{m.sub}</div>
              </div>
            </div>
            <div className="movers-widget__card-bottom">
              <svg viewBox="0 0 70 22" preserveAspectRatio="none" className="movers-widget__spark">
                <polyline points={m.spark} fill="none" stroke="#e3b53a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="movers-widget__card-streams">{m.streams}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
