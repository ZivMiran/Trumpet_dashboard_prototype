import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Metric, Page, Timeframe, TrackFormat } from '../types';
import { initialLiveCounts } from '../data/accounts';

export interface DrillTrack {
  title: string;
  album: string;
  date: string;
  fmt: TrackFormat;
  streams: string;
  rate: string;
  adds: string;
  skip: string;
  growth: string;
  market: string;
  status: 'Rising' | 'Steady' | 'Declining';
  statusDot: string;
  _seed: number;
}

export interface TrkDetailSel {
  label: string;
  plays: string;
  rank: number;
}

export interface CityDetailSel {
  name: string;
  count: string;
  rank: number;
  arrow: string;
  arrowColor: string;
}

export interface AppState {
  page: Page;
  tf: Timeframe;
  metric: Metric;
  sel: number | null;
  selTrack: DrillTrack | null;
  albumSel: number | null;
  compare: number[] | null;
  sort: string;
  dir: 1 | -1;
  fmt: string;
  moverTf: Timeframe;
  drawerTf: Timeframe;
  expanded: Record<number, boolean>;
  region: string | null;
  continent: string;
  mapTf: Timeframe;
  hovered: string | null;
  audKpi: number | null;
  citiesAll: boolean;
  tracksAll: boolean;
  trkDetail: TrkDetailSel | null;
  cityDetail: CityDetailSel | null;
  notifOpen: boolean;
  winOpen: boolean;
  readAll: boolean;
  winFilter: string;
  notifQuery: string;
  insightIdx: number;
  query: string;
  tipKpi: number | null;
  revHover: number | null;
  revCompact: boolean;
  revView: 'donut' | 'bars';
  acctOpen: boolean;
  acctId: string;
  activeAccts: string[];
  liveCounts: Record<string, number>;
  sidebarCollapsed: boolean;
}

const initialState: AppState = {
  page: 'overview',
  tf: '1M',
  metric: 'streams',
  sel: null,
  selTrack: null,
  albumSel: null,
  compare: null,
  sort: 'date',
  dir: 1,
  fmt: 'All',
  moverTf: '1M',
  drawerTf: '1M',
  expanded: {},
  region: null,
  continent: 'World',
  mapTf: '1M',
  hovered: null,
  audKpi: null,
  citiesAll: false,
  tracksAll: false,
  trkDetail: null,
  cityDetail: null,
  notifOpen: false,
  winOpen: false,
  readAll: false,
  winFilter: 'All',
  notifQuery: '',
  insightIdx: 0,
  query: '',
  tipKpi: null,
  revHover: null,
  revCompact: false,
  revView: 'donut',
  acctOpen: false,
  acctId: 'echo',
  activeAccts: ['echo', 'nova'],
  liveCounts: { ...initialLiveCounts },
  sidebarCollapsed: false,
};

type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState> | null);

interface AppContextValue {
  state: AppState;
  update: (patch: Patch) => void;
  pauseInsight: () => void;
  resumeInsight: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const insightPaused = useRef(false);

  const update = (patch: Patch) => {
    setState((s) => {
      const p = typeof patch === 'function' ? patch(s) : patch;
      if (!p) return s;
      return { ...s, ...p };
    });
  };

  useEffect(() => {
    const insightTimer = window.setInterval(() => {
      if (insightPaused.current) return;
      update((s) => ({ insightIdx: (s.insightIdx + 1) % 3 }));
    }, 5000);
    const liveTimer = window.setInterval(() => {
      update((s) => {
        const lc = { ...s.liveCounts };
        for (const k in lc) {
          lc[k] = Math.max(20, Math.round(lc[k] * (1 + (Math.random() - 0.48) * 0.04)));
        }
        return { liveCounts: lc };
      });
    }, 2600);
    return () => {
      window.clearInterval(insightTimer);
      window.clearInterval(liveTimer);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        update,
        pauseInsight: () => { insightPaused.current = true; },
        resumeInsight: () => { insightPaused.current = false; },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
