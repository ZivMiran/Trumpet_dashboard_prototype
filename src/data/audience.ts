import type { AudienceCountry, AudKpiDef, CityRow, TrackRow } from '../types';

export const aBase: AudienceCountry[] = [
  // left/top: Web Mercator projection of the country centroid, lat cropped to [-56, 74]
  // (matches src/data/worldMapDots.json — regenerate both via scripts/generate-map-dots.mjs)
  { id: 'usa', name: 'United States', listeners: '612K', n: 612, left: 22.7, top: 38.5, cont: 'NA' },
  { id: 'mexico', name: 'Mexico', listeners: '142K', n: 142, left: 21.5, top: 48.9, cont: 'NA' },
  { id: 'brazil', name: 'Brazil', listeners: '189K', n: 189, left: 35.6, top: 70.3, cont: 'SA' },
  { id: 'uk', name: 'United Kingdom', listeners: '126K', n: 126, left: 49.3, top: 26.6, cont: 'EU' },
  { id: 'germany', name: 'Germany', listeners: '252K', n: 252, left: 52.9, top: 29.2, cont: 'EU' },
  { id: 'nigeria', name: 'Nigeria', listeners: '88K', n: 88, left: 52.4, top: 57.3, cont: 'AF' },
  { id: 'india', name: 'India', listeners: '134K', n: 134, left: 71.9, top: 50.7, cont: 'AS' },
  { id: 'korea', name: 'South Korea', listeners: '147K', n: 147, left: 85.5, top: 40.6, cont: 'AS' },
  { id: 'japan', name: 'Japan', listeners: '121K', n: 121, left: 88.4, top: 40.8, cont: 'AS' },
  { id: 'australia', name: 'Australia', listeners: '64K', n: 64, left: 87.2, top: 76.9, cont: 'OC' },
];

export const continentLabels = ['World', 'N. America', 'Europe', 'Asia'] as const;
export const contMap: Record<string, string | null> = { World: null, 'N. America': 'NA', Europe: 'EU', Asia: 'AS' };

export const audKpiData: AudKpiDef[] = [
  {
    label: 'Monthly Listeners', value: '2.1M', delta: '▲ 8%', deltaColor: '#45c08a',
    note: '2.1M unique people played your music this month — your highest on record, lifted mainly by algorithmic playlist reach.',
    statStrip: [{ label: 'New', value: '34%' }, { label: 'Returning', value: '66%' }, { label: 'Plays / listener', value: '4.8' }],
    rowsTitle: 'By platform',
    rows: [
      { label: 'Spotify', pct: '58%', w: '58%', color: '#e3b53a' },
      { label: 'Apple Music', pct: '21%', w: '21%', color: '#8a8d94' },
      { label: 'YouTube Music', pct: '13%', w: '13%', color: '#8a8d94' },
      { label: 'Amazon / Other', pct: '8%', w: '8%', color: '#8a8d94' },
    ],
  },
  {
    label: 'Total Followers', value: '486K', delta: '▲ 2%', deltaColor: '#45c08a',
    note: 'You gained 9.4K net new followers this month. Followers are 3.2× more likely to save a new release in its first week.',
    statStrip: [{ label: 'Net new', value: '+9.4K' }, { label: 'Unfollows', value: '1.1K' }, { label: 'Follow → save', value: '3.2×' }],
    rowsTitle: 'Where follows came from',
    rows: [
      { label: 'Release notifications', pct: '41%', w: '41%', color: '#e3b53a' },
      { label: 'Artist profile', pct: '28%', w: '28%', color: '#8a8d94' },
      { label: 'Playlist features', pct: '19%', w: '19%', color: '#8a8d94' },
      { label: 'Social / external', pct: '12%', w: '12%', color: '#8a8d94' },
    ],
  },
  {
    label: 'Top Age Group', value: '18–24', delta: '▲ 1.2pp', deltaColor: '#45c08a',
    note: '18–24 is your core at 38% of listeners. The 25–34 band is your fastest-growing cohort this quarter.',
    statStrip: [{ label: 'Median age', value: '26' }, { label: 'Under 25', value: '44%' }, { label: '35+', value: '25%' }],
    rowsTitle: 'Age distribution',
    rows: [
      { label: '13–17', pct: '6%', w: '6%', color: '#8a8d94' },
      { label: '18–24', pct: '38%', w: '38%', color: '#e3b53a' },
      { label: '25–34', pct: '31%', w: '31%', color: '#e3b53a' },
      { label: '35–44', pct: '15%', w: '15%', color: '#8a8d94' },
      { label: '45–54', pct: '7%', w: '7%', color: '#8a8d94' },
      { label: '55+', pct: '3%', w: '3%', color: '#8a8d94' },
    ],
  },
  {
    label: 'Source Discovery', value: '38%', sub: 'Algorithmic playlists', noDelta: true,
    note: 'Algorithmic playlists are your biggest discovery channel, driving 38% of first-time plays this month — ahead of editorial placement and direct profile visits.',
    statStrip: [{ label: 'Algorithmic', value: '38%' }, { label: 'Editorial', value: '27%' }, { label: 'Direct', value: '14%' }],
    rowsTitle: 'By discovery source',
    rows: [
      { label: 'Algorithmic playlists', pct: '38%', w: '38%', color: '#e3b53a' },
      { label: 'Editorial playlists', pct: '27%', w: '27%', color: '#8a8d94' },
      { label: 'User libraries', pct: '21%', w: '21%', color: '#8a8d94' },
      { label: 'Direct / profile', pct: '14%', w: '14%', color: '#8a8d94' },
    ],
  },
];

