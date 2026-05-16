import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Basketball shotcharts you can drop into any frontend
        </h1>
        <p className="text-lg text-neutral-700 max-w-2xl">
          Framework-agnostic primitives built on D3 — NBA and college court dimensions, zoned
          shotcharts with per-zone shooting percentages, themable color scales.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            to="/zoned-shotchart"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-neutral-800"
          >
            Live demo →
          </Link>
          <a
            href="https://www.npmjs.com/package/shotchart.d3.ts"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium hover:bg-neutral-50"
          >
            View on npm
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Install</h2>
        <pre className="bg-neutral-900 text-neutral-100 rounded-md p-4 text-sm overflow-x-auto">
          <code>{"pnpm add shotchart.d3.ts"}</code>
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Usage</h2>
        <pre className="bg-neutral-900 text-neutral-100 rounded-md p-4 text-sm overflow-x-auto">
          <code>{`import { createZonedShotchart } from "shotchart.d3.ts";
import "shotchart.d3.ts/styles.css";

const chart = createZonedShotchart(svgEl, {
  courtType: "nba",
  theme: "red-green",
  data: zoneData,
});

chart.setData(newData);
chart.destroy();`}</code>
        </pre>
      </section>
    </div>
  );
}
