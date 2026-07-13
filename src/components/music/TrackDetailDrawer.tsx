import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useApp, type DrillTrack } from '../../context/AppContext';
import { catalog, tfDefs } from '../../data/catalog';
import { tfVs } from '../../data/overview';
import { makeWrand } from '../../lib/seed';
import { useOverlayExit } from '../../lib/useOverlayExit';
import { fmtAxis, fmtStreams, growthColor, parseAdds, parseStreams } from '../../lib/format';
import { asset, coverFor } from '../../lib/assets';
import { CompareIcon } from '../icons';
import type { CatalogTrack, Timeframe } from '../../types';
import './TrackDetailDrawer.css';

const NB = 64;
const TRACK_SEC = 225; // nominal 3:45 runtime backing the time axis
const drawerTfs: Timeframe[] = ['1D', '1W', '1M', '1Y', 'All'];

// Growth deltas compress on short windows and compound on long ones.
const growthF: Record<Timeframe, number> = { '1D': 0.25, '1W': 0.55, '1M': 1, '1Y': 3.4, All: 0 };

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function TrackDetailDrawer() {
  const { state, update } = useApp();
  // Latched so the drawer keeps its content while animating out.
  const { mounted, closing, latched } = useOverlayExit(
    state.sel != null || state.selTrack != null ? { sel: state.sel, selTrack: state.selTrack } : null,
  );
  const { sel, selTrack } = latched ?? { sel: null, selTrack: null };
  const [waveHover, setWaveHover] = useState<{ t: number; clump: number | null } | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const playTimer = useRef<number | null>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const trackKey = selTrack ? `t-${selTrack.title}` : `c-${sel}`;

  // New track (or drawer reopen) — stop any snippet and clear wave hover.
  useEffect(() => {
    setPlaying(null);
    setWaveHover(null);
    if (playTimer.current) {
      window.clearTimeout(playTimer.current);
      playTimer.current = null;
    }
  }, [trackKey]);

  useEffect(() => () => {
    if (playTimer.current) window.clearTimeout(playTimer.current);
  }, []);

  if (!mounted || latched == null) return null;

  const cur: DrillTrack | CatalogTrack = selTrack ?? catalog[sel!];
  // A selected release carries its own cover; a collection sub-track borrows its
  // parent album's artwork (its `album` field holds the parent title).
  const cover = selTrack ? coverFor(selTrack.album) : catalog[sel!].img ? asset(catalog[sel!].img!) : undefined;
  const close = () => update({ sel: null, selTrack: null });

  // Compare opens on the current release — for a collection track, its parent album.
  const seedIdx = sel != null ? sel : catalog.findIndex((c) => c.coll === (selTrack?.album ?? ''));
  const openCompare = () => seedIdx >= 0 && update({ compare: [seedIdx] });

  // Timeframe scaling: streams and saves scale with the window; save/skip rates
  // are ratios and hold steady. "All" reads as lifetime, like the streams chart.
  const tf = state.drawerTf;
  const tfDef = tfDefs[tf];
  const isAll = tf === 'All';
  const streamsShown = fmtStreams(parseStreams(cur.streams) * tfDef.f);
  const savesShown = fmtAxis(Math.round(parseAdds(cur.adds) * tfDef.f));
  const gScaled = parseFloat(cur.growth) * growthF[tf];
  const growthShown = isAll
    ? 'lifetime'
    : `${gScaled >= 0 ? '+' : ''}${Math.abs(gScaled) < 10 ? gScaled.toFixed(1) : Math.round(gScaled)}%`;
  const curGrowthColor = isAll ? '#8f9299' : cur.growth ? growthColor(cur.growth) : '#45c08a';

  const wseed = selTrack ? selTrack._seed : (sel ?? 0) + 1;
  const skipFrom = 0.12 + ((wseed * 2) % 3) * 0.045;
  const skipTo = skipFrom + 0.13;
  const saveFrom = 0.52 + (wseed % 4) * 0.04;
  const saveTo = saveFrom + 0.12;
  const wrand = makeWrand(wseed);
  const saveMid = (saveFrom + saveTo) / 2;

  const clumpDefs = [
    { color: '#e5484d', from: skipFrom, to: skipTo, label: `${cur.skip || '—'} skipped here` },
    { color: '#45c08a', from: saveFrom, to: saveTo, label: `Chorus · ${cur.rate || '—'} saved` },
  ];
  const clumps = clumpDefs.map((c) => {
    const left = (c.from * 100).toFixed(1);
    const width = ((c.to - c.from) * 100).toFixed(1);
    const center = (((c.from + c.to) / 2) * 100).toFixed(1);
    return { color: c.color, label: c.label, left, width, center };
  });

  // The cluster currently in focus — a playing snippet wins over hover.
  const activeClump = playing ?? waveHover?.clump ?? null;

  const waveBars = [];
  for (let k = 0; k < NB; k++) {
    const t = k / (NB - 1);
    let h = 0.28 + wrand(k) * 0.5;
    h += Math.max(0, 0.32 - Math.abs(t - saveMid) * 1.7);
    if (t >= skipFrom && t <= skipTo) h *= 0.62;
    h = Math.max(0.12, Math.min(1, h));
    const inSkip = t >= skipFrom && t <= skipTo;
    const inSave = t >= saveFrom && t <= saveTo;
    const clump = inSkip ? 0 : inSave ? 1 : null;
    const color = inSkip ? '#e5484d' : inSave ? '#45c08a' : '#5b5f66';
    let op = inSkip || inSave ? 1 : 0.62;
    if (activeClump != null && clump !== activeClump) op *= 0.3;
    waveBars.push({ key: k, height: h * 100, color, op, clump });
  }

  const startPlay = (i: number) => {
    if (playTimer.current) window.clearTimeout(playTimer.current);
    setPlaying(i);
    playTimer.current = window.setTimeout(() => {
      setPlaying(null);
      playTimer.current = null;
    }, 3000);
  };

  const onWaveMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = waveRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const clumpIdx = clumpDefs.findIndex((c) => t >= c.from && t <= c.to);
    setWaveHover({ t, clump: clumpIdx === -1 ? null : clumpIdx });
  };

  const onWaveClick = () => {
    if (waveHover?.clump != null) startPlay(waveHover.clump);
  };

  const chipClump = playing ?? waveHover?.clump ?? null;

  return (
    <>
      <div className={`track-drawer__scrim${closing ? ' track-drawer__scrim--closing' : ''}`} onClick={close} />
      <aside className={`track-drawer${closing ? ' track-drawer--closing' : ''}`}>
        <div className="track-drawer__head">
          <span className="track-drawer__head-label">Track Detail</span>
          <button type="button" className="track-drawer__close" onClick={close}>
            Close
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="track-drawer__body">
          <div className="track-drawer__top">
            <div className={`track-drawer__icon ${cover ? 'track-drawer__icon--cover' : ''}`}>
              {cover ? (
                <img className="track-drawer__cover" src={cover} alt="" />
              ) : (
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              )}
            </div>
            <div className="track-drawer__top-text">
              <div className="track-drawer__title">{cur.title}</div>
              <div className="track-drawer__meta">{cur.album} · Released {cur.date}</div>
              <div className="track-drawer__status-row">
                <span className="track-drawer__status-pill">
                  <span className="track-drawer__status-dot" style={{ background: cur.statusDot }} />
                  {cur.status}
                </span>
              </div>
            </div>
          </div>

          <div className="track-drawer__perf-head">
            <div className="track-drawer__section-title">Performance</div>
            <div className="track-drawer__tabs">
              {drawerTfs.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`track-drawer__tab ${tf === t ? 'track-drawer__tab--active' : ''}`}
                  onClick={() => update({ drawerTf: t })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="track-drawer__streams-card">
            <div>
              <div className="track-drawer__streams-label">Streams · {tfDef.phrase}</div>
              <div className="track-drawer__streams-value">{streamsShown}</div>
            </div>
            <div className="track-drawer__growth">
              <div className="track-drawer__growth-value" style={{ color: curGrowthColor }}>{growthShown}</div>
              {!isAll && <div className="track-drawer__growth-sub">{tfVs[tf]}</div>}
            </div>
          </div>

          <div className="track-drawer__stats">
            <div className="track-drawer__stat">
              <div className="track-drawer__stat-label">Save Rate</div>
              <div className="track-drawer__stat-value">{cur.rate}</div>
            </div>
            <div className="track-drawer__stat">
              <div className="track-drawer__stat-label">Saves</div>
              <div className="track-drawer__stat-value">{savesShown}</div>
            </div>
            <div className="track-drawer__stat">
              <div className="track-drawer__stat-label">Skip Rate</div>
              <div className="track-drawer__stat-value">{cur.skip}</div>
            </div>
          </div>

          <div className="track-drawer__section-head">
            <div className="track-drawer__section-title">Engagement waveform</div>
            <div className="track-drawer__section-sub">where listeners skip &amp; save — hover a cluster to preview it</div>
          </div>
          <div className="track-drawer__wave-card">
            <div
              className="track-drawer__wave-area"
              ref={waveRef}
              style={{ cursor: waveHover?.clump != null ? 'pointer' : 'default' }}
              onMouseMove={onWaveMove}
              onMouseLeave={() => setWaveHover(null)}
              onClick={onWaveClick}
            >
              {clumps.map((cl, i) => (
                <div
                  key={i}
                  className="track-drawer__clump-band"
                  style={{
                    left: `${cl.left}%`,
                    width: `${cl.width}%`,
                    background: `${cl.color}${activeClump === i ? '30' : '1f'}`,
                    borderLeft: `1px solid ${cl.color}${activeClump === i ? '88' : '55'}`,
                    borderRight: `1px solid ${cl.color}${activeClump === i ? '88' : '55'}`,
                  }}
                />
              ))}
              <div className="track-drawer__bars" key={trackKey}>
                {waveBars.map((bar) => {
                  const eq = playing != null && bar.clump === playing;
                  return (
                    <div
                      key={bar.key}
                      className={`track-drawer__bar ${eq ? 'track-drawer__bar--eq' : ''}`}
                      style={{
                        height: `${bar.height.toFixed(1)}%`,
                        background: bar.color,
                        opacity: bar.op,
                        animationDelay: eq ? `${(bar.key % 4) * 0.1}s` : `${bar.key * 0.007}s`,
                      }}
                    />
                  );
                })}
              </div>
              {clumps.map((cl, i) => (
                <div
                  key={i}
                  className="track-drawer__clump-badge"
                  style={{ left: `${cl.center}%`, borderColor: `${cl.color}${activeClump === i ? 'aa' : '66'}` }}
                >
                  <span className="track-drawer__clump-dot" style={{ background: cl.color }} />
                  {cl.label}
                </div>
              ))}
              {playing != null && (
                <div
                  className="track-drawer__play-zone"
                  key={`play-${playing}`}
                  style={{ left: `${clumps[playing].left}%`, width: `${clumps[playing].width}%` }}
                >
                  <div className="track-drawer__play-progress" />
                  <div className="track-drawer__playhead" />
                </div>
              )}
              {waveHover && playing == null && (
                <div
                  className="track-drawer__wave-cursor"
                  style={{ left: `${(Math.min(0.96, Math.max(0.04, waveHover.t)) * 100).toFixed(1)}%` }}
                >
                  <span className="track-drawer__wave-time">{fmtTime(waveHover.t * TRACK_SEC)}</span>
                </div>
              )}
              {chipClump != null && (
                <button
                  type="button"
                  className={`track-drawer__snippet-chip ${playing != null ? 'track-drawer__snippet-chip--playing' : ''}`}
                  style={{ left: `${clumps[chipClump].center}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startPlay(chipClump);
                  }}
                >
                  {playing != null ? (
                    <>
                      <span className="track-drawer__eq" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      Playing snippet…
                    </>
                  ) : (
                    <>
                      <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" aria-hidden="true">
                        <path d="M0.5 0.8v8.4c0 0.6 0.66 0.97 1.18 0.66l7-4.2a0.78 0.78 0 0 0 0-1.33l-7-4.2A0.78 0.78 0 0 0 0.5 0.8Z" />
                      </svg>
                      Hear this part
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="track-drawer__time-axis">
              <span>0:00</span>
              <span>1:00</span>
              <span>2:00</span>
              <span>3:00</span>
              <span>3:45</span>
            </div>
          </div>
          <div className="track-drawer__legend">
            <span className="track-drawer__legend-item">
              <span className="track-drawer__legend-dot" style={{ background: '#e5484d' }} />
              Skip cluster
            </span>
            <span className="track-drawer__legend-item">
              <span className="track-drawer__legend-dot" style={{ background: '#45c08a' }} />
              Save cluster
            </span>
            <span className="track-drawer__legend-item">
              <span className="track-drawer__legend-dot" style={{ background: '#5b5f66', opacity: 0.7 }} />
              Streams
            </span>
          </div>

          <div className="track-drawer__section-title track-drawer__markets-title">Top markets</div>
          <div className="track-drawer__markets">
            <div className="track-drawer__market-row">
              <span className="track-drawer__market-name">{cur.market}</span>
              <div className="track-drawer__market-bar-track">
                <div className="track-drawer__market-bar" style={{ width: '72%', background: '#e3b53a' }} />
              </div>
              <span className="track-drawer__market-pct">42%</span>
            </div>
            <div className="track-drawer__market-row">
              <span className="track-drawer__market-name">Germany</span>
              <div className="track-drawer__market-bar-track">
                <div className="track-drawer__market-bar" style={{ width: '44%', background: '#8a8d94' }} />
              </div>
              <span className="track-drawer__market-pct">26%</span>
            </div>
            <div className="track-drawer__market-row">
              <span className="track-drawer__market-name">United Kingdom</span>
              <div className="track-drawer__market-bar-track">
                <div className="track-drawer__market-bar" style={{ width: '31%', background: '#8a8d94' }} />
              </div>
              <span className="track-drawer__market-pct">18%</span>
            </div>
          </div>
        </div>

        <div className="track-drawer__footer">
          <button type="button" className="track-drawer__compare-btn" onClick={openCompare}>
            <CompareIcon size={15} />
            Compare
          </button>
          <button type="button" className="track-drawer__export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </aside>
    </>
  );
}
