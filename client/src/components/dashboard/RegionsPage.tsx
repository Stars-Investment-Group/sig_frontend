import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";
import {
  regionBlocks,
  countryWatchRows,
  type RegionFilter,
  type BlockRegime,
} from "@/data/mockDashboard";
import { useI18n } from "@/lib/i18n";

const regimeBadge: Record<BlockRegime, string> = {
  recovery: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  transition: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  fragile: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const riskBadge = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const statusBadge = {
  stable: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  watch: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  risk: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const regimeLabel: Record<BlockRegime, string> = {
  recovery: "Récupération",
  transition: "Transition",
  fragile: "Fragile",
};

const riskLabel = { low: "Faible", medium: "Moyen", high: "Élevé" };
const statusLabel = { stable: "Stable", watch: "Surveillé", risk: "Risque" };

const filters: { value: RegionFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "uemoa", label: "UEMOA" },
  { value: "africa", label: "Afrique" },
  { value: "emea", label: "EMEA" },
  { value: "americas", label: "Amériques" },
  { value: "apac", label: "APAC" },
];

function scoreBar(value: number) {
  const color = value >= 60 ? "bg-green-500" : value >= 45 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

/**
 * Onglet Regions — vision synthétique par blocs macroéconomiques (cartes)
 * + tableau détaillé des pays surveillés avec filtres de catégorie.
 */
export function RegionsPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<RegionFilter>("all");

  const rows = useMemo(
    () => (filter === "all" ? countryWatchRows : countryWatchRows.filter((r) => r.region === filter)),
    [filter]
  );

  return (
    <div className="space-y-6">
      {/* ===== En-tête + contrôles ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.regions.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("page.regions.subtitle")}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Global Macro
        </Button>
      </div>

      {/* ===== Section supérieure : cartes régionales ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {regionBlocks.map((b) => (
          <div key={b.id} className="card-surface flex flex-col p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{b.name}</h3>
              <span className="text-xs text-muted-foreground">{b.count} pays</span>
            </div>

            <span className={`mb-3 self-start rounded px-2 py-0.5 text-[11px] font-semibold ${regimeBadge[b.regime]}`}>
              {regimeLabel[b.regime]}
            </span>

            <div className="space-y-2.5">
              <ScoreRow label={t("regions.growth")} value={b.growth} />
              <ScoreRow label={t("regions.inflation")} value={b.inflation} />
              <ScoreRow label={t("regions.fiscal")} value={b.fiscal} />
              <ScoreRow label={t("regions.risk")} value={b.risk} />
            </div>

            <p className="mt-3 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
              {b.event}
            </p>
          </div>
        ))}
      </section>

      {/* ===== Section inférieure : tableau des pays surveillés ===== */}
      <section className="card-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            {t("regions.countriesTitle")} ({countryWatchRows.length})
          </h2>

          {/* Filtres */}
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">{t("regions.col.country")}</th>
                <th className="px-3 py-2.5 font-medium">{t("regions.col.code")}</th>
                <th className="px-3 py-2.5 font-medium">{t("regions.col.region")}</th>
                <th className="px-3 py-2.5 font-medium">{t("regions.col.regime")}</th>
                <th className="px-3 py-2.5 font-medium">{t("regions.col.risk")}</th>
                <th className="px-3 py-2.5 font-medium">{t("regions.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2.5">
                    <span className="mr-2 inline-flex align-middle">
                      <Flag code={r.code} size={18} />
                    </span>
                    <span className="font-medium text-foreground">{r.name}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{r.code}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{regionLabel(r.region)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${regimeBadge[r.regime]}`}>
                      {regimeLabel[r.regime]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${riskBadge[r.risk]}`}>
                      {riskLabel[r.risk]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${statusBadge[r.status]}`}>
                      {statusLabel[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{value}</span>
      </div>
      {scoreBar(value)}
    </div>
  );
}

function regionLabel(region: RegionFilter) {
  switch (region) {
    case "uemoa": return "UEMOA";
    case "emea": return "EMEA";
    case "americas": return "Amériques";
    case "apac": return "APAC";
    default: return "Afrique";
  }
}
