import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import {
  type CourtExtent,
  type CourtType,
  type FloorOptions,
  fibaSettings,
  type LeagueSettings,
  type MissedMarker,
  nbaSettings,
  ncaamSettings,
  ncaawSettings,
  nfhsSettings,
  type Orientation,
  type Theme,
  wnbaSettings,
} from "shotchart.d3.ts";
import { CodeBlock } from "../components/CodeBlock";
import { CourtDiagram } from "../components/CourtDiagram";
import { CourtDimensionsTable } from "../components/CourtDimensionsTable";
import { type Column, DataTable } from "../components/DataTable";
import { Control, Demo } from "../components/Demo";
import { DimensionsDiagram } from "../components/DimensionsDiagram";
import { FrameworkTabs } from "../components/FrameworkTabs";
import { Fullcourt } from "../components/Fullcourt";
import { Halfcourt } from "../components/Halfcourt";
import { HexbinShotchart } from "../components/HexbinShotchart";
import { LandmarksTable } from "../components/LandmarksTable";
import { SegmentedControl } from "../components/SegmentedControl";
import { ShotScatter } from "../components/ShotScatter";
import { ZoneCodesTable } from "../components/ZoneCodesTable";
import { ZoneDataInspector } from "../components/ZoneDataInspector";
import { ZonedShotchart } from "../components/ZonedShotchart";
import {
  type FloorChoice,
  type Framework,
  fullcourtTemplates,
  halfcourtTemplates,
  hexbinTemplates,
  scatterTemplates,
  zonedTemplates,
} from "../lib/code-templates";
import { exampleZoneData, generateShots, sparseZoneData } from "../lib/sample-data";

export const Route = createFileRoute("/")({
  component: Docs,
});

const datasets = {
  example: { label: "exampleZoneData", value: exampleZoneData },
  sparse: { label: "sparseZoneData", value: sparseZoneData },
} as const;

type DatasetKey = keyof typeof datasets;

const COURT_OPTIONS: ReadonlyArray<{ value: CourtType; label: string }> = [
  { value: "nba", label: "NBA" },
  { value: "wnba", label: "WNBA" },
  { value: "ncaam", label: "NCAAM" },
  { value: "ncaaw", label: "NCAAW" },
  { value: "fiba", label: "FIBA" },
  { value: "nfhs", label: "NFHS" },
];

const LEAGUE_BY_TYPE: Record<CourtType, LeagueSettings> = {
  nba: nbaSettings,
  wnba: wnbaSettings,
  ncaam: ncaamSettings,
  ncaaw: ncaawSettings,
  fiba: fibaSettings,
  nfhs: nfhsSettings,
};

const FLOOR_OPTIONS: ReadonlyArray<{ value: FloorChoice; label: string }> = [
  { value: "none", label: "None" },
  { value: "maple", label: "Maple" },
  { value: "walnut", label: "Walnut" },
  { value: "dark", label: "Dark" },
];

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: "red-green", label: "Red / green" },
  { value: "blue-orange", label: "Blue / orange" },
];

// Hoisted so the demo's effect dependency is stable across renders.
const CUSTOM_FLOOR: FloorOptions = {
  color: "#3b5b8f",
  plankWidth: 0.75,
  plankLength: 8,
  grain: false,
  keyColor: "#2c4670",
};

type HexRadiusKey = "1" | "1.5" | "2";

interface ApiRow {
  name: string;
  sig: string;
  notes: string;
}

const API_COLUMNS: Column<ApiRow>[] = [
  { key: "name", header: "Export", mono: true, nowrap: true },
  { key: "sig", header: "Signature", mono: true },
  {
    key: "notes",
    header: "Notes",
    render: (r) => <span className="text-fg-muted">{r.notes}</span>,
  },
];