export interface GenderSeg {
  width: string;
  minWidth?: string;
  background: string;
  dot: string;
  label: string;
  pct: string;
}

export const genderSegs: GenderSeg[] = [
  { width: '60%', background: '#e3b53a', dot: '#e3b53a', label: 'Female', pct: '60%' },
  { width: '39%', background: '#5c6068', dot: '#8a8d94', label: 'Male', pct: '39%' },
  { width: '1%', minWidth: '5px', background: '#8a7fc0', dot: '#8a7fc0', label: 'Non-binary', pct: '1%' },
];

export interface SourceRow {
  label: string;
  pct: string;
  w: string;
}

export const globalSources: SourceRow[] = [
  { label: 'Algorithmic playlists', pct: '38%', w: '38%' },
  { label: 'Editorial playlists', pct: '27%', w: '27%' },
  { label: 'User libraries', pct: '21%', w: '21%' },
  { label: 'Direct / profile', pct: '14%', w: '14%' },
];

export const sourcesMap: Record<string, SourceRow[]> = {
  germany: [{ label: 'Algorithmic playlists', pct: '46%', w: '46%' }, { label: 'Editorial playlists', pct: '24%', w: '24%' }, { label: 'User libraries', pct: '18%', w: '18%' }, { label: 'Direct / profile', pct: '12%', w: '12%' }],
  usa: [{ label: 'Algorithmic playlists', pct: '34%', w: '34%' }, { label: 'Editorial playlists', pct: '30%', w: '30%' }, { label: 'User libraries', pct: '22%', w: '22%' }, { label: 'Direct / profile', pct: '14%', w: '14%' }],
  brazil: [{ label: 'Algorithmic playlists', pct: '41%', w: '41%' }, { label: 'Editorial playlists', pct: '22%', w: '22%' }, { label: 'User libraries', pct: '25%', w: '25%' }, { label: 'Direct / profile', pct: '12%', w: '12%' }],
  korea: [{ label: 'Algorithmic playlists', pct: '30%', w: '30%' }, { label: 'Editorial playlists', pct: '35%', w: '35%' }, { label: 'User libraries', pct: '24%', w: '24%' }, { label: 'Direct / profile', pct: '11%', w: '11%' }],
};

export const srcColors = ['#e3b53a', '#bd911f', '#8a8d94', '#5c6068'];

const mkRow = (rank: number, name: string, count: string, up: 0 | 1): CityRow => ({
  rank, name, count, arrow: up ? '▲' : '▼', arrowColor: up ? '#45c08a' : '#e5484d',
});

