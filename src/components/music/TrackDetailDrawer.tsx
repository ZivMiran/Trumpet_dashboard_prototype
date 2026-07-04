import { useApp, type DrillTrack } from '../../context/AppContext';
import { catalog } from '../../data/catalog';
import { makeWrand } from '../../lib/seed';
import { growthColor } from '../../lib/format';
import { CompareIcon } from '../icons';
import type { CatalogTrack } from '../../types';
import './TrackDetailDrawer.css';

const NB = 64;

export function TrackDetailDrawer() {
  const { state, update } = useApp();
  const { sel, selTrack } = state;
  const hasSel = sel != null || selTrack != null;
  if (!hasSel) return null;

  const cur: DrillTrack | CatalogTrack = selTrack ?? catalog[sel!];
  const close = () => update({ sel: null, selTrack: null });

  // Compare opens on the current release — for a collection track, its parent album.
  const seedIdx = sel != null ? sel : catalog.findIndex((c) => c.coll === (selTrack?.album ?? ''));
  const openCompare = () => seedIdx >= 0 && update({ compare: [seedIdx] });

  const wseed = selTrack ? selTrack._seed : (sel ?? 0) + 1;
  const skipFrom = 0.12 + ((wseed * 2) % 3) * 0.045;
  const skipTo = skipFrom + 0.13;
  const saveFrom = 0.52 + (wseed % 4) * 0.04;
  const saveTo = saveFrom + 0.12;
  const wrand = makeWrand(wseed);
  const saveMid = (saveFrom + saveTo) / 2;

  const waveBars = [];
  for (let k = 0; k < NB; k++) {
    const t = k / (NB - 1);
    let h = 0.28 + wrand(k) * 0.5;
    h += Math.max(0, 0.32 - Math.abs(t - saveMid) * 1.7);
    if (t >= skipFrom && t <= skipTo) h *= 0.62;
    h = Math.max(0.12, Math.min(1, h));
    const inSkip = t >= skipFrom && t <= skipTo;
    const inSave = t >= saveFrom && t <= saveTo;
    const color = inSkip ? '#e5484d' : inSave ? '#45c08a' : '#5b5f66';
    const op = inSkip || inSave ? 1 : 0.62;
    waveBars.push({ key: k, height: h * 100, color, op });
  }

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

  const curGrowthColor = cur.growth ? growthColor(cur.growth) : '#45c08a';

  return (
    <>
      <div className="track-drawer__scrim" onClick={close} />
      <aside className="track-drawer">
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
            <div className="track-drawer__icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
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

          <div className="track-drawer__streams-card">
            <div>
              <div className="track-drawer__streams-label">Total Streams</div>
              <div className="track-drawer__streams-value">{cur.streams}</div>
            </div>
            <div className="track-drawer__growth">
              <div className="track-drawer__growth-value" style={{ color: curGrowthColor }}>{cur.growth}</div>
              <div className="track-drawer__growth-sub">vs prev 28 days</div>
            </div>
          </div>

          <div className="track-drawer__stats">
            <div className="track-drawer__stat">
              <div className="track-drawer__stat-label">Save Rate</div>
              <div className="track-drawer__stat-value">{cur.rate}</div>
            </div>
            <div className="track-drawer__stat">
              <div className="track-drawer__stat-label">Playlist Adds</div>
              <div className="track-drawer__stat-value">{cur.adds}</div>
            </div>
            <div className="track-drawer__stat">
              <div className="track-drawer__stat-label">Skip Rate</div>
              <div className="track-drawer__stat-value">{cur.skip}</div>
            </div>
          </div>

          <div className="track-drawer__section-head">
            <div className="track-drawer__section-title">Engagement waveform</div>
            <div className="track-drawer__section-sub">where listeners skip &amp; save</div>
          </div>
          <div className="track-drawer__wave-card">
            <div className="track-drawer__wave-area">
              {clumps.map((cl, i) => (
                <div
                  key={i}
                  className="track-drawer__clump-band"
                  style={{
                    left: `${cl.left}%`,
                    width: `${cl.width}%`,
                    background: `${cl.color}1f`,
                    borderLeft: `1px solid ${cl.color}55`,
                    borderRight: `1px solid ${cl.color}55`,
                  }}
                />
              ))}
              <div className="track-drawer__bars">
                {waveBars.map((bar) => (
                  <div
                    key={bar.key}
                    className="track-drawer__bar"
                    style={{ height: `${bar.height.toFixed(1)}%`, background: bar.color, opacity: bar.op }}
                  />
                ))}
              </div>
              {clumps.map((cl, i) => (
                <div
                  key={i}
                  className="track-drawer__clump-badge"
                  style={{ left: `${cl.center}%`, borderColor: `${cl.color}66` }}
                >
                  <span className="track-drawer__clump-dot" style={{ background: cl.color }} />
                  {cl.label}
                </div>
              ))}
            </div>
            <div className="track-drawer__time-axis">
              <span>0:00</span>
              <span>1:00</span>
              <span>2:00</span>
              <span>3:00</span>
              <span>end</span>
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
              Plays
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
          <button type="button" className="track-drawer__report-btn">Open full report</button>
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
