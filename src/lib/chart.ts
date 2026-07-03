export interface Point {
  x: number;
  y: number;
}

// Catmull-Rom smoothed path through points in an 800×300 viewBox
export const smoothPath = (p: Point[]): string => {
  if (p.length < 2) return '';
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  const t = 0.17;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

export const niceCeil = (x: number): number => {
  if (x <= 0) return 0;
  const e = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / e;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * e;
};