export const globalCities: CityRow[] = [
  mkRow(1, 'Seoul', '82K', 1), mkRow(2, 'Berlin', '71K', 1), mkRow(3, 'São Paulo', '71K', 1), mkRow(4, 'Tokyo', '64K', 1),
  mkRow(5, 'London', '62K', 1), mkRow(6, 'New York', '58K', 1), mkRow(7, 'Los Angeles', '49K', 1), mkRow(8, 'Mexico City', '44K', 0),
];

export const citiesMap: Record<string, CityRow[]> = {
  usa: [mkRow(1, 'New York', '142K', 1), mkRow(2, 'Los Angeles', '118K', 1), mkRow(3, 'Chicago', '64K', 1), mkRow(4, 'Austin', '41K', 1), mkRow(5, 'Miami', '38K', 0), mkRow(6, 'Seattle', '33K', 1), mkRow(7, 'Atlanta', '29K', 1), mkRow(8, 'Boston', '24K', 0)],
  mexico: [mkRow(1, 'Mexico City', '58K', 1), mkRow(2, 'Guadalajara', '24K', 1), mkRow(3, 'Monterrey', '19K', 1), mkRow(4, 'Puebla', '12K', 1), mkRow(5, 'Tijuana', '9K', 0), mkRow(6, 'Querétaro', '7K', 1), mkRow(7, 'Mérida', '6K', 1), mkRow(8, 'León', '5K', 0)],
  brazil: [mkRow(1, 'São Paulo', '71K', 1), mkRow(2, 'Rio de Janeiro', '44K', 1), mkRow(3, 'Belo Horizonte', '22K', 1), mkRow(4, 'Brasília', '16K', 1), mkRow(5, 'Salvador', '11K', 0), mkRow(6, 'Curitiba', '9K', 1), mkRow(7, 'Fortaleza', '8K', 1), mkRow(8, 'Recife', '6K', 0)],
  uk: [mkRow(1, 'London', '62K', 1), mkRow(2, 'Manchester', '21K', 1), mkRow(3, 'Birmingham', '15K', 1), mkRow(4, 'Glasgow', '11K', 1), mkRow(5, 'Bristol', '8K', 0), mkRow(6, 'Leeds', '7K', 1), mkRow(7, 'Liverpool', '6K', 1), mkRow(8, 'Edinburgh', '5K', 0)],
  germany: [mkRow(1, 'Berlin', '71K', 1), mkRow(2, 'Munich', '38K', 1), mkRow(3, 'Hamburg', '31K', 1), mkRow(4, 'Cologne', '24K', 1), mkRow(5, 'Frankfurt', '18K', 1), mkRow(6, 'Stuttgart', '14K', 1), mkRow(7, 'Düsseldorf', '11K', 0), mkRow(8, 'Leipzig', '9K', 1)],
  nigeria: [mkRow(1, 'Lagos', '41K', 1), mkRow(2, 'Abuja', '16K', 1), mkRow(3, 'Kano', '9K', 1), mkRow(4, 'Ibadan', '7K', 1), mkRow(5, 'Port Harcourt', '5K', 0), mkRow(6, 'Benin City', '4K', 1), mkRow(7, 'Kaduna', '4K', 1), mkRow(8, 'Enugu', '3K', 0)],
  india: [mkRow(1, 'Mumbai', '41K', 1), mkRow(2, 'Delhi', '36K', 1), mkRow(3, 'Bangalore', '28K', 1), mkRow(4, 'Hyderabad', '17K', 1), mkRow(5, 'Chennai', '12K', 1), mkRow(6, 'Kolkata', '10K', 1), mkRow(7, 'Pune', '9K', 1), mkRow(8, 'Ahmedabad', '7K', 0)],
  korea: [mkRow(1, 'Seoul', '82K', 1), mkRow(2, 'Busan', '24K', 1), mkRow(3, 'Incheon', '16K', 1), mkRow(4, 'Daegu', '11K', 1), mkRow(5, 'Daejeon', '7K', 1), mkRow(6, 'Gwangju', '6K', 1), mkRow(7, 'Suwon', '5K', 0), mkRow(8, 'Ulsan', '4K', 1)],
  japan: [mkRow(1, 'Tokyo', '64K', 1), mkRow(2, 'Osaka', '26K', 1), mkRow(3, 'Nagoya', '14K', 1), mkRow(4, 'Sapporo', '9K', 1), mkRow(5, 'Fukuoka', '7K', 0), mkRow(6, 'Yokohama', '6K', 1), mkRow(7, 'Kobe', '5K', 1), mkRow(8, 'Kyoto', '5K', 0)],
  australia: [mkRow(1, 'Sydney', '24K', 1), mkRow(2, 'Melbourne', '21K', 1), mkRow(3, 'Brisbane', '9K', 1), mkRow(4, 'Perth', '6K', 1), mkRow(5, 'Adelaide', '4K', 0), mkRow(6, 'Gold Coast', '3K', 1), mkRow(7, 'Canberra', '3K', 1), mkRow(8, 'Newcastle', '2K', 0)],
};

