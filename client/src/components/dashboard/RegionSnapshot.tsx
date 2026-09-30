import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { regionSnapshots, type RegionSnapshot as Region } from "@/data/mockDashboard";
import { DeltaBadge } from "@/components/common/DeltaBadge";

const statusMap: Record<Region["status"], { dot: string; text: string }> = {
  Positive: { dot: "#22C55E", text: "text-green-600 dark:text-green-500" },
  Stable: { dot: "#3B82F6", text: "text-blue-600 dark:text-blue-400" },
  Watch: { dot: "#F59E0B", text: "text-amber-600 dark:text-amber-500" },
  Negative: { dot: "#EF4444", text: "text-red-600 dark:text-red-400" },
};

/**
 * Table "Region Snapshot" (spec §01B)
 * Régions, régimes, puces de statut colorées, score de risque et delta.
 */
export function RegionSnapshotTable() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{t("region.title")}</h2>
        <span className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          As of Jul 2026
        </span>
      </div>

      {/* `overflow-x-auto` plutôt que `overflow-hidden` : les coins restent
          arrondis, mais le tableau devient défilable au lieu d'être rogné. */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground dark:bg-slate-800/60">
              <th className="px-2 py-2.5 font-medium">{t("region.column")}</th>
              <th className="px-2 py-2.5 font-medium">{t("region.regime")}</th>
              <th className="px-2 py-2.5 font-medium">{t("region.status")}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t("region.risk")}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t("region.delta")}</th>
            </tr>
          </thead>
          <tbody>
            {regionSnapshots.map((r) => {
              const st = statusMap[r.status];
              return (
                <tr key={r.region} className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-2 py-3 font-medium text-foreground">{r.region}</td>
                  <td className="px-2 py-3 text-muted-foreground">{r.regime}</td>
                  <td className="px-2 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.text}`}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.dot }} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right font-semibold tabular-nums">
                    {r.riskScore}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <DeltaBadge value={r.delta} polarity="lowerBetter" decimals={0} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="mt-3 inline-flex items-center justify-center gap-1 self-center text-xs font-medium text-muted-foreground hover:text-primary">
        View all regions
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

