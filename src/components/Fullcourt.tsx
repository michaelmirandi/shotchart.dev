import { useEffect, useRef } from "react";
import {
  type CourtType,
  createFullcourt,
  type FloorInput,
  type FullcourtInstance,
  type Orientation,
} from "shotchart.d3.ts";

interface Props {
  courtType: CourtType;
  orientation?: Orientation;
  floor?: FloorInput;
}

export function Fullcourt({ courtType, orientation = "horizontal", floor = "none" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<FullcourtInstance | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createFullcourt(svgRef.current, { courtType, orientation, floor });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [courtType, orientation, floor]);

  // A vertical 50×94 court is tall — cap its width so it doesn't tower over the page.
  const sizing = orientation === "horizontal" ? "max-w-4xl" : "max-w-xs";

  return <svg ref={svgRef} className={`w-full ${sizing} mx-auto`} />;
}
