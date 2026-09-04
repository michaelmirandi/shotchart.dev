import { select } from "d3-selection";
import { useEffect, useRef } from "react";
import { createHalfcourt, createShotchartSettings, type LeagueSettings } from "shotchart.ts";
import { annotator, drawCallouts, fmt } from "../lib/annotate";

// Gutters around the court, in feet (the SVG unit).
const LEFT = 8; // half-length dimension
const TOP = 5; // width dimension
const RIGHT = 26; // callouts
const BOTTOM = 4; // lane-width dimension

interface Props {
  league: LeagueSettings;
}

const ft = (n: number) => `${fmt(n)}'`;

/**
 * The dimensions explainer: a full half court (`extent: "half"`) with
 * dimension lines for the big measures and a callout for every
 * `LeagueSettings` field, so the six presets can be compared at a glance.
 */
export function DimensionsDiagram({ league }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const chart = createHalfcourt(svgRef.current, { leagueSettings: league, extent: "half" });
    const s = createShotchartSettings(league, "half");

    const cw = s.courtWidth;
    const vl = s.visibleCourtLength(); // = courtLength / 2
    const bx = cw / 2;
    const by = s.basketCenterY;
    const backboardY = vl - league.basketProtrusionLength;
    const ftY = vl - league.freeThrowLineLength;
    const arcTopY = by - league.threePointRadius;
    const cornerX = bx - league.threePointSideRadius;
    const cornerTopY = vl - league.threePointCutOffLength;
    const halfKey = league.keyWidth / 2;

    const svg = select(svgRef.current).attr(
      "viewBox",
      `${-LEFT} ${-TOP} ${cw + LEFT + RIGHT} ${vl + TOP + BOTTOM}`,
    );
    const layer = svg.append("g").attr("class", "court-annotations");
    const a = annotator(layer);

    // ---- dimension lines for the big measures ----
    a.dimension(0, -2, cw, -2, ft(cw), -1.2); // court width, above the court
    a.dimension(-2, 0, -2, vl, ft(vl), -0.9); // half length, left gutter
    // 3-pt radius as a 45° radial toward the left wing — any radial is correct,
    // and this one crosses nothing but the paint's edge.
    const r = league.threePointRadius;
    a.dimension(bx, by, bx - r * Math.SQRT1_2, by - r * Math.SQRT1_2, ft(r), -1.2);
    a.dimension(bx, cornerTopY, cw - cornerX, cornerTopY, ft(league.threePointSideRadius), -1.1); // corner distance
    a.dimension(cornerX, vl, cornerX, cornerTopY, ft(league.threePointCutOffLength), -0.8); // corner line length
    a.dimension(bx - halfKey, vl + 1.4, bx + halfKey, vl + 1.4, ft(league.keyWidth), 1.3); // lane width, below the baseline
    a.dimension(
      bx + halfKey + 1.6,
      vl,
      bx + halfKey + 1.6,
      ftY,
      ft(league.freeThrowLineLength),
      0.8,
    ); // FT line

    // ---- one callout per LeagueSettings field ----
    const ra = league.restrictedAreaRadius;
    drawCallouts(
      a,
      layer,
      [
        { name: "courtLength", value: `${ft(league.courtLength)} (half shown)`, x: cw, y: 0.6 },
        {
          name: "centerCircleRadius",
          value: ft(league.centerCircleRadius),
          x: bx + league.centerCircleRadius,
          y: 0,
        },
        { name: "courtWidth", value: ft(cw), x: cw, y: 5 },
        { name: "threePointRadius", value: ft(league.threePointRadius), x: bx, y: arcTopY },
        {
          name: "threePointSideRadius",
          value: ft(league.threePointSideRadius),
          x: cw - cornerX,
          y: cornerTopY + 1,
        },
        {
          name: "freeThrowCircleRadius",
          value: ft(league.freeThrowCircleRadius),
          x: bx + league.freeThrowCircleRadius,
          y: ftY,
        },
        { name: "keyWidth", value: ft(league.keyWidth), x: bx + halfKey, y: vl + 1.4 },
        {
          name: "freeThrowLineLength",
          value: ft(league.freeThrowLineLength),
          x: bx + halfKey + 1.6,
          y: (vl + ftY) / 2,
        },
        {
          name: "threePointCutOffLength",
          value: ft(league.threePointCutOffLength),
          x: cw - cornerX,
          y: vl - 1.5,
        },
        {
          name: "restrictedAreaRadius",
          value: ra === null ? "none (no painted arc)" : ft(ra),
          x: bx + (ra ?? 4),
          y: by,
        },
        {
          name: "basketWidth",
          value: ft(league.basketWidth),
          x: bx + league.basketWidth / 2,
          y: backboardY,
        },
        {
          name: "basketProtrusionLength",
          value: ft(league.basketProtrusionLength),
          x: bx + league.basketWidth / 2 + 0.6,
          y: (backboardY + vl) / 2,
        },
      ],
      { minY: 1, maxY: vl - 1, gap: 3.4, elbowX: cw + 1.6, labelX: cw + 3.2 },
    );

    return () => {
      chart.destroy();
      layer.remove();
    };
  }, [league]);

  return <svg ref={svgRef} className="w-full" />;
}
