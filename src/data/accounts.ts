import type { Account } from '../types';

export const accountsPool: Account[] = [
  { id: 'echo', name: 'Echo Theory', initials: 'ET', monthly: '2.1M', color: '#e3b53a' },
  { id: 'nova', name: 'Nova Reign', initials: 'NR', monthly: '845K', color: '#5b9fe3' },
  { id: 'atlas', name: 'Atlas Audio', initials: 'AA', monthly: '5.4M', color: '#45c08a' },
  { id: 'lumen', name: 'Lumen Kids', initials: 'LK', monthly: '312K', color: '#c08ad0' },
];

export const initialLiveCounts: Record<string, number> = {
  echo: 1243,
  nova: 412,
  atlas: 3870,
  lumen: 156,
};
