/**
 * Couche service — Données macroéconomiques (mode statique).
 *
 * Phase frontend seul : toutes les données sont STATIQUES et cohérentes
 * avec la maquette, au schéma identique à la future base Neon PostgreSQL
 * `tracker_macro_portfolio` (countries / economic_indicators).
 *
 * L'intégration ultérieure avec `backend_tracker` consistera simplement à
 * brancher ces fonctions sur l'API REST — l'interface de données est déjà
 * préparée pour ce passage.
 */

/* =========================================================================
 * Types du pipeline (alignés sur le schéma Neon)
 * ========================================================================= */

export interface MacroRecord {
  id: number;
  countryCode: string;
  countryName: string;
  indicatorType: string;
  indicatorLabel: string;
  value: number;
  previousValue: number;
  change: number;
  changeDirection: "up" | "down" | "stable";
  unit: string;
  source: string;
  date: string; // ISO
}

export interface MacroCountry {
  code: string;
  name: string;
}

export interface MacroQuery {
  search?: string;
  countryCode?: string;
  indicatorType?: string;
  unit?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const INDICATOR_LABELS: Record<string, string> = {
  inflation: "Inflation Rate",
  unemployment: "Unemployment Rate",
  interestRate: "Interest Rate",
  gdpGrowth: "GDP Growth",
  consumerSpending: "Consumer Spending",
  industrialProduction: "Industrial Production",
  tradeBalance: "Trade Balance",
  retailSales: "Retail Sales",
  businessConfidence: "Business Confidence",
};

export const INDICATOR_TYPES = Object.keys(INDICATOR_LABELS);

export const SOURCES = ["FRED", "Eurostat", "IMF", "World Bank", "Trading Economics"];

export const COUNTRY_CODES: MacroCountry[] = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "EU", name: "Euro Area" },
  { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "ZA", name: "South Africa" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "SN", name: "Senegal" },
  { code: "NG", name: "Nigeria" },
];

const BASE_VALUES: Record<string, Record<string, number>> = {
  US: { inflation: 2.9, unemployment: 3.7, interestRate: 4.25, gdpGrowth: 2.3 },
  UK: { inflation: 3.1, unemployment: 4.3, interestRate: 4.75, gdpGrowth: 1.2 },
  EU: { inflation: 2.4, unemployment: 6.4, interestRate: 3.4, gdpGrowth: 1.6 },
  JP: { inflation: 1.8, unemployment: 2.5, interestRate: 0.0, gdpGrowth: 0.7 },
  CA: { inflation: 2.6, unemployment: 5.8, interestRate: 4.25, gdpGrowth: 1.4 },
  FR: { inflation: 2.3, unemployment: 7.2, interestRate: 3.4, gdpGrowth: 1.1 },
  DE: { inflation: 2.2, unemployment: 3.3, interestRate: 3.4, gdpGrowth: 0.3 },
  IT: { inflation: 1.9, unemployment: 7.6, interestRate: 3.4, gdpGrowth: 0.9 },
  ES: { inflation: 2.7, unemployment: 11.7, interestRate: 3.4, gdpGrowth: 2.0 },
  BR: { inflation: 4.1, unemployment: 7.9, interestRate: 10.5, gdpGrowth: 2.0 },
  IN: { inflation: 5.4, unemployment: 7.1, interestRate: 6.5, gdpGrowth: 6.3 },
  CN: { inflation: 0.9, unemployment: 5.2, interestRate: 3.0, gdpGrowth: 4.8 },
  ZA: { inflation: 5.1, unemployment: 32.1, interestRate: 7.75, gdpGrowth: 1.2 },
  CI: { inflation: 3.2, unemployment: 3.4, interestRate: 4.5, gdpGrowth: 5.8 },
  SN: { inflation: 4.1, unemployment: 6.2, interestRate: 4.5, gdpGrowth: 4.5 },
  NG: { inflation: 9.2, unemployment: 4.2, interestRate: 12.0, gdpGrowth: 1.8 },
};

const FALLBACK_BASE: Record<string, number> = {
  consumerSpending: 3.2,
  industrialProduction: 2.1,
  tradeBalance: -1.5,
  retailSales: 2.8,
  businessConfidence: 51,
};

function buildStaticRecords(): MacroRecord[] {
  const jobs: MacroRecord[] = [];
  let id = 1;
  const now = new Date("2026-07-31");

  for (const country of COUNTRY_CODES) {
    for (const indicator of INDICATOR_TYPES) {
      const unit =
        indicator === "tradeBalance" || indicator === "consumerSpending" ? "$B" : "%";
      const base = BASE_VALUES[country.code]?.[indicator] ?? FALLBACK_BASE[indicator] ?? 4;

      for (let m = 11; m >= 0; m--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - m);
        const wave = Math.sin((11 - m) / 2.3) * 0.25;
        const drift = (11 - m) * 0.03;
        const value = round1(base + wave - drift);
        const previousValue = round1(value + (Math.random() - 0.5) * 0.6);
        const change = round2(value - previousValue);
        const changeDirection: MacroRecord["changeDirection"] =
          change > 0.05 ? "up" : change < -0.05 ? "down" : "stable";

        jobs.push({
          id: id++,
          countryCode: country.code,
          countryName: country.name,
          indicatorType: indicator,
          indicatorLabel: INDICATOR_LABELS[indicator],
          value,
          previousValue,
          change,
          changeDirection,
          unit,
          source: SOURCES[(country.code.length + m + indicator.length) % SOURCES.length],
          date: date.toISOString().slice(0, 10),
        });
      }
    }
  }
  return jobs;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const STATIC_RECORDS: MacroRecord[] = buildStaticRecords();

export function getCountries(): MacroCountry[] {
  return COUNTRY_CODES;
}

export function getLatestIndicators(): MacroRecord[] {
  return STATIC_RECORDS;
}

export function filterMacro(records: MacroRecord[], query: MacroQuery): MacroRecord[] {
  const q = (query.search ?? "").trim().toLowerCase();

  return records.filter((r) => {
    if (
      q &&
      !r.countryName.toLowerCase().includes(q) &&
      !r.indicatorLabel.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (query.countryCode && query.countryCode !== "all" && r.countryCode !== query.countryCode) {
      return false;
    }
    if (query.indicatorType && query.indicatorType !== "all" && r.indicatorType !== query.indicatorType) {
      return false;
    }
    if (query.unit && query.unit !== "all" && r.unit !== query.unit) return false;
    if (query.dateFrom && r.date < query.dateFrom) return false;
    if (query.dateTo && r.date > query.dateTo) return false;
    return true;
  });
}

export type MacroSortKey =
  | "countryName"
  | "indicatorLabel"
  | "date"
  | "value"
  | "change"
  | "source";

export function sortMacro(
  records: MacroRecord[],
  key: MacroSortKey,
  direction: "asc" | "desc"
): MacroRecord[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return ((av as number) - (bv as number)) * dir;
  });
}
