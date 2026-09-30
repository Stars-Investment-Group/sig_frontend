import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    /**
     * Découpage manuel des chunks (performance / cache navigateur).
     * Les grosses librairies sont isolées : un seul chargement initial,
     * rechargement partiel à la prochaine visite (cache HTTP long).
     */
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          chart: ["chart.js", "react-chartjs-2"],
          "ui-core": [
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
            "class-variance-authority",
            "lucide-react",
          ],
          data: ["@tanstack/react-query", "date-fns"],
          // Projection et topologie : charges a la demande par la carte des
          // regimes, donc isoles pour ne pas alourdir le premier rendu.
          geo: ["d3-geo", "topojson-client"],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

