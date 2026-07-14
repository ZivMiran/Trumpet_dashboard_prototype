import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { metricMeta, metricSeries, tfShape, tfNames, tfVs, evtData } from '../../data/overview';
import { smoothPath, niceCeil, type Point } from '../../lib/chart';
import { fmtAxis } from '../../lib/format';
import { useOverlayExit } from '../../lib/useOverlayExit';
import type { Metric, Timeframe } from '../../types';
import './StreamsChart.css';

const tfKeys: Timeframe[] = ['1D', '1W', '1M', '1Y', 'All'];
const metricKeys = Object.keys(metricMeta) as Metric[];

// How close (as a fraction of plot width) the cursor must be to a peak-event
// marker before the crosshair magnetizes onto it.
const EVT_MAGNET = 0.04;

// Snapped hover point, the magnetized event (if any), and the plot size
// captured at move time (for px math).
interface HoverState {
  idx: number;
  evt: number | null;
  w: number;
  h: number;
}

export function StreamsChart() {
  const { state, update } = useApp();
  const [hover, setHover] = useState<HoverState | null>(null);
  const [tfHover, setTfHover] = useState<Timeframe | null>(null);
  // Latches the hovered tab so its tooltip can fade out in place.
  const { mounted: tfTipMounted, closing: tfTipClosing, latched: tfTipKey } = useOverlayExit(tfHover, 120);
  const [anim, setAnim] = useState(0);

  const metric = state.metric;
  const tfKey = state.tf;
  const shape = tfShape[tfKey];
  const series = metricSeries[metric][tfKey];
  const metricValue = series[0];
  const metricDelta = series[1];
  const deltaMod = metricDelta.charAt(0) === '▲' ? 'up' : metricDelta.charAt(0) === '▼' ? 'down' : 'flat';
  const metricColor = metricMeta[metric].color;
  const metricLabel = metricMeta[metric].label;
  const norm = shape.norm;
  const N = norm.length;
  // Axis max: the data peak plus ~8% headroom, rounded up to a nice number.
  // The shape is then rescaled so each point is an honest fraction of that
  // axis — the peak reads exactly series[2] and lands 75–92% up the plot,
  // never leaving a dead band between the curve and the top gridline.
  const peakNorm = Math.max(...norm);
  const yTop = niceCeil(series[2] * 1.08);
  const scale = series[2] / (peakNorm * yTop);
  const sv = norm.map((v) => v * scale);
  const xy: Point[] = sv.map((v, i) => ({ x: (i / (N - 1)) * 800, y: (1 - v) * 300 }));
  const metricLinePath = smoothPath(xy);
  const metricAreaPath = `${metricLinePath} L 800 300 L 0 300 Z`;
  const yLabels = [4, 3, 2, 1, 0].map((i) => fmtAxis((yTop * i) / 4));
  const avgFrac = sv.reduce((a, b) => a + b, 0) / N;
  const avgPct = ((1 - avgFrac) * 100).toFixed(2);
  const avgLabel = fmtAxis(yTop * avgFrac);

  const evts = evtData[tfKey] || [];
  const evtMarkers = evts.map((e, i) => {
    const fx = Math.max(0, Math.min(1, e.x / 800));
    const p = fx * (N - 1);
    const i0 = Math.floor(p);
    const i1 = Math.min(N - 1, i0 + 1);
    const nv = sv[i0] + (sv[i1] - sv[i0]) * (p - i0);
    return { key: i, fx, fxPct: fx * 100, cyPct: (1 - nv) * 100, nv, t: e.t, d: e.d };
  });

  const hi = hover ? Math.max(0, Math.min(N - 1, hover.idx)) : null;
  const hoverEvt = hover && hover.evt != null ? evtMarkers[hover.evt] : null;
  // While magnetized, the event point is the hover anchor for the crosshair
  // and tooltip; otherwise the nearest data point is.
  const anchorFrac = hoverEvt ? hoverEvt.fx : hi != null ? hi / (N - 1) : 0;
  const anchorTopPct = hoverEvt ? hoverEvt.cyPct : hi != null ? (1 - sv[hi]) * 100 : 0;
  const hoverValue = hover ? fmtAxis(yTop * (hoverEvt ? hoverEvt.nv : sv[hi!])) : '';
  const hoverTime = hover ? shape.pts[hoverEvt ? Math.round(hoverEvt.fx * (N - 1)) : hi!] : '';

  let tipStyle: React.CSSProperties | null = null;
  if (hover) {
    const px = anchorFrac * hover.w;
    const py = (anchorTopPct / 100) * hover.h;
    const half = hoverEvt ? 126 : 86;
    const flip = py < (hoverEvt ? 158 : 86);
    tipStyle = {
      left: `${Math.max(half, Math.min(hover.w - half, px)).toFixed(0)}px`,
      top: `${(flip ? py + 18 : py - 18).toFixed(0)}px`,
      transform: `translate(-50%, ${flip ? '0' : '-100%'})`,
    };
  }

  const onChartMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const frac = (ev.clientX - r.left) / r.width;
    const idx = Math.max(0, Math.min(N - 1, Math.round(frac * (N - 1))));
    let evt: number | null = null;
    for (let i = 0; i < evts.length; i++) {
      if (Math.abs(evts[i].x / 800 - frac) < EVT_MAGNET) { evt = i; break; }
    }
    setHover((prev) =>
      prev && prev.idx === idx && prev.evt === evt && prev.w === r.width && prev.h === r.height
        ? prev
        : { idx, evt, w: r.width, h: r.height },
    );
  };

  const selectMetric = (k: Metric) => {
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
        <div className="streams-card__seg" aria-label="Metric">
          {metricKeys.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === metric}
              className={`streams-card__seg-btn ${k === metric ? 'streams-card__seg-btn--active' : 'streams-card__seg-btn--inactive'}`}
              onClick={() => selectMetric(k)}
            >
              {metricMeta[k].label}
            </button>
          ))}
        </div>
        <div className="streams-card__seg streams-card__seg--tf" aria-label="Timeframe">
          {tfKeys.map((k) => (
            <div
              key={k}
              className="streams-card__seg-item"
              onMouseEnter={() => setTfHover(k)}
              onMouseLeave={() => setTfHover((h) => (h === k ? null : h))}
            >
              <button
                type="button"
                aria-pressed={tfKey === k}
                className={`streams-card__seg-btn ${tfKey === k ? 'streams-card__seg-btn--active' : 'streams-card__seg-btn--inactive'}`}
                onClick={() => selectTf(k)}
              >
                {k}
              </button>
              {tfTipMounted && tfTipKey === k && (
                <div className={`streams-card__seg-tooltip${tfTipClosing ? ' streams-card__seg-tooltip--closing' : ''}`}>
                  {tfNames[k]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div key={`${metric}-${tfKey}`} className="streams-card__value-row">
        <div className="streams-card__value">{metricValue}</div>
        <div className="streams-card__delta-row">
          <span className={`streams-card__delta streams-card__delta--${deltaMod}`}>{metricDelta}</span>
          {tfVs[tfKey] && <span className="streams-card__delta-vs">{tfVs[tfKey]}</span>}
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
            {hover && <div className="streams-card__crosshair" style={{ left: `${(anchorFrac * 100).toFixed(3)}%` }} />}
            {hover && hi != null && !hoverEvt && (
              <div
                className="streams-card__hover-dot"
                style={{ left: `${(anchorFrac * 100).toFixed(3)}%`, top: `${anchorTopPct.toFixed(3)}%` }}
              />
            )}
            {!(hover && hi === N - 1) && (
              <div
                key={`end-${anim}`}
                className="streams-card__end-dot"
                style={{ left: '100%', top: `${((1 - sv[N - 1]) * 100).toFixed(2)}%` }}
              />
            )}
            {evtMarkers.map((e) => (
              <button
                key={e.key}
                type="button"
                className={`streams-card__evt-mark ${hover && hover.evt === e.key ? 'streams-card__evt-mark--hot' : ''}`}
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
                  <span className="streams-card__tip-dot" />
                  <span className="streams-card__tip-value">{hoverValue}</span>
                  <span className="streams-card__tip-label">{metricLabel}</span>
                </div>
                {hoverEvt && (
                  <div className="streams-card__tip-evt">
                    <div className="streams-card__tip-evt-tag">
                      <span className="streams-card__tip-evt-bolt">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z" />
                        </svg>
                      </span>
                      Peak event
                    </div>
                    <div className="streams-card__tip-evt-title">{hoverEvt.t}</div>
                    <div className="streams-card__tip-evt-detail">{hoverEvt.d}</div>
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
