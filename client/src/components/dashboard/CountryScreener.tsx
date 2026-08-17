import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";
import { useI18n } from "@/lib/i18n";
import { screenerRows, type ScreenerRow } from "@/data/mockDashboard";

const riskBadge: Record<ScreenerRow["risk"], string> = {
  Low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const trendMap: Record<ScreenerRow["trend"], { icon: typeof ArrowUpRight; cls: string }> = {
  Improving: { icon: ArrowUpRight, cls: "text-green-600 dark:text-green-500" },
  Stable: { icon: Minus, cls: "text-blue-600 dark:text-blue-400" },
  Deteriorating: { icon: ArrowDownRight, cls: "text-red-600 dark:text-red-400" },
};

/**
 * Range 4 (droite) — Country Screener (spec §01B).
 * Tableau interactif : pays, régimes, risque, croissance, inflation, solde extérieur, tendance.
 */
export function CountryScreener() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{t("screener.title")}</h2>
        <Button variant="outline" size="sm">{t("screener.open")}</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">Country</th>
              <th className="px-3 py-2.5 font-medium">Regime</th>
              <th className="px-3 py-2.5 font-medium">Risk</th>
              <th className="px-3 py-2.5 text-right font-medium">Growth</th>
              <th className="px-3 py-2.5 text-right font-medium">Inflation</th>
              <th className="px-3 py-2.5 text-right font-medium">Ext. Bal.</th>
              <th className="px-3 py-2.5 text-center font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {screenerRows.map((r) => {
              const tr = trendMap[r.trend];
              const TrendIcon = tr.icon;
              return (
                <tr key={r.country} className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-3">
                    <span className="mr-1.5 inline-flex align-middle">
                      <Flag code={r.code} size={18} />
                    </span>
                    <span className="font-medium text-foreground">{r.country}</span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{r.regime}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${riskBadge[r.risk]}`}>
                      {r.risk}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums text-foreground">
                    {r.growth > 0 ? "+" : ""}
                    {r.growth.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {r.inflation.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {r.external > 0 ? "+" : ""}
                    {r.external.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tr.cls}`}>
                      <TrendIcon className="h-3.5 w-3.5" />
                      {r.trend}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

