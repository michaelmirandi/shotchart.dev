import { useEffect, useRef } from "react";
import {
  type CourtType,
  createHexbinShotchart,
  type FloorInput,
  type HexbinShotchartInstance,
  type Shot,
  type Theme,
} from "shotchart.ts";

interface Props {
  courtType: CourtType;
  data: Shot[];
  theme: Theme;
  radius: number;
  floor?: FloorInput;
  minAttempts?: number;
}

export function HexbinShotchart({
  courtType,
  data,
  theme,
  radius,
  floor = "none",
  minAttempts = 1,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<HexbinShotchartInstance | null>(null);

  // Rebuild on structural changes; data / theme / radius propagate via setters.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — initial data/theme/radius are captured at mount
  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = createHexbinShotchart(svgRef.current, {
      courtType,
      floor,
      minAttempts,
      data,
      theme,
      radius,
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [courtType, floor, minAttempts]);

  useEffect(() => {
    chartRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    chartRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    chartRef.current?.setRadius(radius);
  }, [radius]);

  return <svg ref={svgRef} className="mx-auto w-full max-w-3xl" />;
}
