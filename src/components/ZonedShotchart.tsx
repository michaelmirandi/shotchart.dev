import { useEffect, useRef } from "react";
import {
  type CourtType,
  createZonedShotchart,
  type FloorInput,
  type Theme,
  type ZoneData,
  type ZonedShotchartInstance,
} from "shotchart.ts";

interface Props {
  courtType: CourtType;
  theme: Theme;
  data: ZoneData[];
  floor?: FloorInput;
}

export function ZonedShotchart({ courtType, theme, data, floor = "none" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<ZonedShotchartInstance | null>(null);

  // Rebuild only on structural changes (court, floor); data and theme propagate via setters.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — initial data/theme are captured at mount
  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createZonedShotchart(svgRef.current, {
      courtType,
      theme,
      backgroundTheme: "dark",
      floor,
      data,
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [courtType, floor]);

  useEffect(() => {
    chartRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    chartRef.current?.setTheme(theme);
  }, [theme]);

  return <svg ref={svgRef} className="mx-auto w-full max-w-3xl" />;
}