function Docs() {
  const [halfcourtType, setHalfcourtType] = useState<CourtType>("nba");
  const [halfcourtFloor, setHalfcourtFloor] = useState<FloorChoice>("maple");
  const [halfcourtExtent, setHalfcourtExtent] = useState<CourtExtent>("arc");

  const [fullType, setFullType] = useState<CourtType>("nba");
  const [fullOrientation, setFullOrientation] = useState<Orientation>("horizontal");
  const [fullFloor, setFullFloor] = useState<FloorChoice>("maple");

  const [scatterType, setScatterType] = useState<CourtType>("nba");
  const [scatterFloor, setScatterFloor] = useState<FloorChoice>("maple");
  const [scatterMarker, setScatterMarker] = useState<MissedMarker>("ring");

  const [zonedType, setZonedType] = useState<CourtType>("nba");
  const [zonedTheme, setZonedTheme] = useState<Theme>("red-green");
  const [zonedDataset, setZonedDataset] = useState<DatasetKey>("example");
  const [zonedFloor, setZonedFloor] = useState<FloorChoice>("none");

  const [hexType, setHexType] = useState<CourtType>("nba");
  const [hexTheme, setHexTheme] = useState<Theme>("red-green");
  const [hexRadius, setHexRadius] = useState<HexRadiusKey>("1.5");
  const [hexFloor, setHexFloor] = useState<FloorChoice>("none");
  const [hexMin, setHexMin] = useState<"1" | "3">("1");

  const [dimType, setDimType] = useState<CourtType>("nba");

  const halfcourtExamples = useMemo<Record<Framework, string>>(() => {
    const state = { courtType: halfcourtType, floor: halfcourtFloor, extent: halfcourtExtent };
    return {
      vanilla: halfcourtTemplates.vanilla(state),
      react: halfcourtTemplates.react(state),
      vue: halfcourtTemplates.vue(state),
      svelte: halfcourtTemplates.svelte(state),
      angular: halfcourtTemplates.angular(state),
    };
  }, [halfcourtType, halfcourtFloor, halfcourtExtent]);

  const fullcourtExamples = useMemo<Record<Framework, string>>(() => {
    const state = { courtType: fullType, orientation: fullOrientation, floor: fullFloor };
    return {
      vanilla: fullcourtTemplates.vanilla(state),
      react: fullcourtTemplates.react(state),
      vue: fullcourtTemplates.vue(state),
      svelte: fullcourtTemplates.svelte(state),
      angular: fullcourtTemplates.angular(state),
    };
  }, [fullType, fullOrientation, fullFloor]);

  // Threes are placed relative to the selected league's arc, so regenerate per court.
  const scatterShots = useMemo(
    () => generateShots({ seed: 42, count: 300, league: LEAGUE_BY_TYPE[scatterType] }),
    [scatterType],
  );

  const scatterExamples = useMemo<Record<Framework, string>>(() => {
    const state = {
      courtType: scatterType,
      data: scatterShots,
      floor: scatterFloor,
      missedMarker: scatterMarker,
    };
    return {
      vanilla: scatterTemplates.vanilla(state),
      react: scatterTemplates.react(state),
      vue: scatterTemplates.vue(state),
      svelte: scatterTemplates.svelte(state),
      angular: scatterTemplates.angular(state),
    };
  }, [scatterType, scatterShots, scatterFloor, scatterMarker]);

  const zonedData = datasets[zonedDataset].value;

  const zonedExamples = useMemo<Record<Framework, string>>(() => {
    const state = { courtType: zonedType, theme: zonedTheme, data: zonedData, floor: zonedFloor };
    return {
      vanilla: zonedTemplates.vanilla(state),
      react: zonedTemplates.react(state),
      vue: zonedTemplates.vue(state),
      svelte: zonedTemplates.svelte(state),
      angular: zonedTemplates.angular(state),
    };
  }, [zonedType, zonedTheme, zonedData, zonedFloor]);

  const hexShots = useMemo(
    () => generateShots({ seed: 7, count: 1200, league: LEAGUE_BY_TYPE[hexType] }),
    [hexType],
  );

  const hexExamples = useMemo<Record<Framework, string>>(() => {
    const state = {
      courtType: hexType,
      data: hexShots,
      theme: hexTheme,
      radius: Number(hexRadius),
      floor: hexFloor,
      minAttempts: Number(hexMin),
    };
    return {
      vanilla: hexbinTemplates.vanilla(state),
      react: hexbinTemplates.react(state),
      vue: hexbinTemplates.vue(state),
      svelte: hexbinTemplates.svelte(state),
      angular: hexbinTemplates.angular(state),
    };
  }, [hexType, hexShots, hexTheme, hexRadius, hexFloor, hexMin]);

  return (
    <article className="space-y-14">
      {/* ------------------------------------------------------------------ */}
      {/* Getting started                                                    */}
      {/* ------------------------------------------------------------------ */}

      <section id="overview" className="scroll-mt-16">
        <h1 className="text-3xl font-semibold tracking-tight">shotchart.d3.ts</h1>
        <p className="mt-4 text-lg text-fg-muted">
          Framework-agnostic basketball shotcharts built on D3. Hand it an SVG element and a small
          options object; it draws the court and your data.
        </p>
        <p className="mt-4">
          Two kinds of factory. <strong className="font-medium">Courts</strong>:{" "}
          <Code>createHalfcourt</Code> and <Code>createFullcourt</Code> draw a court in any of six
          league dimensions, optionally on a hardwood floor.{" "}
          <strong className="font-medium">Shots</strong>: three ways to put attempts on that court —
          one mark per shot (<Code>createShotScatter</Code>
          ), 14 buckets colored by percentile (<Code>createZonedShotchart</Code>), or hexagonal bins
          (<Code>createHexbinShotchart</Code>). Wrappers for every major framework live below.
        </p>
      </section>

      <Section id="installation" title="Installation">
        <CodeBlock
          lang="bash"
          code={`pnpm add shotchart.d3.ts
# npm install shotchart.d3.ts · yarn add shotchart.d3.ts · bun add shotchart.d3.ts`}
        />
        <p className="text-fg-muted">Then import the stylesheet once at your app entry:</p>
        <CodeBlock code={'import "shotchart.d3.ts/styles.css";'} lang="typescript" />
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Courts                                                             */}
      {/* ------------------------------------------------------------------ */}

      <Section
        id="halfcourt"
        title="Halfcourt"
        subtitle={
          <>
            <Code>createHalfcourt</Code> — a static, scalable court in any of six league dimensions.
          </>
        }
      >
        <Demo
          controls={
            <>
              <Control label="courtType">
                <SegmentedControl
                  value={halfcourtType}
                  onChange={setHalfcourtType}
                  options={COURT_OPTIONS}
                />
              </Control>
              <Control label="floor">
                <SegmentedControl
                  value={halfcourtFloor}
                  onChange={setHalfcourtFloor}
                  options={FLOOR_OPTIONS}
                />
              </Control>
              <Control label="extent">
                <SegmentedControl
                  value={halfcourtExtent}
                  onChange={setHalfcourtExtent}
                  options={[
                    { value: "arc", label: "Arc (default)" },
                    { value: "half", label: "Full half" },
                  ]}
                />
              </Control>
            </>
          }
        >
          <Halfcourt courtType={halfcourtType} floor={halfcourtFloor} extent={halfcourtExtent} />
        </Demo>
        <FrameworkTabs examples={halfcourtExamples} />
      </Section>

      <Section
        id="fullcourt"
        title="Fullcourt"
        subtitle={
          <>
            <Code>createFullcourt</Code> — both ends, sidelines, division line and center circle,
            for all six leagues.
          </>
        }
      >
        <Demo
          controls={
            <>
              <Control label="courtType">
                <SegmentedControl value={fullType} onChange={setFullType} options={COURT_OPTIONS} />
              </Control>
              <Control label="orientation">
                <SegmentedControl
                  value={fullOrientation}
                  onChange={setFullOrientation}
                  options={[
                    { value: "horizontal", label: "Horizontal" },
                    { value: "vertical", label: "Vertical" },
                  ]}
                />
              </Control>
              <Control label="floor">
                <SegmentedControl
                  value={fullFloor}
                  onChange={setFullFloor}
                  options={FLOOR_OPTIONS}
                />
              </Control>
            </>
          }
        >
          <Fullcourt courtType={fullType} orientation={fullOrientation} floor={fullFloor} />
        </Demo>
        <p className="text-fg-muted">
          The viewBox is <Code>courtLength × courtWidth</Code> feet when horizontal (FIBA's 28 m ×
          15 m and NFHS's 84' × 50' come through as-is), and the transpose when vertical. Planks
          always run the length of the court.
        </p>
        <FrameworkTabs examples={fullcourtExamples} />
      </Section>

      <Section
        id="floor"
        title="Court floor"
        subtitle={
          <>
            The <Code>floor</Code> option — procedural hardwood: planks, seams and grain drawn in
            SVG, no image assets.
          </>
        }
      >
        <p>
          Every factory accepts a <Code>floor</Code> option. Pass a preset name (
          <Code>"maple"</Code>, <Code>"walnut"</Code>, <Code>"dark"</Code>) or an object to tune it.
          With a floor present the court lines switch to 2" white paint, the rim turns orange and
          the lane is painted. Everything is sized in feet, so it scales with the chart.
        </p>
        <CodeBlock
          lang="typescript"
          code={`import type { FloorInput, FloorOptions } from "shotchart.d3.ts";

type FloorInput = "none" | "wood" | "maple" | "walnut" | "dark" | FloorOptions;

interface FloorOptions {
  type?: "none" | "solid" | "wood"; // default "wood"
  preset?: "maple" | "walnut" | "dark";
  color?: string;        // base tone (solid color, or the wood's base)
  plankWidth?: number;   // feet, default 0.5
  plankLength?: number;  // feet, default 6
  grain?: boolean;       // feTurbulence overlay, default true
  seamOpacity?: number;  // default 0.25
  paintKey?: boolean;    // fill the lane, default true
  keyColor?: string;     // lane paint (defaults to a preset-derived tone)
  lineColor?: string;    // court line paint (defaults to white via CSS)
}`}
        />
        <SubHeading>Custom floor</SubHeading>
        <Demo>
          <Halfcourt courtType="nba" floor={CUSTOM_FLOOR} />
        </Demo>
        <CodeBlock
          lang="typescript"
          code={`createHalfcourt(svg, {
  courtType: "nba",
  floor: { color: "#3b5b8f", plankWidth: 0.75, plankLength: 8, grain: false, keyColor: "#2c4670" },
});`}
        />
      </Section>

      <Section
        id="coordinates"
        title="Coordinates & dimensions"
        subtitle="Where things are on the chart, so you can put your own things there too."
      >
        <SubHeading>Units</SubHeading>
        <p>
          Everything is in <strong className="font-medium">feet</strong>. FIBA's metric dimensions
          (28 m × 15 m, 6.75 m arc) are converted to feet at the settings boundary; internally the
          renderer never sees meters.
        </p>

        <SubHeading>The SVG viewBox</SubHeading>
        <p>
          Every halfcourt chart renders into{" "}
          <Code>viewBox="-0.1 -0.1 courtWidth+0.2 visibleCourtLength+0.2"</Code> where 1 SVG unit =
          1 foot (the 0.1 is stroke padding). Your CSS controls pixel size. Y increases downward, so
          the baseline sits at the <em>bottom</em> of the SVG and the top of the 3-pt arc is near
          the top.
        </p>
        <p className="text-fg-muted">
          With the default <Code>extent: "arc"</Code>, <Code>visibleCourtLength</Code> isn't{" "}
          <Code>courtLength / 2</Code>: the chart shows the arc plus half the leftover distance to
          mid-court. For NBA that is (23.75 + 5.25) + (47 − 29) / 2 = 38'. Pass{" "}
          <Code>extent: "half"</Code> for the whole 47'.
        </p>

        <SubHeading>Annotated NBA halfcourt</SubHeading>
        <p className="text-fg-muted">
          Rulers show SVG coordinates along each axis; callouts name the landmarks with their exact
          values. All numbers come from <Code>createShotchartSettings(nbaSettings)</Code>.
        </p>
        <Demo>
          <CourtDiagram />
        </Demo>

        <SubHeading>Landmarks</SubHeading>
        <LandmarksTable />
        <p className="text-fg-muted">
          <Code>basketCenterY</Code> comes from <Code>createShotchartSettings()</Code>: the rim
          center sits 15" (1.25') in front of the backboard on every court, so it is{" "}
          <Code>visibleCourtLength − basketProtrusionLength − 1.25</Code>.
        </p>

        <SubHeading>Plotting your own marks</SubHeading>
        <p className="text-fg-muted">
          The shot charts below cover the common cases, but any overlay can use the same projection:{" "}
          <Code>shotToSvg()</Code> turns basket-relative feet into SVG coordinates (and{" "}
          <Code>svgToShot()</Code> goes back).
        </p>
        <CodeBlock
          lang="typescript"
          code={`import { select } from "d3-selection";
import {
  createHalfcourt,
  createShotchartSettings,
  nbaSettings,
  shotToSvg,
} from "shotchart.d3.ts";
import "shotchart.d3.ts/styles.css";

const svg = document.querySelector<SVGSVGElement>("#chart")!;
createHalfcourt(svg, { courtType: "nba" });
const settings = createShotchartSettings(nbaSettings);

// (0, 0) is basket center, +x right, +y toward halfcourt.
const marks = [
  { x: 0, y: 0, label: "dunk" },
  { x: -22, y: 1, label: "right corner 3" },
  { x: 5, y: 18, label: "top of key" },
];

// Append to the SVG root, outside the court group, so plain fills apply.
const overlay = select(svg).append("g").attr("class", "my-overlay");
for (const m of marks) {
  const { x, y } = shotToSvg(m, settings);
  overlay.append("circle").attr("cx", x).attr("cy", y).attr("r", 0.5).attr("fill", "#111");
}`}
        />

        <SubHeading>Court dimensions</SubHeading>
        <p className="text-fg-muted">
          The same treatment for the physical court: dimension lines for the big measures and a
          callout for every <Code>LeagueSettings</Code> field, on the full half court (
          <Code>extent: "half"</Code>). Switch courts to compare presets.
        </p>
        <Demo
          controls={
            <Control label="courtType">
              <SegmentedControl value={dimType} onChange={setDimType} options={COURT_OPTIONS} />
            </Control>
          }
        >
          <DimensionsDiagram league={LEAGUE_BY_TYPE[dimType]} />
        </Demo>

        <SubHeading>All six courts</SubHeading>
        <CourtDimensionsTable />
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Shots                                                              */}
      {/* ------------------------------------------------------------------ */}

      <Section
        id="shot-data"
        title="Shot data"
        subtitle="The per-shot input shared by the Individual and Hexbin charts."
      >
        <p>
          Shots are in <strong className="font-medium">feet from the basket center</strong>:{" "}
          <Code>+x</Code> is to the right as drawn (baseline at the bottom), <Code>+y</Code> points
          toward halfcourt. That is the NBA Stats API convention divided by ten, and it is
          league-independent: the same shot list renders on any court. If your source looks
          mirrored, negate <Code>x</Code>. The Buckets chart is the exception — it takes
          pre-aggregated zone totals (see{" "}
          <a href="#zone-data" className="underline underline-offset-4">
            ZoneData shape
          </a>
          ).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Labeled label="The Shot type">
            <CodeBlock
              lang="typescript"
              code={`import type { Shot } from "shotchart.d3.ts";

interface Shot {
  x: number;      // feet from basket center, +x right
  y: number;      // feet from basket center, +y toward halfcourt
  made: boolean;
}

// Extra fields are welcome — the factories are
// generic over T extends Shot, so setData() keeps
// your type.`}
            />
          </Labeled>
          <Labeled label="From the NBA Stats API">
            <CodeBlock
              lang="typescript"
              code={`// shotchartdetail rows are tenths of a foot
// from the basket, so divide by ten.
const shots: Shot[] = rows.map((r) => ({
  x: r.LOC_X / 10,
  y: r.LOC_Y / 10,
  made: r.SHOT_MADE_FLAG === 1,
}));

createShotScatter(svg, { courtType: "nba", data: shots });`}
            />
          </Labeled>
        </div>
      </Section>

      <Section
        id="shot-scatter"
        title="Individual"
        subtitle={
          <>
            <Code>createShotScatter</Code> — one mark per attempt: filled dots for makes, rings or
            X's for misses.
          </>
        }
      >
        <Demo
          controls={
            <>
              <Control label="courtType">
                <SegmentedControl
                  value={scatterType}
                  onChange={setScatterType}
                  options={COURT_OPTIONS}
                />
              </Control>
              <Control label="floor">
                <SegmentedControl
                  value={scatterFloor}
                  onChange={setScatterFloor}
                  options={FLOOR_OPTIONS}
                />
              </Control>
              <Control label="style.missedMarker">
                <SegmentedControl
                  value={scatterMarker}
                  onChange={setScatterMarker}
                  options={[
                    { value: "ring", label: "Ring" },
                    { value: "x", label: "X" },
                  ]}
                />
              </Control>
            </>
          }
        >
          <ShotScatter
            courtType={scatterType}
            data={scatterShots}
            floor={scatterFloor}
            missedMarker={scatterMarker}
          />
        </Demo>
        <p className="text-fg-muted">
          Marks are clipped to the court by default (<Code>clip: false</Code> lets heaves hang off
          the edge). Radius, colors, marker and stroke live in <Code>style</Code> and can be changed
          later with <Code>setStyle()</Code>. The demo shots are synthetic: a seeded generator
          places them relative to the selected league's arc.
        </p>
        <FrameworkTabs examples={scatterExamples} />
      </Section>

      <Section
        id="zoned-shotchart"
        title="Buckets"
        subtitle={
          <>
            <Code>createZonedShotchart</Code> — 14 court regions, each filled by percentile and
            labeled with FGM/FGA and FG%.
          </>
        }
      >
        <Demo
          controls={
            <>
              <Control label="courtType">
                <SegmentedControl
                  value={zonedType}
                  onChange={setZonedType}
                  options={COURT_OPTIONS}
                />
              </Control>
              <Control label="theme">
                <SegmentedControl
                  value={zonedTheme}
                  onChange={setZonedTheme}
                  options={THEME_OPTIONS}
                />
              </Control>
              <Control label="dataset">
                <SegmentedControl
                  value={zonedDataset}
                  onChange={setZonedDataset}
                  options={[
                    { value: "example", label: "Full (14 zones)" },
                    { value: "sparse", label: "Sparse (3 zones)" },
                  ]}
                />
              </Control>
              <Control label="floor">
                <SegmentedControl
                  value={zonedFloor}
                  onChange={setZonedFloor}
                  options={FLOOR_OPTIONS}
                />
              </Control>
            </>
          }
        >
          <ZonedShotchart
            courtType={zonedType}
            theme={zonedTheme}
            data={zonedData}
            floor={zonedFloor}
          />
        </Demo>
        <FrameworkTabs examples={zonedExamples} />

        <SubSection id="zone-data" title="ZoneData shape">
          <p className="text-fg-muted">
            Buckets take pre-aggregated totals, one entry per zone. Every entry passed to{" "}
            <Code>createZonedShotchart</Code> matches this interface.
          </p>
          <CodeBlock
            lang="typescript"
            code={`import type { ZoneData, ShotchartZone } from "shotchart.d3.ts";

interface ZoneData {
  bucket: ShotchartZone;  // one of 14 zone codes (see below)
  fgm: number;            // field goals made
  fga: number;            // field goals attempted
  percentile: number;     // 0–100; use -1 to render the zone as empty
}`}
          />
          <p className="text-fg-muted">
            The dataset toggle on the demo above swaps between two presets. The table and JSON below
            update in lockstep with the chart.
          </p>
          <ZoneDataInspector data={zonedData} />
        </SubSection>

        <SubSection id="zone-codes" title="Zone codes">
          <p className="text-fg-muted">All 14 ShotchartZone identifiers, in render order.</p>
          <ZoneCodesTable />
        </SubSection>
      </Section>

      <Section
        id="hexbin"
        title="Hexbin"
        subtitle={
          <>
            <Code>createHexbinShotchart</Code> — shots binned into hexagons: color is FG%, size is
            how often the spot is used.
          </>
        }
      >
        <Demo
          controls={
            <>
              <Control label="courtType">
                <SegmentedControl value={hexType} onChange={setHexType} options={COURT_OPTIONS} />
              </Control>
              <Control label="theme">
                <SegmentedControl value={hexTheme} onChange={setHexTheme} options={THEME_OPTIONS} />
              </Control>
              <Control label="radius (ft)">
                <SegmentedControl
                  value={hexRadius}
                  onChange={setHexRadius}
                  options={[
                    { value: "1", label: "1" },
                    { value: "1.5", label: "1.5" },
                    { value: "2", label: "2" },
                  ]}
                />
              </Control>
              <Control label="minAttempts">
                <SegmentedControl
                  value={hexMin}
                  onChange={setHexMin}
                  options={[
                    { value: "1", label: "1" },
                    { value: "3", label: "3" },
                  ]}
                />
              </Control>
              <Control label="floor">
                <SegmentedControl value={hexFloor} onChange={setHexFloor} options={FLOOR_OPTIONS} />
              </Control>
            </>
          }
        >
          <HexbinShotchart
            courtType={hexType}
            data={hexShots}
            theme={hexTheme}
            radius={Number(hexRadius)}
            floor={hexFloor}
            minAttempts={Number(hexMin)}
          />
        </Demo>
        <p className="text-fg-muted">
          Binning happens in feet, so cells mean the same thing on every court and at every pixel
          size. <Code>colorDomain</Code> (default <Code>[0.25, 0.65]</Code>) maps FG% across the
          palette; <Code>sizeScale</Code> picks sqrt / linear / none for the frequency encoding.
          Every cell also gets a faint full-radius outline so low-frequency spots keep their
          footprint (<Code>outline: false</Code> turns it off). <Code>binShots()</Code> is exported
          on its own for legends and tables, and <Code>bins()</Code> returns the live aggregation.
        </p>
        <FrameworkTabs examples={hexExamples} />
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Reference                                                          */}
      {/* ------------------------------------------------------------------ */}

      <Section id="api-reference" title="API reference" subtitle="Everything the library exports.">
        <SubHeading>Factories</SubHeading>
        <DataTable
          columns={API_COLUMNS}
          rowKey={(r) => r.name}
          rows={[
            {
              name: "createHalfcourt",
              sig: "(svg, options?) → HalfcourtInstance",
              notes: "Static half court. Options: courtType, leagueSettings, extent, floor.",
            },
            {
              name: "createFullcourt",
              sig: "(svg, options?) → FullcourtInstance",
              notes: "Both ends. Options: courtType, leagueSettings, orientation, floor.",
            },
            {
              name: "createShotScatter",
              sig: "(svg, options) → ShotScatterInstance",
              notes: "Individual shots. Instance has setData / setStyle / destroy.",
            },
            {
              name: "createZonedShotchart",
              sig: "(svg, options) → ZonedShotchartInstance",
              notes: "Buckets. Instance has setData / setTheme / setBackground / destroy.",
            },
            {
              name: "createHexbinShotchart",
              sig: "(svg, options) → HexbinShotchartInstance",
              notes: "Hexbins. Instance has setData / setTheme / setRadius / bins / destroy.",
            },
          ]}
        />

        <SubHeading>Presets & palettes</SubHeading>
        <DataTable
          columns={API_COLUMNS}
          rowKey={(r) => r.name}
          rows={[
            { name: "nbaSettings", sig: "LeagueSettings", notes: "" },
            { name: "wnbaSettings", sig: "LeagueSettings", notes: "" },
            { name: "ncaamSettings", sig: "LeagueSettings", notes: "" },
            {
              name: "ncaawSettings",
              sig: "LeagueSettings",
              notes: "Identical to ncaam since 2021-22.",
            },
            { name: "fibaSettings", sig: "LeagueSettings", notes: "" },
            { name: "nfhsSettings", sig: "LeagueSettings", notes: "" },
            {
              name: "createShotchartSettings",
              sig: "(LeagueSettings, extent?) → ShotchartSettings",
              notes: "Derived SVG-coord layout (basketCenterY, visibleCourtLength, etc).",
            },
            { name: "redGreenPalette", sig: "string[]", notes: "Default palette." },
            { name: "orangeBluePalette", sig: "string[]", notes: "Alternate palette." },
          ]}
        />

        <SubHeading>Utilities</SubHeading>
        <DataTable
          columns={API_COLUMNS}
          rowKey={(r) => r.name}
          rows={[
            {
              name: "shotToSvg",
              sig: "({ x, y }, settings) → Point",
              notes: "Basket-relative feet → SVG coordinates.",
            },
            {
              name: "svgToShot",
              sig: "(Point, settings) → { x, y }",
              notes: "Inverse of shotToSvg.",
            },
            {
              name: "binShots",
              sig: "(shots, settings, radius) → HexbinDatum[]",
              notes: "Pure hex aggregation (fga / fgm / fgPct per cell).",
            },
            {
              name: "createColorScale",
              sig: "(palette) → (percentile: number) => string",
              notes: "Build a custom percentile → color scale.",
            },
            {
              name: "zoneColor",
              sig: "(percentile, palette) → string",
              notes: "One-shot lookup against a palette.",
            },
            {
              name: "polygonCentroid",
              sig: "(points: Point[]) → [number, number]",
              notes: "Geometric centroid for placing labels.",
            },
            {
              name: "formatPercentage",
              sig: "(fgm, fga) → string",
              notes: 'Renders as e.g. "47.1%" or "0%".',
            },
          ]}
        />

        <SubHeading>Types</SubHeading>
        <DataTable
          columns={API_COLUMNS}
          rowKey={(r) => r.name}
          rows={[
            { name: "HalfcourtOptions / HalfcourtInstance", sig: "interface", notes: "" },
            { name: "FullcourtOptions / FullcourtInstance", sig: "interface", notes: "" },
            {
              name: "ShotScatterOptions / ShotScatterInstance",
              sig: "interface<T extends Shot>",
              notes: "",
            },
            {
              name: "ShotScatterStyle",
              sig: "interface",
              notes: "radius, madeColor, missedColor, missedMarker, opacity, strokeWidth.",
            },
            { name: "ZonedShotchartOptions / ZonedShotchartInstance", sig: "interface", notes: "" },
            {
              name: "HexbinShotchartOptions / HexbinShotchartInstance",
              sig: "interface<T extends Shot>",
              notes: "",
            },
            {
              name: "HexbinDatum",
              sig: "{ x, y, fga, fgm, fgPct }",
              notes: "One aggregated cell, SVG coords.",
            },
            { name: "Shot", sig: "{ x, y, made }", notes: "Feet from basket center." },
            { name: "ZoneData", sig: "interface", notes: "" },
            { name: "ShotchartZone", sig: "union", notes: "14 zone code literals." },
            {
              name: "FloorInput / FloorOptions / FloorPreset",
              sig: "union / interface",
              notes: "",
            },
            {
              name: "CourtType",
              sig: '"nba" | "wnba" | "ncaam" | "ncaaw" | "fiba" | "nfhs"',
              notes: "",
            },
            { name: "CourtExtent", sig: '"arc" | "half"', notes: "" },
            { name: "Orientation", sig: '"horizontal" | "vertical"', notes: "" },
            { name: "MissedMarker", sig: '"ring" | "x"', notes: "" },
            { name: "Theme", sig: '"red-green" | "blue-orange"', notes: "" },
            { name: "BackgroundTheme", sig: '"dark" | "light"', notes: "" },
            { name: "LeagueSettings", sig: "interface", notes: "" },
            {
              name: "ShotchartSettings",
              sig: "interface",
              notes: "Derived layout — use for coordinate overlays.",
            },
            { name: "Point", sig: "{ x: number; y: number }", notes: "" },
          ]}
        />
      </Section>

      <Section id="resources" title="Resources">
        <ul className="space-y-2">
          <li>
            <ExternalLink href="https://github.com/michaelmirandi/shotchart.d3.ts">
              GitHub
            </ExternalLink>
            <span className="text-fg-muted"> — source, issues, README</span>
          </li>
          <li>
            <ExternalLink href="https://www.npmjs.com/package/shotchart.d3.ts">npm</ExternalLink>
            <span className="text-fg-muted"> — install and versions</span>
          </li>
          <li>
            <ExternalLink href="https://github.com/michaelmirandi/shotchart.d3.ts/blob/main/README.md">
              README
            </ExternalLink>
            <span className="text-fg-muted"> — full reference</span>
          </li>
        </ul>
      </Section>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page primitives
// ---------------------------------------------------------------------------

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1.5 text-fg-muted">{subtitle}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

/** A nested section (third nav level) inside a `Section`. */
function SubSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 pt-6">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-sm font-medium">{children}</h3>;
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-fg-muted">{label}</p>
      {children}
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-line bg-canvas-subtle px-1 py-0.5 font-mono text-[12.5px]">
      {children}
    </code>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
    >
      {children}
    </a>
  );
}
