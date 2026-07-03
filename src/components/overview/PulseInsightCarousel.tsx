import { useApp } from '../../context/AppContext';
import { insightDefs } from '../../data/overview';
import './PulseInsightCarousel.css';

export function PulseInsightCarousel() {
  const { state, update, pauseInsight, resumeInsight } = useApp();
  const ins = insightDefs[state.insightIdx % insightDefs.length];

  const go = () =>
    update({
      page: ins.goPage,
      sel: ins.goSel ?? null,
      albumSel: ins.goAlbum ?? null,
      region: ins.goRegion ?? null,
    });

  return (
    <div className="pulse-card" onMouseEnter={pauseInsight} onMouseLeave={resumeInsight}>
      <div className="pulse-card__icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div className="pulse-card__body" onClick={go}>
        <div className="pulse-card__tag">{ins.tag}</div>
        <div className="pulse-card__headline">
          {ins.pre}
          <span className="pulse-card__hi">{ins.hi}</span>
          {ins.post}
        </div>
        <div className="pulse-card__sub">{ins.sub}</div>
      </div>
      <div className="pulse-card__side">
        <button type="button" className="pulse-card__detail-btn" onClick={go}>
          View detail <span className="pulse-card__detail-arrow">→</span>
        </button>
        <div className="pulse-card__dots">
          {insightDefs.map((_, i) => (
            <div
              key={i}
              className="pulse-dot-btn"
              style={{
                width: i === state.insightIdx % insightDefs.length ? 22 : 8,
                background: i === state.insightIdx % insightDefs.length ? '#e3b53a' : '#45494f',
              }}
              onClick={(e) => {
                e.stopPropagation();
                update({ insightIdx: i });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
