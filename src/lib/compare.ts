import type { CatalogTrack } from '../types';
import { catalog } from '../data/catalog';
import { makeWrand } from './seed';
import { parseAdds } from './format';

// The comparison tool plots each release on a shared "time since release" axis,
// so two tracks can be compared apples-to-apples (e.g. their first week) no
// matter when they actually came out. Series are deterministically generated
// from each release's totals — believable launch-then-decay shapes, not live data.

export type CompareWindow = '1D' | '1W' | '1M' | '1Y' | 'All';
export type CompareMetric = 'streams' | 'listeners' | 'saves';

interface WindowDef {
  key: CompareWindow;
  label: string;
  full: string;
  points: number;
  frac: number; // share of lifetime total that lands inside this window
  decay: number;
}

export const compareWindows: WindowDef[] = [
  { key: '1D', label: '1D', full: 'First 24 hours', points: 24, frac: 0.03, decay: 0.93 },
  { key: '1W', label: '1W', full: 'First week', points: 7, frac: 0.1, decay: 0.86 },
  { key: '1M', label: '1M', full: 'First month', points: 30, frac: 0.26, decay: 0.93 },
  { key: '1Y', label: '1Y', full: 'First year', points: 12, frac: 0.8, decay: 0.88 },
  { key: 'All', label: 'All', full: 'All time', points: 12, frac: 1, decay: 0.9 },
];

export const compareMetrics: { key: CompareMetric; label: string; desc: string }[] = [
  { key: 'streams', label: 'Streams', desc: 'Total plays over time' },
  { key: 'listeners', label: 'Listeners', desc: 'Unique listeners' },
  { key: 'saves', label: 'Saves', desc: 'Playlist & library adds' },
];

export const metricTotal = (r: CatalogTrack, metric: CompareMetric): number =>
  metric === 'streams' ? r._s : metric === 'listeners' ? Math.round(r._s * 0.45) : parseAdds(r.adds);

// Per-period values (length = window.points) for one release + metric.
export function releaseSeries(seedKey: number, total: number, metric: CompareMetric, w: WindowDef): number[] {
  const rand = makeWrand(seedKey + w.points * 3 + (metric === 'saves' ? 101 : metric === 'listeners' ? 53 : 0));
  const windowTotal = total * w.frac;
  const weights: number[] = [];
  for (let i = 0; i < w.points; i++) {
    const noise = 0.84 + rand(i) * 0.32;
    weights.push(Math.pow(w.decay, i) * noise);
  }
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map((wt) => Math.round((windowTotal * wt) / sum));
}

// A few evenly-spaced x-axis ticks for the window.
export function axisTicks(w: WindowDef): { idx: number; label: string }[] {
  if (w.key === '1D') return [0, 5, 11, 17, 23].map((idx) => ({ idx, label: `${idx + 1}h` }));
  if (w.key === '1W') return [0, 2, 4, 6].map((idx) => ({ idx, label: `Day ${idx + 1}` }));
  if (w.key === '1M') return [0, 7, 14, 21, 29].map((idx) => ({ idx, label: `Day ${idx + 1}` }));
  if (w.key === '1Y') return [0, 3, 6, 9, 11].map((idx) => ({ idx, label: `Mo ${idx + 1}` }));
  return [
    { idx: 0, label: 'Start' },
    { idx: Math.floor(w.points / 2), label: 'Mid' },
    { idx: w.points - 1, label: 'Now' },
  ];
}

export const pointLabel = (w: WindowDef, idx: number): string =>
  w.key === '1D'
    ? `Hour ${idx + 1}`
    : w.key === '1Y'
      ? `Month ${idx + 1}`
      : w.key === 'All'
        ? `Period ${idx + 1}`
        : `Day ${idx + 1}`;

// Suggested second track: the biggest other release.
export const defaultCompareB = (aIdx: number): number => {
  let best = -1;
  catalog.forEach((r, i) => {
    if (i === aIdx) return;
    if (best === -1 || r._s > catalog[best]._s) best = i;
  });
  return best;
};
