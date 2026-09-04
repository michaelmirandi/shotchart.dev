import type { Selection } from "d3-selection";

/**
 * Drawing helpers shared by the annotated diagrams (coordinates, dimensions).
 * Everything is in feet (the SVG unit) and uses `currentColor`, so the
 * `.court-annotations` rules in globals.css control the look in both themes.
 */

export type Layer = Selection<SVGGElement, unknown, null, undefined>;
type Anchor = "start" | "middle" | "end";

/** Feet with at most two decimals, trailing zeros dropped. */
export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Spread callout slots vertically so labels never overlap: push down from the
 * top to enforce the gap, then pull back up if the last one ran past the bottom.
 */
export function layoutSlots(targets: number[], min: number, max: number, gap: number): number[] {
  const ys = targets.map((y) => Math.max(min, y));
  for (let i = 1; i < ys.length; i += 1) ys[i] = Math.max(ys[i], ys[i - 1] + gap);
  ys[ys.length - 1] = Math.min(ys[ys.length - 1], max);
  for (let i = ys.length - 2; i >= 0; i -= 1) ys[i] = Math.min(ys[i], ys[i + 1] - gap);
  return ys;
}

export interface Annotator {
  text(
    x: number,
    y: number,
    label: string,
    anchor: Anchor,
    size?: number,
  ): Selection<SVGTextElement, unknown, null, undefined>;
  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width?: number,
  ): Selection<SVGLineElement, unknown, null, undefined>;
  dot(x: number, y: number, r?: number): void;
  /**
   * A dimension line with end ticks and a value label. For a horizontal line
   * `offset` moves the label up (negative) or down; for a vertical line it moves
   * it left (negative, end-anchored) or right. For a diagonal it moves the label
   * along the line's left-hand normal (negative = right-hand side).
   */
  dimension(x1: number, y1: number, x2: number, y2: number, label: string, offset: number): void;
}

export function annotator(layer: Layer): Annotator {
  const text: Annotator["text"] = (x, y, label, anchor, size = 1.15) =>
    layer
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("font-size", size)
      .attr("text-anchor", anchor)
      .attr("dominant-baseline", "middle")
      .text(label);

  const line: Annotator["line"] = (x1, y1, x2, y2, width = 0.06) =>
    layer
      .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "currentColor")
      .attr("stroke-width", width);

  const dot: Annotator["dot"] = (x, y, r = 0.3) => {
    layer.append("circle").attr("cx", x).attr("cy", y).attr("r", r).attr("fill", "currentColor");
  };

  const dimension: Annotator["dimension"] = (x1, y1, x2, y2, label, offset) => {
    const tick = 0.35;
    line(x1, y1, x2, y2);
    if (y1 === y2) {
      line(x1, y1 - tick, x1, y1 + tick);
      line(x2, y2 - tick, x2, y2 + tick);
      text((x1 + x2) / 2, y1 + offset, label, "middle", 1.05);
    } else if (x1 === x2) {
      line(x1 - tick, y1, x1 + tick, y1);
      line(x2 - tick, y2, x2 + tick, y2);
      text(x1 + offset, (y1 + y2) / 2, label, offset > 0 ? "start" : "end", 1.05);
    } else {
      // Diagonal: ticks and label along the left-hand normal of p1 → p2.
      const len = Math.hypot(x2 - x1, y2 - y1);
      const nx = -(y2 - y1) / len;
      const ny = (x2 - x1) / len;
      line(x1 + nx * tick, y1 + ny * tick, x1 - nx * tick, y1 - ny * tick);
      line(x2 + nx * tick, y2 + ny * tick, x2 - nx * tick, y2 - ny * tick);
      const side = nx * Math.sign(offset);
      text(
        (x1 + x2) / 2 + nx * offset,
        (y1 + y2) / 2 + ny * offset,
        label,
        side > 0.3 ? "start" : side < -0.3 ? "end" : "middle",
        1.05,
      );
    }
  };

  return { text, line, dot, dimension };
}

export interface Callout {
  name: string;
  value: string;
  /** Target point on the court. */
  x: number;
  y: number;
}

export interface CalloutLayout {
  minY: number;
  maxY: number;
  /** Minimum vertical distance between slots (two text lines + air). */
  gap: number;
  /** Where leaders turn toward their slot. */
  elbowX: number;
  /** Left edge of the label column. */
  labelX: number;
}

/** Named callouts in a gutter column, sorted by target and spread so they never collide. */
export function drawCallouts(
  a: Annotator,
  layer: Layer,
  callouts: Callout[],
  { minY, maxY, gap, elbowX, labelX }: CalloutLayout,
): void {
  const sorted = [...callouts].sort((p, q) => p.y - q.y);
  const slots = layoutSlots(
    sorted.map((c) => c.y),
    minY,
    maxY,
    gap,
  );

  sorted.forEach((c, i) => {
    const slotY = slots[i];
    layer
      .append("path")
      .attr(
        "d",
        `M${c.x},${c.y} L${elbowX},${c.y} L${elbowX + 0.9},${slotY} L${labelX - 0.5},${slotY}`,
      )
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 0.08)
      .attr("stroke-opacity", 0.7);
    a.dot(c.x, c.y);
    a.text(labelX, slotY - 0.8, c.name, "start", 1.35).attr("class", "callout-name");
    a.text(labelX, slotY + 0.85, c.value, "start");
  });
}
