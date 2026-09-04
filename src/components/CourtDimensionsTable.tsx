import type { CourtType, LeagueSettings } from "shotchart.ts";
import {
  fibaSettings,
  nbaSettings,
  ncaamSettings,
  ncaawSettings,
  nfhsSettings,
  wnbaSettings,
} from "shotchart.ts";
import { type Column, DataTable } from "./DataTable";

const COURTS: Array<{ id: CourtType; settings: LeagueSettings; notes: string }> = [
  { id: "nba", settings: nbaSettings, notes: "Dashed inner half on FT circle" },
  { id: "wnba", settings: wnbaSettings, notes: "NBA court, closer 3-pt arc" },
  { id: "ncaam", settings: ncaamSettings, notes: "Solid FT circle, 12' paint" },
  { id: "ncaaw", settings: ncaawSettings, notes: "Identical to NCAA-M since 2021-22" },
  { id: "fiba", settings: fibaSettings, notes: "Metric → feet (28 m × 15 m)" },
  { id: "nfhs", settings: nfhsSettings, notes: "84' court, no painted RA arc" },
];

/** Feet with at most two decimals; whole numbers stay whole (50 → "50", not "5"). */
function feet(n: number | null): string {
  if (n === null) return "—";
  if (Number.isInteger(n)) return `${n}'`;
  return `${n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}'`;
}

interface Row {
  id: CourtType;
  length: string;
  width: string;
  three: string;
  paint: string;
  ft: string;
  ra: string;
  notes: string;
}

const ROWS: Row[] = COURTS.map(({ id, settings: s, notes }) => ({
  id,
  length: feet(s.courtLength),
  width: feet(s.courtWidth),
  three: feet(s.threePointRadius),
  paint: feet(s.keyWidth),
  ft: feet(s.freeThrowLineLength),
  ra: feet(s.restrictedAreaRadius),
  notes,
}));

const COLUMNS: Column<Row>[] = [
  { key: "id", header: "courtType", mono: true, nowrap: true },
  { key: "length", header: "length", mono: true, align: "right" },
  { key: "width", header: "width", mono: true, align: "right" },
  { key: "three", header: "3-pt", mono: true, align: "right" },
  { key: "paint", header: "paint", mono: true, align: "right" },
  { key: "ft", header: "FT line", mono: true, align: "right" },
  { key: "ra", header: "RA arc", mono: true, align: "right" },
  {
    key: "notes",
    header: "Notes",
    render: (r) => <span className="whitespace-nowrap text-fg-muted">{r.notes}</span>,
  },
];

export function CourtDimensionsTable() {
  return <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />;
}
