import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Halfcourt } from "../components/Halfcourt";

export const Route = createFileRoute("/halfcourt")({
  component: HalfcourtDemo,
});

function HalfcourtDemo() {
  const [courtType, setCourtType] = useState<"nba" | "college">("nba");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Halfcourt</h1>
        <p className="text-neutral-600 mt-1">
          A bare court diagram. Toggle between NBA and college dimensions.
        </p>
      </header>

      <div className="flex gap-2">
        {(["nba", "college"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCourtType(value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
              courtType === value
                ? "bg-black text-white border-black"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {value === "nba" ? "NBA" : "College"}
          </button>
        ))}
      </div>

      <div className="border border-neutral-200 rounded-md p-6 bg-white">
        <Halfcourt courtType={courtType} />
      </div>
    </div>
  );
}
