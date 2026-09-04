import type { ShotchartZone } from "shotchart.ts";
import { type Column, DataTable } from "./DataTable";

interface ZoneEntry {
  code: ShotchartZone;
  name: string;
  region: string;
}

const ZONES: ZoneEntry[] = [
  { code: "RIM", name: "Restricted Area", region: "Inside" },
  { code: "M-FL", name: "Middle Floater", region: "Paint" },
  { code: "L-FL", name: "Left Floater", region: "Paint" },
  { code: "R-FL", name: "Right Floater", region: "Paint" },
  { code: "M-MR", name: "Middle Midrange", region: "Midrange" },
  { code: "LW-MR", name: "Left Wing Midrange", region: "Midrange" },
  { code: "RW-MR", name: "Right Wing Midrange", region: "Midrange" },
  { code: "LB-MR", name: "Left Baseline Midrange", region: "Midrange" },
  { code: "RB-MR", name: "Right Baseline Midrange", region: "Midrange" },
  { code: "M-ATB", name: "Middle Above-the-Break 3", region: "Three" },
  { code: "L-ATB", name: "Left Above-the-Break 3", region: "Three" },
  { code: "R-ATB", name: "Right Above-the-Break 3", region: "Three" },
  { code: "L-C3", name: "Left Corner 3", region: "Three" },
  { code: "R-C3", name: "Right Corner 3", region: "Three" },
];

const COLUMNS: Column<ZoneEntry>[] = [
  { key: "code", header: "Code", mono: true, nowrap: true },
  { key: "name", header: "Name" },
  {
    key: "region",
    header: "Region",
    render: (z) => <span className="text-fg-muted">{z.region}</span>,
  },
];

export function ZoneCodesTable() {
  return <DataTable columns={COLUMNS} rows={ZONES} rowKey={(z) => z.code} />;
}
