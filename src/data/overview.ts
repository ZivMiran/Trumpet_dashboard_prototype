import type { Metric, Timeframe } from '../types';

export const pageMeta: Record<string, [string, string]> = {
  overview: ['Overview', 'Where your catalog stands today'],
  music: ['Music', 'Your catalog — tap a track for detail'],
  audience: ['Audience', 'Who is listening, and where'],
  settings: ['Settings', 'Workspace & account preferences'],
};

export const tfShape: Record<Timeframe, { norm: number[]; x: string[] }> = {
  '1D': { norm: [0.2, 0.16, 0.24, 0.3, 0.46, 0.4, 0.58, 0.66, 0.6, 0.72], x: ['12a', '6a', '12p', '6p', '11p'] },
  '1W': { norm: [0.3, 0.42, 0.36, 0.52, 0.46, 0.62, 0.56, 0.68], x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { norm: [0.26, 0.34, 0.31, 0.48, 0.41, 0.58, 0.53, 0.63, 0.72], x: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] },
  '1Y': { norm: [0.18, 0.25, 0.34, 0.41, 0.53, 0.61, 0.71, 0.8], x: ['Q3', 'Q4', 'Q1', 'Q2'] },
  All: { norm: [0.14, 0.21, 0.28, 0.43, 0.5, 0.66, 0.74, 0.82], x: ['2021', '2022', '2023', '2024'] },
};

export const tfNames: Record<Timeframe, string> = {
  '1D': 'One day',
  '1W': 'One week',
  '1M': 'One month',
  '1Y': 'This year',
  All: 'All time',
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

// chart event annotations — dots on big moves (coords match the 800×300 viewBox)
export const evtData: Partial<Record<Timeframe, ChartEvent[]>> = {
  '1W': [{ x: 550, y: 120, t: 'New Music Friday refresh', d: '"Neon Tides" re-added to the editorial list — Fri.' }],
  '1M': [{ x: 520, y: 130, t: 'TikTok clip went viral', d: '24% spike in Spotify saves on "After Dark".' }],
  '1Y': [
    { x: 520, y: 140, t: 'Nightfall LP released', d: 'Album launch drove a catalog-wide lift.' },
    { x: 740, y: 90, t: 'Sync placement', d: '"Glass Hearts" featured in a Netflix trailer.' },
  ],
  All: [
    { x: 390, y: 170, t: 'First editorial add', d: '"Echo Theory — EP" picked up by Discover Weekly.' },
    { x: 650, y: 100, t: 'Breakout year', d: 'TikTok virality compounded catalog growth.' },
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
