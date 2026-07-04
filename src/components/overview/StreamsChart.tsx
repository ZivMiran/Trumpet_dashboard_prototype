import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { metricMeta, metricSeries, tfShape, tfNames, evtData } from '../../data/overview';
import { smoothPath, niceCeil, type Point } from '../../lib/chart';
import { fmtAxis } from '../../lib/format';
import type { Metric, Timeframe } from '../../types';
import './StreamsChart.css';

const tfKeys: Timeframe[] = ['1D', '1W', '1M', '1Y', 'All'];

// Snapped hover point plus the plot size captured at move time (for px math).
interface HoverState {
  idx: number;
  w: number;
  h: number;
}

export function StreamsChart() {
  const { state, update } = useApp();
  const [hover, setHover] = useState<HoverState | null>(null);
  const [metricOpen, setMetricOpen] = useState(false);
  const [tfHover, setTfHover] = useState<Timeframe | null>(null);
  const [anim, setAnim] = useState(0);

  const metric = state.metric;
  const tfKey = state.tf;
  const shape = tfShape[tfKey];
  const series = metricSeries[metric][tfKey];
  const metricValue = series[0];
  const metricDelta = series[1];
  const metricDeltaColor = metricDelta.charAt(0) === '▲' ? '#45c08a' : metricDelta.charAt(0) === '▼' ? '#e5807f' : '#8f9299';
  const metricColor = metricMeta[metric].color;
  const metricLabel = metricMeta[metric].label;
  const norm = shape.norm;
  const N = norm.length;
  const xy: Point[] = norm.map((v, i) => ({ x: (i / (N - 1)) * 800, y: (1 - v) * 300 }));
  const metricLinePath = smoothPath(xy);
  const metricAreaPath = `${metricLinePath} L 800 300 L 0 300 Z`;
  const peakNorm = Math.max(...norm);
  const yTop = niceCeil(series[2] / peakNorm);
  const yLabels = [4, 3, 2, 1, 0].map((i) => fmtAxis((yTop * i) / 4));
  const avgNorm = norm.reduce((a, b) => a + b, 0) / N;
  const avgPct = ((1 - avgNorm) * 100).toFixed(2);
  const avgLabel = fmtAxis(yTop * avgNorm);

  const hi = hover ? Math.max(0, Math.min(N - 1, hover.idx)) : null;
  const hiFrac = hi != null ? hi / (N - 1) : 0;

  const evts = evtData[tfKey] || [];
  const evtMarkers = evts.map((e, i) => {
    const fx = Math.max(0, Math.min(1, e.x / 800));
    const p = fx * (N - 1);
    const i0 = Math.floor(p);
    const i1 = Math.min(N - 1, i0 + 1);
    const nv = norm[i0] + (norm[i1] - norm[i0]) * (p - i0);
    return { key: i, fx, fxPct: fx * 100, cyPct: (1 - nv) * 100, t: e.t, d: e.d };
  });

  // When the snapped point sits on a peak event the gold event marker is the
  // indicator, so hide the plain follower dot and fold the event detail into
  // the one hover tooltip — no second popup to collide with.
  const nearEvt = hi != null ? evts.find((e) => Math.abs(e.x / 800 - hiFrac) < 0.05) || null : null;
  const hoverValue = hi != null ? fmtAxis(yTop * norm[hi]) : '';
  const hoverTime = hi != null ? shape.pts[hi] : '';

  // Tooltip is anchored to the snapped data point (same anchor as crosshair +
  // dot), clamped to the plot, flipped below when the point rides too high.
  let tipStyle: React.CSSProperties | null = null;
  if (hover && hi != null) {
    const px = hiFrac * hover.w;
    const py = (1 - norm[hi]) * hover.h;
    const half = nearEvt ? 126 : 86;
    const flip = py < (nearEvt ? 158 : 86);
    tipStyle = {
      left: `${Math.max(half, Math.min(hover.w - half, px)).toFixed(0)}px`,
      top: `${(flip ? py + 18 : py - 18).toFixed(0)}px`,
      transform: `translate(-50%, ${flip ? '0' : '-100%'})`,
    };
  }

  const onChartMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const idx = Math.max(0, Math.min(N - 1, Math.round(((ev.clientX - r.left) / r.width) * (N - 1))));
    setHover((prev) => (prev && prev.idx === idx && prev.w === r.width && prev.h === r.height ? prev : { idx, w: r.width, h: r.height }));
  };

  const metricOptions = (Object.keys(metricMeta) as Metric[]).map((k) => ({
    key: k,
    label: metricMeta[k].label,
    color: metricMeta[k].color,
    value: metricSeries[k][tfKey][0],
    active: k === metric,
  }));

  const selectMetric = (k: Metric) => {
    setMetricOpen(false);
    if (k === metric) return;
    update({ metric: k });
    setAnim((a) => a + 1);
    setHover(null);
  };

  const selectTf = (k: Timeframe) => {
    if (k === tfKey) return;
    update({ tf: k });
    setAnim((a) => a + 1);
    setHover(null);
  };

  return (
    <div className="streams-card" style={{ '--chart-color': metricColor } as React.CSSProperties}>
      <div className="streams-card__head">
        <div className="streams-card__metric-wrap">
          <button
            type="button"
            className={`streams-card__metric-btn ${metricOpen ? 'streams-card__metric-btn--open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={metricOpen}
            onClick={() => setMetricOpen((o) => !o)}
          >
            <span>{metricLabel}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bdbbb1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {metricOpen && (
            <>
              <div className="streams-card__metric-scrim" onClick={() => setMetricOpen(false)} />
              <div className="streams-card__metric-menu" role="menu">
                <div className="streams-card__metric-menu-label">Metric</div>
                {metricOptions.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    role="menuitem"
                    className={`streams-card__metric-row ${m.active ? 'streams-card__metric-row--active' : ''}`}
                    onClick={() => selectMetric(m.key)}
                  >
                    <span className="streams-card__metric-dot" style={{ background: m.color }} />
                    <span className="streams-card__metric-row-label">{m.label}</span>
                    <span className="streams-card__metric-row-value">{m.value}</span>
                    {m.active && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          <div key={`${metric}-${tfKey}`} className="streams-card__value-row">
            <div className="streams-card__value">{metricValue}</div>
            <div className="streams-card__delta" style={{ color: metricDeltaColor }}>{metricDelta}</div>
          </div>
        </div>
        <div className="streams-card__tfseg">
          {tfKeys.map((k) => (
            <div
              key={k}
              className="streams-card__tfseg-item"
              onMouseEnter={() => setTfHover(k)}
              onMouseLeave={() => setTfHover((h) => (h === k ? null : h))}
            >
              <button
                type="button"
                aria-pressed={tfKey === k}
                className={`streams-card__tfseg-btn ${tfKey === k ? 'streams-card__tfseg-btn--active' : 'streams-card__tfseg-btn--inactive'}`}
                onClick={() => selectTf(k)}
              >
                {k}
              </button>
              {tfHover === k && <div className="streams-card__tfseg-tooltip">{tfNames[k]}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="streams-card__body">
        <div className="streams-card__ylabels">
          {yLabels.map((y, i) => <span key={i}>{y}</span>)}
        </div>
        <div className="streams-card__chart-col">
          <div
            className="streams-card__chart-area"
            aria-label={`${metricLabel} over ${tfNames[tfKey].toLowerCase()}: ${metricValue}`}
            onMouseMove={onChartMove}
            onMouseLeave={() => setHover(null)}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`streams-card__grid-line ${i === 4 ? 'streams-card__grid-line--base' : ''}`}
                style={{ top: `${i * 25}%` }}
              />
            ))}
            <div className="streams-card__avg-line" style={{ top: `${avgPct}%` }} />
            <div className="streams-card__avg-pill" style={{ top: `${avgPct}%` }}>
              <span className="streams-card__avg-dot" />
              <span className="streams-card__avg-label">Avg</span>
              <span className="streams-card__avg-value">{avgLabel}</span>
            </div>
            <svg viewBox="0 0 800 300" preserveAspectRatio="none" className="streams-card__svg" aria-hidden="true">
              <defs>
                <linearGradient id="streamFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricColor} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={metricColor} stopOpacity="0.015" />
                </linearGradient>
              </defs>
              <g key={anim}>
                <path d={metricAreaPath} fill="url(#streamFill)" stroke="none" className="streams-card__area-path" />
                <path d={metricLinePath} pathLength={1} vectorEffect="non-scaling-stroke" className="streams-card__line-path" />
              </g>
            </svg>
            {hover && <div className="streams-card__crosshair" style={{ left: `${(hiFrac * 100).toFixed(3)}%` }} />}
            {hover && hi != null && !nearEvt && (
              <div
                className="streams-card__hover-dot"
                style={{ left: `${(hiFrac * 100).toFixed(3)}%`, top: `${((1 - norm[hi]) * 100).toFixed(3)}%` }}
              />
            )}
            {!(hover && hi === N - 1) && (
              <div
                key={`end-${anim}`}
                className="streams-card__end-dot"
                style={{ left: '100%', top: `${((1 - norm[N - 1]) * 100).toFixed(2)}%` }}
              />
            )}
            {evtMarkers.map((e) => (
              <button
                key={e.key}
                type="button"
                className="streams-card__evt-mark"
                style={{ left: `${e.fxPct.toFixed(2)}%`, top: `${e.cyPct.toFixed(2)}%` }}
                aria-label={`Peak event: ${e.t}. ${e.d}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z" />
                </svg>
              </button>
            ))}
            {tipStyle && (
              <div className="streams-card__tip" style={tipStyle}>
                <div className="streams-card__tip-time">{hoverTime}</div>
                <div className="streams-card__tip-top">
                  <span className="streams-card__tip-value">{hoverValue}</span>
                  <span className="streams-card__tip-label">{metricLabel}</span>
                </div>
                {nearEvt && (
                  <div className="streams-card__tip-evt">
                    <div className="streams-card__tip-evt-tag">
                      <span className="streams-card__tip-evt-bolt">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z" />
                        </svg>
                      </span>
                      Peak event
                    </div>
                    <div className="streams-card__tip-evt-title">{nearEvt.t}</div>
                    <div className="streams-card__tip-evt-detail">{nearEvt.d}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="streams-card__xlabels">
            {shape.x.map((x, i) => <span key={i}>{x}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
