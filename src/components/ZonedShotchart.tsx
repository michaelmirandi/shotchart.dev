import {
  type ZoneData,
  type ZonedShotchartInstance,
  createZonedShotchart,
} from "shotchart.d3.ts";
import { useEffect, useRef } from "react";

interface Props {
  data: ZoneData[];
  courtType?: "nba" | "college";
  theme?: "red-green" | "blue-orange";
  backgroundTheme?: "dark" | "light";
}

export function ZonedShotchart(props: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<ZonedShotchartInstance | null>(null);

  // Recreate the chart only on structural changes (court type)
  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createZonedShotchart(svgRef.current, {
      courtType: props.courtType,
      data: props.data,
      theme: props.theme,
      backgroundTheme: props.backgroundTheme,
    });
    return () => chartRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.courtType]);

  // Cheap, in-place updates for everything else
  useEffect(() => {
    chartRef.current?.setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (props.theme) chartRef.current?.setTheme(props.theme);
  }, [props.theme]);

  useEffect(() => {
    if (props.backgroundTheme) chartRef.current?.setBackground(props.backgroundTheme);
  }, [props.backgroundTheme]);

  return <svg ref={svgRef} className="w-full max-w-2xl mx-auto block" />;
}
