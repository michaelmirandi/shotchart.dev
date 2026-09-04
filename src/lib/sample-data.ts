import { type LeagueSettings, nbaSettings, type Shot, type ZoneData } from "shotchart.d3.ts";

export const exampleZoneData: ZoneData[] = [
  { bucket: "RIM", fgm: 32, fga: 45, percentile: 89 },
  { bucket: "M-FL", fgm: 8, fga: 22, percentile: 31 },
  { bucket: "L-FL", fgm: 5, fga: 14, percentile: 42 },
  { bucket: "R-FL", fgm: 6, fga: 15, percentile: 38 },
  { bucket: "M-MR", fgm: 4, fga: 11, percentile: 24 },
  { bucket: "LW-MR", fgm: 7, fga: 17, percentile: 58 },
  { bucket: "RW-MR", fgm: 6, fga: 19, percentile: 47 },
  { bucket: "LB-MR", fgm: 3, fga: 8, percentile: 51 },
  { bucket: "RB-MR", fgm: 4, fga: 9, percentile: 62 },
  { bucket: "M-ATB", fgm: 12, fga: 32, percentile: 71 },
  { bucket: "L-ATB", fgm: 8, fga: 26, percentile: 33 },
  { bucket: "R-ATB", fgm: 10, fga: 27, percentile: 64 },
  { bucket: "L-C3", fgm: 5, fga: 11, percentile: 78 },
  { bucket: "R-C3", fgm: 6, fga: 13, percentile: 82 },
];

export const sparseZoneData: ZoneData[] = [
  { bucket: "RIM", fgm: 12, fga: 18, percentile: 75 },
  { bucket: "L-C3", fgm: 3, fga: 8, percentile: 60 },
  { bucket: "R-C3", fgm: 4, fga: 7, percentile: 88 },
];

// ---------------------------------------------------------------------------
// Synthetic per-shot data
// ---------------------------------------------------------------------------

/** Small, fast, deterministic PRNG — the docs must render the same chart every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

interface Geometry {
  arc: number; // 3-pt arc radius
  side: number; // corner-3 line distance from the basket's x
  halfWidth: number;
  /** y (from basket center, + toward halfcourt) where the corner line meets the arc. */
  cornerTopY: number;
  /** Half-angle of the arc, measured from straight-on. */
  arcHalfAngle: number;
}

function geometry(league: LeagueSettings): Geometry {
  const basketFromBaseline = league.basketProtrusionLength + 1.25;
  const cornerTopY = league.threePointCutOffLength - basketFromBaseline;
  return {
    arc: league.threePointRadius,
    side: league.threePointSideRadius,
    halfWidth: league.courtWidth / 2,
    cornerTopY,
    arcHalfAngle: Math.atan2(league.threePointSideRadius, cornerTopY),
  };
}

/** Polar sample around the basket: `angle` from straight-on, `+x` right. */
function polar(r: number, angle: number): { x: number; y: number } {
  return { x: r * Math.sin(angle), y: r * Math.cos(angle) };
}

const between = (rng: Rng, lo: number, hi: number): number => lo + rng() * (hi - lo);

interface ZoneSpec {
  weight: number;
  madeRate: number;
  sample(rng: Rng, g: Geometry): { x: number; y: number };
}

// Rough NBA-shaped distribution: rim-heavy, lots of threes, a little midrange.
// Samplers reject and retry when a point strays into a neighboring zone so the
// made-rate really is per zone.
const ZONES: ZoneSpec[] = [
  {
    weight: 0.35,
    madeRate: 0.62,
    sample: (rng) => polar(4 * Math.sqrt(rng()), between(rng, -1.9, 1.9)),
  },
  {
    weight: 0.1,
    madeRate: 0.45,
    sample: (rng) => polar(between(rng, 4, 10), between(rng, -1.3, 1.3)),
  },
  {
    weight: 0.15,
    madeRate: 0.4,
    sample: (rng, g) => {
      for (;;) {
        const p = polar(between(rng, 10, g.arc - 1), between(rng, -1.4, 1.4));
        if (Math.abs(p.x) < g.side - 0.5) return p;
      }
    },
  },
  {
    weight: 0.25,
    madeRate: 0.36,
    sample: (rng, g) => {
      const maxAngle = g.arcHalfAngle - 0.08;
      for (;;) {
        const p = polar(between(rng, g.arc + 0.5, g.arc + 3), between(rng, -maxAngle, maxAngle));
        if (Math.abs(p.x) < g.side - 0.3) return p;
      }
    },
  },
  {
    weight: 0.15,
    madeRate: 0.39,
    sample: (rng, g) => {
      const sign = rng() < 0.5 ? -1 : 1;
      const x = sign * between(rng, g.side + 0.4, g.halfWidth - 0.6);
      const yMax = Math.max(0, g.cornerTopY - 0.5);
      return { x, y: between(rng, -2, yMax) };
    },
  },
];

export interface GenerateShotsOptions {
  seed?: number;
  count?: number;
  /** Threes are placed relative to this league's arc. */
  league?: LeagueSettings;
}

export function generateShots({
  seed = 42,
  count = 400,
  league = nbaSettings,
}: GenerateShotsOptions = {}): Shot[] {
  const rng = mulberry32(seed);
  const g = geometry(league);
  const totalWeight = ZONES.reduce((sum, z) => sum + z.weight, 0);

  const shots: Shot[] = [];
  for (let i = 0; i < count; i += 1) {
    let pick = rng() * totalWeight;
    let zone = ZONES[ZONES.length - 1];
    for (const z of ZONES) {
      pick -= z.weight;
      if (pick <= 0) {
        zone = z;
        break;
      }
    }
    const { x, y } = zone.sample(rng, g);
    shots.push({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      made: rng() < zone.madeRate,
    });
  }
  return shots;
}

/** 400 NBA-shaped shots, same every load. */
export const exampleShots: Shot[] = generateShots();
