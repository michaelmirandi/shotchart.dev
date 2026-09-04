import { useEffect, useRef } from "react";
import {
  type CourtExtent,
  type CourtType,
  createShotScatter,
  type FloorInput,
  type MissedMarker,
  type Shot,
  type ShotScatterInstance,
} from "shotchart.d3.ts";

interface Props {
  courtType: CourtType;
  data: Shot[];
  floor?: FloorInput;
  extent?: CourtExtent;
  missedMarker?: MissedMarker;
}

export function ShotScatter({
  courtType,
  data,
  floor = "none",
  extent = "arc",
  missedMarker = "ring",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<ShotScatterInstance | null>(null);

  // Rebuild on structural changes; data and style propagate via setters.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — initial data/style are captured at mount
  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createShotScatter(svgRef.current, {
      courtType,
      floor,
      extent,
      data,
      style: { missedMarker },
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [courtType, floor, extent]);

  useEffect(() => {
    chartRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    chartRef.current?.setStyle({ missedMarker });
  }, [missedMarker]);

  return <svg ref={svgRef} className="mx-auto w-full max-w-3xl" />;
}
