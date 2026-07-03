import { useApp } from '../../context/AppContext';
import { seedOf, platSplit } from '../../lib/seed';
import { parsePlays, fmtK } from '../../lib/format';
import { nameOf, trkArrFor } from '../../lib/audience';
import './CityDetailModal.css';

export function CityDetailModal() {
  const { state, update } = useApp();
  const cd = state.cityDetail;
  if (!cd) return null;
  const close = () => update({ cityDetail: null });

  const rid = state.region;
  const name = nameOf(rid);
  const scopeLabel = rid ? 'in ' + name : 'Top city worldwide';
  const seed = seedOf(cd.name);
  const trend = (cd.arrow === '▲' ? '▲ ' : '▼ ') + (2 + (seed % 11)) + '%';
  const splits = platSplit(seed);
  const topHere = trkArrFor(rid)
    .slice(0, 3)
    .map((t, i) => ({
      rank: i + 1,
      label: t.label,
      plays: fmtK(parsePlays(t.plays) * (0.18 + (seed % 12) / 50)),
    }));

  return (
    <div className="city-modal__scrim" onClick={close}>
      <div className="city-modal" onClick={(e) => e.stopPropagation()}>
        <div className="city-modal__head">
          <div style={{ minWidth: 0 }}>
            <div className="city-modal__kicker">City · #{cd.rank}</div>
            <div className="city-modal__title">{cd.name}</div>
            <div className="city-modal__sub">{scopeLabel}</div>
          </div>
          <div className="city-modal__close" onClick={close}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </div>
        </div>

        <div className="city-modal__body">
          <div className="city-modal__value-row">
            <div className="city-modal__value">{cd.count}</div>
            <div className="city-modal__trend-col">
              <span className="city-modal__trend" style={{ color: cd.arrowColor }}>
                {trend}
              </span>
              <span className="city-modal__trend-sub">listeners · vs last month</span>
            </div>
          </div>

          <div className="city-modal__platform-title">By Platform</div>
          <div className="city-modal__bar">
            {splits.map((g) => (
              <div key={g.label} className="city-modal__seg" style={{ width: g.pct, background: g.dot }}></div>
            ))}
          </div>
          <div className="city-modal__legend">
            {splits.map((g) => (
              <div key={g.label} className="city-modal__legend-item">
                <span className="city-modal__dot" style={{ background: g.dot }}></span>
                <span className="city-modal__legend-label">{g.label}</span>
                <span className="city-modal__legend-pct">{g.pct}</span>
              </div>
            ))}
          </div>

          <div className="city-modal__top-title">Top Tracks Here</div>
          {topHere.map((t) => (
            <div key={t.rank} className="city-modal__top-row">
              <div className="city-modal__top-rank">{t.rank}</div>
              <div className="city-modal__top-name">{t.label}</div>
              <div className="city-modal__top-plays">{t.plays}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
