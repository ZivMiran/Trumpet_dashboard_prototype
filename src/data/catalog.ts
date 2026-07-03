import type { CatalogTrack, CollectionTrack } from '../types';

// Two kinds of catalog entries:
//   • Singles (incl. collabs) — a release that IS one track. Opens the track drawer.
//   • Collections (Album / EP) — a release that CONTAINS tracks. Expands inline to its
//     tracklist; its streams/saves/rate are aggregates of the member tracks below.
export const catalog: CatalogTrack[] = [
  { title: 'After Dark', date: 'Mar 14, 2024', album: 'Single', fmt: 'Single', streams: '1.24M', _s: 1240000, rate: '17%', adds: '1.3K', skip: '9%', status: 'Rising', statusDot: '#45c08a', spark: '0,22 18,18 36,16 54,11 72,8 90,4', growth: '+34%', market: 'United States' },
  { title: 'Neon Tides', date: 'Jan 9, 2024', album: 'with Mira Vale', fmt: 'Collab', streams: '982K', _s: 982000, rate: '18%', adds: '940', skip: '11%', status: 'Steady', statusDot: '#8f9299', spark: '0,14 18,13 36,15 54,12 72,13 90,12', growth: '+7%', market: 'Germany' },
  { title: 'Nightfall LP', date: 'Sep 1, 2023', album: 'Album · 5 tracks', fmt: 'Album', coll: 'Nightfall LP', streams: '4.81M', _s: 4811000, rate: '14%', adds: '4.7K', skip: '16%', status: 'Steady', statusDot: '#8f9299', spark: '0,9 18,11 36,12 54,14 72,16 90,18', growth: '+9%', market: 'United States' },
  { title: 'Paper Planes', date: 'Nov 4, 2022', album: 'Single', fmt: 'Single', streams: '1.79M', _s: 1790000, rate: '19%', adds: '1.9K', skip: '10%', status: 'Steady', statusDot: '#8f9299', spark: '0,15 18,14 36,14 54,13 72,14 90,13', growth: '+11%', market: 'United Kingdom' },
  { title: 'Slow Burn', date: 'Apr 15, 2022', album: 'with Kosa', fmt: 'Collab', streams: '543K', _s: 543000, rate: '12%', adds: '420', skip: '22%', status: 'Declining', statusDot: '#e5484d', spark: '0,9 18,12 36,14 54,16 72,19 90,22', growth: '-18%', market: 'Mexico' },
  { title: 'Echo Theory', date: 'Aug 27, 2021', album: 'EP · 4 tracks', fmt: 'EP', coll: 'Echo Theory', streams: '3.10M', _s: 3100000, rate: '17%', adds: '3.5K', skip: '16%', status: 'Steady', statusDot: '#8f9299', spark: '0,7 18,9 36,12 54,14 72,16 90,19', growth: '+6%', market: 'United States' },
  { title: 'Velvet Hours', date: 'Apr 2, 2024', album: 'Single', fmt: 'Single', streams: '1.12M', _s: 1120000, rate: '16%', adds: '1.1K', skip: '10%', status: 'Rising', statusDot: '#45c08a', spark: '0,20 18,16 36,15 54,10 72,7 90,3', growth: '+28%', market: 'United States' },
  { title: 'Parallel', date: 'Aug 5, 2023', album: 'with Juno Reyes', fmt: 'Collab', streams: '870K', _s: 870000, rate: '17%', adds: '820', skip: '12%', status: 'Steady', statusDot: '#8f9299', spark: '0,13 18,14 36,12 54,13 72,12 90,13', growth: '+9%', market: 'Germany' },
  { title: 'Wavelengths', date: 'Jul 18, 2022', album: 'Album · 6 tracks', fmt: 'Album', coll: 'Wavelengths', streams: '2.92M', _s: 2920000, rate: '15%', adds: '2.8K', skip: '16%', status: 'Steady', statusDot: '#8f9299', spark: '0,8 18,10 36,12 54,13 72,15 90,17', growth: '+6%', market: 'United States' },
  { title: 'Drift', date: 'Feb 20, 2024', album: 'Single', fmt: 'Single', streams: '1.45M', _s: 1450000, rate: '18%', adds: '1.6K', skip: '9%', status: 'Rising', statusDot: '#45c08a', spark: '0,21 18,17 36,14 54,10 72,6 90,2', growth: '+31%', market: 'United Kingdom' },
  { title: 'Aurora', date: 'Oct 12, 2023', album: 'EP · 4 tracks', fmt: 'EP', coll: 'Aurora', streams: '2.00M', _s: 2000000, rate: '16%', adds: '2.0K', skip: '16%', status: 'Steady', statusDot: '#8f9299', spark: '0,12 18,10 36,11 54,9 72,7 90,5', growth: '+5%', market: 'Germany' },
  { title: 'Embers', date: 'Dec 1, 2021', album: 'Single', fmt: 'Single', streams: '624K', _s: 624000, rate: '13%', adds: '510', skip: '17%', status: 'Declining', statusDot: '#e5484d', spark: '0,8 18,11 36,13 54,16 72,18 90,21', growth: '-11%', market: 'Mexico' },
  { title: 'Ghostlight', date: 'May 9, 2022', album: 'with Sable', fmt: 'Collab', streams: '712K', _s: 712000, rate: '14%', adds: '690', skip: '15%', status: 'Steady', statusDot: '#8f9299', spark: '0,14 18,13 36,14 54,12 72,13 90,12', growth: '+4%', market: 'France' },
];

