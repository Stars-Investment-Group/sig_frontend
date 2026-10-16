import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Search, SlidersHorizontal, Minus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  INDICATOR_BLOCKS,
  INDICATOR_POLARITY,
  STATIC_COUNTRIES,
  indicatorsByBlock,
  type CatalogueEntry,
  type IndicatorBlock,
} from "@/data/mockData";
import { useIndicatorSeries, type SeriesLookup } from "@/api/indicatorSeries";
import { regimeIndex, useRegimes } from "@/api/regimes";
import { sourceAttr } from "@/api/useApiData";
import { getRegime } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Indicators — vue multi-pays du catalogue du module 2.
 *
 * La page n'exposait que quatre series — inflation, chomage, taux directeur,
 * croissance — alors que le catalogue en compte vingt-quatre. Elle s'organise
 * desormais par **bloc** : les sept familles de la matrice multi-horizons, et
 * sous chacune ses indicateurs.
 *
 * Trois defauts reparés au passage :
 *  - `REGIME_FR` et `REGIME_CLS` etaient indexes en minuscules (« recovery »)
 *    alors que la donnee est capitalisee (« Recovery ») : tous les libelles
 *    restaient en anglais et toutes les pastilles sortaient bleues, quel que
 *    soit le regime ;
 *  - une troisieme table de regions, ecrite ici a la main, rangeait l'Afrique
 *    du Sud en APAC et versait tout le reste dans EMEA. `Country.region` fait
 *    foi ;
 *  - l'unite etait « % » en dur, ce qui est faux pour un indice ou un nombre
 *    de mois d'importations.
 */

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

/** Intitule francais de chaque bloc, dans l'ordre de la planche P5. */
const BLOCK_FR: Record<IndicatorBlock, string> = {
  Growth: "Croissance",
  Inflation: "Inflation",
  External: "Extérieur",
  Fiscal: "Budget",
  "Financial Conditions": "Conditions financières",
  "Policy & Liquidity": "Politique & liquidité",
  Sentiment: "Climat",
};

/** Une couleur par bloc, pour la bande de resume et les courbes. */
const BLOCK_COLOR: Record<IndicatorBlock, string> = {
  Growth: "#22C55E",
  Inflation: "#EF4444",
  External: "#14B8A6",
  Fiscal: "#8B5CF6",
  "Financial Conditions": "#3B82F6",
  "Policy & Liquidity": "#6366F1",
  Sentiment: "#F59E0B",
};

const RISK_LABEL = {
  all: "Tous les risques",
  low: "Risque faible",
  medium: "Risque moyen",
  high: "Risque élevé",
} as const;

type RiskFilter = keyof typeof RISK_LABEL;

interface Cell {
  value: number | null;
  /** Variation sur un mois, dans l'unite de l'indicateur. */
  delta: number;
  /** Sens **oriente** : « up » signifie favorable, pas « en hausse ». */
  tone: "up" | "down" | "flat";
}

/** Derniere valeur et variation mensuelle, orientees par la polarite. */
function cellOf(
  series: SeriesLookup,
  countryCode: string,
  indicator: CatalogueEntry
): Cell {
  const history = series(countryCode, indicator.code);
  if (history.length === 0) return { value: null, delta: 0, tone: "flat" };
  const last = history[history.length - 1].value;
  const previous = history[history.length - 2]?.value ?? last;
  const change = last - previous;
  const favorable =
    INDICATOR_POLARITY[indicator.code] === "lowerBetter" ? -change : change;
  return {
    value: last,
    delta: change,
    tone: favorable > 0.05 ? "up" : favorable < -0.05 ? "down" : "flat",
  };
}

const format = (value: number | null, unit: string) =>
  value === null ? "—" : `${value.toFixed(1)}${unit}`;

