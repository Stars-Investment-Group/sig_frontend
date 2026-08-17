import { TrendingUp, Tag, Landmark, Shield } from "lucide-react";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { useI18n } from "@/lib/i18n";
import type { IndicatorKpi } from "@/data/mockDashboard";

const labelKey: Record<string, string> = {
  growth: "kpi.growth",
  inflation: "kpi.inflation",
  rate: "kpi.rate",
  risk: "kpi.risk",
};

// Configuration exacte des icônes et couleurs pastel de la maquette
const iconMap = {
  growth: {
    Icon: TrendingUp,
    color: "#16A34A",       // Vert icône
    bgColor: "#E8F5E9"      // Fond cercle vert pastel
  },
  inflation: {
    Icon: Tag,
    color: "#EA580C",       // Orange icône
    bgColor: "#FFF3E0"      // Fond cercle orange pastel
  },
  rate: {
    Icon: Landmark,
    color: "#1D4ED8",       // Bleu banque icône
    bgColor: "#E8EAF6"      // Fond cercle bleu pastel
  },
  risk: {
    Icon: Shield,
    color: "#DC2626",       // Rouge bouclier icône
    bgColor: "#FFEBEE"      // Fond cercle rouge pastel
  },
};

export function KpiCard({ kpi }: { kpi: IndicatorKpi }) {
  const { t } = useI18n();
  const config = iconMap[kpi.icon] || iconMap.growth;
  const Icon = config.Icon;

  // Règle métier : Pour l'inflation et le risque, une baisse (delta < 0) est une amélioration (Vert)
  const isPositiveEffect =
    kpi.icon === "inflation" || kpi.icon === "risk"
      ? kpi.delta <= 0
      : kpi.delta >= 0;

  return (
    <div className="card-surface flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      {/* ===== 1. HEADER : Icône en cercle parfait + Titre & Sous-titre ===== */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          <Icon className="h-5 w-5 stroke-[2]" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-[13px] font-bold leading-tight text-slate-900 dark:text-foreground">
            {t(labelKey[kpi.icon] || "kpi.growth")}
          </h3>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {kpi.subtitle || kpi.period || "2025F"}
          </span>
        </div>
      </div>

      {/* ===== 2. VALEUR PRINCIPALE + BADGE DELTA ===== */}
      <div className="mt-4 flex items-baseline justify-between px-0.5">
        <div className="flex items-baseline">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {kpi.value}
          </span>
          {kpi.unit && (
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {kpi.unit}
            </span>
          )}
        </div>

        {/* Badge Delta d'évolution */}
        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            isPositiveEffect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          <span>{kpi.delta > 0 ? "▲" : "▼"}</span>
          <span>
            {kpi.delta > 0 ? `+${kpi.delta}` : kpi.delta}
            {kpi.deltaUnit ? ` ${kpi.deltaUnit}` : " pp"}
          </span>
        </div>
      </div>

      {/* ===== 3. SPARKLINE GRAPH ===== */}
      <div className="mt-3 h-9 w-full">
        <Sparkline
          data={kpi.spark}
          color={config.color}
          height={36}
          fill={true}
        />
      </div>

      {/* ===== 4. FOOTER BASELINE ===== */}
      <div className="mt-2 text-center text-[11px] font-semibold text-muted-foreground">
        vs {kpi.comparisonDate || "Apr 2025"}
      </div>
    </div>
  );
}
