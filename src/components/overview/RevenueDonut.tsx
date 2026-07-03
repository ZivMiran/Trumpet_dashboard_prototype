import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { revData, REV_TOTAL } from '../../data/overview';
import './RevenueDonut.css';

const REV_C = 2 * Math.PI * 40;

export function RevenueDonut() {
  const { state, update } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const revHover = state.revHover;

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

  return (
    <div className="revenue-card" ref={cardRef}>
      <div className="revenue-card__head">
        <div className="revenue-card__title">Est. Revenue</div>
        <div className="revenue-card__sub">Last 30 days · by platform</div>
      </div>
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
    </div>
  );
}
