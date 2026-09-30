import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Search, SlidersHorizontal, Minus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { STATIC_COUNTRIES, STATIC_REGIMES, getStaticHistory, STATIC_LATEST_INDICATORS } from "@/data/mockData";
import type { MacroObservation } from "@shared/schema";
import { useI18n } from "@/lib/i18n";

/* =========================================================================
 * Indicators — Vue synthétique multi-pays des indicateurs macroéconomiques.
 * Exploite les données statiques mockData (en attente du backend gouverné).
 * ========================================================================= */

const INDICATOR_TYPES = ["cpi_inflation", "unemployment_rate", "policy_rate", "real_gdp_growth"] as const;
type IndicatorKey = (typeof INDICATOR_TYPES)[number];

const IND_META: Record<IndicatorKey, { label: string; unit: string; color: string; icon: string; decode: string }> = {
  cpi_inflation: { label: "Inflation (CPI)", unit: "% YoY", color: "#EF4444", icon: "infl", decode: "en hausse · désinflation en cours" },
  unemployment_rate: { label: "Chômage", unit: "%", color: "#F59E0B", icon: "unempl", decode: "marché du travail" },
  policy_rate: { label: "Taux directeur", unit: "%", color: "#3B82F6", icon: "rate", decode: "politique monétaire" },
  real_gdp_growth: { label: "Croissance PIB", unit: "% YoY", color: "#22C55E", icon: "gdp", decode: "activité réelle" },
};

interface CountryRow {
  code: string;
  name: string;
  regime: string;
  regimeLabel: string;
  risk: "low" | "medium" | "high";
  values: Record<IndicatorKey, number>;
  deltas: Record<IndicatorKey, number>;
  dirs: Record<IndicatorKey, string>;
}

const REGIME_FR: Record<string, string> = {
  recovery: "Récupération",
  transition: "Transition",
  recession: "Récession",
  overheating: "Surchauffe",
};

