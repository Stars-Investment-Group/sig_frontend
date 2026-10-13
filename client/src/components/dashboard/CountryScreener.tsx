import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Download, Minus, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { OutlookBadge } from "@/components/country/shared";
import { useI18n } from "@/lib/i18n";
import { buildScreenerRows, type ScreenerRow } from "@/data/screener";
import { exportCsv } from "@/utils/exportCsv";
import { cn } from "@/lib/utils";

/**
 * Country Screener — planche P1.
 *
 * Trois ecarts a l'ancienne version, tous voulus par la maquette : les filtres
 * (region, revenu, regime, recherche), les colonnes manquantes (rang, region,
 * revenu, score de risque, outlook, etoile de suivi) et surtout la
 * **pagination** — le perimetre de la beta est de 208 pays, une table sans
 * pagination y serait inutilisable.
 *
 * Les lignes sont derivees des profils pays, pas d'une liste ecrite a la main :
 * elles suivent donc automatiquement le jeu de donnees, et le screener ne peut
 * plus contredire la fiche pays qu'il pointe.
 */

const PAGE_SIZE = 13;

const TREND_STYLE: Record<ScreenerRow["trend"], { Icon: typeof ArrowUpRight; cls: string }> = {
  Improving: { Icon: ArrowUpRight, cls: "text-green-600 dark:text-green-500" },
  Stable: { Icon: Minus, cls: "text-blue-600 dark:text-blue-400" },
  Deteriorating: { Icon: ArrowDownRight, cls: "text-red-600 dark:text-red-400" },
};

const RISK_TONE = (score: number) =>
  score <= 40
    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
    : score <= 60
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

export function CountryScreener({ activeRegion = "all" }: { activeRegion?: string }) {
  const { t } = useI18n();
  const allRows = useMemo(() => buildScreenerRows(), []);

  const [income, setIncome] = useState("all");
  const [regime, setRegime] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [watched, setWatched] = useState<Set<string>>(new Set());

  const incomes = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.income))).sort(),
    [allRows]
  );
  const regimes = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.regime))).sort(),
    [allRows]
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allRows.filter(
      (r) =>
        (activeRegion === "all" || r.region === activeRegion) &&
        (income === "all" || r.income === income) &&
        (regime === "all" || r.regime === regime) &&
        (!needle || r.country.toLowerCase().includes(needle))
    );
  }, [allRows, activeRegion, income, regime, query]);

  // Un filtre qui raccourcit la liste ne doit pas laisser une page vide affichee.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const resetPage = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPage(0);
  };

  const toggleWatch = (code: string) =>
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const handleExport = () =>
    exportCsv(
      rows.map((r) => ({
        Rang: r.rank,
        Pays: r.country,
        Code: r.code,
        Region: r.region,
        Revenu: r.income,
        "Croissance 2026F (%)": r.growth,
        "Inflation 2026F (%)": r.inflation,
        "Balance externe (% PIB)": r.external,
        "Score de risque (/100)": r.riskScore,
        Outlook: r.outlook,
        Tendance: r.trend,
      })),
      "sig-screener"
    );

  const selectClass =
    "rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="card-surface flex flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{t("screener.title")}</h2>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filtres de la maquette. Le filtre regional vit dans l'en-tete de page. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={income}
          onChange={(e) => resetPage(setIncome)(e.target.value)}
          aria-label="Filtrer par niveau de revenu"
          className={selectClass}
        >
          <option value="all">Tous les revenus</option>
          {incomes.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <select
          value={regime}
          onChange={(e) => resetPage(setRegime)(e.target.value)}
          aria-label="Filtrer par régime"
          className={selectClass}
        >
          <option value="all">Tous les régimes</option>
          {regimes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
            placeholder="Rechercher un pays…"
            aria-label="Rechercher un pays"
            className="w-44 rounded-md border border-border bg-card py-1.5 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2.5 font-medium">Rang</th>
              <th className="px-2 py-2.5 font-medium">Pays</th>
              <th className="px-2 py-2.5 font-medium">Région</th>
              <th className="px-2 py-2.5 font-medium">Revenu</th>
              <th className="px-2 py-2.5 text-right font-medium">Croissance</th>
              <th className="px-2 py-2.5 text-right font-medium">Inflation</th>
              <th className="px-2 py-2.5 text-right font-medium">Bal. ext.</th>
              <th className="px-2 py-2.5 text-right font-medium">Risque</th>
              <th className="px-2 py-2.5 font-medium">Outlook</th>
              <th className="px-2 py-2.5 text-center font-medium">Tendance</th>
              <th className="px-2 py-2.5 text-center font-medium">Suivi</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const trend = TREND_STYLE[r.trend];
              const isWatched = watched.has(r.code);
              return (
                <tr
                  key={r.code}
                  className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-2 py-2.5 text-xs tabular-nums text-muted-foreground">{r.rank}</td>
                  <td className="px-2 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <Flag code={r.code} size={16} />
                      <span className="text-xs font-medium text-foreground">{r.country}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-xs text-muted-foreground">{r.region}</td>
                  <td className="px-2 py-2.5 text-xs text-muted-foreground">{r.income}</td>
                  <td className="px-2 py-2.5 text-right text-xs font-medium tabular-nums text-foreground">
                    {r.growth > 0 ? "+" : ""}
                    {r.growth.toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                    {r.inflation.toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                    {r.external > 0 ? "+" : ""}
                    {r.external.toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums", RISK_TONE(r.riskScore))}>
                      {r.riskScore}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <OutlookBadge outlook={r.outlook} />
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={cn("flex items-center justify-center gap-1 text-[11px] font-medium", trend.cls)}>
                      <trend.Icon className="h-3.5 w-3.5" />
                      <Sparkline data={r.spark} width={44} height={16} fill={false} />
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => toggleWatch(r.code)}
                      aria-label={`${isWatched ? "Retirer" : "Ajouter"} ${r.country} de la liste de suivi`}
                      aria-pressed={isWatched}
                      className="rounded p-1 transition-colors hover:bg-accent"
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          isWatched ? "fill-amber-400 text-amber-500" : "text-muted-foreground"
                        )}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-xs text-muted-foreground">
                  Aucun pays ne correspond aux filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination : indispensable des que l'univers passe a 208 pays. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {rows.length === 0
            ? "Aucun pays"
            : `Affichage ${current * PAGE_SIZE + 1} à ${current * PAGE_SIZE + visible.length} sur ${rows.length} pays`}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            aria-label="Page précédente"
            className="rounded border border-border p-1 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {Array.from({ length: pageCount }, (_, i) => i).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === current ? "page" : undefined}
              className={cn(
                "min-w-[26px] rounded border px-1.5 py-0.5 text-xs transition-colors",
                i === current
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={current >= pageCount - 1}
            aria-label="Page suivante"
            className="rounded border border-border p-1 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
