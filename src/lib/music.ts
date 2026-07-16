import type { CatalogTrack, TrackFormat } from '../types';
import type { DrillTrack } from '../context/AppContext';
import { catalog, collections } from '../data/catalog';
import { seedOf } from './seed';

export const trendRank = (s: CatalogTrack['status']): number =>
  ({ Rising: 2, Steady: 1, Declining: 0 } as const)[s] ?? 1;

// Format shown in the table: a collab is still a single release, so it reads
// "Single". The collaboration itself is conveyed by the row's "with …" subtext.
export const typeOf = (r: { fmt: TrackFormat }): string =>
  ({ Single: 'Single', Collab: 'Single', Album: 'Album', EP: 'EP' } as Record<TrackFormat, string>)[r.fmt] || r.fmt;

export const typeRank = (r: { fmt: TrackFormat }): number =>
  ({ Single: 0, Collab: 0, Album: 1, EP: 2 } as Record<TrackFormat, number>)[r.fmt] ?? 3;

// Restrained, distinct hues for the format dot — muted, never saturated.
export const typeDotOf = (r: { fmt: TrackFormat }): string =>
  ({ Single: '#6f9bd6', Collab: '#6f9bd6', Album: '#c08fd6', EP: '#5fb89a' } as Record<TrackFormat, string>)[r.fmt] || '#8f9299';

// Selection patch that opens the shared track drawer for a track named by an
// audience list row. Singles select their catalog row; collection members get
// the same DrillTrack shape the album drawer builds. Unknown names fall back
// to a seeded stand-in so the row never dead-ends.
export const trackDrawerSel = (
  label: string,
  plays?: string,
): { sel: number | null; albumSel: null; selTrack: DrillTrack | null } => {
  const ci = catalog.findIndex((r) => !r.coll && r.title === label);
  if (ci !== -1) return { sel: ci, albumSel: null, selTrack: null };

  for (const [coll, tracks] of Object.entries(collections)) {
    const ti = tracks.findIndex((t) => t.name === label);
    if (ti === -1) continue;
    const pi = catalog.findIndex((r) => r.coll === coll);
    const p = catalog[pi];
    const tk = tracks[ti];
    return {
      sel: null,
      albumSel: null,
      selTrack: {
        title: tk.name,
        album: p.title,
        date: p.date,
        fmt: p.fmt,
        streams: tk.streams,
        rate: tk.rate,
        adds: tk.adds,
        skip: tk.skip,
        growth: tk.growth,
        market: tk.market,
        status: tk.status,
        statusDot: tk.statusDot,
        _seed: (pi + 1) * 7 + ti + 1,
      },
    };
  }

  const s = seedOf(label);
  const rising = s % 3 !== 0;
  return {
    sel: null,
    albumSel: null,
    selTrack: {
      title: label,
      album: 'Single',
      date: `${['Feb', 'May', 'Aug', 'Nov'][s % 4]} ${1 + (s % 27)}, 202${2 + (s % 3)}`,
      fmt: 'Single',
      streams: plays ?? `${420 + (s % 480)}K`,
      rate: `${12 + (s % 8)}%`,
      adds: `${(0.4 + (s % 16) / 10).toFixed(1)}K`,
      skip: `${9 + (s % 11)}%`,
      growth: rising ? `+${4 + (s % 23)}%` : `-${3 + (s % 9)}%`,
      market: ['United States', 'Germany', 'United Kingdom', 'Brazil'][s % 4],
      status: rising ? 'Rising' : 'Declining',
      statusDot: rising ? '#45c08a' : '#e5484d',
      _seed: s,
    },
  };
};
