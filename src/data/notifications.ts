import type { Notification } from '../types';

export const notifications: Notification[] = [
  { id: 'n1', title: '"After Dark" crossed 1M streams', body: 'Up 34% over the last 28 days — your fastest climber.', time: '2h', kind: 'Milestones', unread: true },
  { id: 'n2', title: 'TikTok → Spotify spillover', body: 'A 24% save spike was detected on "After Dark".', time: '5h', kind: 'Insights', unread: true },
  { id: 'n3', title: 'Added to editorial playlist', body: '"Neon Tides" was added to Fresh Finds (1.2M followers).', time: '1d', kind: 'Insights', unread: true },
  { id: 'n4', title: 'Germany audience grew 12%', body: 'Driven by Spotify algorithmic playlists this week.', time: '2d', kind: 'Insights', unread: false },
  { id: 'n5', title: 'Payout processed', body: '$18.1K estimated revenue cleared for last cycle.', time: '3d', kind: 'Account', unread: false },
  { id: 'n6', title: 'Follower milestone', body: 'You just passed 486K followers across platforms.', time: '4d', kind: 'Milestones', unread: false },
  { id: 'n7', title: 'Weekly pulse ready', body: 'Your catalog summary for this week is available.', time: '5d', kind: 'Account', unread: false },
];
