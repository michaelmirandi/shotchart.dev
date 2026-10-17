import type { TrackingFrame, TrackingTeam } from "shotchart.ts";
import sample from "./tracking-sample.json";

export interface SampleRosterEntry {
  id: string;
  team: TrackingTeam;
  label: string;
  name: string;
  teamName: string;
}

/**
 * One real possession of BBI optical tracking (25 Hz): Connecticut's trip after
 * the opening block — a closeout on the left wing, then a missed three — from
 * Duke vs Connecticut, 2026-03-29. Stored as compact rows; expanded here.
 */
export const trackingRoster = sample.roster as SampleRosterEntry[];

export const trackingFrames: TrackingFrame[] = sample.frames.map((row) => {
  const [frame, gameClock, shotClock, bx, by, bz] = row as [
    number,
    number,
    number | null,
    number,
    number,
    number,
  ];
  const players = [];
  for (const [i, p] of trackingRoster.entries()) {
    const x = row[6 + i * 2];
    const y = row[7 + i * 2];
    if (typeof x === "number" && typeof y === "number") {
      players.push({ id: p.id, team: p.team, x, y, label: p.label });
    }
  }
  return { frame, gameClock, shotClock, players, ball: { x: bx, y: by, z: bz } };
});

export const trackingFps = sample.fps;

/** Index of the shot's release (frame 2252) inside `trackingFrames`. */
export const trackingShotIndex = trackingFrames.findIndex((f) => f.frame === 2252);

/** `1147.92` → `"19:07.9"`. */
export function formatClock(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}
