import type {
  CourtExtent,
  CourtType,
  FloorPreset,
  MissedMarker,
  Orientation,
  Shot,
  Theme,
  ZoneData,
} from "shotchart.ts";

export const FRAMEWORKS = ["vanilla", "react", "vue", "svelte", "angular"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  vanilla: "Vanilla TS",
  react: "React",
  vue: "Vue 3",
  svelte: "Svelte 5",
  angular: "Angular",
};

export const FRAMEWORK_SHIKI_LANG: Record<Framework, string> = {
  vanilla: "typescript",
  react: "tsx",
  vue: "vue",
  svelte: "svelte",
  angular: "typescript",
};

/** A floor choice as exposed by the docs toggles. */
export type FloorChoice = FloorPreset | "none";

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** `{ raw }` is emitted verbatim (identifiers, object literals); strings are quoted. */
type OptValue = string | number | boolean | { raw: string } | undefined;

function formatOptions(options: Record<string, OptValue>, indent: number): string {
  const pad = " ".repeat(indent);
  return Object.entries(options)
    .filter(([, v]) => v !== undefined)
    .map(([key, v]) => {
      const rendered =
        typeof v === "object" ? v.raw : typeof v === "string" ? JSON.stringify(v) : String(v);
      return `${pad}${key}: ${rendered},`;
    })
    .join("\n");
}

function importLine(names: string[]): string {
  const single = `import { ${names.join(", ")} } from "shotchart.ts";`;
  if (single.length <= 80) return single;
  return `import {\n${names.map((n) => `  ${n},`).join("\n")}\n} from "shotchart.ts";`;
}

export function formatZoneData(data: ZoneData[]): string {
  const rows = data.map(
    (z) =>
      `  { bucket: "${z.bucket}", fgm: ${z.fgm}, fga: ${z.fga}, percentile: ${z.percentile} },`,
  );
  return `[\n${rows.join("\n")}\n]`;
}

const SHOT_PREVIEW = 8;

export function formatShots(data: Shot[]): string {
  const rows = data
    .slice(0, SHOT_PREVIEW)
    .map((s) => `  { x: ${s.x}, y: ${s.y}, made: ${s.made} },`);
  if (data.length > SHOT_PREVIEW) rows.push(`  // … ${data.length - SHOT_PREVIEW} more`);
  return `[\n${rows.join("\n")}\n]`;
}

/** Everything the five framework renderers need to emit one factory's example. */
interface FactorySpec {
  factory: string;
  instanceType: string;
  /** Extra type imports (e.g. `ZoneData`, `Shot`). */
  types: string[];
  componentName: string;
  selector: string;
  svgClass: string;
  /** Module-level code emitted above the component (typically the dataset). */
  preamble?: string;
  options: Record<string, OptValue>;
  /** Cheap instance updates to mention, e.g. `setData(nextData)`. */
  setters: string[];
}

function renderVanilla(spec: FactorySpec): string {
  const updates = spec.setters.length
    ? `\n// Cheap updates (no re-render):\n${spec.setters.map((s) => `// chart.${s};`).join("\n")}\n`
    : "\n";
  return `${importLine([spec.factory, ...spec.types.map((t) => `type ${t}`)])}
import "shotchart.ts/styles.css";
${spec.preamble ? `\n${spec.preamble}\n` : ""}
const svg = document.querySelector<SVGSVGElement>("#chart")!;
const chart = ${spec.factory}(svg, {
${formatOptions(spec.options, 2)}
});
${updates}
// On teardown:
// chart.destroy();`;
}

function renderReact(spec: FactorySpec): string {
  const updates = spec.setters.length
    ? `\n  // Cheap updates from props — call setters in their own effects:\n${spec.setters
        .map((s) => `  //   chartRef.current?.${s};`)
        .join("\n")}\n`
    : "";
  return `import { useEffect, useRef } from "react";
${importLine([spec.factory, ...spec.types.map((t) => `type ${t}`), `type ${spec.instanceType}`])}
import "shotchart.ts/styles.css";
${spec.preamble ? `\n${spec.preamble}\n` : ""}
export function ${spec.componentName}() {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<${spec.instanceType} | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    chartRef.current = ${spec.factory}(svgRef.current, {
${formatOptions(spec.options, 6)}
    });
    return () => chartRef.current?.destroy();
  }, []);
${updates}
  return <svg ref={svgRef} className="${spec.svgClass}" />;
}`;
}

function renderVue(spec: FactorySpec): string {
  return `<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
${importLine([spec.factory, ...spec.types.map((t) => `type ${t}`), `type ${spec.instanceType}`])}
import "shotchart.ts/styles.css";
${spec.preamble ? `\n${spec.preamble}\n` : ""}
const svgRef = ref<SVGSVGElement | null>(null);
let chart: ${spec.instanceType} | null = null;

onMounted(() => {
  if (!svgRef.value) return;
  chart = ${spec.factory}(svgRef.value, {
${formatOptions(spec.options, 4)}
  });
});

onBeforeUnmount(() => chart?.destroy());
</script>

<template>
  <svg ref="svgRef" class="${spec.svgClass}" />
</template>`;
}

function renderSvelte(spec: FactorySpec): string {
  const preamble = spec.preamble
    ? `\n${spec.preamble
        .split("\n")
        .map((l) => (l ? `  ${l}` : l))
        .join("\n")}\n`
    : "";
  return `<script lang="ts">
  ${importLine([spec.factory, ...spec.types.map((t) => `type ${t}`), `type ${spec.instanceType}`])
    .split("\n")
    .join("\n  ")}
  import "shotchart.ts/styles.css";
