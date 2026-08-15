import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiCard as KpiData } from "@/data/mockDashboard";

/**
 * KPI Card — composant système (spec §E).
 * Value, unit, period, delta, source. Ouvre l'historique au clic.
 */
export function KpiCard({ kpi }: { kpi: KpiData }) {
  const TrendIcon =
    kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    kpi.trend === "up"
      ? "text-green-600"
      : kpi.trend === "down"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <button
      type="button"
      className="card-surface text-left p-5 transition-shadow hover:shadow-md"
    >
      <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {kpi.label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="indicator-value">
          {kpi.value}
          {kpi.unit ? <span className="ml-0.5 text-base font-semibold">{kpi.unit}</span> : null}
        </span>
      </div>

      <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
        <TrendIcon className="h-3.5 w-3.5" />
        <span>{kpi.deltaLabel}</span>
      </div>

      <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        {kpi.source} · {kpi.period}
      </div>
    </button>
  );
}
