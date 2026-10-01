import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { regionSnapshots, type RegionSnapshot as Region } from "@/data/mockDashboard";
import { DATA_AS_OF } from "@/data/mockData";

/**
 * Region Snapshot — planche P1.
 *
 * La maquette montre trois colonnes et aucune ligne d'en-tete : region, etat,
 * score. Les colonnes Regime et Delta de l'ancienne version n'y figurent pas.
 *
 * Surtout, elle emploie le **vocabulaire de la legende de la carte**
 * (Favorable / Neutral / Deteriorating) et non un second jeu de termes. Deux
 * echelles differentes pour la meme notion, a deux blocs d'ecart, se
 * contrediraient a l'oeil.
 */

/** Correspondance vers les six etats de la carte des regimes. */
const STATE: Record<Region["status"], { label: string; dot: string; text: string }> = {
  Positive: { label: "Favorable", dot: "#4ADE80", text: "text-green-600 dark:text-green-400" },
  Stable: { label: "Neutral", dot: "#3B82F6", text: "text-blue-600 dark:text-blue-400" },
  Watch: { label: "Deteriorating", dot: "#F59E0B", text: "text-amber-600 dark:text-amber-500" },
  Negative: { label: "Stressed", dot: "#EF4444", text: "text-red-600 dark:text-red-400" },
};

export function RegionSnapshotTable({ activeRegion = "all" }: { activeRegion?: string }) {
  const { t } = useI18n();

  const rows =
    activeRegion === "all"
      ? regionSnapshots
      : regionSnapshots.filter((r) => r.region === activeRegion);

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-2">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{t("region.title")}</h2>
        <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          As of{" "}
          {DATA_AS_OF.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </div>

      <table className="w-full text-sm">
        {/* La maquette n'affiche pas d'en-tete ; il reste pour les lecteurs d'ecran. */}
        <thead className="sr-only">
          <tr>
            <th scope="col">{t("region.column")}</th>
            <th scope="col">{t("region.status")}</th>
            <th scope="col">{t("region.risk")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const state = STATE[r.status];
            return (
              <tr
                key={r.region}
                className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="py-3 pr-2 text-sm font-medium text-foreground">{r.region}</td>
                <td className="py-3 pr-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${state.text}`}>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: state.dot }}
                    />
                    {state.label}
                  </span>
                </td>
                <td className="py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                  {r.riskScore}
                  <span className="font-normal text-muted-foreground">/100</span>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-xs text-muted-foreground">
                Aucune région ne correspond au filtre.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="mt-3 inline-flex items-center justify-center gap-1 self-center text-xs font-medium text-muted-foreground hover:text-primary">
        View all regions
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