export const globalTracks: TrackRow[] = [
  { label: 'Neon Tide', plays: '1.24M' }, { label: 'Paper Lanterns', plays: '910K' },
  { label: 'Midnight Echo', plays: '684K' }, { label: 'Gold Static', plays: '503K' },
];

export const tracksMap: Record<string, TrackRow[]> = {
  usa: [{ label: 'Gold Static', plays: '212K' }, { label: 'Neon Tide', plays: '188K' }, { label: 'Slow Burn', plays: '141K' }, { label: 'Paper Lanterns', plays: '120K' }],
  mexico: [{ label: 'Neon Tide', plays: '48K' }, { label: 'Paper Lanterns', plays: '39K' }, { label: 'Slow Burn', plays: '27K' }, { label: 'Gold Static', plays: '19K' }],
  brazil: [{ label: 'Paper Lanterns', plays: '74K' }, { label: 'Neon Tide', plays: '66K' }, { label: 'Slow Burn', plays: '52K' }, { label: 'Gold Static', plays: '38K' }],
  uk: [{ label: 'Midnight Echo', plays: '44K' }, { label: 'Neon Tide', plays: '39K' }, { label: 'Gold Static', plays: '28K' }, { label: 'Paper Lanterns', plays: '21K' }],
  germany: [{ label: 'Midnight Echo', plays: '96K' }, { label: 'Neon Tide', plays: '81K' }, { label: 'Paper Lanterns', plays: '63K' }, { label: 'Gold Static', plays: '49K' }],
  nigeria: [{ label: 'Neon Tide', plays: '31K' }, { label: 'Slow Burn', plays: '24K' }, { label: 'Paper Lanterns', plays: '18K' }, { label: 'Gold Static', plays: '12K' }],
  india: [{ label: 'Neon Tide', plays: '47K' }, { label: 'Paper Lanterns', plays: '38K' }, { label: 'Midnight Echo', plays: '29K' }, { label: 'Gold Static', plays: '20K' }],
  korea: [{ label: 'Neon Tide', plays: '88K' }, { label: 'Midnight Echo', plays: '72K' }, { label: 'Gold Static', plays: '54K' }, { label: 'Paper Lanterns', plays: '41K' }],
  japan: [{ label: 'Midnight Echo', plays: '63K' }, { label: 'Neon Tide', plays: '58K' }, { label: 'Paper Lanterns', plays: '42K' }, { label: 'Gold Static', plays: '31K' }],
  australia: [{ label: 'Gold Static', plays: '34K' }, { label: 'Neon Tide', plays: '29K' }, { label: 'Slow Burn', plays: '21K' }, { label: 'Paper Lanterns', plays: '16K' }],
};

export const songPool = ['Neon Tide', 'Paper Lanterns', 'Midnight Echo', 'Gold Static', 'Slow Burn', 'After Dark', 'Glass Hearts', 'Velvet Hours', 'Ember Lines', 'Coastline', 'Quiet Engine', 'Afterglow'];

export const platformNames = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon / Other'];
