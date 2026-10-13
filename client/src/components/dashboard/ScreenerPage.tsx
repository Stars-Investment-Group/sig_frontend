import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import {
  SlidersHorizontal, Search, RotateCcw, TrendingUp, TrendingDown, Minus,
  ArrowUpDown, Download, Filter, CheckCircle2, GitCompare,
} from "lucide-react";
import { exportCsv } from "@/utils/exportCsv";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { buildScreenerRows } from "@/data/screener";
import { getCountryProfile } from "@/data/countryProfile";

/* =========================================================================
 * Screener — Filtre avancé multi-critères sur les pays.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

/**
 * Les lignes viennent de `buildScreenerRows`, comme le widget de l'accueil.
 *
 * Cette page tenait dix lignes ecrites a la main : avec les memes pays et les
 * memes intitules que l'accueil, elle en donnait d'autres chiffres, et elle
 * annoncait « 10 pays » sur un univers qui en compte vingt-quatre. Deux
 * screeners qui se contredisent valent moins qu'un seul.
 *
 * Le regime et le palier de risque, que la table affiche en pastilles, se
 * deduisent du profil : ils ne sont pas portes par `ScreenerRow`.
 */
interface ScreenRow {
  code: string;
  name: string;
  region: string;
  regime: string;
  risk: "low" | "medium" | "high";
  score: number;
  growth: number;
  inflation: number;
  fiscal: number;
  external: number;
  trend: "Improving" | "Deteriorating" | "Stable";
  spark: number[];
}

/** Trois paliers, comme les filtres de la colonne de gauche. */
function riskBand(score: number): ScreenRow["risk"] {
  if (score < 35) return "low";
  if (score < 60) return "medium";
  return "high";
}

function buildRows(): ScreenRow[] {
  return buildScreenerRows().map((row) => {
    const profile = getCountryProfile(row.code);
    return {
      code: row.code,
      name: row.country,
      region: row.region,
      regime: row.regime,
      risk: riskBand(row.riskScore),
      score: Math.round(profile.rating.compositeScore * 10),
      growth: row.growth,
      inflation: row.inflation,
      fiscal: profile.metrics.fiscalBalance,
      external: row.external,
      trend: row.trend,
      spark: row.spark,
    };
  });
}

const REGIME_FR: Record<string, string> = {
  Expansion: "Expansion",
  Recovery: "Récupération",
  Transition: "Transition",
  Recession: "Récession",
};
const REGIME_CLS: Record<string, string> = {
  Expansion: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Recovery: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Transition: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Recession: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};
const RISK_CLS: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

/** La planche P3 compare de deux à huit pays. */
const MAX_COMPARE = 8;

type NumericKey = "growth" | "inflation" | "fiscal" | "external" | "score";

const CRITERIA_LABELS: { key: NumericKey; label: string; unit: string; step: number }[] = [
  { key: "growth", label: "Croissance PIB", unit: "%", step: 1 },
  { key: "inflation", label: "Inflation", unit: "%", step: 1 },
  { key: "score", label: "Score SIG", unit: "", step: 5 },
  { key: "fiscal", label: "Solde budgétaire", unit: "% PIB", step: 1 },
  { key: "external", label: "Solde courant", unit: "% PIB", step: 1 },
];

/** Bornes arrondies vers l'exterieur, calculees sur les lignes affichees. */
function buildCriteria(rows: ScreenRow[]) {
  return CRITERIA_LABELS.map((c) => {
    const values = rows.map((r) => r[c.key]);
    const min = Math.floor(Math.min(...values) / c.step) * c.step;
    const max = Math.ceil(Math.max(...values) / c.step) * c.step;
    // Une plage nulle rendrait le curseur inutilisable.
    return { ...c, min, max: max > min ? max : min + c.step };
  });
}

