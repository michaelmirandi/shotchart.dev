import { select } from "d3-selection";
import { useEffect, useRef } from "react";
import { createHalfcourt, createShotchartSettings, nbaSettings } from "shotchart.d3.ts";
import { annotator, drawCallouts, fmt } from "../lib/annotate";

// Gutters around the court, in feet (the SVG unit).
const LEFT = 9; // y ruler labels
const TOP = 4; // x ruler labels + origin
const RIGHT = 22; // callouts
const BOTTOM = 3; // "y ↓" hint

const RULER_OFFSET = 1.2; // axis line distance from the court edge
const TICK = 0.7;

/**
 * The coordinate explainer: an NBA halfcourt with an x ruler on top, a y ruler
 * on the left, and named callouts (with their SVG coordinates) in a right
 * gutter. Every number comes from `createShotchartSettings`, nothing is
 * hand-placed. The annotation layer sits outside the library's `g.shotchart`
 * so the library's label rules never touch it.
 */
export function CourtDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const chart = createHalfcourt(svgRef.current, { courtType: "nba" });
    const s = createShotchartSettings(nbaSettings);

    const cw = s.courtWidth;
    const vl = s.visibleCourtLength();
    const bx = cw / 2;
    const by = s.basketCenterY;
    const backboardY = vl - s.basketProtrusionLength;
    const ftY = vl - s.freeThrowLineLength;
    const arcTopY = by - nbaSettings.threePointRadius;
    const cornerX = bx - nbaSettings.threePointSideRadius;
    const cornerTopY = vl - nbaSettings.threePointCutOffLength;

    const svg = select(svgRef.current).attr(
      "viewBox",
      `${-LEFT} ${-TOP} ${cw + LEFT + RIGHT} ${vl + TOP + BOTTOM}`,
    );
    const layer = svg.append("g").attr("class", "court-annotations");
    const a = annotator(layer);

    // ---- x ruler (top) ----
    const xAxisY = -RULER_OFFSET;
    a.line(0, xAxisY, cw, xAxisY);
    for (const x of [0, cornerX, bx, cw - cornerX, cw]) {
      a.line(x, xAxisY, x, xAxisY + TICK);
      a.text(x, xAxisY - 1.1, fmt(x), "middle");
    }
    a.text(cw + 1.2, xAxisY, "x →", "start");

    // ---- y ruler (left) ----
    const yAxisX = -RULER_OFFSET;
    a.line(yAxisX, 0, yAxisX, vl);
    for (const y of [0, arcTopY, ftY, by, vl]) {
      a.line(yAxisX, y, yAxisX + TICK, y);
      a.text(yAxisX - 0.9, y, fmt(y), "end");
    }
    a.text(yAxisX, vl + 1.7, "y ↓", "middle");

    // ---- origin ----
    a.dot(0, 0);
    a.line(0, 0, -1.3, -1.3, 0.08);
    a.text(-1.8, -3.0, "origin", "end").attr("class", "callout-name");
    a.text(-1.8, -1.7, "(0, 0)", "end");

    // ---- callouts (right gutter) ----
    drawCallouts(
      a,
      layer,
      [
        { name: "top of 3-pt arc", value: `y = ${fmt(arcTopY)}`, x: bx, y: arcTopY },
        { name: "sideline", value: `x = 0 or ${fmt(cw)}`, x: cw, y: 14 },
        {
          name: "free-throw line",
          value: `y = ${fmt(ftY)}`,
          x: bx + nbaSettings.keyWidth / 2,
          y: ftY,
        },
        {
          name: "corner-3 line",
          value: `x = ${fmt(cornerX)} or ${fmt(cw - cornerX)}`,
          x: cw - cornerX,
          y: cornerTopY + 3,
        },
        { name: "basket center", value: `(${fmt(bx)}, ${fmt(by)})`, x: bx, y: by },
        {
          name: "backboard",
          value: `y = ${fmt(backboardY)}`,
          x: bx + s.basketWidth / 2,
          y: backboardY,
        },
        { name: "baseline", value: `y = ${fmt(vl)}`, x: cw, y: vl },
      ],
      { minY: 1, maxY: vl - 1, gap: 3.9, elbowX: cw + 1.6, labelX: cw + 3.2 },
    );

    return () => {
      chart.destroy();
      layer.remove();
    };
  }, []);

  return <svg ref={svgRef} className="w-full" />;
}
