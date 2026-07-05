import { useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { aBase, mapTfConfig } from '../../data/audience';
import { marketsForTf, scopeNameFor } from '../../lib/audience';
import {
  MAP_ASPECT,
  computeHeatIndex,
  coverSize,
  drawHeatDots,
  drawOcean,
  heatMarkersFrom,
} from '../../lib/mapHeat';
import type { Timeframe } from '../../types';
import worldMapDots from '../../data/worldMapDots.json';
import './ListenersMap.css';

const DOTS = new Float32Array(worldMapDots.dots.length);
for (let i = 0; i < worldMapDots.dots.length; i++) {
  DOTS[i] = worldMapDots.dots[i] / worldMapDots.scale;
}

const TF_KEYS: Timeframe[] = ['1D', '1W', '1M', '1Y', 'All'];

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
// Default view: mid-Atlantic between the two biggest clusters (USA + Europe).
const HOME_VIEW = { zoom: 1, cx: 37, cy: 50 };

// Camera feel. Every input moves a *target* view; a single follower loop
// eases the visible view toward it (exponential approach, ~TAU ms to close
// 63% of the gap). One system covers wheel zoom, buttons, reset, marker
// focus and flick momentum — and any new input just retargets mid-flight,
// so motion is always interruptible and never fights itself.
const CAM_TAU = 110;
// Zoom a clicked market flies to (deep enough to center edge markets too).
const FOCUS_ZOOM = 2.6;
// How far a released flick glides: velocity (px/ms) times this many ms.
const GLIDE_MS = 160;

// Entrance bloom plays once per app session (survives StrictMode double-mount
// and Overview <-> Audience navigation).
let hasBloomed = false;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ListenersMap() {
  const { state, update } = useApp();

  // Markets, heat, ranks and totals all derive from the selected timeframe.
  const markets = useMemo(() => marketsForTf(state.mapTf), [state.mapTf]);
  const heatMarkers = useMemo(() => heatMarkersFrom(markets), [markets]);
  const maxN = useMemo(() => Math.max(...markets.map((m) => m.n)), [markets]);
  const totalN = useMemo(() => markets.reduce((s, m) => s + m.n, 0), [markets]);
  const ranks = useMemo(() => {
    const r: Record<string, number> = {};
    [...markets].sort((a, b) => b.n - a.n).forEach((m, i) => (r[m.id] = i + 1));
    return r;
  }, [markets]);

  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1, mapX: 0, mapY: 0, mapW: 0, mapH: 0 });
  // View = zoom level + which map point (%) sits at the frame center.
  const viewRef = useRef({ ...HOME_VIEW });
  // Where the camera is heading; the follower eases viewRef toward this.
  const targetRef = useRef({ ...HOME_VIEW });
  const followRef = useRef({ raf: 0, lastT: 0 });
  const dragRef = useRef({ active: false, moved: false, lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0 });
  const animRef = useRef({
    weights: aBase.map(() => 1),
    progress: hasBloomed ? 1 : 0,
    raf: 0,
    firstRegionRun: true,
    heatDirty: true,
  });
  const heatIdxRef = useRef(new Uint8Array(DOTS.length / 2));

  const redraw = () => {
    const canvas = canvasRef.current;
    const { w, h, dpr, mapX, mapY, mapW, mapH } = sizeRef.current;
    if (!canvas || w <= 0 || h <= 0 || mapW <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const anim = animRef.current;
    if (anim.heatDirty) {
      computeHeatIndex(DOTS, heatMarkers, anim.weights, anim.progress, heatIdxRef.current);
      anim.heatDirty = false;
    }
    const box = { cssW: w, cssH: h, mapX, mapY, mapW, mapH };
    const dotScale = Math.pow(viewRef.current.zoom, -0.3);
    drawOcean(ctx, {
      ...box,
      spacingXPct: worldMapDots.spacingX,
      spacingYPct: worldMapDots.spacingY,
      dotScale,
    });
    drawHeatDots(ctx, {
      ...box,
      dots: DOTS,
      heatIndex: heatIdxRef.current,
      spacingXPct: worldMapDots.spacingX,
      markers: heatMarkers,
      weights: anim.weights,
      progress: anim.progress,
      dotScale,
    });
  };
  const redrawRef = useRef(redraw);
  redrawRef.current = redraw;

  // Apply the current view: position the stage (marker overlay box) and redraw
  // the canvas. Pan is clamped so the map never detaches from the frame edges.
  const applyView = () => {
    const stage = stageRef.current;
    const { w: frameW, h: frameH } = sizeRef.current;
    if (!stage || frameW <= 0) return;
    const view = viewRef.current;
    const base = coverSize(frameW, frameH, MAP_ASPECT);
    const mapW = base.w * view.zoom;
    const mapH = base.h * view.zoom;
    const panX = clamp(frameW / 2 - (view.cx / 100) * mapW, frameW - mapW, 0);
    const panY = clamp(frameH / 2 - (view.cy / 100) * mapH, frameH - mapH, 0);
    view.cx = ((frameW / 2 - panX) / mapW) * 100;
    view.cy = ((frameH / 2 - panY) / mapH) * 100;
    stage.style.left = `${panX}px`;
    stage.style.top = `${panY}px`;
    stage.style.width = `${mapW}px`;
    stage.style.height = `${mapH}px`;
    // Markers grow with zoom, sub-linearly so they never dominate the map.
    stage.style.setProperty('--mk-scale', Math.pow(view.zoom, 0.6).toFixed(3));
    sizeRef.current = { ...sizeRef.current, mapX: panX, mapY: panY, mapW, mapH };
    redrawRef.current();
  };
  const applyViewRef = useRef(applyView);
  applyViewRef.current = applyView;

  // Clamp the target so the camera never aims past the map edges (the glide
  // then settles smoothly at the boundary instead of hitting a wall).
  const clampTarget = () => {
    const t = targetRef.current;
    const { w: frameW, h: frameH } = sizeRef.current;
    t.zoom = clamp(t.zoom, MIN_ZOOM, MAX_ZOOM);
    if (frameW <= 0) return;
    const base = coverSize(frameW, frameH, MAP_ASPECT);
    const halfX = (50 * frameW) / (base.w * t.zoom);
    const halfY = (50 * frameH) / (base.h * t.zoom);
    t.cx = clamp(t.cx, halfX, 100 - halfX);
    t.cy = clamp(t.cy, halfY, 100 - halfY);
  };

  const stopFollow = () => {
    cancelAnimationFrame(followRef.current.raf);
    followRef.current.raf = 0;
  };

  // The one camera loop: ease the view toward the target in log-zoom space
  // (constant perceived rate at any scale), frame-rate independent.
  const startFollow = () => {
    clampTarget();
    if (reducedMotion()) {
      stopFollow();
      Object.assign(viewRef.current, targetRef.current);
      applyViewRef.current();
      return;
    }
    if (followRef.current.raf) return; // already running; it reads the new target
    followRef.current.lastT = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - followRef.current.lastT, 64);
      followRef.current.lastT = now;
      const k = 1 - Math.exp(-dt / CAM_TAU);
      const view = viewRef.current;
      const t = targetRef.current;
      view.zoom = Math.exp(Math.log(view.zoom) + Math.log(t.zoom / view.zoom) * k);
      view.cx += (t.cx - view.cx) * k;
      view.cy += (t.cy - view.cy) * k;
      const done =
        Math.abs(Math.log(t.zoom / view.zoom)) < 0.001 &&
        Math.abs(t.cx - view.cx) < 0.02 &&
        Math.abs(t.cy - view.cy) < 0.02;
      if (done) {
        Object.assign(view, t);
        followRef.current.raf = 0;
      } else {
        followRef.current.raf = requestAnimationFrame(tick);
      }
      applyViewRef.current();
    };
    followRef.current.raf = requestAnimationFrame(tick);
  };

  // Retarget the zoom, keeping the map point under (fx, fy) anchored there.
  const zoomTargetAt = (fx: number, fy: number, factor: number) => {
    const { w: frameW, h: frameH, mapX, mapY, mapW, mapH } = sizeRef.current;
    if (frameW <= 0 || mapW <= 0) return;
    const t = targetRef.current;
    const newZoom = clamp(t.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    // Map point (%) currently under the cursor…
    const px = ((fx - mapX) / mapW) * 100;
    const py = ((fy - mapY) / mapH) * 100;
    // …stays under the cursor at the target zoom.
    const base = coverSize(frameW, frameH, MAP_ASPECT);
    t.zoom = newZoom;
    t.cx = px + ((frameW / 2 - fx) * 100) / (base.w * newZoom);
    t.cy = py + ((frameH / 2 - fy) * 100) / (base.h * newZoom);
    startFollow();
  };

  // Fly to a market: center it and land at a focused zoom (never zooms out
  // if the user is already in closer).
  const focusMarket = (m: { left: number; top: number }) => {
    const t = targetRef.current;
    t.zoom = Math.max(t.zoom, FOCUS_ZOOM);
    t.cx = m.left;
    t.cy = m.top;
    startFollow();
  };

  // Layout: canvas backing spans the frame; view derives the map box.
  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const ro = new ResizeObserver(() => {
      const frameW = frame.clientWidth;
      const frameH = frame.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(frameW * dpr);
      canvas.height = Math.round(frameH * dpr);
      canvas.style.width = `${frameW}px`;
      canvas.style.height = `${frameH}px`;
      sizeRef.current = { ...sizeRef.current, w: frameW, h: frameH, dpr };
      applyViewRef.current();
    });
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  // Wheel zoom, anchored to the cursor. Non-passive so the page doesn't scroll.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = frame.getBoundingClientRect();
      zoomTargetAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0016));
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop the camera loop if the component unmounts mid-flight.
  useEffect(() => () => cancelAnimationFrame(followRef.current.raf), []);

  // Entrance bloom: heat and dot alpha rise over 600ms, once per session.
  useEffect(() => {
    const anim = animRef.current;
    if (hasBloomed || reducedMotion()) {
      hasBloomed = true;
      anim.progress = 1;
      anim.heatDirty = true;
      redrawRef.current();
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - t0) / 600, 1);
      anim.progress = easeOutCubic(t);
      anim.heatDirty = true;
      redrawRef.current();
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        hasBloomed = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Region emphasis: selected hotspot brightens, the rest cool down.
  useEffect(() => {
    const anim = animRef.current;
    // Selected boost must outweigh the lost spillover from dimmed neighbours
    // (matters in the dense Europe cluster), so the winner always nets brighter.
    const target = aBase.map((m) => (state.region === null ? 1 : m.id === state.region ? 1.45 : 0.3));
    cancelAnimationFrame(anim.raf);
    if (anim.firstRegionRun || reducedMotion()) {
      anim.firstRegionRun = false;
      anim.weights = target;
      anim.heatDirty = true;
      redrawRef.current();
      return;
    }
    const from = anim.weights.slice();
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / 250, 1);
      const e = easeOutCubic(t);
      anim.weights = from.map((v, i) => v + (target[i] - v) * e);
      anim.heatDirty = true;
      redrawRef.current();
      if (t < 1) anim.raf = requestAnimationFrame(tick);
    };
    anim.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(anim.raf);
  }, [state.region]);

  // Timeframe change: rebuild the heat from the new market weights and repaint.
  useEffect(() => {
    animRef.current.heatDirty = true;
    redrawRef.current();
  }, [state.mapTf]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Grabbing the map halts any in-flight camera motion, right where it is.
    stopFollow();
    Object.assign(targetRef.current, viewRef.current);
    dragRef.current = { active: true, moved: false, lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), vx: 0, vy: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.lastX) + Math.abs(e.clientY - drag.lastY) < 4) return;
      drag.moved = true;
      // Capture can throw if the pointer vanished mid-gesture (or is synthetic).
      try {
        frameRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* pan still works without capture */
      }
      frameRef.current?.classList.add('is-panning');
    }
    // Smoothed pointer velocity (px/ms) for the release glide.
    const now = performance.now();
    const dt = Math.max(now - drag.lastT, 1);
    drag.vx = drag.vx * 0.6 + (dx / dt) * 0.4;
    drag.vy = drag.vy * 0.6 + (dy / dt) * 0.4;
    drag.lastT = now;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    const view = viewRef.current;
    const { mapW, mapH } = sizeRef.current;
    if (mapW <= 0) return;
    view.cx -= (dx / mapW) * 100;
    view.cy -= (dy / mapH) * 100;
    applyViewRef.current();
    // Keep the target pinned to the finger while dragging (1:1 tracking).
    Object.assign(targetRef.current, viewRef.current);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.active && drag.moved) {
      try {
        frameRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may never have been taken */
      }
      frameRef.current?.classList.remove('is-panning');
      // Flick momentum: project the release velocity a beat further and let
      // the follower glide there (stale flicks decay via the EMA above).
      const { mapW, mapH } = sizeRef.current;
      const idle = performance.now() - drag.lastT > 90;
      if (!idle && mapW > 0 && Math.hypot(drag.vx, drag.vy) > 0.08) {
        const t = targetRef.current;
        t.cx = viewRef.current.cx - ((drag.vx * GLIDE_MS) / mapW) * 100;
        t.cy = viewRef.current.cy - ((drag.vy * GLIDE_MS) / mapH) * 100;
        startFollow();
      }
    }
    drag.active = false;
    // drag.moved is consumed by the click handlers right after pointerup.
  };

  const wasDrag = () => {
    const moved = dragRef.current.moved;
    dragRef.current.moved = false;
    return moved;
  };

  const zoomFromCenter = (factor: number) => {
    // Center-anchored: the map point at the frame center stays put, so only
    // the target zoom changes.
    targetRef.current.zoom = clamp(targetRef.current.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    startFollow();
  };

  const resetView = () => {
    targetRef.current = { ...HOME_VIEW };
    startFollow();
  };

  return (
    <section className="listeners-map">
      <div className="listeners-map__head">
        <div className="listeners-map__title">Listeners Map</div>
        <div className="listeners-map__tf" role="group" aria-label="Timeframe">
          {TF_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              title={mapTfConfig[k].label}
              aria-pressed={state.mapTf === k}
              className={`listeners-map__tf-btn${state.mapTf === k ? ' is-active' : ''}`}
              onClick={() => update({ mapTf: k })}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="listeners-map__body">
        <div
          className="listeners-map__frame"
          ref={frameRef}
          onClick={() => {
            if (!wasDrag()) update({ region: null });
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <canvas className="listeners-map__canvas" ref={canvasRef} aria-hidden="true" />

          <div className={`listeners-map__stage${state.region ? ' has-selection' : ''}`} ref={stageRef}>
            {markets.map((m, i) => {
              const size = Math.round(6 + 5 * (m.n / maxN));
              const selected = state.region === m.id;
              const hovered = state.hovered === m.id;
              // Tooltip flips derive from the marker's on-screen position (the
              // map pans and zooms, so static map-% thresholds would be wrong).
              const geo = sizeRef.current;
              const screenX = geo.mapX + (m.left / 100) * geo.mapW;
              const screenY = geo.mapY + (m.top / 100) * geo.mapH;
              const tipClass = [
                'listeners-map__tooltip',
                screenY < 88 ? 'listeners-map__tooltip--below' : '',
                screenX > geo.w - 130 ? 'listeners-map__tooltip--align-right' : '',
                screenX < 130 ? 'listeners-map__tooltip--align-left' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  // Keyed by timeframe so switching windows remounts the markers
                  // and replays their staggered pop-in (page entry mounts fresh).
                  key={`${m.id}-${state.mapTf}`}
                  type="button"
                  className={`listeners-map__marker${selected ? ' is-selected' : ''}`}
                  style={
                    {
                      left: `${m.left}%`,
                      top: `${m.top}%`,
                      '--s': `${size}px`,
                      animationDelay: `${i * 28}ms`,
                    } as React.CSSProperties
                  }
                  aria-label={`${m.name}, ${m.listeners} listeners`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!wasDrag()) {
                      update({ region: m.id });
                      focusMarket(m);
                    }
                  }}
                  onMouseEnter={() => update({ hovered: m.id })}
                  onMouseLeave={() => update((s) => (s.hovered === m.id ? { hovered: null } : null))}
                >
                  {(ranks[m.id] <= 3 || selected) && (
                    <span className="listeners-map__marker-pulse" style={{ animationDelay: `${i * 400}ms` }} />
                  )}
                  <span className="listeners-map__marker-ring" />
                  <span className="listeners-map__marker-dot" />
                  {selected && <span className="listeners-map__marker-label">{m.name}</span>}
                  {hovered && (
                    <span className={tipClass}>
                      <span className="listeners-map__tooltip-name">{m.name}</span>
                      <span className="listeners-map__tooltip-listeners">{m.listeners} listeners</span>
                      <span className="listeners-map__tooltip-meta">
                        {Math.round((m.n / totalN) * 100)}% of audience · #{ranks[m.id]} market
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="listeners-map__controls" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" className="listeners-map__ctl" aria-label="Zoom in" onClick={() => zoomFromCenter(1.5)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button type="button" className="listeners-map__ctl" aria-label="Zoom out" onClick={() => zoomFromCenter(1 / 1.5)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button type="button" className="listeners-map__ctl" aria-label="Reset view" onClick={resetView}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          </div>

          <div className="listeners-map__legend">
            <span className="listeners-map__legend-label">Low</span>
            <span className="listeners-map__legend-bar" />
            <span className="listeners-map__legend-label">High</span>
          </div>

          <div className="listeners-map__scope">
            <span className="listeners-map__scope-dot" />
            {scopeNameFor(state.region)}
            {state.region && <span className="listeners-map__scope-hint"> · click map to reset</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
