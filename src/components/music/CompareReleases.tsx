import { useState, type MouseEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { catalog } from '../../data/catalog';
import { fmtAxis } from '../../lib/format';
import { smoothPath, niceCeil, type Point } from '../../lib/chart';
import { typeOf, typeDotOf } from '../../lib/music';
import {
  compareWindows,
  compareMetrics,
  releaseSeries,
  metricTotal,
  axisTicks,
  pointLabel,
  defaultCompareB,
  type CompareWindow,
  type CompareMetric,
} from '../../lib/compare';
import { CloseIcon, ChevronDownIcon, CompareIcon, SearchIcon, CheckIcon } from '../icons';
import { asset } from '../../lib/assets';
import { useOverlayExit } from '../../lib/useOverlayExit';
import './CompareReleases.css';

const COLOR_A = '#e3b53a';
const COLOR_B = '#6f9bd6';
const VB_W = 800;
const VB_H = 300;
const PAD_T = 16;
const PAD_B = 10;

// Module-scope so it keeps its own search state + input focus across re-renders.
function TrackPickerMenu({
  currentIdx,
  excludeIdx,
  align,
  closing,
  onPick,
  onClose,
}: {
  currentIdx: number;
  excludeIdx: number;
  align: 'left' | 'right';
  closing?: boolean;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const rows = catalog
    .map((r, i) => ({ r, i }))
    .filter((x) => x.i !== excludeIdx)
    .filter((x) => !query || (x.r.title + ' ' + x.r.album).toLowerCase().includes(query));

  return (
    <>
      <div className={`compare__picker-scrim${closing ? ' compare__picker-scrim--closing' : ''}`} onClick={onClose} />
      <div className={`compare__picker compare__picker--${align}${closing ? ' compare__picker--closing' : ''}`}>
        <div className="compare__picker-search">
          <SearchIcon size={14} />
          <input
            className="compare__picker-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search releases…"
            autoFocus
          />
        </div>
        <div className="compare__picker-list">
          {rows.map((x) => (
            <button
              type="button"
              key={x.i}
              className={`compare__picker-row ${x.i === currentIdx ? 'compare__picker-row--active' : ''}`}
              onClick={() => onPick(x.i)}
            >
              {x.r.img ? (
                <img className="compare__picker-cover" src={asset(x.r.img)} alt="" loading="lazy" />
              ) : (
                <span className="compare__picker-dot" style={{ background: typeDotOf(x.r) }} />
              )}
              <span className="compare__picker-name">{x.r.title}</span>
              <span className="compare__picker-fmt">{typeOf(x.r)}</span>
              {x.i === currentIdx && <CheckIcon size={14} />}
            </button>
          ))}
          {rows.length === 0 && <div className="compare__picker-empty">No releases match “{q}”.</div>}
        </div>
      </div>
    </>
  );
}

export function CompareReleases() {
  const { state, update } = useApp();
  const [win, setWin] = useState<CompareWindow>('1W');
  const [metric, setMetric] = useState<CompareMetric>('streams');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [picker, setPicker] = useState<null | 'A' | 'B'>(null);
  const [metricOpen, setMetricOpen] = useState(false);
  // Internal popovers get the same held-mount exit treatment as the modal.
  const pickerExit = useOverlayExit(picker, 120);
  const metricExit = useOverlayExit(metricOpen || null, 120);
  // Latched so the modal keeps its content while animating out.
  const { mounted, closing, latched: ids } = useOverlayExit(
    state.compare && state.compare.length > 0 ? state.compare : null,
  );

  if (!mounted || !ids || ids.length === 0) return null;

  const aIdx = ids[0];
  const bIdx = ids[1] ?? -1;
  const A = catalog[aIdx];
  const B = bIdx >= 0 ? catalog[bIdx] : null;
  if (!A) return null;

  const w = compareWindows.find((x) => x.key === win)!;
  const metricDef = compareMetrics.find((m) => m.key === metric)!;
  const n = w.points;

  const seriesA = releaseSeries(aIdx + 1, metricTotal(A, metric), metric, w);
  const seriesB = B ? releaseSeries(bIdx + 1, metricTotal(B, metric), metric, w) : [];
  const rawMax = Math.max(1, ...seriesA, ...seriesB);
  const yMax = niceCeil(rawMax);

  const xAt = (i: number) => (n > 1 ? (i / (n - 1)) * VB_W : VB_W / 2);
  const yAt = (v: number) => PAD_T + (1 - v / yMax) * (VB_H - PAD_T - PAD_B);
  const xPct = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50);
  const yPct = (v: number) => (yAt(v) / VB_H) * 100;

  const pointsOf = (s: number[]): Point[] => s.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const linePath = (s: number[]) => smoothPath(pointsOf(s));
  const areaPath = (s: number[]) => `${smoothPath(pointsOf(s))} L ${VB_W} ${VB_H} L 0 ${VB_H} Z`;

  const close = () => update({ compare: null });
  const setSlot = (slot: 'A' | 'B', i: number) => {
    update({ compare: slot === 'A' ? [i, bIdx >= 0 ? bIdx : undefined].filter((x) => x != null) as number[] : [aIdx, i] });
    setPicker(null);
  };

  const total = (s: number[]) => s.reduce((a, b) => a + b, 0);
  const peakIdx = (s: number[]) => (s.length ? s.reduce((m, v, i) => (v > s[m] ? i : m), 0) : 0);
  const totalA = total(seriesA);
  const totalB = total(seriesB);
  const pA = peakIdx(seriesA);
  const pB = peakIdx(seriesB);
  const leadPct = (a: number, b: number) => (Math.min(a, b) > 0 ? Math.round((Math.abs(a - b) / Math.min(a, b)) * 100) : 0);

  const kpis = B
    ? [
        { label: `${w.full} · ${metricDef.label}`, a: fmtAxis(totalA), b: fmtAxis(totalB), aWins: totalA >= totalB, delta: leadPct(totalA, totalB) },
        { label: 'Peak', a: fmtAxis(seriesA[pA] || 0), b: fmtAxis(seriesB[pB] || 0), aWins: (seriesA[pA] || 0) >= (seriesB[pB] || 0), delta: leadPct(seriesA[pA] || 0, seriesB[pB] || 0), subA: pointLabel(w, pA), subB: pointLabel(w, pB) },
        { label: 'Per-period average', a: fmtAxis(Math.round(totalA / n)), b: fmtAxis(Math.round(totalB / n)), aWins: totalA >= totalB, delta: leadPct(totalA, totalB) },
        { label: `Lifetime ${metricDef.label}`, a: fmtAxis(metricTotal(A, metric)), b: fmtAxis(metricTotal(B, metric)), aWins: metricTotal(A, metric) >= metricTotal(B, metric), delta: leadPct(metricTotal(A, metric), metricTotal(B, metric)) },
      ]
    : [];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    setHoverIdx(Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1)))));
  };

  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => ({ f, v: fmtAxis(Math.round(yMax * f)) }));
  const hoverRight = hoverIdx != null && xPct(hoverIdx) > 58;
  const suggestB = defaultCompareB(aIdx);
  const drawKey = `${win}-${metric}-${aIdx}-${bIdx}`;

  return (
    <>
      <div className={`compare__scrim${closing ? ' compare__scrim--closing' : ''}`} onClick={close} />
      <div className="compare__center">
        <div
          className={`compare__modal${closing ? ' compare__modal--closing' : ''}`}
          role="dialog"
          aria-label="Compare releases"
        >
        <div className="compare__head">
          <div className="compare__head-icon"><CompareIcon size={17} /></div>
          <div className="compare__head-text">
            <div className="compare__title">Compare releases</div>
            <div className="compare__sub">Performance from release day · {metricDef.label.toLowerCase()} over time</div>
          </div>
          <button type="button" className="compare__close" onClick={close} aria-label="Close comparison">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="compare__controls">
          <div className="compare__selectors">
            <div className="compare__sel-wrap">
              <button type="button" className="compare__sel" onClick={() => setPicker((p) => (p === 'A' ? null : 'A'))}>
                <span className="compare__sel-dot" style={{ background: COLOR_A }} />
                <span className="compare__sel-name">{A.title}</span>
                <ChevronDownIcon size={14} />
              </button>
              {pickerExit.mounted && pickerExit.latched === 'A' && (
                <TrackPickerMenu currentIdx={aIdx} excludeIdx={bIdx} align="left" closing={pickerExit.closing} onPick={(i) => setSlot('A', i)} onClose={() => setPicker(null)} />
              )}
            </div>
            <span className="compare__vs">vs</span>
            <div className="compare__sel-wrap">
              {B ? (
                <button type="button" className="compare__sel" onClick={() => setPicker((p) => (p === 'B' ? null : 'B'))}>
                  <span className="compare__sel-dot" style={{ background: COLOR_B }} />
                  <span className="compare__sel-name">{B.title}</span>
                  <ChevronDownIcon size={14} />
                </button>
              ) : (
                <button type="button" className="compare__sel compare__sel--add" onClick={() => setPicker((p) => (p === 'B' ? null : 'B'))}>
                  <span className="compare__sel-plus">+</span>
                  Add a release
                </button>
              )}
              {pickerExit.mounted && pickerExit.latched === 'B' && (
                <TrackPickerMenu currentIdx={bIdx} excludeIdx={aIdx} align="left" closing={pickerExit.closing} onPick={(i) => setSlot('B', i)} onClose={() => setPicker(null)} />
              )}
            </div>
          </div>

          <div className="compare__toggles">
            <div className="compare__metric-wrap">
              <button type="button" className={`compare__metric-btn ${metricOpen ? 'compare__metric-btn--open' : ''}`} onClick={() => setMetricOpen((o) => !o)}>
                {metricDef.label}
                <ChevronDownIcon size={14} />
              </button>
              {metricExit.mounted && (
                <>
                  <div
                    className={`compare__picker-scrim${metricExit.closing ? ' compare__picker-scrim--closing' : ''}`}
                    onClick={() => setMetricOpen(false)}
                  />
                  <div className={`compare__metric-menu${metricExit.closing ? ' compare__metric-menu--closing' : ''}`}>
                    {compareMetrics.map((m) => (
                      <button
                        type="button"
                        key={m.key}
                        className={`compare__metric-row ${metric === m.key ? 'compare__metric-row--active' : ''}`}
                        onClick={() => { setMetric(m.key); setMetricOpen(false); }}
                      >
                        <div className="compare__metric-row-text">
                          <span className="compare__metric-row-label">{m.label}</span>
                          <span className="compare__metric-row-desc">{m.desc}</span>
                        </div>
                        {metric === m.key && <CheckIcon size={15} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="compare__seg" role="group" aria-label="Timeframe since release">
              {compareWindows.map((cw) => (
                <button
                  key={cw.key}
                  type="button"
                  title={cw.full}
                  aria-pressed={win === cw.key}
                  className={`compare__seg-btn ${win === cw.key ? 'compare__seg-btn--active' : ''}`}
                  onClick={() => setWin(cw.key)}
                >
                  {cw.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="compare__body">
          <div className="compare__chart-card">
            <div className="compare__chart-head">
              <div className="compare__legend">
                <span className="compare__legend-item">
                  <span className="compare__legend-dash" style={{ background: COLOR_A }} />
                  {A.title}
                </span>
                {B && (
                  <span className="compare__legend-item">
                    <span className="compare__legend-dash" style={{ background: COLOR_B }} />
                    {B.title}
                  </span>
                )}
              </div>
              <span className="compare__chart-note">{metricDef.label} · {w.full}</span>
            </div>

            <div className="compare__plot-row">
              <div className="compare__ylabels">
                {yTicks.map((t) => <span key={t.f}>{t.v}</span>)}
              </div>
              <div className="compare__chart-col">
                <div className="compare__chart-area" onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
                  {[25, 50, 75].map((p) => (
                    <div key={p} className="compare__grid" style={{ top: `${p}%` }} />
                  ))}
                  <svg key={drawKey} className="compare__svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cmpFillA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLOR_A} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={COLOR_A} stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="cmpFillB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLOR_B} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={COLOR_B} stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    {B && <path d={areaPath(seriesB)} fill="url(#cmpFillB)" className="compare__area" />}
                    <path d={areaPath(seriesA)} fill="url(#cmpFillA)" className="compare__area" />
                    {B && (
                      <path
                        d={linePath(seriesB)}
                        fill="none"
                        stroke={COLOR_B}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        pathLength={1}
                        className="compare__line compare__line--b"
                      />
                    )}
                    <path
                      d={linePath(seriesA)}
                      fill="none"
                      stroke={COLOR_A}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      pathLength={1}
                      className="compare__line"
                    />
                  </svg>

                  {hoverIdx != null && (
                    <>
                      <div className="compare__crosshair" style={{ left: `${xPct(hoverIdx)}%` }} />
                      <div className="compare__dot" style={{ left: `${xPct(hoverIdx)}%`, top: `${yPct(seriesA[hoverIdx])}%`, borderColor: COLOR_A }} />
                      {B && <div className="compare__dot" style={{ left: `${xPct(hoverIdx)}%`, top: `${yPct(seriesB[hoverIdx])}%`, borderColor: COLOR_B }} />}
                      <div className={`compare__tip ${hoverRight ? 'compare__tip--left' : ''}`} style={{ left: `${xPct(hoverIdx)}%` }}>
                        <div className="compare__tip-label">{pointLabel(w, hoverIdx)}</div>
                        <div className="compare__tip-row">
                          <span className="compare__tip-dot" style={{ background: COLOR_A }} />
                          <span className="compare__tip-name">{A.title}</span>
                          <span className="compare__tip-val">{fmtAxis(seriesA[hoverIdx])}</span>
                        </div>
                        {B && (
                          <div className="compare__tip-row">
                            <span className="compare__tip-dot" style={{ background: COLOR_B }} />
                            <span className="compare__tip-name">{B.title}</span>
                            <span className="compare__tip-val">{fmtAxis(seriesB[hoverIdx])}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="compare__xlabels">
                  {axisTicks(w).map((t) => (
                    <span key={t.idx} style={{ left: `${xPct(t.idx)}%` }}>{t.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="compare__side">
            {B ? (
              kpis.map((k) => (
                <div key={k.label} className="compare__kpi">
                  <div className="compare__kpi-head">
                    <span className="compare__kpi-label">{k.label}</span>
                    {k.delta > 0 && <span className="compare__kpi-chip">↑ {k.delta}%</span>}
                  </div>
                  <div className={`compare__kpi-row ${k.aWins ? 'compare__kpi-row--win' : ''}`}>
                    <span className="compare__kpi-dot" style={{ background: COLOR_A }} />
                    <span className="compare__kpi-name">{A.title}</span>
                    <span className="compare__kpi-val">{k.a}{k.subA ? <em className="compare__kpi-sub"> · {k.subA}</em> : null}</span>
                  </div>
                  <div className={`compare__kpi-row ${!k.aWins ? 'compare__kpi-row--win' : ''}`}>
                    <span className="compare__kpi-dot" style={{ background: COLOR_B }} />
                    <span className="compare__kpi-name">{B.title}</span>
                    <span className="compare__kpi-val">{k.b}{k.subB ? <em className="compare__kpi-sub"> · {k.subB}</em> : null}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="compare__empty">
                <div className="compare__empty-icon"><CompareIcon size={22} /></div>
                <div className="compare__empty-title">Add a release to compare</div>
                <div className="compare__empty-text">
                  Pick a second release to chart it against <b>{A.title}</b> and break down streams, peak day &amp; lifetime totals.
                </div>
                <button type="button" className="compare__empty-cta" onClick={() => setPicker('B')}>
                  Choose a release
                </button>
                {suggestB >= 0 && (
                  <button type="button" className="compare__empty-suggest" onClick={() => update({ compare: [aIdx, suggestB] })}>
                    <span className="compare__empty-suggest-dot" style={{ background: COLOR_B }} />
                    Suggested · {catalog[suggestB].title}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
