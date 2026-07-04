import { srcColors, platformNames } from '../data/audience';

export const seedOf = (str: string): number =>
  [...String(str)].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0);

export interface PlatSplit {
  label: string;
  pct: string;
  dot: string;
}

export const platSplit = (seed: number): PlatSplit[] => {
  const s = Math.abs(seed);
  let a = 46 + (s % 16);
  const b = 17 + (Math.floor(s / 3) % 9);
  const c = 11 + (Math.floor(s / 7) % 7);
  // The remainder can go below the 4% floor for some seeds; take the excess
  // out of the (always largest) first share so the four always sum to 100.
  let d = 100 - a - b - c;
  if (d < 4) {
    a += d - 4;
    d = 4;
  }
  const vals = [a, b, c, d];
  return platformNames.map((nm, i) => ({
    label: nm,
    pct: vals[i] + '%',
    dot: srcColors[i],
  }));
};

export const makeWrand = (wseed: number) => (n: number): number => {
  const x = Math.sin((n + wseed * 13.17) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
