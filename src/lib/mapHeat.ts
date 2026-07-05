// Pure helpers for the Listeners Map dot-density heat rendering.
// Coordinate space: percent of the map box (x 0–100, y 0–100), equirectangular,
// lat cropped to [-56, 74]. Heat distances are corrected for the box aspect so
// blobs stay circular on screen. The canvas spans the whole frame; the map box
// (mapX/mapY/mapW/mapH) is the letterboxed region the land dots live in, and a
// faint lattice on the same grid fills the rest of the frame so the widget
// never shows empty letterbox bands.
import { aBase } from '../data/audience';
import worldMapDots from '../data/worldMapDots.json';

// Single source of truth: the generator script bakes the projection aspect
// into the JSON (Web Mercator cropped to lat [-56, 74] ≈ 2.0).
export const MAP_ASPECT: number = worldMapDots.aspect;

export interface HeatMarker {
  x: number;
  y: number;
  w: number; // 0–1, relative to the largest market
  sigma: number; // gaussian spread, % of map width
}

export interface MapBox {
  mapX: number;
  mapY: number;
  mapW: number;
  mapH: number;
}

const MAX_N = Math.max(...aBase.map((m) => m.n));

export function buildMarkers(): HeatMarker[] {
  return aBase.map((m) => {
    const w = m.n / MAX_N;
    return { x: m.left, y: m.top, w, sigma: 1.7 + 2.6 * Math.sqrt(w) };
  });
}

// Heat markers from an arbitrary market list (e.g. a timeframe-scaled set).
// Weight is relative to the peak within the same list, so the heat spread
// reflects that timeframe's own distribution.
export function heatMarkersFrom(list: { left: number; top: number; n: number }[]): HeatMarker[] {
  const max = Math.max(...list.map((m) => m.n)) || 1;
  return list.map((m) => {
    const w = m.n / max;
    return { x: m.left, y: m.top, w, sigma: 1.7 + 2.6 * Math.sqrt(w) };
  });
}

// Base map size that COVERS the frame (fills it fully, overflow pannable).
export function coverSize(frameW: number, frameH: number, aspect: number) {
  const h = Math.max(frameH, frameW / aspect);
  return { w: h * aspect, h };
}

export function heatAt(x: number, y: number, markers: HeatMarker[], weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    const dx = x - m.x;
    if (dx > 3.5 * m.sigma || dx < -3.5 * m.sigma) continue;
    const dy = (y - m.y) / MAP_ASPECT;
    const d2 = dx * dx + dy * dy;
    sum += weights[i] * m.w * Math.exp(-d2 / (2 * m.sigma * m.sigma));
  }
  return sum;
}

// Color ramp: charcoal geography -> warm charcoal -> olive-bronze -> deep brass -> gold.
const RAMP_STOPS: [number, number, number][] = [
  [0x3d, 0x40, 0x46],
  [0x55, 0x50, 0x3e],
  [0x7a, 0x6b, 0x36],
  [0xb2, 0x92, 0x30],
  [0xe3, 0xb5, 0x3a],
];

