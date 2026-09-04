import { useEffect, useRef } from "react";
import {
  type CourtExtent,
  type CourtType,
  createHalfcourt,
  type FloorInput,
  type HalfcourtInstance,
} from "shotchart.d3.ts";

interface Props {
  courtType: CourtType;
  floor?: FloorInput;
  extent?: CourtExtent;
}

export function Halfcourt({ courtType, floor = "none", extent = "arc" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<HalfcourtInstance | null>(null);

  // All three props are structural — rebuild on any change.
  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createHalfcourt(svgRef.current, { courtType, floor, extent });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [courtType, floor, extent]);

  return <svg ref={svgRef} className="mx-auto w-full max-w-3xl" />;
}
