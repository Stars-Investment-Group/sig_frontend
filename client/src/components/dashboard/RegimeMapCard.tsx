import { useI18n } from "@/lib/i18n";
import { riskLegend } from "@/data/mockDashboard";

/**
 * Carte globale des régimes (spec §01B).
 * Carte vectorielle / interactive placeholder + légende des risques.
 */
export function RegimeMapCard() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {t("regimeMap.title")}
        </h2>
        {/* Indicateur (i) — drill-down */}
        <button
          className="group relative flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-xs text-muted-foreground hover:border-primary hover:text-primary"
          aria-label={`Drill-down ${riskLegend.length} niveaux de risque`}
          title="Cliquer pour ouvrir le drill-down"
        >
          i
        </button>
      </div>

      {/* Carte interactive placeholder */}
      <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl">🌍</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Interactive regime map
            </p>
            <p className="text-xs text-muted-foreground/70">
              UEMOA · Afrique · benchmarks globaux
            </p>
          </div>
        </div>
      </div>

      {/* Légende des risques */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {riskLegend.map((item) => (
          <div key={item.level} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.hex }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

