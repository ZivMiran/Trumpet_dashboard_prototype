import type { Metric, Timeframe } from '../types';

export const pageMeta: Record<string, [string, string]> = {
  overview: ['Overview', 'Where your catalog stands today'],
  music: ['Music', 'Your catalog — tap a track for detail'],
  audience: ['Audience', 'Who is listening, and where'],
  settings: ['Settings', 'Workspace & account preferences'],
};

// Each timeframe: one norm value + period label per data point (pts), plus the
// sparse axis labels (x). Shapes are hand-tuned so the bumps land on the peak
// events annotated in evtData below.
export const tfShape: Record<Timeframe, { norm: number[]; pts: string[]; x: string[] }> = {
  '1D': {
    norm: [0.3, 0.26, 0.22, 0.19, 0.17, 0.16, 0.19, 0.26, 0.34, 0.4, 0.44, 0.47, 0.48, 0.46, 0.45, 0.47, 0.52, 0.58, 0.65, 0.71, 0.76, 0.78, 0.7, 0.6],
    pts: ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'],
    x: ['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'],
  },
  '1W': {
    norm: [0.3, 0.42, 0.37, 0.48, 0.62, 0.68, 0.6],
    pts: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  '1M': {
    norm: [0.26, 0.28, 0.27, 0.3, 0.32, 0.31, 0.34, 0.33, 0.36, 0.38, 0.37, 0.4, 0.42, 0.41, 0.44, 0.43, 0.46, 0.45, 0.48, 0.56, 0.62, 0.6, 0.58, 0.59, 0.61, 0.63, 0.65, 0.67, 0.69, 0.72],
    pts: ['Jun 5', 'Jun 6', 'Jun 7', 'Jun 8', 'Jun 9', 'Jun 10', 'Jun 11', 'Jun 12', 'Jun 13', 'Jun 14', 'Jun 15', 'Jun 16', 'Jun 17', 'Jun 18', 'Jun 19', 'Jun 20', 'Jun 21', 'Jun 22', 'Jun 23', 'Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30', 'Jul 1', 'Jul 2', 'Jul 3', 'Jul 4'],
    x: ['Jun 5', 'Jun 12', 'Jun 19', 'Jun 26', 'Jul 4'],
  },
  '1Y': {
    norm: [0.18, 0.22, 0.25, 0.28, 0.33, 0.36, 0.4, 0.52, 0.57, 0.6, 0.72, 0.8],
    pts: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    x: ['Jul', 'Oct', 'Jan', 'Apr', 'Jun'],
  },
  All: {
    norm: [0.12, 0.13, 0.14, 0.16, 0.17, 0.19, 0.21, 0.23, 0.25, 0.27, 0.33, 0.36, 0.39, 0.42, 0.45, 0.48, 0.52, 0.62, 0.68, 0.74, 0.8, 0.85],
    pts: ['Q1 2021', 'Q2 2021', 'Q3 2021', 'Q4 2021', 'Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'],
    x: ['2021', '2022', '2023', '2024', '2025', '2026'],
  },
};

export const tfNames: Record<Timeframe, string> = {
  '1D': 'One day',
  '1W': 'One week',
  '1M': 'One month',
  '1Y': 'This year',
  All: 'All time',
};

// What the delta is measured against, shown next to it ("All" deltas read
// "lifetime" on their own, so no comparison label there).
export const tfVs: Record<Timeframe, string> = {
  '1D': 'vs yesterday',
  '1W': 'vs prior week',
  '1M': 'vs prior month',
  '1Y': 'vs prior year',
  All: '',
};

export interface MetricMeta {
  label: string;
  color: string;
}

export const metricMeta: Record<Metric, MetricMeta> = {
  streams: { label: 'Streams', color: '#e3b53a' },
  listeners: { label: 'Listeners', color: '#e3b53a' },
  saves: { label: 'Saves', color: '#e3b53a' },
  followers: { label: 'Followers', color: '#e3b53a' },
};

// [headline, delta, peak numeric value] per timeframe
export const metricSeries: Record<Metric, Record<Timeframe, [string, string, number]>> = {
  streams: {
    '1D': ['62.4K', '▲ +0.8%', 62400],
    '1W': ['0.42M', '▲ +1.1%', 420000],
    '1M': ['1.58M', '▲ +2.4%', 1580000],
    '1Y': ['11.2M', '▲ +14%', 11200000],
    All: ['24.8M', 'lifetime', 24800000],
  },
  listeners: {
    '1D': ['18.1K', '▲ +0.5%', 18100],
    '1W': ['118K', '▲ +0.9%', 118000],
    '1M': ['470K', '▲ +4.2%', 470000],
    '1Y': ['3.38M', '▲ +11%', 3380000],
    All: ['7.15M', 'lifetime', 7150000],
  },
  saves: {
    '1D': ['6.8K', '▲ +1.3%', 6800],
    '1W': ['47K', '▲ +2.0%', 47000],
    '1M': ['184K', '▲ +5.1%', 184000],
    '1Y': ['1.18M', '▲ +9.0%', 1180000],
    All: ['2.56M', 'lifetime', 2560000],
  },
  followers: {
    '1D': ['612', '▲ +0.6%', 612],
    '1W': ['4.1K', '▲ +1.4%', 4100],
    '1M': ['17.8K', '▲ +2.0%', 17800],
    '1Y': ['156K', '▲ +12%', 156000],
    All: ['486K', 'lifetime', 486000],
  },
};

export interface ChartEvent {
  x: number;
  y: number;
  t: string;
  d: string;
}

// chart event annotations — dots on big moves (coords match the 800×300 viewBox;
// x values sit exactly on the data point where each shape's bump begins)
export const evtData: Partial<Record<Timeframe, ChartEvent[]>> = {
  '1W': [{ x: 533, y: 120, t: 'New Music Friday refresh', d: '"Neon Tides" re-added to the editorial list — Fri.' }],
  '1M': [{ x: 524, y: 130, t: 'TikTok clip went viral', d: '24% spike in Spotify saves on "After Dark".' }],
  '1Y': [
    { x: 509, y: 140, t: 'Nightfall LP released', d: 'Album launch drove a catalog-wide lift.' },
    { x: 727, y: 90, t: 'Sync placement', d: '"Glass Hearts" featured in a Netflix trailer.' },
  ],
  All: [
    { x: 381, y: 170, t: 'First editorial add', d: '"Echo Theory — EP" picked up by Discover Weekly.' },
    { x: 648, y: 100, t: 'Breakout year', d: 'TikTok virality compounded catalog growth.' },
  ],
};

export interface KpiDef {
  label: string;
  value: string;
  delta: string;
  tip?: string;
}

export const kpiData: KpiDef[] = [
  { label: 'Streams', value: '5.4M', delta: '▲ +6.4%' },
  { label: 'Listeners', value: '3.4M', delta: '▲ +4.2%', tip: 'Unique individual listeners who played a track at least once this month.' },
  { label: 'Saves', value: '612K', delta: '▲ +5.1%' },
  { label: 'Followers', value: '486K', delta: '▲ +2.0%' },
  { label: 'Save-to-Stream', value: '6.8%', delta: '▲ +0.9pp', tip: "Share of this month's streams that ended in a save — a proxy for how strongly listeners connect with a track." },
];

export interface InsightDef {
  tag: string;
  pre: string;
  hi: string;
  post: string;
  sub: string;
  goPage: 'music' | 'audience';
  goSel?: number;
  goAlbum?: number;
  goRegion?: string;
}

export const insightDefs: InsightDef[] = [
  { tag: 'TikTok → Spotify spillover', pre: 'Your latest TikTok clip drove a ', hi: '24% spike', post: ' in Spotify saves on "After Dark".', sub: "Double down — schedule a follow-up clip this week while you're trending.", goPage: 'music', goSel: 0 },
  { tag: 'Catalog momentum', pre: '"Glass Hearts" just crossed ', hi: '2.4M streams', post: ' — the lead track on Nightfall LP this quarter.', sub: 'Pitch it to editorial playlists while the momentum holds.', goPage: 'music', goAlbum: 2 },
  { tag: 'Audience growth', pre: 'Your audience in ', hi: 'Germany', post: ' grew 12% this week on algorithmic playlists.', sub: 'Consider a localized push or an EU tour announcement.', goPage: 'audience', goRegion: 'germany' },
];

export interface RevSlice {
  label: string;
  pct: number;
  amount: string;
  color: string;
}

export const revData: RevSlice[] = [
  { label: 'Spotify', pct: 45, amount: '$8.4K', color: '#e3b53a' },
  { label: 'Apple Music', pct: 22, amount: '$4.1K', color: '#bd911f' },
  { label: 'YouTube', pct: 18, amount: '$3.2K', color: '#8a8d94' },
  { label: 'TikTok', pct: 9, amount: '$1.4K', color: '#5c6068' },
  { label: 'Other', pct: 6, amount: '$1.0K', color: '#3a3d42' },
];

export const REV_TOTAL = '$18.1K';
