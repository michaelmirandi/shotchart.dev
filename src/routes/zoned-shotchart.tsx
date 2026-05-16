import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ZonedShotchart } from "../components/ZonedShotchart";
import { exampleZoneData, sparseZoneData } from "../lib/sample-data";

export const Route = createFileRoute("/zoned-shotchart")({
  component: ZonedDemo,
});

function ZonedDemo() {
  const [courtType, setCourtType] = useState<"nba" | "college">("nba");
  const [theme, setTheme] = useState<"red-green" | "blue-orange">("red-green");
  const [backgroundTheme, setBackgroundTheme] = useState<"dark" | "light">("light");
  const [dataset, setDataset] = useState<"full" | "sparse">("full");

  const data = useMemo(() => (dataset === "full" ? exampleZoneData : sparseZoneData), [dataset]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Zoned shotchart</h1>
        <p className="text-neutral-600 mt-1">
          Court with 14 shooting zones. Cell color reflects shooting percentile, labels show
          FGM/FGA and FG%.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Control label="Court">
          <Toggle
            options={[
              ["nba", "NBA"],
              ["college", "College"],
            ]}
            value={courtType}
            onChange={setCourtType}
          />
        </Control>
        <Control label="Theme">
          <Toggle
            options={[
              ["red-green", "R/G"],
              ["blue-orange", "B/O"],
            ]}
            value={theme}
            onChange={setTheme}
          />
        </Control>
        <Control label="Background">
          <Toggle
            options={[
              ["light", "Light"],
              ["dark", "Dark"],
            ]}
            value={backgroundTheme}
            onChange={setBackgroundTheme}
          />
        </Control>
        <Control label="Dataset">
          <Toggle
            options={[
              ["full", "Full"],
              ["sparse", "Sparse"],
            ]}
            value={dataset}
            onChange={setDataset}
          />
        </Control>
      </div>

      <div
        className={`border border-neutral-200 rounded-md p-6 ${
          backgroundTheme === "dark" ? "bg-neutral-900" : "bg-white"
        }`}
      >
        <ZonedShotchart
          courtType={courtType}
          theme={theme}
          backgroundTheme={backgroundTheme}
          data={data}
        />
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-neutral-300 overflow-hidden">
      {options.map(([opt, label]) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs font-medium ${
            value === opt
              ? "bg-black text-white"
              : "bg-white text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