// Member tracks for each collection. Aggregates on the parent row above are derived
// from these (streams summed, saves summed, save-rate averaged).
export const collections: Record<string, CollectionTrack[]> = {
  'Nightfall LP': [
    { name: 'Glass Hearts', dur: '3:50', streams: '2.41M', rate: '16%', adds: '2.6K', skip: '14%', growth: '+19%', market: 'United States', status: 'Rising', statusDot: '#45c08a' },
    { name: 'Nightfall', dur: '5:20', streams: '690K', rate: '17%', adds: '720', skip: '12%', growth: '+9%', market: 'United States', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Midnight Drive', dur: '4:12', streams: '761K', rate: '13%', adds: '610', skip: '19%', growth: '-14%', market: 'Brazil', status: 'Declining', statusDot: '#e5484d' },
    { name: 'Cold Static', dur: '3:33', streams: '548K', rate: '11%', adds: '340', skip: '21%', growth: '-8%', market: 'Germany', status: 'Declining', statusDot: '#e5484d' },
    { name: 'Hollow Lights', dur: '4:05', streams: '402K', rate: '14%', adds: '410', skip: '16%', growth: '+4%', market: 'United Kingdom', status: 'Steady', statusDot: '#8f9299' },
  ],
  'Echo Theory': [
    { name: 'Echo Theory', dur: '3:42', streams: '1.10M', rate: '20%', adds: '1.4K', skip: '13%', growth: '+12%', market: 'United States', status: 'Rising', statusDot: '#45c08a' },
    { name: 'Reverb', dur: '4:01', streams: '820K', rate: '18%', adds: '900', skip: '15%', growth: '+6%', market: 'Germany', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Afterglow', dur: '3:28', streams: '640K', rate: '16%', adds: '680', skip: '17%', growth: '+3%', market: 'United Kingdom', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Static Bloom', dur: '4:15', streams: '540K', rate: '15%', adds: '540', skip: '18%', growth: '-5%', market: 'Mexico', status: 'Declining', statusDot: '#e5484d' },
  ],
  Wavelengths: [
    { name: 'Wavelengths', dur: '3:46', streams: '880K', rate: '18%', adds: '920', skip: '12%', growth: '+20%', market: 'United States', status: 'Rising', statusDot: '#45c08a' },
    { name: 'Tidal', dur: '4:08', streams: '560K', rate: '15%', adds: '520', skip: '16%', growth: '+5%', market: 'United States', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Horizon Line', dur: '3:55', streams: '410K', rate: '14%', adds: '400', skip: '14%', growth: '+7%', market: 'United Kingdom', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Undertow', dur: '4:22', streams: '430K', rate: '13%', adds: '360', skip: '18%', growth: '-6%', market: 'Germany', status: 'Declining', statusDot: '#e5484d' },
    { name: 'Saltwater', dur: '3:31', streams: '350K', rate: '16%', adds: '380', skip: '15%', growth: '+3%', market: 'Brazil', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Deep Blue', dur: '5:02', streams: '290K', rate: '12%', adds: '240', skip: '20%', growth: '-9%', market: 'Mexico', status: 'Declining', statusDot: '#e5484d' },
  ],
  Aurora: [
    { name: 'Aurora', dur: '3:38', streams: '720K', rate: '19%', adds: '780', skip: '13%', growth: '+15%', market: 'Germany', status: 'Rising', statusDot: '#45c08a' },
    { name: 'Polar', dur: '4:11', streams: '520K', rate: '16%', adds: '520', skip: '16%', growth: '+4%', market: 'United States', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Solstice', dur: '3:49', streams: '430K', rate: '15%', adds: '410', skip: '17%', growth: '+2%', market: 'United Kingdom', status: 'Steady', statusDot: '#8f9299' },
    { name: 'Nightglow', dur: '4:27', streams: '330K', rate: '14%', adds: '300', skip: '19%', growth: '-7%', market: 'France', status: 'Declining', statusDot: '#e5484d' },
  ],
};

export const tfDefs: Record<string, { f: number; phrase: string; spark: string }> = {
  '1D': { f: 0.04, phrase: 'today', spark: '0,17 18,16 36,12 54,11 70,7' },
  '1W': { f: 0.25, phrase: 'this week', spark: '0,16 18,15 36,11 54,9 70,5' },
  '1M': { f: 1, phrase: 'this month', spark: '0,18 18,13 36,10 54,6 70,2' },
  '1Y': { f: 11, phrase: 'this year', spark: '0,19 18,15 36,11 54,7 70,2' },
  All: { f: 24, phrase: 'all time', spark: '0,20 18,16 36,12 54,6 70,1' },
};
