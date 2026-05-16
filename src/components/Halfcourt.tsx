import { type HalfcourtInstance, createHalfcourt } from "shotchart.d3.ts";
import { useEffect, useRef } from "react";

interface Props {
  courtType?: "nba" | "college";
}

export function Halfcourt(props: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<HalfcourtInstance | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createHalfcourt(svgRef.current, { courtType: props.courtType });
    return () => chartRef.current?.destroy();
  }, [props.courtType]);

  return <svg ref={svgRef} className="w-full max-w-2xl mx-auto block" />;
}
