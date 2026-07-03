import { useApp } from '../../context/AppContext';
import { kpiData } from '../../data/overview';
import './KpiRibbon.css';

export function KpiRibbon() {
  const { state, update } = useApp();

  return (
    <div className="kpi-ribbon">
      {kpiData.map((k, i) => (
        <div key={k.label} className="kpi-card">
          <div className="kpi-card__top">
            <span className="kpi-card__label">{k.label}</span>
            {k.tip && (
              <div
                className="kpi-card__tip-icon"
                onMouseEnter={() => update({ tipKpi: i })}
                onMouseLeave={() => update((s) => (s.tipKpi === i ? { tipKpi: null } : null))}
              >
                ?
                {state.tipKpi === i && <div className="kpi-card__tip">{k.tip}</div>}
              </div>
            )}
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
