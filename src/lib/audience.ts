import { aBase, globalCities, citiesMap, globalTracks, tracksMap, songPool, srcColors } from '../data/audience';
import { parsePlays, fmtK } from './format';
import type { CityRow, TrackRow } from '../types';

export const nameOf = (rid: string | null): string | null =>
  rid ? aBase.find((b) => b.id === rid)?.name ?? null : null;

export const allCitiesFor = (rid: string | null): CityRow[] =>
  rid ? citiesMap[rid] || globalCities : globalCities;

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

export const allTrackRowsFor = (rid: string | null): TrackRowView[] => {
  const trkArr = trkArrFor(rid);
  const trkMax = Math.max(...trkArr.map((t) => parsePlays(t.plays)));
  return trkArr.map((t, i) => ({
    ...t,
    rank: i + 1,
    color: srcColors[i % srcColors.length],
    w: `${Math.round((parsePlays(t.plays) / trkMax) * 100)}%`,
  }));
};

export const scopeNameFor = (rid: string | null): string => nameOf(rid) || 'Worldwide';

export const detailScopeLabelFor = (rid: string | null): string =>
  rid ? 'within ' + nameOf(rid) : 'Across all markets';
