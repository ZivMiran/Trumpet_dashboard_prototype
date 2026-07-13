import { useApp } from '../../context/AppContext';
import { catalog, collections } from '../../data/catalog';
import { parsePlays, growthColor } from '../../lib/format';
import { typeOf } from '../../lib/music';
import { asset } from '../../lib/assets';
import { useOverlayExit } from '../../lib/useOverlayExit';
import { NoteIcon, CloseIcon, DownloadIcon, CompareIcon } from '../icons';
import './AlbumBreakdownDrawer.css';

export function AlbumBreakdownDrawer() {
  const { state, update } = useApp();
  // Latched so the drawer keeps its content while animating out.
  const { mounted, closing, latched: albumSel } = useOverlayExit(state.albumSel);
  if (!mounted || albumSel == null) return null;

  const r = catalog[albumSel];
  if (!r || !r.coll) return null;

  const tracks = collections[r.coll] || [];
  const kind = typeOf(r); // 'Album' | 'EP'
  const close = () => update({ albumSel: null });
  const maxStreams = Math.max(1, ...tracks.map((t) => parsePlays(t.streams)));

  const openTrack = (tk: (typeof tracks)[number], i: number) =>
    update({
      albumSel: null,
      sel: null,
      selTrack: {
        title: tk.name,
        album: r.title,
        date: r.date,
        fmt: r.fmt,
        streams: tk.streams,
        rate: tk.rate,
        adds: tk.adds,
        skip: tk.skip,
        growth: tk.growth,
        market: tk.market,
        status: tk.status,
        statusDot: tk.statusDot,
        _seed: (albumSel + 1) * 7 + i + 1,
      },
    });

  return (
    <>
      <div className={`album-drawer__scrim${closing ? ' album-drawer__scrim--closing' : ''}`} onClick={close} />
      <aside className={`album-drawer${closing ? ' album-drawer--closing' : ''}`}>
        <div className="album-drawer__head">
          <span className="album-drawer__head-label">{kind} Breakdown</span>
          <button type="button" className="album-drawer__close" onClick={close}>
            Close
            <CloseIcon size={13} />
          </button>
        </div>

        <div className="album-drawer__body">
          <div className="album-drawer__top">
            <div className={`album-drawer__cover ${r.img ? 'album-drawer__cover--img' : ''}`}>
              {r.img ? <img className="album-drawer__cover-img" src={asset(r.img)} alt="" /> : <NoteIcon size={32} color="currentColor" />}
            </div>
            <div className="album-drawer__top-text">
              <div className="album-drawer__title">{r.title}</div>
              <div className="album-drawer__meta">{kind} · {tracks.length} tracks · Released {r.date}</div>
              <div className="album-drawer__status-row">
                <span className="album-drawer__status-pill">
                  <span className="album-drawer__status-dot" style={{ background: r.statusDot }} />
                  {r.status}
                </span>
              </div>
            </div>
          </div>

          <div className="album-drawer__streams-card">
            <div>
              <div className="album-drawer__streams-label">Total Streams</div>
              <div className="album-drawer__streams-value">{r.streams}</div>
            </div>
            <div className="album-drawer__growth">
              <div className="album-drawer__growth-value" style={{ color: growthColor(r.growth) }}>{r.growth}</div>
              <div className="album-drawer__growth-sub">vs prev 28 days</div>
            </div>
          </div>

          <div className="album-drawer__stats">
            <div className="album-drawer__stat">
              <div className="album-drawer__stat-label">Avg Save Rate</div>
              <div className="album-drawer__stat-value">{r.rate}</div>
            </div>
            <div className="album-drawer__stat">
              <div className="album-drawer__stat-label">Total Saves</div>
              <div className="album-drawer__stat-value">{r.adds}</div>
            </div>
            <div className="album-drawer__stat">
              <div className="album-drawer__stat-label">Avg Skip Rate</div>
              <div className="album-drawer__stat-value">{r.skip}</div>
            </div>
          </div>

          <div className="album-drawer__section-head">
            <div className="album-drawer__section-title">Track breakdown</div>
            <div className="album-drawer__section-sub">streams per track · tap to open</div>
          </div>
          <div className="album-drawer__tracks">
            {tracks.map((tk, i) => (
              <button type="button" key={tk.name} className="album-drawer__track" onClick={() => openTrack(tk, i)}>
                <span className="album-drawer__track-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="album-drawer__track-mid">
                  <div className="album-drawer__track-row">
                    <span className="album-drawer__track-name">{tk.name}</span>
                    <span className="album-drawer__track-dur">{tk.dur}</span>
                  </div>
                  <div className="album-drawer__bar-track">
                    <div className="album-drawer__bar" style={{ width: `${(parsePlays(tk.streams) / maxStreams) * 100}%` }} />
                  </div>
                </div>
                <span className="album-drawer__track-streams">{tk.streams}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="album-drawer__footer">
          <button type="button" className="album-drawer__report-btn">Open full report</button>
          <button type="button" className="album-drawer__compare-btn" onClick={() => update({ compare: [albumSel] })}>
            <CompareIcon size={15} />
            Compare
          </button>
          <button type="button" className="album-drawer__export-btn">
            <DownloadIcon size={14} />
            Export
          </button>
        </div>
      </aside>
    </>
  );
}
