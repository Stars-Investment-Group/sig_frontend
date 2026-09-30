import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import {
  SlidersHorizontal, Search, RotateCcw, TrendingUp, TrendingDown, Minus,
  ArrowUpDown, Download, Filter, CheckCircle2,
} from "lucide-react";
import { exportCsv } from "@/utils/exportCsv";
import { useI18n } from "@/lib/i18n";

/* =========================================================================
 * Screener — Filtre avancé multi-critères sur les pays.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

interface ScreenRow {
  code: string;
  name: string;
  region: string;
  regime: "Recovery" | "Transition" | "Expansion" | "Stress";
  risk: "low" | "medium" | "high";
  score: number;
  growth: number;
  inflation: number;
  fiscal: number;
  external: number;
  trend: "Improving" | "Deteriorating" | "Stable";
  spark: number[];
}

const DATA: ScreenRow[] = [
  { code: "CIV", name: "Côte d'Ivoire", region: "UEMOA", regime: "Recovery", risk: "low", score: 72, growth: 5.8, inflation: 3.2, fiscal: -3.1, external: 1.4, trend: "Improving", spark: [52, 55, 58, 62, 65, 68, 72] },
  { code: "SEN", name: "Senegal", region: "UEMOA", regime: "Transition", risk: "medium", score: 63, growth: 4.5, inflation: 4.1, fiscal: -1.8, external: -0.8, trend: "Deteriorating", spark: [74, 72, 70, 68, 66, 64, 63] },
  { code: "USA", name: "États-Unis", region: "Amériques", regime: "Expansion", risk: "low", score: 78, growth: 2.3, inflation: 2.9, fiscal: -6.2, external: -3.0, trend: "Stable", spark: [75, 76, 76, 77, 77, 78, 78] },
  { code: "EMU", name: "Zone euro", region: "EMEA", regime: "Recovery", risk: "medium", score: 66, growth: 1.6, inflation: 2.4, fiscal: -3.0, external: 1.5, trend: "Improving", spark: [58, 60, 61, 63, 64, 65, 66] },
  { code: "GBR", name: "Royaume-Uni", region: "EMEA", regime: "Recovery", risk: "medium", score: 61, growth: 1.2, inflation: 3.1, fiscal: -4.4, external: -2.1, trend: "Stable", spark: [62, 62, 61, 62, 61, 61, 61] },
  { code: "NGA", name: "Nigeria", region: "Afrique", regime: "Stress", risk: "high", score: 38, growth: 1.8, inflation: 9.2, fiscal: -3.8, external: -3.1, trend: "Deteriorating", spark: [46, 44, 43, 42, 40, 39, 38] },
  { code: "IND", name: "Inde", region: "APAC", regime: "Recovery", risk: "medium", score: 70, growth: 6.3, inflation: 5.4, fiscal: -5.6, external: -1.2, trend: "Improving", spark: [60, 62, 64, 66, 67, 69, 70] },
  { code: "JPN", name: "Japon", region: "APAC", regime: "Transition", risk: "medium", score: 59, growth: 0.7, inflation: 1.8, fiscal: -5.0, external: 3.2, trend: "Stable", spark: [59, 59, 58, 59, 59, 59, 59] },
  { code: "BRA", name: "Brésil", region: "Amériques", regime: "Transition", risk: "high", score: 48, growth: 2.0, inflation: 4.1, fiscal: -7.0, external: -2.5, trend: "Deteriorating", spark: [55, 53, 52, 50, 49, 48, 48] },
  { code: "CHN", name: "Chine", region: "APAC", regime: "Transition", risk: "medium", score: 57, growth: 4.8, inflation: 0.9, fiscal: -3.5, external: 1.8, trend: "Stable", spark: [58, 58, 57, 57, 57, 57, 57] },
];

const REGIME_FR: Record<string, string> = {
  Recovery: "Récupération", Transition: "Transition", Expansion: "Expansion", Stress: "Stress",
};
const REGIME_CLS: Record<string, string> = {
  Recovery: "bg-green-500/15 text-green-300 border-green-500/30",
  Transition: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Expansion: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Stress: "bg-red-500/15 text-red-300 border-red-500/30",
};
const RISK_CLS: Record<string, string> = {
  low: "bg-green-500/15 text-green-300 border-green-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-red-500/15 text-red-300 border-red-500/30",
};

type NumericKey = "growth" | "inflation" | "fiscal" | "external" | "score";

const CRITERIA: { key: NumericKey; label: string; unit: string; min: number; max: number }[] = [
  { key: "growth", label: "Croissance PIB", unit: "%", min: -1, max: 8 },
  { key: "inflation", label: "Inflation", unit: "%", min: 0, max: 10 },
  { key: "score", label: "Score SIG", unit: "", min: 0, max: 100 },
  { key: "fiscal", label: "Solde budgétaire", unit: "% PIB", min: -8, max: 2 },
  { key: "external", label: "Solde courant", unit: "% PIB", min: -5, max: 4 },
];

export function ScreenerPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [regimeFilter, setRegimeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [ranges, setRanges] = useState<Record<NumericKey, [number, number]>>(() => {
    const init = {} as Record<NumericKey, [number, number]>;
    for (const c of CRITERIA) init[c.key] = [c.min, c.max];
    return init;
  });
  const [sortKey, setSortKey] = useState<NumericKey>("score");
  const [sortDesc, setSortDesc] = useState(true);

  const reset = () => {
    setQuery("");
    setRegimeFilter("all");
    setRiskFilter("all");
    const init = {} as Record<NumericKey, [number, number]>;
    for (const c of CRITERIA) init[c.key] = [c.min, c.max];
    setRanges(init);
  };

  const filtered = useMemo(() => {
    return DATA.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => (regimeFilter === "all" ? true : r.regime === regimeFilter))
      .filter((r) => (riskFilter === "all" ? true : r.risk === riskFilter))
      .filter((r) =>
        CRITERIA.every((c) => {
          const v = r[c.key] as number;
          const [lo, hi] = ranges[c.key];
          return v >= lo && v <= hi;
        })
      )
      .sort((a, b) => {
        const d = (a[sortKey] as number) - (b[sortKey] as number);
        return sortDesc ? -d : d;
      });
  }, [query, regimeFilter, riskFilter, ranges, sortKey, sortDesc]);

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
    CRITERIA.filter((c) => ranges[c.key][0] !== c.min || ranges[c.key][1] !== c.max).length;

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
                {Object.keys(REGIME_FR).map((r) => (
                  <option key={r} value={r}>{REGIME_FR[r]}</option>
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
            {CRITERIA.map((c) => {
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> pays correspondant{filtered.length > 1 ? "s" : ""} aux critères
            </p>
          </div>

          <Card className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Pays</th>
                    <th className="px-4 py-3 font-medium">Régime</th>
                    <th className="px-4 py-3 text-center font-medium">Risque</th>
                    {CRITERIA.map((c) => (
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
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Flag code={r.code} size={18} />
                          <div>
                            <p className="font-medium text-foreground">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.region}</p>
                          </div>
                        </div>
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
