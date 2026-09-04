import { type Column, DataTable } from "./DataTable";

interface Row {
  landmark: string;
  x: string;
  y: string;
}

const ROWS: Row[] = [
  { landmark: "Baseline", x: "0 → courtWidth", y: "visibleCourtLength" },
  { landmark: "Sidelines", x: "0, courtWidth", y: "0 → visibleCourtLength" },
  {
    landmark: "Basket center",
    x: "courtWidth / 2",
    y: "basketCenterY  (= visibleCourtLength − basketProtrusionLength − 1.25)",
  },
  {
    landmark: "Backboard",
    x: "(courtWidth − basketWidth) / 2 → (courtWidth + basketWidth) / 2",
    y: "visibleCourtLength − basketProtrusionLength",
  },
  {
    landmark: "Free-throw line",
    x: "(courtWidth − keyWidth) / 2 → (courtWidth + keyWidth) / 2",
    y: "visibleCourtLength − freeThrowLineLength",
  },
  { landmark: "Top of 3-pt arc", x: "courtWidth / 2", y: "basketCenterY − threePointRadius" },
  {
    landmark: "Corner-3 line",
    x: "courtWidth / 2 ± threePointSideRadius",
    y: "visibleCourtLength − threePointCutOffLength → visibleCourtLength",
  },
  { landmark: "Restricted-area arc", x: "radius restrictedAreaRadius", y: "centered on basket" },
  { landmark: 'Division line  (extent: "half")', x: "0 → courtWidth", y: "0" },
  {
    landmark: 'Center circle  (extent: "half")',
    x: "radius centerCircleRadius",
    y: "centered on (courtWidth / 2, 0)",
  },
];

const COLUMNS: Column<Row>[] = [
  { key: "landmark", header: "Landmark", nowrap: true },
  { key: "x", header: "x", mono: true },
  { key: "y", header: "y", mono: true },
];

export function LandmarksTable() {
  return <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.landmark} />;
}
