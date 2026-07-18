import { useApp } from '../../context/AppContext';
import { seedOf, platSplit } from '../../lib/seed';
import { parsePlays, fmtK } from '../../lib/format';
import { nameOf, trkArrFor } from '../../lib/audience';
import { trackDrawerSel } from '../../lib/music';
import { useEscClose, useOverlayExit } from '../../lib/useOverlayExit';
import './CityDetailDrawer.css';

export function CityDetailDrawer() {
  const { state, update } = useApp();
  // Latched so the drawer keeps its content while animating out.
  const { mounted, closing, latched: cd } = useOverlayExit(state.cityDetail);
  // Esc closes the drawer — unless the notifications modal sits above it.
  useEscClose(state.cityDetail != null && !state.winOpen, () => update({ cityDetail: null }));
  if (!mounted || !cd) return null;
  const close = () => update({ cityDetail: null });

  const rid = state.region;
  const name = nameOf(rid);
  const scopeLabel = rid ? 'in ' + name : 'Top city worldwide';
  const seed = seedOf(cd.name);
  const trend = (cd.arrow === '▲' ? '▲ ' : '▼ ') + (2 + (seed % 11)) + '%';
  const splits = platSplit(seed);

  const stats = [
    { label: 'New listeners', value: `${26 + (seed % 16)}%` },
    { label: 'Plays / listener', value: (3.4 + (seed % 21) / 10).toFixed(1) },
    { label: 'Follower share', value: `${14 + (seed % 12)}%` },
  ];

  const topHere = trkArrFor(rid)
    .slice(0, 5)
    .map((t, i) => ({
      rank: i + 1,
      label: t.label,
      v: parsePlays(t.plays) * (0.18 + (seed % 12) / 50),
    }));
  const maxPlays = Math.max(1, ...topHere.map((t) => t.v));

  // Drill into a track — the shared track drawer takes this one's place.
  const openTrack = (label: string, plays: string) =>
    update({ cityDetail: null, ...trackDrawerSel(label, plays) });

  return (
    <>
      <div className={`city-drawer__scrim${closing ? ' city-drawer__scrim--closing' : ''}`} onClick={close} />
      <aside className={`city-drawer${closing ? ' city-drawer--closing' : ''}`}>
        <div className="city-drawer__head">
          <span className="city-drawer__head-label">City Detail</span>
          <button type="button" className="city-drawer__close" onClick={close}>
            Close
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="city-drawer__body">
          <div className="city-drawer__kicker">City · #{cd.rank}</div>
          <div className="city-drawer__title">{cd.name}</div>
          <div className="city-drawer__sub">{scopeLabel}</div>

          <div className="city-drawer__value-row">
            <div className="city-drawer__value">{cd.count}</div>
            <div className="city-drawer__trend-col">
              <span className="city-drawer__trend" style={{ color: cd.arrowColor }}>{trend}</span>
              <span className="city-drawer__trend-sub">listeners · vs last month</span>
            </div>
          </div>

          <div className="city-drawer__stats">
            {stats.map((st) => (
              <div key={st.label} className="city-drawer__stat">
                <div className="city-drawer__stat-label">{st.label}</div>
                <div className="city-drawer__stat-value">{st.value}</div>
              </div>
            ))}
          </div>

          <div className="city-drawer__section-title">By platform</div>
          <div className="city-drawer__bar">
            {splits.map((g) => (
              <div key={g.label} className="city-drawer__seg" style={{ width: g.pct, background: g.dot }} />
            ))}
          </div>
          <div className="city-drawer__legend">
            {splits.map((g) => (
              <div key={g.label} className="city-drawer__legend-item">
                <span className="city-drawer__dot" style={{ background: g.dot }} />
                <span className="city-drawer__legend-label">{g.label}</span>
                <span className="city-drawer__legend-pct">{g.pct}</span>
              </div>
            ))}
          </div>

          <div className="city-drawer__section-head">
            <div className="city-drawer__section-title city-drawer__section-title--flush">Top tracks here</div>
            <div className="city-drawer__section-sub">plays in {cd.name} · tap to open</div>
          </div>
          <div className="city-drawer__tracks">
            {topHere.map((t) => (
              <button type="button" key={t.rank} className="city-drawer__track" onClick={() => openTrack(t.label, fmtK(t.v))}>
                <span className="city-drawer__track-rank">{t.rank}</span>
                <div className="city-drawer__track-mid">
                  <span className="city-drawer__track-name">{t.label}</span>
                  <div className="city-drawer__bar-track">
                    <div className="city-drawer__bar-fill" style={{ width: `${(t.v / maxPlays) * 100}%` }} />
                  </div>
                </div>
                <span className="city-drawer__track-plays">{fmtK(t.v)}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
