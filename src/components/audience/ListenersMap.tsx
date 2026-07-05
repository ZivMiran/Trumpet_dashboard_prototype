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
  const dragRef = useRef({ active: false, moved: false, lastX: 0, lastY: 0 });
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

  const zoomAt = (fx: number, fy: number, factor: number) => {
    const view = viewRef.current;
    const { w: frameW, h: frameH, mapX, mapY, mapW } = sizeRef.current;
    const newZoom = clamp(view.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    if (newZoom === view.zoom || frameW <= 0) return;
    const scale = newZoom / view.zoom;
    // Keep the map point under (fx, fy) anchored while scaling.
    const panX = fx - (fx - mapX) * scale;
    const panY = fy - (fy - mapY) * scale;
    view.zoom = newZoom;
    view.cx = ((frameW / 2 - panX) / (mapW * scale)) * 100;
    view.cy = ((frameH / 2 - panY) / (sizeRef.current.mapH * scale)) * 100;
    applyViewRef.current();
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
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0016));
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    dragRef.current = { active: true, moved: false, lastX: e.clientX, lastY: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.lastX) + Math.abs(e.clientY - drag.lastY) < 4) return;
      drag.moved = true;
      frameRef.current?.setPointerCapture(e.pointerId);
      frameRef.current?.classList.add('is-panning');
    }
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    const view = viewRef.current;
    const { mapW, mapH } = sizeRef.current;
    if (mapW <= 0) return;
    view.cx -= (dx / mapW) * 100;
    view.cy -= (dy / mapH) * 100;
    applyViewRef.current();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.active && drag.moved) {
      frameRef.current?.releasePointerCapture(e.pointerId);
      frameRef.current?.classList.remove('is-panning');
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
    const { w, h } = sizeRef.current;
    zoomAt(w / 2, h / 2, factor);
  };

  const resetView = () => {
    viewRef.current = { ...HOME_VIEW };
    applyViewRef.current();
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
                  key={m.id}
                  type="button"
                  className={`listeners-map__marker${selected ? ' is-selected' : ''}`}
                  style={
                    {
                      left: `${m.left}%`,
                      top: `${m.top}%`,
                      '--s': `${size}px`,
                      animationDelay: `${250 + i * 40}ms`,
                    } as React.CSSProperties
                  }
                  aria-label={`${m.name}, ${m.listeners} listeners`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!wasDrag()) update({ region: m.id });
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
