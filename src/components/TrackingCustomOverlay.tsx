import { select } from "d3-selection";
import type { TrackingFrame, TrackingInstance, TrackingPlayer } from "shotchart.ts";

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

function nearestDefender(frame: TrackingFrame): TrackingPlayer | null {
  const ball = frame.ball;
  if (!ball || !frame.offense) return null;
  const defense = frame.offense === "home" ? "away" : "home";
  let best: TrackingPlayer | null = null;
  for (const p of frame.players) {
    if (p.team === defense && (!best || distance(p, ball) < distance(best, ball))) best = p;
  }
  return best;
}

/**
 * The "Build your own" recipe: a dashed line from the ball to the nearest
 * defender with an upright distance label, drawn with nothing but
 * `overlay()`, `project()` and `addFrameListener()`.
 */
export function nearestDefenderOverlay(chart: TrackingInstance): () => void {
  const layer = select(chart.overlay());
  const line = layer
    .append("line")
    .attr("stroke", "#111827")
    .attr("stroke-width", 0.15)
    .attr("stroke-dasharray", "0.6 0.4");
  const label = layer
    .append("text")
    .attr("font-weight", 600)
    .attr("text-anchor", "middle")
    // Inline !important beats the stylesheet's `.shotchart text` rule.
    .style("font-size", "1.3px", "important")
    .style("fill", "#111827", "important")
    .style("stroke", "#ffffff", "important")
    .style("stroke-width", "0.35px", "important")
    .style("paint-order", "stroke");

  const draw = (frame: TrackingFrame | undefined) => {
    const defender = frame ? nearestDefender(frame) : null;
    const ball = frame?.ball;
    if (!defender || !ball) {
      line.attr("display", "none");
      label.attr("display", "none");
      return;
    }
    const from = chart.project(ball);
    const to = chart.project(defender);
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    line
      .attr("display", null)
      .attr("x1", from.x)
      .attr("y1", from.y)
      .attr("x2", to.x)
      .attr("y2", to.y);
    label
      .attr("display", null)
      .attr("x", mid.x)
      .attr("y", mid.y)
      // On a horizontal court the overlay is rotated -90°; turn the text back upright.
      .attr(
        "transform",
        chart.orientation === "horizontal"
          ? `rotate(90, ${mid.x}, ${mid.y}) translate(0, -0.6)`
          : "translate(0, -0.6)",
      )
      .text(`${distance(defender, ball).toFixed(1)} ft`);
  };

  draw(chart.current());
  const off = chart.addFrameListener((_, frame) => draw(frame));
  return () => {
    off();
    line.remove();
    label.remove();
  };
}
