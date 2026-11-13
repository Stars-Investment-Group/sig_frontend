import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  /**
   * Chemin de base du site.
   *
   * GitHub Pages sert le depot sous `/<nom-du-depot>/`, pas a la racine : sans
   * cela, toutes les ressources seraient demandees a `/assets/...` et la page
   * resterait blanche. `VITE_BASE_PATH` est pose par le workflow de
   * deploiement ; en developpement et pour OVH, la racine convient.
   */
  base: process.env.VITE_BASE_PATH ?? "/",
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
  /**
   * Les fichiers d'environnement sont lus a la **racine du depot**, pas dans
   * `client/`.
   *
   * Par defaut Vite les cherche dans `root`, donc ici dans `client/`. Or
   * `.env.example` vit a la racine et dit de le copier en `.env.local` : suivi
   * a la lettre, le fichier n'etait jamais lu, `VITE_USE_API` restait indefini
   * et l'application servait ses mocks **sans le moindre signal**. En
   * pre-production cela livrerait un site sur donnees fictives que rien ne
   * distingue d'un site branche. Verifie le 2026-11-13 : les quatorze pages
   * annonçaient `data-source="mock"` avec un `.env.local` present a la racine.
   */
  envDir: import.meta.dirname,
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

