import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { HouseViewCard } from "@/components/dashboard/HouseViewCard";
import { RegimeMapCard } from "@/components/dashboard/RegimeMapCard";
import { RegionSnapshotTable } from "@/components/dashboard/RegionSnapshot";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { WhatChanged } from "@/components/dashboard/WhatChanged";
import { CountryScreener } from "@/components/dashboard/CountryScreener";
import { globalKpis } from "@/data/mockDashboard";
import { useI18n } from "@/lib/i18n";

/**
 * Global Overview — Dashboard institutionnel SIG (spec §01B)
 * Structure : 4 ranges sur grille 12 colonnes, thème clair/sombre adaptatif.
 */
export default function GlobalOverview() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      {/* ===== En-tête de page ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.globalOverview")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("nav.subtitle")}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {t("downloadPdf")}
        </Button>
      </div>


      {/* ===== Range 2 — Global Regime Map + Region Snapshot ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <RegimeMapCard />
        <RegionSnapshotTable />
      </section>

      {/* ===== Range 3 — Top Movers / Watchlist ===== */}
      <TopMovers />

      {/* ===== Range 4 — What Changed + Country Screener ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <WhatChanged />
        <CountryScreener />
      </section>

      {/* Note de gouvernance */}
      <p className="pb-2 text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette. Les valeurs dynamiques seront injectées
        par le pipeline de données (source, vintage et qualité conformément à la spec §H).
      </p>
    </div>
  );
}
