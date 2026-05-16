import type { ZoneData } from "shotchart.d3.ts";

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
