import { useApp } from '../../context/AppContext';
import { audKpiData } from '../../data/audience';
import './AudienceKpiRibbon.css';

export function AudienceKpiRibbon() {
  const { update } = useApp();

  return (
    <div className="audience-kpi-ribbon">
      {audKpiData.map((k, i) => (
        <div key={k.label} className="audience-kpi-ribbon__card" onClick={() => update({ audKpi: i })}>
          <div className="audience-kpi-ribbon__top">
            <span className="audience-kpi-ribbon__label">{k.label}</span>
            <svg
              className="audience-kpi-ribbon__chevron"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5c6068"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </div>
          <div className="audience-kpi-ribbon__value">{k.value}</div>
          {!k.noDelta ? (
            <div className="audience-kpi-ribbon__delta-row">
              <span className="audience-kpi-ribbon__delta" style={{ color: k.deltaColor }}>
                {k.delta}
              </span>
              <span className="audience-kpi-ribbon__delta-label">vs last month</span>
            </div>
          ) : (
            <div className="audience-kpi-ribbon__sub">{k.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