export function IndicatorsPage() {
  const { t } = useI18n();
  const [block, setBlock] = useState<IndicatorBlock>("Growth");
  const [activeCode, setActiveCode] = useState<string>("real_gdp_growth");
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const indicators = useMemo(() => indicatorsByBlock(block), [block]);

  // Une requete par indicateur du bloc ouvert, pas une par pays : la route
  // `?indicator=` rend les vingt-quatre pays d'un coup.
  const codes = useMemo(() => indicators.map((i) => i.code), [indicators]);
  const series = useIndicatorSeries(codes);
  const regimes = useRegimes();
  const parCode = useMemo(() => regimeIndex(regimes.data), [regimes.data]);
  const active =
    indicators.find((i) => i.code === activeCode) ?? indicators[0] ?? null;

  /** Les regions reelles du contrat, pas une table inventee sur place. */
  const regions = useMemo(
    () => Array.from(new Set(STATIC_COUNTRIES.map((c) => c.region))).sort(),
    []
  );

  const rows = useMemo(() => {
    return STATIC_COUNTRIES.map((country) => {
      // `getRegime` leve sur un pays sans regime : c'est voulu, mais ici la
      // liste vient de `STATIC_COUNTRIES`, donc le repli est toujours defini.
      const regime = parCode.get(country.code) ?? getRegime(country.code);
      const cells = new Map<string, Cell>();
      for (const indicator of indicators) {
        cells.set(indicator.code, cellOf(series.data, country.code, indicator));
      }
      return {
        code: country.code,
        name: country.name,
        region: country.region,
        regime: regime.regime,
        risk: regime.riskLevel,
        cells,
      };
    })
      .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => (riskFilter === "all" ? true : r.risk === riskFilter))
      .filter((r) => (regionFilter === "all" ? true : r.region === regionFilter))
      .sort((a, b) => {
        if (!active) return a.name.localeCompare(b.name);
        return (b.cells.get(active.code)?.value ?? 0) - (a.cells.get(active.code)?.value ?? 0);
      });
  }, [indicators, active, query, riskFilter, regionFilter, series.data, parCode]);

  // Statistiques de la bande de resume, sur l'indicateur selectionne.
  const values = active
    ? rows.map((r) => r.cells.get(active.code)?.value).filter((v): v is number => v !== null && v !== undefined)
    : [];
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const hi = values.length ? Math.max(...values) : 0;
  const lo = values.length ? Math.min(...values) : 0;
  const up = active ? rows.filter((r) => r.cells.get(active.code)?.tone === "up").length : 0;
  const down = active ? rows.filter((r) => r.cells.get(active.code)?.tone === "down").length : 0;

  const color = BLOCK_COLOR[block];
  // Au-dela de cinq colonnes d'indicateurs, la table deborderait.
  const showTrajectory = indicators.length <= 5;

  const selectBlock = (next: IndicatorBlock) => {
    setBlock(next);
    // L'indicateur actif doit appartenir au bloc affiche.
    setActiveCode(indicatorsByBlock(next)[0]?.code ?? "");
  };

  return (
    <div className="space-y-6" {...sourceAttr(series.fromApi)}>
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> {t("page.indicators.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("page.indicators.subtitle")}</p>
        </div>
        <Badge variant="outline" className="border-border text-muted-foreground">
          Catalogue du module 2 · 24 indicateurs
        </Badge>
      </div>

      {/* ===== Blocs ===== */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Familles d'indicateurs">
        {INDICATOR_BLOCKS.map((b) => {
          const isActive = b === block;
          return (
            <button
              key={b}
              onClick={() => selectBlock(b)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-transparent bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {BLOCK_FR[b]}
              <span className="ml-1.5 font-normal opacity-70">
                {indicatorsByBlock(b).length}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ===== Résumé de l'indicateur sélectionné ===== */}
      {active && (
        <Card className="card-surface overflow-hidden">
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
          />
          <CardContent className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Moyenne · {active.shortName}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                {avg.toFixed(1)}
                <span className="text-base font-medium text-muted-foreground">{active.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Maximum</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                {hi.toFixed(1)}
                <span className="text-base font-medium text-muted-foreground">{active.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Minimum</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                {lo.toFixed(1)}
                <span className="text-base font-medium text-muted-foreground">{active.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Mouvement sur un mois
              </p>
              {/* Oriente : « amélioration » et non « hausse ». Une inflation qui
                  monte n'est pas une bonne nouvelle. */}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                  {up} en amélioration
                </Badge>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                  {down} en dégradation
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Sélecteur d'indicateur dans le bloc ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {indicators.map((indicator) => {
          const isActive = active?.code === indicator.code;
          return (
            <button
              key={indicator.code}
              onClick={() => setActiveCode(indicator.code)}
              aria-pressed={isActive}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: color,
                    boxShadow: isActive ? `0 0 0 4px ${color}22` : "none",
                  }}
                />
                {isActive && (
                  <span className="text-[10px] font-semibold uppercase text-primary">actif</span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{indicator.shortName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {indicator.family === "leading"
                  ? "Avancé"
                  : indicator.family === "coincident"
                    ? "Coïncident"
                    : "Retardé"}{" "}
                · {indicator.frequency === "Monthly" ? "mensuel" : "trimestriel"}
              </p>
            </button>
          );
        })}
      </div>

      {/* ===== Filtres ===== */}
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
          onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          {(Object.keys(RISK_LABEL) as RiskFilter[]).map((key) => (
            <option key={key} value={key}>
              {RISK_LABEL[key]}
            </option>
          ))}
        </select>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="all">Toutes les régions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <p className="ml-auto text-xs text-muted-foreground">
          {rows.length} pays · {indicators.length} indicateur
          {indicators.length > 1 ? "s" : ""} du bloc {BLOCK_FR[block].toLowerCase()}
        </p>
      </div>

      {/* ===== Tableau ===== */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Pays</th>
                <th className="px-4 py-3 text-center font-medium">Régime</th>
                {indicators.map((indicator) => (
                  <th key={indicator.code} className="px-3 py-3 text-right font-medium">
                    <button
                      onClick={() => setActiveCode(indicator.code)}
                      className={cn(
                        "hover:text-foreground",
                        indicator.code === active?.code && "text-foreground"
                      )}
                      title={indicator.name}
                    >
                      {indicator.shortName}
                    </button>
                  </th>
                ))}
                {showTrajectory && (
                  <th className="px-4 py-3 text-right font-medium">Trajectoire</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/countries/${r.code}`}
                      className="flex items-center gap-2.5 hover:underline"
                    >
                      <Flag code={r.code} size={18} />
                      <span>
                        <span className="block font-medium text-foreground">{r.name}</span>
                        <span className="block text-[11px] text-muted-foreground">{r.region}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge className={REGIME_CLS[r.regime]}>
                      {REGIME_FR[r.regime] ?? r.regime}
                    </Badge>
                  </td>
                  {indicators.map((indicator) => {
                    const cell = r.cells.get(indicator.code);
                    const strong = indicator.code === active?.code;
                    return (
                      <td
                        key={indicator.code}
                        className={cn(
                          "whitespace-nowrap px-3 py-2.5 text-right tabular-nums",
                          strong ? "font-bold text-foreground" : "text-foreground"
                        )}
                      >
                        {format(cell?.value ?? null, indicator.unit)}
                        <span
                          className={cn(
                            "ml-1.5 inline-flex items-center gap-0.5 text-xs",
                            cell?.tone === "up"
                              ? "text-green-600 dark:text-green-400"
                              : cell?.tone === "down"
                                ? "text-red-600 dark:text-red-400"
                                : "text-muted-foreground"
                          )}
                        >
                          {cell?.tone === "up" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : cell?.tone === "down" ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {Math.abs(cell?.delta ?? 0).toFixed(1)}
                        </span>
                      </td>
                    );
                  })}
                  {showTrajectory && (
                    <td className="px-4 py-2">
                      <div className="flex justify-end">
                        {active && (
                          <Sparkline
                            data={series.data(r.code, active.code).map((h) => h.value)}
                            color={r.cells.get(active.code)?.tone === "down" ? "#EF4444" : color}
                            width={84}
                            height={28}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={indicators.length + (showTrajectory ? 3 : 2)}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucun pays ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        La flèche indique le sens <strong className="font-medium">favorable</strong>, pas le sens
        de la variation : une inflation qui recule monte en vert.
      </p>
    </div>
  );
}