${preamble}
  let svg: SVGSVGElement;
  let chart: ${spec.instanceType} | null = null;

  $effect(() => {
    chart = ${spec.factory}(svg, {
${formatOptions(spec.options, 6)}
    });
    return () => chart?.destroy();
  });
</script>

<svg bind:this={svg} class="${spec.svgClass}"></svg>`;
}

function renderAngular(spec: FactorySpec): string {
  return `import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
${importLine([spec.factory, ...spec.types.map((t) => `type ${t}`), `type ${spec.instanceType}`])}
import "shotchart.ts/styles.css";
${spec.preamble ? `\n${spec.preamble}\n` : ""}
@Component({
  selector: "${spec.selector}",
  standalone: true,
  template: '<svg #svg class="${spec.svgClass}"></svg>',
})
export class ${spec.componentName}Component implements AfterViewInit, OnDestroy {
  @ViewChild("svg") svgRef!: ElementRef<SVGSVGElement>;
  private chart: ${spec.instanceType} | null = null;

  ngAfterViewInit() {
    this.chart = ${spec.factory}(this.svgRef.nativeElement, {
${formatOptions(spec.options, 6)}
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}`;
}

function templatesFor<S>(
  build: (state: S) => FactorySpec,
): Record<Framework, (state: S) => string> {
  return {
    vanilla: (s) => renderVanilla(build(s)),
    react: (s) => renderReact(build(s)),
    vue: (s) => renderVue(build(s)),
    svelte: (s) => renderSvelte(build(s)),
    angular: (s) => renderAngular(build(s)),
  };
}

const floorOption = (floor: FloorChoice): OptValue => (floor === "none" ? undefined : floor);

// ---------------------------------------------------------------------------
// Per-factory templates
// ---------------------------------------------------------------------------

export interface HalfcourtState {
  courtType: CourtType;
  floor: FloorChoice;
  extent: CourtExtent;
}

export const halfcourtTemplates = templatesFor<HalfcourtState>(({ courtType, floor, extent }) => ({
  factory: "createHalfcourt",
  instanceType: "HalfcourtInstance",
  types: [],
  componentName: "Court",
  selector: "app-court",
  svgClass: "w-full max-w-2xl",
  options: {
    courtType,
    floor: floorOption(floor),
    extent: extent === "half" ? "half" : undefined,
  },
  setters: [],
}));

export interface ZonedState {
  courtType: CourtType;
  theme: Theme;
  data: ZoneData[];
  floor: FloorChoice;
}

export const zonedTemplates = templatesFor<ZonedState>(({ courtType, theme, data, floor }) => ({
  factory: "createZonedShotchart",
  instanceType: "ZonedShotchartInstance",
  types: ["ZoneData"],
  componentName: "Shotchart",
  selector: "app-shotchart",
  svgClass: "w-full max-w-2xl",
  preamble: `const data: ZoneData[] = ${formatZoneData(data)};`,
  options: {
    courtType,
    theme,
    backgroundTheme: "dark",
    floor: floorOption(floor),
    data: { raw: "data" },
  },
  setters: ["setData(nextData)", 'setTheme("blue-orange")', 'setBackground("light")'],
}));

export interface ScatterState {
  courtType: CourtType;
  data: Shot[];
  floor: FloorChoice;
  missedMarker: MissedMarker;
}

export const scatterTemplates = templatesFor<ScatterState>(
  ({ courtType, data, floor, missedMarker }) => ({
    factory: "createShotScatter",
    instanceType: "ShotScatterInstance",
    types: ["Shot"],
    componentName: "ShotScatter",
    selector: "app-shot-scatter",
    svgClass: "w-full max-w-2xl",
    preamble: `// Feet from basket center: +x right, +y toward halfcourt.\nconst shots: Shot[] = ${formatShots(data)};`,
    options: {
      courtType,
      floor: floorOption(floor),
      data: { raw: "shots" },
      style: missedMarker === "x" ? { raw: '{ missedMarker: "x" }' } : undefined,
    },
    setters: ["setData(nextShots)", "setStyle({ radius: 0.8 })"],
  }),
);

export interface HexbinState {
  courtType: CourtType;
  data: Shot[];
  theme: Theme;
  radius: number;
  floor: FloorChoice;
  minAttempts: number;
}

export const hexbinTemplates = templatesFor<HexbinState>(
  ({ courtType, data, theme, radius, floor, minAttempts }) => ({
    factory: "createHexbinShotchart",
    instanceType: "HexbinShotchartInstance",
    types: ["Shot"],
    componentName: "HexbinShotchart",
    selector: "app-hexbin-shotchart",
    svgClass: "w-full max-w-2xl",
    preamble: `// Feet from basket center: +x right, +y toward halfcourt.\nconst shots: Shot[] = ${formatShots(data)};`,
    options: {
      courtType,
      theme,
      radius,
      minAttempts: minAttempts > 1 ? minAttempts : undefined,
      floor: floorOption(floor),
      data: { raw: "shots" },
    },
    setters: ["setData(nextShots)", 'setTheme("blue-orange")', "setRadius(2)"],
  }),
);

export interface FullcourtState {
  courtType: CourtType;
  orientation: Orientation;
  floor: FloorChoice;
}

export const fullcourtTemplates = templatesFor<FullcourtState>(
  ({ courtType, orientation, floor }) => ({
    factory: "createFullcourt",
    instanceType: "FullcourtInstance",
    types: [],
    componentName: "Fullcourt",
    selector: "app-fullcourt",
    svgClass: orientation === "horizontal" ? "w-full max-w-4xl" : "w-full max-w-xs",
    options: {
      courtType,
      orientation: orientation === "vertical" ? "vertical" : undefined,
      floor: floorOption(floor),
    },
    setters: [],
  }),
);
