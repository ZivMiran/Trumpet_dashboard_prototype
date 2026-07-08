import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { revData, REV_TOTAL } from '../../data/overview';
import './RevenueDonut.css';

const REV_C = 2 * Math.PI * 40;
const REV_MAX_PCT = Math.max(...revData.map((p) => p.pct));

export function RevenueDonut() {
  const { state, update } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const revHover = state.revHover;
  const view = state.revView;

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const compact = el.clientHeight < 470;
      update((s) => (compact !== s.revCompact ? { revCompact: compact } : null));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  let revAcc = 0;
  const revSegs = revData.map((p, i) => {
    const len = (p.pct / 100) * REV_C;
    const offset = -revAcc;
    revAcc += len;
    const active = revHover === i;
    const dim = revHover != null && !active;
    return {
      key: i,
      stroke: p.color,
      dash: `${len.toFixed(2)} ${(REV_C - len).toFixed(2)}`,
      offset: offset.toFixed(2),
      width: active ? 19 : 16,
      opacity: dim ? 0.3 : 1,
    };
  });

  const revActive = revHover != null ? revData[revHover] : null;
  const revCenterLabel = revActive ? revActive.label : 'Total';
  const revCenterValue = revActive ? revActive.amount : REV_TOTAL;
  const revLegend = revData.map((p, i) => ({
    key: i,
    label: p.label,
    pct: `${p.pct}%`,
    amount: p.amount,
    color: p.color,
    rowBg: revHover === i ? '#34373b' : 'transparent',
    rowColor: revHover != null && revHover !== i ? '#8f9299' : '#f0ede5',
    dotOpacity: revHover != null && revHover !== i ? 0.4 : 1,
  }));
  const revTipShow = revActive != null;
  const revTipText = revActive ? `${revActive.label} · ${revActive.pct}% · ${revActive.amount}` : '';
  const revShowLegend = !state.revCompact;

  const enter = (i: number) => () => update({ revHover: i });
  const leaveAll = () => update({ revHover: null });
  const setView = (v: 'donut' | 'bars') => () => update({ revView: v, revHover: null });

  return (
    <div className="revenue-card" ref={cardRef}>
      <div className="revenue-card__head">
        <div className="revenue-card__head-text">
          <div className="revenue-card__title">Est. Revenue</div>
          <div className="revenue-card__sub">Last 30 days · by platform</div>
        </div>
        <div className="revenue-card__views" role="tablist" aria-label="Chart style">
          <button
            type="button"
            aria-label="Donut view"
            aria-selected={view === 'donut'}
            role="tab"
            className={`revenue-card__view-btn ${view === 'donut' ? 'revenue-card__view-btn--active' : ''}`}
            onClick={setView('donut')}
          >
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
              <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="3.2" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Bars view"
            aria-selected={view === 'bars'}
            role="tab"
            className={`revenue-card__view-btn ${view === 'bars' ? 'revenue-card__view-btn--active' : ''}`}
            onClick={setView('bars')}
          >
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
              <rect x="1" y="2" width="12" height="2.6" rx="1.3" fill="currentColor" />
              <rect x="1" y="5.7" width="8.5" height="2.6" rx="1.3" fill="currentColor" />
              <rect x="1" y="9.4" width="5" height="2.6" rx="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {view === 'donut' ? (
        <>
          <div className="revenue-card__donut-wrap">
            <div className="revenue-card__donut">
              <svg viewBox="0 0 100 100" className="revenue-card__svg">
                {revSegs.map((s) => (
                  <circle
                    key={s.key}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={s.stroke}
                    strokeWidth={s.width}
                    strokeDasharray={s.dash}
                    strokeDashoffset={s.offset}
                    opacity={s.opacity}
                    className="revenue-card__seg"
                    onMouseEnter={enter(s.key)}
                    onMouseLeave={leaveAll}
                  />
                ))}
              </svg>
              <div className="revenue-card__center">
                <div className="revenue-card__center-label">{revCenterLabel}</div>
                <div className="revenue-card__center-value">{revCenterValue}</div>
              </div>
              {revTipShow && <div className="revenue-card__tip">{revTipText}</div>}
            </div>
          </div>
          {revShowLegend && (
            <div className="revenue-card__legend">
              {revLegend.map((r) => (
                <div
                  key={r.key}
                  className="revenue-card__legend-row"
                  style={{ color: r.rowColor, background: r.rowBg }}
                  onMouseEnter={enter(r.key)}
                  onMouseLeave={leaveAll}
                >
                  <div className="revenue-card__legend-dot" style={{ background: r.color, opacity: r.dotOpacity }} />
                  <span>{r.label}</span>
                  <span className="revenue-card__legend-pct">{r.pct}</span>
                  <span className="revenue-card__legend-amount">{r.amount}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="revenue-card__bars">
          {revData.map((p, i) => {
            const dim = revHover != null && revHover !== i;
            return (
              <div
                key={i}
                className="revenue-card__bar-row"
                style={{ opacity: dim ? 0.45 : 1 }}
                onMouseEnter={enter(i)}
                onMouseLeave={leaveAll}
              >
                <div className="revenue-card__bar-meta">
                  <span className="revenue-card__bar-label">{p.label}</span>
                  <span className="revenue-card__bar-pct">{p.pct}%</span>
                  <span className="revenue-card__bar-amount">{p.amount}</span>
                </div>
                <div className="revenue-card__bar-track">
                  <div
                    className="revenue-card__bar-fill"
                    style={{
                      width: `${(p.pct / REV_MAX_PCT) * 100}%`,
                      background: p.color,
                      animationDelay: `${i * 55}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <div className="revenue-card__bars-total">
            <span className="revenue-card__bars-total-label">Total</span>
            <span className="revenue-card__bars-total-value">{REV_TOTAL}</span>
          </div>
        </div>
      )}
    </div>
  );
}
