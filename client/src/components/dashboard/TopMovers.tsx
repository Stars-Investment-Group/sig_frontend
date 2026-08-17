import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Flag } from "@/components/Flag";
import { useI18n } from "@/lib/i18n";
import { watchlist, type CountryMover } from "@/data/mockDashboard";

const statusMap: Record<CountryMover["status"], string> = {
  Improving: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Deteriorating: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Stable: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

/**
 * Range 3 — Top Movers / Watchlist (spec §01B).
 * Grille de cartes pays avec drapeau, score, variation, sparkline et statut.
 */
export function TopMovers() {
  const { t } = useI18n();

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{t("topMovers.title")}</h2>
        <button className="text-sm font-medium text-primary hover:underline">
          {t("topMovers.manage")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {watchlist.map((c) => (
          <CountryCard key={c.code} country={c} />
        ))}
      </div>
    </section>
  );
}

function CountryCard({ country: c }: { country: CountryMover }) {
  const positive = c.delta >= 0;
  const sparkColor = c.status === "Improving" ? "#22C55E" : c.status === "Deteriorating" ? "#EF4444" : "#3B82F6";

  return (
    <button className="card-surface flex flex-col p-4 text-left transition-shadow hover:shadow-md">
      {/* Drapeau + delta */}
      <div className="flex items-start justify-between">
        <Flag code={c.code} size={28} />
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            positive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          }`}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {positive ? "+" : ""}
          {c.delta}
        </span>
      </div>

      {/* Nom + score */}
      <div className="mt-2">
        <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold tabular-nums">{c.score}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">SIG Score</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-1 flex justify-center">
        <Sparkline data={c.spark} color={sparkColor} width={120} height={30} />
      </div>

      {/* Statut */}
      <span className={`mt-2 self-start rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusMap[c.status]}`}>
        {c.status}
      </span>
    </button>
  );
}
