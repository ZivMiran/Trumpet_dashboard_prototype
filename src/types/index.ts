export type Page = 'overview' | 'music' | 'audience' | 'settings';

export type Metric = 'streams' | 'listeners' | 'saves' | 'followers';

export type Timeframe = '1D' | '1W' | '1M' | '1Y' | 'All';

export type TrackFormat = 'Single' | 'Album' | 'EP' | 'Collab';

export interface CatalogTrack {
  title: string;
  date: string;
  album: string;
  fmt: TrackFormat;
  coll?: string;
  streams: string;
  _s: number;
  rate: string;
  adds: string;
  skip: string;
  status: 'Rising' | 'Steady' | 'Declining';
  statusDot: string;
  spark: string;
  growth: string;
  market: string;
  img?: string;
}

export interface CollectionTrack {
  name: string;
  dur: string;
  streams: string;
  rate: string;
  adds: string;
  skip: string;
  growth: string;
  market: string;
  status: 'Rising' | 'Steady' | 'Declining';
  statusDot: string;
}

export interface Account {
  id: string;
  name: string;
  initials: string;
  monthly: string;
  color: string;
  img?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'Insights' | 'Milestones' | 'Account';
  unread: boolean;
}

export interface AudienceCountry {
  id: string;
  name: string;
  listeners: string;
  n: number;
  left: number;
  top: number;
  cont: string;
}

export interface AudKpiRow {
  label: string;
  pct: string;
  w: string;
  color: string;
}

export interface AudKpiStat {
  label: string;
  value: string;
}

export interface AudKpiDef {
  label: string;
  value: string;
  delta?: string;
  deltaColor?: string;
  sub?: string;
  noDelta?: boolean;
  note: string;
  statStrip: AudKpiStat[];
  rowsTitle: string;
  rows: AudKpiRow[];
}

export interface CityRow {
  rank: number;
  name: string;
  count: string;
  arrow: string;
  arrowColor: string;
}

export interface TrackRow {
  label: string;
  plays: string;
}

export interface Platform {
  name: string;
  color: string;
  status: string;
  statusDot: string;
  connectable: boolean;
}
