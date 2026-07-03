import { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { metricMeta, metricSeries, tfShape, tfNames, evtData } from '../../data/overview';
import { smoothPath, niceCeil, type Point } from '../../lib/chart';
import { fmtAxis } from '../../lib/format';
import type { Metric, Timeframe } from '../../types';
import './StreamsChart.css';

const tfKeys: Timeframe[] = ['1D', '1W', '1M', '1Y', 'All'];

export function StreamsChart() {
  const { state, update } = useApp();
  const areaRef = useRef<SVGSVGElement>(null);

  const metric = state.metric;
  const mMeta = metricMeta[metric];
  const tfKey = state.tf;
  const shape = tfShape[tfKey];
  const series = metricSeries[metric][tfKey];
  const metricValue = series[0];
  const metricDelta = series[1];
  const metricDeltaColor = metricDelta.charAt(0) === '▲' ? '#45c08a' : metricDelta.charAt(0) === '▼' ? '#e5807f' : '#8f9299';
  const metricColor = mMeta.color;
  const metricLabel = mMeta.label;
  const norm = shape.norm;
  const Npts = norm.length;
  const xy: Point[] = norm.map((v, i) => ({ x: (i / (Npts - 1)) * 800, y: (1 - v) * 300 }));
  const metricLinePath = smoothPath(xy);
  const metricAreaPath = `${metricLinePath} L 800 300 L 0 300 Z`;
  const peakNorm = Math.max(...norm);
  const yTop = niceCeil(series[2] / peakNorm);
  const yLabels = [4, 3, 2, 1, 0].map((i) => fmtAxis((yTop * i) / 4));
  const gridLines = [0, 1, 2, 3, 4].map((i) => ({
    key: i,
    style: {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      top: `${i * 25}%`,
      height: 0,
      borderTop: i === 4 ? '1px solid #3a3d42' : '1px dashed rgba(255,255,255,0.055)',
    },
  }));
  const avgNorm = norm.reduce((a, b) => a + b, 0) / Npts;
  const avgPct = ((1 - avgNorm) * 100).toFixed(2);
  const avgLabel = fmtAxis(yTop * avgNorm);

  const N = Npts;
  let hi = state.hoverIdx;
  if (hi != null) hi = Math.max(0, Math.min(N - 1, hi));
  // Near a peak event the gold event marker is the indicator, so hide the
  // plain follower dot to avoid two near-identical dots.
  const dotSuppress =
    state.hoverX != null &&
    (evtData[tfKey] || []).some((e) => Math.abs(e.x / 800 - state.hoverX! / (state.hoverW || 1)) < 0.05);
  const dots = norm.map((v, i) => {
    const lp = (i / (N - 1)) * 100;
    const tp = (1 - v) * 100;
    const isHi = i === hi && !dotSuppress;
    return {
      key: i,
      style: {
        position: 'absolute' as const,
        left: `${lp.toFixed(3)}%`,
        top: `${tp.toFixed(3)}%`,
        transform: 'translate(-50%,-50%)',
        width: isHi ? 12 : 7,
        height: isHi ? 12 : 7,
        borderRadius: '50%',
        background: '#16171a',
        border: `2px solid ${metricColor}`,
        opacity: isHi ? 1 : 0,
        transition: 'width .15s ease, height .15s ease, opacity .15s ease',
        pointerEvents: 'none' as const,
        zIndex: 6,
        boxShadow: isHi ? `0 0 0 4px ${metricColor}22` : 'none',
      },
    };
  });
  const hoverLp = hi != null ? (hi / (N - 1)) * 100 : 0;
  const crosshairStyle = {
    position: 'absolute' as const,
    left: `${hoverLp.toFixed(3)}%`,
    top: 0,
    bottom: 0,
    width: 0,
    borderLeft: `1px dashed ${metricColor}66`,
    transform: 'translateX(-0.5px)',
    pointerEvents: 'none' as const,
    zIndex: 5,
  };

  const onChartMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    const idx = Math.max(0, Math.min(N - 1, Math.round((x / r.width) * (N - 1))));
    update({ hoverIdx: idx, hoverX: x, hoverY: y, hoverW: r.width, hoverH: r.height });
  };
  const onChartLeave = () => {
    update((s) => (s.hoverIdx != null || s.hoverX != null ? { hoverIdx: null, hoverX: null } : null));
  };

  const drawAnim = (state.chartAnim || 0) % 2 === 0 ? 'drawA' : 'drawB';

  const metricOptions = (Object.keys(metricMeta) as Metric[]).map((k) => ({
    key: k,
    label: metricMeta[k].label,
    color: metricMeta[k].color,
    value: metricSeries[k][tfKey][0],
    active: k === metric,
  }));

  const selectMetric = (k: Metric) =>
    update((s) => ({ metric: k, metricOpen: false, chartAnim: (s.chartAnim || 0) + 1, hoverIdx: null }));

  const tfSeg = tfKeys.map((k) => ({
    key: k,
    label: k,
    full: tfNames[k],
    active: tfKey === k,
    inactive: tfKey !== k,
    hovered: state.tfHover === k,
  }));

  const selectTf = (k: Timeframe) => update((s) => ({ tf: k, chartAnim: (s.chartAnim || 0) + 1, hoverIdx: null }));

  const evts = evtData[tfKey] || [];
  const evtMarkers = evts.map((e, i) => {
    const fx = Math.max(0, Math.min(1, e.x / 800));
    const p = fx * (Npts - 1);
    const i0 = Math.floor(p);
    const i1 = Math.min(Npts - 1, i0 + 1);
    const nv = norm[i0] + (norm[i1] - norm[i0]) * (p - i0);
    return { key: i, fx, fxPct: fx * 100, cyPct: (1 - nv) * 100, t: e.t, d: e.d };
  });

  const hoverOn = hi != null && state.hoverX != null;
  const hoverValue = hi != null ? fmtAxis(yTop * norm[hi]) : '';
  const hw = state.hoverW || 0;
  const hxp = state.hoverX || 0;
  const hyp = state.hoverY || 0;
  // A single, unified tooltip: when the cursor is near a peak event, the value
  // tooltip also carries the event detail — no second popup to collide with.
  const nearEvt = hoverOn ? evts.find((e) => Math.abs(e.x / 800 - hxp / (hw || 1)) < 0.05) : null;
  const tipLeftPx = Math.max(108, Math.min(hw - 108, hxp));
  const flipDown = hyp < 110;
  const hoverTipStyle = {
    position: 'absolute' as const,
    left: `${tipLeftPx.toFixed(0)}px`,
    top: `${(flipDown ? hyp + 18 : hyp - 16).toFixed(0)}px`,
    transform: `translate(-50%, ${flipDown ? '0' : '-100%'})`,
    pointerEvents: 'none' as const,
    zIndex: 21,
    background: '#1d1f23',
    border: '1px solid #45494f',
    borderRadius: '10px',
    padding: '9px 13px',
    boxShadow: '0 16px 44px rgba(0,0,0,.55)',
  };

  return (
    <div className="streams-card">
      <div className="streams-card__head">
        <div className="streams-card__metric-wrap">
          <button
            type="button"
            className={`streams-card__metric-btn ${state.metricOpen ? 'streams-card__metric-btn--open' : ''}`}
            onClick={() => update((s) => ({ metricOpen: !s.metricOpen }))}
          >
            <span>{metricLabel}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bdbbb1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {state.metricOpen && (
            <>
              <div className="streams-card__metric-scrim" onClick={() => update({ metricOpen: false })} />
              <div className="streams-card__metric-menu">
                <div className="streams-card__metric-menu-label">Metric</div>
                {metricOptions.map((m) => (
                  <div
                    key={m.key}
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
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="streams-card__value-row">
            <div className="streams-card__value">{metricValue}</div>
            <div className="streams-card__delta" style={{ color: metricDeltaColor }}>{metricDelta}</div>
          </div>
        </div>
        <div className="streams-card__tfseg">
          {tfSeg.map((t) => (
            <div
              key={t.key}
              className="streams-card__tfseg-item"
              onMouseEnter={() => update({ tfHover: t.key })}
              onMouseLeave={() => update((s) => (s.tfHover === t.key ? { tfHover: null } : null))}
            >
              {t.active && (
                <div className="streams-card__tfseg-btn streams-card__tfseg-btn--active" onClick={() => selectTf(t.key)}>
                  {t.label}
                </div>
              )}
              {t.inactive && (
                <div className="streams-card__tfseg-btn streams-card__tfseg-btn--inactive" onClick={() => selectTf(t.key)}>
                  {t.label}
                </div>
              )}
              {t.hovered && <div className="streams-card__tfseg-tooltip">{t.full}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="streams-card__body">
        <div className="streams-card__ylabels">
          {yLabels.map((y, i) => <span key={i}>{y}</span>)}
        </div>
        <div className="streams-card__chart-col">
          <div className="streams-card__chart-area" onMouseMove={onChartMove} onMouseLeave={onChartLeave}>
            {gridLines.map((g) => <div key={g.key} style={g.style} />)}
            <div className="streams-card__avg-line" style={{ top: `${avgPct}%` }} />
            <div className="streams-card__avg-pill" style={{ top: `${avgPct}%` }}>
              <span className="streams-card__avg-dot" />
              <span className="streams-card__avg-label">Avg</span>
              <span className="streams-card__avg-value">{avgLabel}</span>
            </div>
            <svg ref={areaRef} viewBox="0 0 800 300" preserveAspectRatio="none" className="streams-card__svg">
              <defs>
                <linearGradient id="streamFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricColor} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={metricColor} stopOpacity="0.015" />
                </linearGradient>
              </defs>
              <path d={metricAreaPath} fill="url(#streamFill)" stroke="none" className="streams-card__area-path" />
              <path
                key={drawAnim}
                d={metricLinePath}
                fill="none"
                stroke={metricColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                style={{ animation: `${drawAnim} .85s ease forwards` }}
              />
            </svg>
            {hoverOn && <div style={crosshairStyle} />}
            {dots.map((d) => <div key={d.key} style={d.style} />)}
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
            {hoverOn && (
              <div style={hoverTipStyle}>
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
