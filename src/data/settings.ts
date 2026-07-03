import type { Platform } from '../types';

export const platforms: Platform[] = [
  { name: 'Spotify', color: '#1DB954', status: 'Connected · 2m ago', statusDot: '#45c08a', connectable: false },
  { name: 'Apple Music', color: '#FA243C', status: 'Connected · 4m ago', statusDot: '#45c08a', connectable: false },
  { name: 'YouTube Music', color: '#FF0000', status: 'Connected · 6m ago', statusDot: '#45c08a', connectable: false },
  { name: 'Amazon Music', color: '#46C3D6', status: 'Connected · 9m ago', statusDot: '#45c08a', connectable: false },
  { name: 'TikTok', color: '#FE2C55', status: 'Not connected', statusDot: '#5c6068', connectable: true },
  { name: 'SoundCloud', color: '#FF5500', status: 'Not connected', statusDot: '#5c6068', connectable: true },
];
