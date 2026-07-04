// One-off generator for src/data/worldMapDots.json.
// Run manually: node scripts/generate-map-dots.mjs [110|50]
// Never imported by the app — the app only consumes the baked JSON.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RES = process.argv[2] === '110' ? '110m' : '50m';
const URL = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_${RES}_land.geojson`;

// Projection: Web Mercator, lat cropped to [-56, 74] (no Antarctica).
// Mercator keeps the aspect near 2:1 (vs 2.77 equirectangular), so a dashboard
// card shows much more of the world at min zoom, and it's the familiar
// web-map look.
const LAT_TOP = 74;
const LAT_BOT = -56;
const merc = (latDeg) => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
const Y_TOP = merc(LAT_TOP);
const Y_SPAN = Y_TOP - merc(LAT_BOT);
const ASPECT = (2 * Math.PI) / Y_SPAN; // ~1.996

const COLS = 280;
const D_LON = 360 / COLS;
// Hex rows spaced evenly in projected (screen) space, not latitude.
const SPACING_X = 100 / COLS; // % of width
const SPACING_Y = SPACING_X * (Math.sqrt(3) / 2) * ASPECT; // % of height

const toX = (lon) => ((lon + 180) / 360) * 100;
const toY = (lat) => ((Y_TOP - merc(lat)) / Y_SPAN) * 100;
const latOfY = (yPct) => ((2 * Math.atan(Math.exp(Y_TOP - (yPct / 100) * Y_SPAN)) - Math.PI / 2) * 180) / Math.PI;

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function collectRings(geojson) {
  const rings = [];
  for (const f of geojson.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') rings.push(...g.coordinates);
    else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) rings.push(...poly);
  }
  // Precompute bounding boxes for early rejection
  return rings.map((ring) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { ring, minX, maxX, minY, maxY };
  });
}

function isLand(lon, lat, rings) {
  // Even-odd across all rings (handles holes like the Caspian)
  let crossings = 0;
  for (const r of rings) {
    if (lon < r.minX || lon > r.maxX || lat < r.minY || lat > r.maxY) continue;
    if (pointInRing(lon, lat, r.ring)) crossings++;
  }
  return crossings % 2 === 1;
}

console.log(`Fetching ${URL} ...`);
const res = await fetch(URL);
if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
const geojson = await res.json();
const rings = collectRings(geojson);
console.log(`${geojson.features.length} features, ${rings.length} rings`);

const dots = [];
for (let row = 0; ; row++) {
  const yPct = (row + 0.5) * SPACING_Y;
  if (yPct >= 100) break;
  const lat = latOfY(yPct);
  const offset = row % 2 === 1 ? D_LON / 2 : 0;
  for (let c = 0; c < COLS; c++) {
    const lon = -180 + D_LON / 2 + offset + c * D_LON;
    if (lon > 180) continue;
    if (isLand(lon, lat, rings)) {
      dots.push(Math.round(toX(lon) * 100), Math.round(yPct * 100));
    }
  }
}

const out = {
  aspect: Number(ASPECT.toFixed(4)),
  cols: COLS,
  spacingX: Number(SPACING_X.toFixed(4)),
  spacingY: Number(SPACING_Y.toFixed(4)),
  scale: 100,
  dots,
};

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'worldMapDots.json');
writeFileSync(outPath, JSON.stringify(out));
console.log(`Wrote ${outPath}: ${dots.length / 2} dots, ${(JSON.stringify(out).length / 1024).toFixed(1)} KB (${RES})`);

// Projected positions for the 10 markets (real centroids)
const markets = [
  ['usa', 39.5, -98.35],
  ['mexico', 23.6, -102.5],
  ['brazil', -14.2, -51.9],
  ['uk', 54.0, -2.5],
  ['germany', 51.2, 10.4],
  ['nigeria', 9.1, 8.7],
  ['india', 20.6, 79.0],
  ['korea', 36.5, 127.9],
  ['japan', 36.2, 138.3],
  ['australia', -25.3, 133.8],
];
console.log('\naBase positions (left/top):');
for (const [id, lat, lon] of markets) {
  console.log(`  ${id}: left: ${toX(lon).toFixed(1)}, top: ${toY(lat).toFixed(1)}`);
}
