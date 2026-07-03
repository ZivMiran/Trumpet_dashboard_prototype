import { useApp } from '../../context/AppContext';
import { seedOf, platSplit } from '../../lib/seed';
import { parsePlays, fmtK } from '../../lib/format';
import { scopeNameFor, detailScopeLabelFor } from '../../lib/audience';
import './TrackDetailModal.css';

export function TrackDetailModal() {
  const { state, update } = useApp();
  const td = state.trkDetail;
  if (!td) return null;
  const close = () => update({ trkDetail: null });

  const scope = scopeNameFor(state.region);
  const scopeLabel = detailScopeLabelFor(state.region);
  const splits = platSplit(seedOf(td.label));
  const pv = parsePlays(td.plays);
  const s = seedOf(td.label);
  const stats = [
    { label: 'Saves', value: fmtK(pv * (0.09 + (s % 7) / 100)) },
    { label: 'Avg. Completion', value: (72 + (s % 18)) + '%' },
    { label: 'Playlist Adds', value: fmtK(pv * (0.025 + (s % 5) / 200)) },
  ];

  return (
    <div className="track-modal__scrim" onClick={close}>
      <div className="track-modal" onClick={(e) => e.stopPropagation()}>
        <div className="track-modal__head">
          <div style={{ minWidth: 0 }}>
            <div className="track-modal__kicker">Track · #{td.rank}</div>
            <div className="track-modal__title">{td.label}</div>
            <div className="track-modal__sub">{scopeLabel}</div>
          </div>
          <div className="track-modal__close" onClick={close}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </div>
        </div>

        <div className="track-modal__body">
          <div className="track-modal__value-row">
            <div className="track-modal__value">{td.plays}</div>
            <div className="track-modal__value-sub">plays · {scope}</div>
          </div>

          <div className="track-modal__stats">
            {stats.map((st) => (
              <div key={st.label} className="track-modal__stat">
                <div className="track-modal__stat-label">{st.label}</div>
                <div className="track-modal__stat-value">{st.value}</div>
              </div>
            ))}
          </div>

          <div className="track-modal__platform-title">By Platform</div>
          <div className="track-modal__bar">
            {splits.map((g) => (
              <div key={g.label} className="track-modal__seg" style={{ width: g.pct, background: g.dot }}></div>
            ))}
          </div>
          <div className="track-modal__legend">
            {splits.map((g) => (
              <div key={g.label} className="track-modal__legend-item">
                <span className="track-modal__dot" style={{ background: g.dot }}></span>
                <span className="track-modal__legend-label">{g.label}</span>
                <span className="track-modal__legend-pct">{g.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
