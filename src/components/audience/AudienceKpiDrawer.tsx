import { useApp } from '../../context/AppContext';
import { audKpiData } from '../../data/audience';
import './AudienceKpiDrawer.css';

export function AudienceKpiDrawer() {
  const { state, update } = useApp();
  if (state.audKpi == null) return null;
  const k = audKpiData[state.audKpi];
  const close = () => update({ audKpi: null });

  return (
    <>
      <div className="audience-kpi-drawer__scrim" onClick={close}></div>
      <aside className="audience-kpi-drawer">
        <div className="audience-kpi-drawer__head">
          <span className="audience-kpi-drawer__head-label">Audience Metric</span>
          <button type="button" className="audience-kpi-drawer__close" onClick={close}>
            Close
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <div className="audience-kpi-drawer__body">
          <div className="audience-kpi-drawer__label">{k.label}</div>
          <div className="audience-kpi-drawer__value-row">
            <div className="audience-kpi-drawer__value">{k.value}</div>
            {!k.noDelta ? (
              <div className="audience-kpi-drawer__delta-col">
                <span className="audience-kpi-drawer__delta" style={{ color: k.deltaColor }}>
                  {k.delta}
                </span>
                <span className="audience-kpi-drawer__delta-sub">this month · vs last month</span>
              </div>
            ) : (
              <div className="audience-kpi-drawer__sub">{k.sub}</div>
            )}
          </div>

          <div className="audience-kpi-drawer__note">{k.note}</div>

          <div className="audience-kpi-drawer__stats">
            {k.statStrip.map((s) => (
              <div key={s.label} className="audience-kpi-drawer__stat">
                <div className="audience-kpi-drawer__stat-label">{s.label}</div>
                <div className="audience-kpi-drawer__stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="audience-kpi-drawer__rows-title">{k.rowsTitle}</div>
          <div className="audience-kpi-drawer__rows">
            {k.rows.map((r) => (
              <div key={r.label} className="audience-kpi-drawer__row">
                <div className="audience-kpi-drawer__row-head">
                  <span className="audience-kpi-drawer__row-label">{r.label}</span>
                  <span className="audience-kpi-drawer__row-pct">{r.pct}</span>
                </div>
                <div className="audience-kpi-drawer__row-track">
                  <div className="audience-kpi-drawer__row-fill" style={{ background: r.color, width: r.w }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="audience-kpi-drawer__footer">
          <button type="button" className="audience-kpi-drawer__report-btn">Open full report</button>
          <button type="button" className="audience-kpi-drawer__export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </aside>
    </>
  );
}
