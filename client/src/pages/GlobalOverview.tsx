import { useState } from "react";
import { CalendarDays, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { HouseViewCard } from "@/components/dashboard/HouseViewCard";
import { RegimeMapCard } from "@/components/dashboard/RegimeMapCard";
import { RegionSnapshotTable } from "@/components/dashboard/RegionSnapshot";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { WhatChanged } from "@/components/dashboard/WhatChanged";
import { CountryScreener } from "@/components/dashboard/CountryScreener";
import { RegionalRegimeMatrix } from "@/components/dashboard/RegionalRegimeMatrix";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { globalKpis, regionSnapshots } from "@/data/mockDashboard";
import { DATA_AS_OF } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";

/**
 * Global Overview — planche P1 des maquettes.
 *
 * L'ordre des rangees suit la planche : House View et KPI, carte et regions,
 * Top Movers, What Changed, matrice et evenements, screener, puis le triptyque
 * alertes / confiance / mode d'emploi.
 */

/** Fenetre de donnees affichee dans l'en-tete, derivee de la date d'arrete. */
function dataWindowLabel(): string {
  const end = DATA_AS_OF;
  const start = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
}

export default function GlobalOverview() {
  const { t } = useI18n();
  const [region, setRegion] = useState("all");

  const regions = ["all", ...regionSnapshots.map((r) => r.region)];

  return (
    <div className="space-y-8">
      {/* ===== En-tete de page ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.globalOverview")}</h1>
          <p className="text-sm text-muted-foreground">{t("nav.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre regional : pilote le screener et la table regionale */}
          <div className="relative">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Filtrer par region"
              className="appearance-none rounded-md border border-border bg-card py-2 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "Toutes les régions" : r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Fenetre de donnees. Elle deviendra selectionnable quand le module 3
              servira de la profondeur d'historique ; aujourd'hui le jeu statique
              n'a qu'un arrete, afficher un selecteur actif serait mentir. */}
          <span
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
            title="Fenêtre du jeu de données. Sélectionnable une fois l'historique servi par le backend."
          >
            <CalendarDays className="h-4 w-4" />
            {dataWindowLabel()}
          </span>

          <Button className="gap-2">
            <Download className="h-4 w-4" />
            {t("downloadPdf")}
          </Button>
        </div>
      </div>

      {/* ===== Rangee 1 — House View + bande de KPI ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <HouseViewCard />
        <div className="lg:col-span-3">
          <KpiStrip kpis={globalKpis} />
        </div>
      </section>

      {/* ===== Rangee 2 — Carte des regimes + Vue regionale ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <RegimeMapCard />
        <RegionSnapshotTable activeRegion={region} />
      </section>

      {/* ===== Rangee 3 — Top Movers / Watchlist ===== */}
      <TopMovers />

      {/* ===== Rangee 4 — What Changed ===== */}
      <WhatChanged />

      {/* ===== Rangee 5 — Matrice regionale + Evenements a venir ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <RegionalRegimeMatrix />
        <UpcomingEvents />
      </section>

      {/* ===== Rangee 6 — Country Screener ===== */}
      <CountryScreener activeRegion={region} />

      {/* ===== Rangee 7 — Alertes, confiance, mode d'emploi ===== */}
      <DashboardFooter />

      <p className="pb-2 text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette. Les valeurs dynamiques seront injectées par le
        pipeline de données (source, millésime et qualité conformément à la spec §H).
      </p>
    </div>
  );
}
