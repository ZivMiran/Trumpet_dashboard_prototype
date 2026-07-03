import { useApp } from '../../context/AppContext';
import { kpiData } from '../../data/overview';
import './KpiRibbon.css';

// Per-KPI glyphs. Paths follow the same stroke language as the app shell icons
// (24×24 viewBox, round caps/joins) so the ribbon stays visually consistent.
const kpiIcons: Record<string, React.ReactNode> = {
  Streams: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10v3" />
      <path d="M6 6v11" />
      <path d="M10 3v18" />
      <path d="M14 8v7" />
      <path d="M18 5v13" />
      <path d="M22 10v3" />
    </svg>
  ),
  Listeners: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  Saves: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  Followers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  'Save-to-Stream': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
};

export function KpiRibbon() {
  const { state, update } = useApp();

  return (
    <div className="kpi-ribbon">
      {kpiData.map((k, i) => (
        <div key={k.label} className="kpi-card">
          <div className="kpi-card__top">
            <span className="kpi-card__label">
              {k.label}
              {k.tip && (
                <span
                  className="kpi-card__tip-icon"
                  onMouseEnter={() => update({ tipKpi: i })}
                  onMouseLeave={() => update((s) => (s.tipKpi === i ? { tipKpi: null } : null))}
                >
                  ?
                  {state.tipKpi === i && <div className="kpi-card__tip">{k.tip}</div>}
                </span>
              )}
            </span>
            {kpiIcons[k.label] && <span className="kpi-card__metric-icon">{kpiIcons[k.label]}</span>}
          </div>
          <div className="kpi-card__value">{k.value}</div>
          <div className="kpi-card__delta-row">
            <span className="kpi-card__delta">{k.delta}</span>
            <span className="kpi-card__delta-label">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
