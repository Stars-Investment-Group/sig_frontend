import { Sparkline } from "@/components/dashboard/Sparkline";
import { useI18n } from "@/lib/i18n";
import type { IndicatorKpi } from "@/data/mockDashboard";
import { cn } from "@/lib/utils";

/**
 * Bande des 4 KPI mondiaux — planche P1.
 *
 * La maquette ne montre pas quatre cartes distinctes mais **une seule carte
 * decoupee en quatre colonnes** par des filets verticaux. C'est ce qui donne a
 * la rangee sa lecture d'ensemble : les quatre chiffres se comparent, ils ne
 * sont pas quatre blocs independants. Les pastilles d'icones colorees de
 * l'ancienne version n'y figurent pas non plus.
 */

const LABEL_KEY: Record<IndicatorKpi["icon"], string> = {
  growth: "kpi.growth",
  inflation: "kpi.inflation",
  rate: "kpi.rate",
  risk: "kpi.risk",
};

/** Couleur de la sparkline, alignee sur le sens de lecture de l'indicateur. */
const SPARK_COLOR: Record<IndicatorKpi["icon"], string> = {
  growth: "#16A34A",
  inflation: "#EA580C",
  rate: "#2563EB",
  risk: "#DC2626",
};

/** Une hausse est favorable pour la croissance, defavorable ailleurs. */
function isFavorable(kpi: IndicatorKpi): boolean {
  return kpi.icon === "inflation" || kpi.icon === "risk" ? kpi.delta <= 0 : kpi.delta >= 0;
}

export function KpiStrip({ kpis }: { kpis: IndicatorKpi[] }) {
  const { t } = useI18n();

  return (
    <div className="card-surface grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
      {kpis.map((kpi) => {
        const favorable = isFavorable(kpi);
        const label = t(LABEL_KEY[kpi.icon]);
        return (
          <div key={kpi.id} className="flex flex-col p-4">
            <p className="text-[11px] font-semibold leading-tight text-muted-foreground">
              {label === LABEL_KEY[kpi.icon] ? kpi.label : label}
              {kpi.qualifier && <span className="font-medium"> ({kpi.qualifier})</span>}
            </p>

            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-[26px] font-bold leading-none tracking-tight text-foreground">
                {kpi.value}
                {kpi.unit}
              </span>
              {kpi.valueSuffix && (
                <span className="text-xs font-medium text-muted-foreground">{kpi.valueSuffix}</span>
              )}
            </p>

            <p className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <span
                className={cn(
                  "font-bold",
                  Math.abs(kpi.delta) < 0.001
                    ? "text-muted-foreground"
                    : favorable
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-red-600 dark:text-red-400"
                )}
              >
                {Math.abs(kpi.delta) < 0.001 ? "—" : kpi.delta > 0 ? "▲" : "▼"}{" "}
                {Math.abs(kpi.delta) < 0.001
                  ? ""
                  : `${kpi.delta > 0 ? "+" : ""}${kpi.delta}${kpi.deltaUnit ?? "pp"}`}
              </span>
              <span className="text-muted-foreground">vs {kpi.comparisonDate ?? "Apr 2025"}</span>
            </p>

            <div className="mt-3">
              <Sparkline
                data={kpi.spark}
                color={SPARK_COLOR[kpi.icon]}
                width={180}
                height={38}
                className="w-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
