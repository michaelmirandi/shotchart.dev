import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    // Required when consuming the linked local library via `pnpm link`.
    // Without this, Vite's dep pre-bundling caches the linked dist and
    // misses HMR updates that come through the symlink.
    exclude: ["shotchart.d3.ts"],
  },
});