export function ScreenerPage() {
  const { t } = useI18n();
  const rows = useMemo(() => buildRows(), []);
  const criteria = useMemo(() => buildCriteria(rows), [rows]);
  // Un filtre qui propose un régime absent des données ne mène qu'à une
  // table vide : on n'offre que ceux qui sont réellement présents.
  const regimes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.regime))).sort(),
    [rows]
  );
  const [query, setQuery] = useState("");
  const [regimeFilter, setRegimeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [ranges, setRanges] = useState<Record<NumericKey, [number, number]>>(() => {
    const init = {} as Record<NumericKey, [number, number]>;
    for (const c of criteria) init[c.key] = [c.min, c.max];
    return init;
  });
  // La comparaison accepte de deux à huit pays : on plafonne ici plutôt que
  // de laisser /compare en ignorer silencieusement une partie.
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<NumericKey>("score");
  const [sortDesc, setSortDesc] = useState(true);

  const toggleSelected = (code: string) =>
    setSelected((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, code]
    );

  const reset = () => {
    setSelected([]);
    setQuery("");
    setRegimeFilter("all");
    setRiskFilter("all");
    const init = {} as Record<NumericKey, [number, number]>;
    for (const c of criteria) init[c.key] = [c.min, c.max];
    setRanges(init);
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => (regimeFilter === "all" ? true : r.regime === regimeFilter))
      .filter((r) => (riskFilter === "all" ? true : r.risk === riskFilter))
      .filter((r) =>
        criteria.every((c) => {
          const v = r[c.key] as number;
          const [lo, hi] = ranges[c.key];
          return v >= lo && v <= hi;
        })
      )
      .sort((a, b) => {
        const d = (a[sortKey] as number) - (b[sortKey] as number);
        return sortDesc ? -d : d;
      });
  }, [rows, query, regimeFilter, riskFilter, ranges, sortKey, sortDesc]);

  const handleExport = () => {
    exportCsv(
      filtered.map(({ spark, ...row }) => row),
      `sig-screener-${new Date().toISOString().slice(0, 10)}`
    );
  };

  const activeFilters =
    (query ? 1 : 0) +
    (regimeFilter !== "all" ? 1 : 0) +
    (riskFilter !== "all" ? 1 : 0) +
    criteria.filter((c) => ranges[c.key][0] !== c.min || ranges[c.key][1] !== c.max).length;

  const toggleSort = (key: NumericKey) => {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> {t("page.screener.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.screener.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent">
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
          </button>
          <button
            onClick={handleExport}
            disabled={!filtered.length}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ===== Panneau de filtres ===== */}
        <Card className="card-surface lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4 text-primary" /> Critères
            </CardTitle>
            {activeFilters > 0 && (
              <Badge className="bg-primary/15 text-primary border-primary/30">{activeFilters} actif{activeFilters > 1 ? "s" : ""}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Recherche */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Recherche</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom du pays…"
                  className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Régime */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Régime</label>
              <select
                value={regimeFilter}
                onChange={(e) => setRegimeFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="all">Tous les régimes</option>
                {regimes.map((r) => (
                  <option key={r} value={r}>{REGIME_FR[r] ?? r}</option>
                ))}
              </select>
            </div>

            {/* Risque */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Niveau de risque</label>
              <div className="flex gap-1.5">
                {(["all", "low", "medium", "high"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      riskFilter === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {r === "all" ? "Tous" : r === "low" ? "Faible" : r === "medium" ? "Moyen" : "Élevé"}
                  </button>
                ))}
              </div>
            </div>

            {/* Plages numériques */}
            {criteria.map((c) => {
              const [lo, hi] = ranges[c.key];
              return (
                <div key={c.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">{c.label}</label>
                    <span className="text-xs tabular-nums text-foreground">{lo} – {hi}{c.unit && ` ${c.unit}`}</span>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="range" min={c.min} max={c.max} step={1} value={lo}
                      onChange={(e) => setRanges((p) => ({ ...p, [c.key]: [+e.target.value, Math.max(+e.target.value, p[c.key][1])] }))}
                      className="w-full accent-primary"
                      aria-label={`${c.label} minimum`}
                    />
                    <input
                      type="range" min={c.min} max={c.max} step={1} value={hi}
                      onChange={(e) => setRanges((p) => ({ ...p, [c.key]: [Math.min(p[c.key][0], +e.target.value), +e.target.value] }))}
                      className="w-full accent-primary"
                      aria-label={`${c.label} maximum`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ===== Résultats ===== */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> pays correspondant{filtered.length > 1 ? "s" : ""} aux critères
            </p>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                {selected.length === 0
                  ? `Sélectionnez 2 à ${MAX_COMPARE} pays à comparer`
                  : `${selected.length} sélectionné${selected.length > 1 ? "s" : ""}${selected.length >= MAX_COMPARE ? " — maximum atteint" : ""}`}
              </p>
              {selected.length >= 2 ? (
                <Link
                  href={`/compare?codes=${selected.join(",")}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <GitCompare className="h-3.5 w-3.5" /> Comparer
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <GitCompare className="h-3.5 w-3.5" /> Comparer
                </span>
              )}
            </div>
          </div>

          <Card className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="w-9 px-3 py-3" aria-label="Sélection" />
                    <th className="px-4 py-3 font-medium">Pays</th>
                    <th className="px-4 py-3 font-medium">Régime</th>
                    <th className="px-4 py-3 text-center font-medium">Risque</th>
                    {criteria.map((c) => (
                      <th key={c.key} className="px-4 py-3 text-right font-medium">
                        <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-foreground">
                          {c.label}
                          <ArrowUpDown className={`h-3 w-3 ${sortKey === c.key ? "text-primary" : ""}`} />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-medium">Tendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.code} className="border-b border-border/60 last:border-0 hover:bg-accent/30">
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(r.code)}
                          onChange={() => toggleSelected(r.code)}
                          disabled={!selected.includes(r.code) && selected.length >= MAX_COMPARE}
                          className="h-3.5 w-3.5 accent-primary disabled:opacity-30"
                          aria-label={`Comparer ${r.name}`}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/countries/${r.code}`}
                          className="flex items-center gap-2.5 hover:underline"
                        >
                          <Flag code={r.code} size={18} />
                          <span>
                            <span className="block font-medium text-foreground">{r.name}</span>
                            <span className="block text-xs text-muted-foreground">{r.region}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5"><Badge className={REGIME_CLS[r.regime]}>{REGIME_FR[r.regime]}</Badge></td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge className={RISK_CLS[r.risk]}>{r.risk === "low" ? "Faible" : r.risk === "medium" ? "Moyen" : "Élevé"}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{r.growth.toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{r.inflation.toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-bold tabular-nums text-foreground">{r.score}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{r.fiscal.toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{r.external.toFixed(1)}%</td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          <Sparkline data={r.spark} color={r.trend === "Improving" ? "#22C55E" : r.trend === "Deteriorating" ? "#EF4444" : "#64748B"} width={64} height={22} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 opacity-40" />
                        Aucun pays ne correspond aux critères sélectionnés.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}
