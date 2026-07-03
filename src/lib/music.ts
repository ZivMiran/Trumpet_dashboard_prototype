import type { CatalogTrack, TrackFormat } from '../types';

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
