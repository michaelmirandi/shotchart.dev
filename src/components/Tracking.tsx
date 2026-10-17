import { useEffect, useRef, useState } from "react";
import {
  type CourtType,
  createTracking,
  type FloorInput,
  type Orientation,
  type TrackingFrame,
  type TrackingInstance,
  type TrackingShapes,
  type TrackingStyle,
} from "shotchart.ts";
import { formatClock } from "../lib/tracking-sample";

interface Props {
  data: TrackingFrame[];
  fps: number;
  courtType?: CourtType;
  loop?: boolean;
  style?: Partial<TrackingStyle>;
  orientation?: Orientation;
  floor?: FloorInput;
  speed?: number;
  shapes?: TrackingShapes;
  /**
   * Runs after every (re)mount with the live instance — the place to draw
   * custom overlays. Return a cleanup. Must be referentially stable.
   */
  setup?: (chart: TrackingInstance) => (() => void) | undefined;
}

export function Tracking({
  data,
  fps,
  courtType = "ncaam",
  loop = false,
  style,
  orientation = "horizontal",
  floor = "none",
  speed = 1,
  shapes,
  setup,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<TrackingInstance | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Rebuild on structural changes and resume from the same frame; speed,
  // shapes and style propagate via their setters.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — frame/speed/shapes/style are captured at mount
  useEffect(() => {
    if (!svgRef.current) return;
    const chart = createTracking(svgRef.current, {
      courtType,
      orientation,
      floor,
      data,
      fps,
      speed,
      loop,
      shapes,
      style,
      onFrame: (i) => {
        setIndex(i);
        // Playback stops by itself at the last frame.
        if (!chartRef.current?.isPlaying()) setPlaying(false);
      },
    });
    chartRef.current = chart;
    const cleanup = setup?.(chart);
    chart.setFrame(index);
    setPlaying(false);
    return () => {
      cleanup?.();
      chart.destroy();
      chartRef.current = null;
    };
  }, [data, fps, courtType, orientation, floor, loop, setup]);

  useEffect(() => {
    chartRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (shapes) chartRef.current?.setShapes(shapes);
  }, [shapes]);

  useEffect(() => {
    if (style) chartRef.current?.setStyle(style);
  }, [style]);

  function toggle() {
    const chart = chartRef.current;
    if (!chart) return;
    if (chart.isPlaying()) chart.pause();
    else chart.play();
    setPlaying(chart.isPlaying());
  }

  const frame = data[index];
  const sizing = orientation === "horizontal" ? "max-w-4xl" : "max-w-xs";

  return (
    <div className={`mx-auto w-full space-y-3 ${sizing}`}>
      <svg ref={svgRef} className="w-full" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="w-16 shrink-0 rounded-md border border-line bg-canvas px-2.5 py-1 text-xs font-medium hover:border-line-strong"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0, data.length - 1)}
          value={index}
          aria-label="Frame"
          onChange={(e) => {
            chartRef.current?.pause();
            setPlaying(false);
            chartRef.current?.setFrame(Number(e.target.value));
          }}
          className="min-w-0 flex-1 accent-current"
        />
        <span className="shrink-0 font-mono text-[11px] text-fg-muted tabular-nums">
          {formatClock(frame?.gameClock)} · SC {frame?.shotClock?.toFixed(1) ?? "—"}
        </span>
      </div>
    </div>
  );
}
