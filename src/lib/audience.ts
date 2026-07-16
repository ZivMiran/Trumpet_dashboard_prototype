import { aBase, globalCities, citiesMap, globalTracks, tracksMap, songPool, srcColors, mapTfConfig } from '../data/audience';
import { parsePlays, fmtK } from './format';
import type { CityRow, TrackRow, Timeframe } from '../types';

export interface MapMarket {
  id: string;
  name: string;
  left: number;
  top: number;
  n: number; // reach in thousands, for the selected timeframe
  listeners: string;
}

// Deterministic per-market momentum in [-0.5, 0.5]: surging markets sit high,
// mature ones low. Stable across renders so switching back and forth is exact.
const momentum = (i: number): number => {
  const s = Math.sin((i + 1) * 127.1) * 43758.5453;
  return (s - Math.floor(s)) - 0.5;
};

// Markets scaled to a timeframe. Positions/ids are fixed; reach (n) and the
// formatted listener count vary with the window.
export const marketsForTf = (tf: Timeframe): MapMarket[] => {
  const { scale, trend } = mapTfConfig[tf];
  return aBase.map((m, i) => {
    const n = Math.max(1, m.n * scale * (1 + momentum(i) * trend));
    return { id: m.id, name: m.name, left: m.left, top: m.top, n, listeners: fmtK(n) };
  });
};

export const nameOf = (rid: string | null): string | null =>
  rid ? aBase.find((b) => b.id === rid)?.name ?? null : null;

// Deterministic per-item momentum in [-0.5, 0.5], keyed off the label so the
// same track/city always leans the same way. Combined with a timeframe's trend
// it lets short windows surface surging entries and long windows favour staples.
const itemMom = (key: string): number => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) | 0;
  const s = Math.sin(h) * 43758.5453;
  return s - Math.floor(s) - 0.5;
};

// A count string ('82K', '1.24M') scaled + momentum-shifted for a timeframe,
// as a plain number in thousands (for sorting/formatting).
const tfValue = (str: string, tf: Timeframe, key: string): number => {
  const { scale, trend } = mapTfConfig[tf];
  return Math.max(1, parsePlays(str) * scale * (1 + itemMom(key) * trend));
};

export const allCitiesFor = (rid: string | null, tf: Timeframe = '1M'): CityRow[] => {
  const base = rid ? citiesMap[rid] || globalCities : globalCities;
  return base
    .map((c) => ({ ...c, v: tfValue(c.count, tf, c.name) }))
    .sort((a, b) => b.v - a.v)
    .map((c, i) => ({ rank: i + 1, name: c.name, count: fmtK(c.v), arrow: c.arrow, arrowColor: c.arrowColor }));
};

export const trkArrFor = (rid: string | null): TrackRow[] => {
  const base = rid ? tracksMap[rid] || globalTracks : globalTracks;
  const out = base.slice();
  let v = parsePlays(out[out.length - 1].plays);
  for (const name of songPool) {
    if (out.length >= 8) break;
    if (out.some((t) => t.label === name)) continue;
    v = Math.max(2, Math.round(v * 0.8));
    out.push({ label: name, plays: fmtK(v) });
  }
  return out;
};

export interface TrackRowView extends TrackRow {
  rank: number;
  color: string;
  w: string;
}

export const allTrackRowsFor = (rid: string | null, tf: Timeframe = '1M'): TrackRowView[] => {
  const scored = trkArrFor(rid)
    .map((t) => ({ label: t.label, v: tfValue(t.plays, tf, t.label) }))
    .sort((a, b) => b.v - a.v);
  const trkMax = Math.max(...scored.map((t) => t.v));
  return scored.map((t, i) => ({
    label: t.label,
    plays: fmtK(t.v),
    rank: i + 1,
    color: srcColors[i % srcColors.length],
    w: `${Math.round((t.v / trkMax) * 100)}%`,
  }));
};

export const scopeNameFor = (rid: string | null): string => nameOf(rid) || 'Worldwide';
