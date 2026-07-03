export const fmtAxis = (n: number): string => {
  if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(Math.round(n));
};

export const fmtStreams = (n: number): string =>
  n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));

export const fmtK = (n: number): string => (n >= 1000 ? (n / 1000).toFixed(2) + 'M' : Math.round(n) + 'K');

export const parsePlays = (p: string): number => parseFloat(p) * (/M/i.test(p) ? 1000 : 1);

export const parseAdds = (v: string): number => {
  const n = parseFloat(v);
  return /k/i.test(v) ? n * 1000 : n;
};

export const fmtLive = (n: number): string => n.toLocaleString('en-US');

export const growthColor = (g: string): string => (g.trim().charAt(0) === '-' ? '#e5484d' : '#45c08a');