const REGIME_CLS: Record<string, string> = {
  recovery: "bg-green-500/15 text-green-300 border-green-500/30",
  transition: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  recession: "bg-red-500/15 text-red-300 border-red-500/30",
  overheating: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

function regimeOf(code: string) {
  return STATIC_REGIMES.find((r) => r.countryCode === code);
}

export function IndicatorsPage() {
  const { t } = useI18n();
  const latest = STATIC_LATEST_INDICATORS as MacroObservation[];
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>("real_gdp_growth");
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const best = useMemo(() => (c: string) => {
    const reg = regimeOf(c);
    return { risk: (reg?.riskLevel ?? "medium") as "low" | "medium" | "high", regime: reg?.regime ?? "Transition" };
  }, []);

  const rows: CountryRow[] = useMemo(() => {
    return latest
      .map((ind) => ind.countryCode)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .map((code) => {
        const country = STATIC_COUNTRIES.find((x) => x.code === code);
        const values = {} as Record<IndicatorKey, number>;
        const deltas = {} as Record<IndicatorKey, number>;
        const dirs = {} as Record<IndicatorKey, string>;
        for (const t of INDICATOR_TYPES) {
          const rec = latest.find((x) => x.countryCode === code && x.indicatorCode === t);
          values[t] = rec?.value ?? 0;
          deltas[t] = rec?.change ?? 0;
          dirs[t] = rec?.changeDirection ?? "stable";
        }
        const { risk, regime } = best(code);
        return {
          code,
          name: country?.name ?? code,
          regime,
          regimeLabel: REGIME_FR[regime] ?? regime,
          risk,
          values,
          deltas,
          dirs,
        };
      })
      .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => (riskFilter === "all" ? true : r.risk === riskFilter))
      .filter((r) =>
        regionFilter === "all"
          ? true
          : regionOf(r.code) === regionFilter
      )
      .sort((a, b) => b.values[activeIndicator] - a.values[activeIndicator]);
  }, [latest, query, riskFilter, regionFilter, activeIndicator, best]);

  const active = IND_META[activeIndicator];
  const raw = rows.map((r) => r.values[activeIndicator]);
  const avg = raw.length ? raw.reduce((a, b) => a + b, 0) / raw.length : 0;
  const hi = raw.length ? Math.max(...raw) : 0;
  const lo = raw.length ? Math.min(...raw) : 0;
  const upCount = rows.filter((r) => r.dirs[activeIndicator] === "up").length;
  const downCount = rows.filter((r) => r.dirs[activeIndicator] === "down").length;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> {t("page.indicators.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.indicators.subtitle")}
          </p>
        </div>
        <Badge variant="outline" className="border-border text-muted-foreground">
          Actualisé : 31/07/2026 · Data pipeline (démo)
        </Badge>
      </div>

      {/* ===== Résumé indicateur sélectionné ===== */}
      <Card className="card-surface overflow-hidden">
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${active.color}66, ${active.color})` }}
        />
        <CardContent className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Moyenne {active.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
              {avg.toFixed(1)}
              <span className="text-base font-medium text-muted-foreground">{active.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Maximum</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{hi.toFixed(1)}<span className="text-base font-medium text-muted-foreground">{active.unit}</span></p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Minimum</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{lo.toFixed(1)}<span className="text-base font-medium text-muted-foreground">{active.unit}</span></p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Mouvement (m/m)</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="bg-green-500/15 text-green-300 border-green-500/30">{upCount} hausse</Badge>
              <Badge className="bg-red-500/15 text-red-300 border-red-500/30">{downCount} baisse</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Sélecteur d'indicateurs ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INDICATOR_TYPES.map((t) => {
          const m = IND_META[t];
          const isActive = t === activeIndicator;
          return (
            <button
              key={t}
              onClick={() => setActiveIndicator(t)}
              className={`group rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40 hover:bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: m.color, boxShadow: isActive ? `0 0 0 4px ${m.color}22` : "none" }}
                />
                {isActive && <span className="text-[10px] font-semibold uppercase text-primary">actif</span>}
              </div>
              <p className="mt-3 font-semibold text-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.decode}</p>
            </button>
          );
        })}
      </div>

      {/* ===== Filtres + tableau ===== */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un pays…"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="all">Tous les risques</option>
          <option value="low">Risque faible</option>
          <option value="medium">Risque moyen</option>
          <option value="high">Risque élevé</option>
        </select>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="all">Toutes les régions</option>
          <option value="Americas">Amériques</option>
          <option value="EMEA">EMEA</option>
          <option value="APAC">APAC</option>
        </select>
      </div>

      {/* ===== Tableau ===== */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Pays</th>
                <th className="px-4 py-3 text-center font-medium">Régime</th>
                {INDICATOR_TYPES.map((t) => (
                  <th key={t} className="px-4 py-3 text-right font-medium">
                    <button
                      onClick={() => setActiveIndicator(t)}
                      className={`inline-flex items-center gap-1 hover:text-foreground ${t === activeIndicator ? "text-foreground" : ""}`}
                    >
                      {IND_META[t].label}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">Trajectoire</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hist = getStaticHistory(r.code, activeIndicator).map((h) => h.value);
                const hColor = r.dirs[activeIndicator] === "up"
                  ? IND_META[activeIndicator].color
                  : r.dirs[activeIndicator] === "down"
                  ? "#6366F1"
                  : "#64748B";
                return (
                  <tr key={r.code} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Flag code={r.code} size={18} />
                        <span className="font-medium text-foreground">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge className={REGIME_CLS[r.regime]}>{r.regimeLabel}</Badge>
                    </td>
                    {INDICATOR_TYPES.map((t) => {
                      const strong = t === activeIndicator;
                      const d = r.deltas[t];
                      const dir = r.dirs[t];
                      return (
                        <td key={t} className={`px-4 py-2.5 text-right tabular-nums ${strong ? "font-bold text-foreground" : "text-foreground"}`}>
                          {r.values[t].toFixed(1)}%
                          <span className={`ml-1.5 inline-flex items-center gap-0.5 text-xs ${
                            dir === "up" ? "text-green-500 dark:text-green-400" : dir === "down" ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
                          }`}>
                            {dir === "up" ? <ArrowUpRight className="h-3 w-3" /> : dir === "down" ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {Math.abs(d).toFixed(1)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2">
                      <div className="flex justify-end">
                        <Sparkline data={hist.length >= 2 ? hist : [r.values[activeIndicator]]} color={hColor} width={84} height={28} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucun pays ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}

function regionOf(code: string): string {
  const americas = ["USA", "CAN", "BRA"];
  const apac = ["JPN", "IND", "CHN", "ZAF"];
  if (americas.includes(code)) return "Americas";
  if (apac.includes(code)) return "APAC";
  return "EMEA";
}