function rampColor(t: number): string {
  const pos = Math.min(Math.max(t, 0), 1) * (RAMP_STOPS.length - 1);
  const i = Math.min(Math.floor(pos), RAMP_STOPS.length - 2);
  const f = pos - i;
  const a = RAMP_STOPS[i];
  const b = RAMP_STOPS[i + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

const LUT: string[] = Array.from({ length: 256 }, (_, i) => rampColor(i / 255));

export interface OceanOpts extends MapBox {
  cssW: number;
  cssH: number;
  spacingXPct: number; // column spacing, % of map width
  spacingYPct: number; // row spacing, % of map height
  dotScale?: number; // same zoom damping as the land dots
}

// The ocean is the SAME hex grid as the land dots, just dimmer — one unified
// texture where continents read as the brighter cells, so the two layers can
// never misalign. Rendered as a repeating canvas pattern (one tile, one fill)
// so panning costs O(1) regardless of frame size. Land dots paint over their
// own cells afterwards.
const OCEAN_TILE_W = 64;
let oceanTile: HTMLCanvasElement | null = null;
let oceanTileKey = '';

export function drawOcean(ctx: CanvasRenderingContext2D, opts: OceanOpts): void {
  const { cssW, cssH, mapX, mapY, mapW, mapH, spacingXPct, spacingYPct } = opts;
  const dotScale = opts.dotScale ?? 1;
  const sx = (spacingXPct / 100) * mapW;
  const sy = (spacingYPct / 100) * mapH;
  if (sx <= 0 || sy <= 0) return;

  // One tile = one column x two rows (even row centered, odd row offset by
  // half a column, drawn as half-dots on the tile's vertical edges).
  const tileW = OCEAN_TILE_W;
  const tileH = Math.max(8, Math.round(tileW * ((2 * sy) / sx)));
  const r = 0.8 * 0.3 * tileW * dotScale; // in tile units; 0.8x of land dot size
  const key = `${tileH}|${r.toFixed(2)}`;
  if (!oceanTile || oceanTileKey !== key) {
    oceanTile = document.createElement('canvas');
    oceanTile.width = tileW;
    oceanTile.height = tileH;
    const tctx = oceanTile.getContext('2d');
    if (!tctx) return;
    tctx.fillStyle = '#8f9299';
    for (const [dx, dy] of [
      [tileW / 2, tileH / 4],
      [0, (3 * tileH) / 4],
      [tileW, (3 * tileH) / 4],
    ]) {
      tctx.beginPath();
      tctx.arc(dx, dy, r, 0, Math.PI * 2);
      tctx.fill();
    }
    oceanTileKey = key;
  }

  const pattern = ctx.createPattern(oceanTile, 'repeat');
  if (!pattern) return;
  // Scale the integer-sized tile to the exact fractional grid pitch so the
  // repeats stay in perfect phase with the land dots across the whole frame.
  pattern.setTransform(new DOMMatrix([sx / tileW, 0, 0, (2 * sy) / tileH, 0, 0]));
  ctx.save();
  ctx.translate(mapX, mapY); // anchor the pattern at the map origin
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = pattern;
  ctx.fillRect(-mapX, -mapY, cssW, cssH);
  ctx.restore();
}

// Precompute each land dot's color-ramp index for the current heat state.
// Recomputed only when the heat itself changes (entrance, region emphasis) —
// pan/zoom redraws reuse the cache untouched.
export function computeHeatIndex(
  dots: Float32Array,
  markers: HeatMarker[],
  weights: number[],
  progress: number,
  out: Uint8Array,
): void {
  for (let i = 0, j = 0; i < dots.length; i += 2, j++) {
    const raw = heatAt(dots[i], dots[i + 1], markers, weights) * progress;
    const t = Math.pow(1 - Math.exp(-2.8 * raw), 0.75);
    out[j] = Math.min(255, (t * 255) | 0);
  }
}

export interface HeatDotsOpts extends MapBox {
  cssW: number;
  cssH: number;
  dots: Float32Array; // [x0,y0,x1,y1,...] in percent of the map box
  heatIndex: Uint8Array; // per-dot ramp index from computeHeatIndex()
  spacingXPct: number;
  markers: HeatMarker[];
  weights: number[]; // per-market emphasis, aligned with buildMarkers()/aBase
  progress: number; // entrance 0–1, already eased
  dotScale?: number; // damps dot radius at high zoom so the texture keeps air
}

// Ambient hotspot glow + land dots, drawn over the background lattice.
// Off-viewport dots are culled so pan/zoom redraws stay cheap.
// Caller sets the DPR transform; everything here is CSS pixels.
export function drawHeatDots(ctx: CanvasRenderingContext2D, opts: HeatDotsOpts): void {
  const { cssW, cssH, mapX, mapY, mapW, mapH, dots, heatIndex, spacingXPct, markers, weights, progress } = opts;
  const dotScale = opts.dotScale ?? 1;

  // Soft radial bloom under each hotspot so the heat feels luminous.
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    const wEff = Math.min(m.w * weights[i], 1);
    if (wEff <= 0.01) continue;
    const px = mapX + (m.x / 100) * mapW;
    const py = mapY + (m.y / 100) * mapH;
    const rad = ((3.2 * m.sigma) / 100) * mapW;
    if (px + rad < 0 || px - rad > cssW || py + rad < 0 || py - rad > cssH) continue;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, rad);
    grad.addColorStop(0, `rgba(227,181,58,${(0.11 * wEff * progress).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(227,181,58,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Land dots: constant radius, heat carried purely by color. Diameter stays
  // ~60% of the grid pitch so there's clear air between dots. The ~1px floor
  // keeps them full-coverage (crisp) instead of fuzzy sub-pixel blobs when
  // fully zoomed out, which is what caused the optical shimmer.
  const r = Math.max(0.9, 0.3 * (spacingXPct / 100) * mapW * dotScale);
  ctx.globalAlpha = 0.55 + 0.45 * progress;
  for (let i = 0, j = 0; i < dots.length; i += 2, j++) {
    const px = mapX + (dots[i] / 100) * mapW;
    const py = mapY + (dots[i + 1] / 100) * mapH;
    if (px + r < 0 || px - r > cssW || py + r < 0 || py - r > cssH) continue;
    ctx.fillStyle = LUT[heatIndex[j]];
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
