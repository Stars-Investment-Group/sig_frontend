import type { Country, EconomicRegime, EconomicIndicator, EconomicAlert } from "@shared/schema";

/**
 * Jeu de données STATIQUES centralisé (mode frontend seul).
 *
 * Fournit des données de démonstration cohérentes avec le schéma de la future
 * base Neon PostgreSQL `tracker_macro_portfolio`. Ces données alimentent les
 * pages et composants en attendant l'intégration du backend `backend_tracker`.
 *
 * ⚠️ Phase frontend : ces valeurs sont illustratives et seront remplacées par
 * les données gouvernées réelles (pipeline ETL) une fois le backend opérationnel.
 */

/* =========================================================================
 * Pays
 * ========================================================================= */

export const STATIC_COUNTRIES: Country[] = [
  { id: 1, code: "US", name: "United States", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 2, code: "UK", name: "United Kingdom", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 3, code: "EU", name: "Euro Area", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 4, code: "JP", name: "Japan", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 5, code: "CA", name: "Canada", flagUrl: null, status: "watch", lastUpdated: new Date("2026-07-31") },
  { id: 6, code: "FR", name: "France", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 7, code: "DE", name: "Germany", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 8, code: "IT", name: "Italy", flagUrl: null, status: "watch", lastUpdated: new Date("2026-07-31") },
  { id: 9, code: "ES", name: "Spain", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 10, code: "BR", name: "Brazil", flagUrl: null, status: "watch", lastUpdated: new Date("2026-07-31") },
  { id: 11, code: "IN", name: "India", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 12, code: "CN", name: "China", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 13, code: "ZA", name: "South Africa", flagUrl: null, status: "watch", lastUpdated: new Date("2026-07-31") },
  { id: 14, code: "CI", name: "Côte d'Ivoire", flagUrl: null, status: "stable", lastUpdated: new Date("2026-07-31") },
  { id: 15, code: "SN", name: "Senegal", flagUrl: null, status: "watch", lastUpdated: new Date("2026-07-31") },
  { id: 16, code: "NG", name: "Nigeria", flagUrl: null, status: "risk", lastUpdated: new Date("2026-07-31") },
];

/* =========================================================================
 * Régimes économiques par pays
 * ========================================================================= */

export const STATIC_REGIMES: EconomicRegime[] = [
  { id: 1, countryCode: "US", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "stable", riskLevel: "low", lastUpdated: new Date("2026-07-31") },
  { id: 2, countryCode: "UK", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "slow", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 3, countryCode: "EU", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "stable", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 4, countryCode: "JP", regime: "transition", inflationLevel: "low", gdpGrowthLevel: "slow", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 5, countryCode: "CA", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "slow", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 6, countryCode: "FR", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "slow", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 7, countryCode: "DE", regime: "transition", inflationLevel: "moderate", gdpGrowthLevel: "negative", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 8, countryCode: "IT", regime: "transition", inflationLevel: "moderate", gdpGrowthLevel: "slow", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 9, countryCode: "ES", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "stable", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 10, countryCode: "BR", regime: "transition", inflationLevel: "high", gdpGrowthLevel: "stable", riskLevel: "high", lastUpdated: new Date("2026-07-31") },
  { id: 11, countryCode: "IN", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "strong", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 12, countryCode: "CN", regime: "transition", inflationLevel: "low", gdpGrowthLevel: "stable", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 13, countryCode: "ZA", regime: "recession", inflationLevel: "high", gdpGrowthLevel: "slow", riskLevel: "high", lastUpdated: new Date("2026-07-31") },
  { id: 14, countryCode: "CI", regime: "recovery", inflationLevel: "moderate", gdpGrowthLevel: "strong", riskLevel: "low", lastUpdated: new Date("2026-07-31") },
  { id: 15, countryCode: "SN", regime: "transition", inflationLevel: "moderate", gdpGrowthLevel: "stable", riskLevel: "medium", lastUpdated: new Date("2026-07-31") },
  { id: 16, countryCode: "NG", regime: "recession", inflationLevel: "high", gdpGrowthLevel: "slow", riskLevel: "high", lastUpdated: new Date("2026-07-31") },
];

/* =========================================================================
 * Indicateurs économiques (séries courtes)
 * ========================================================================= */

function buildIndicators(): EconomicIndicator[] {
  const records: EconomicIndicator[] = [];
  let id = 1;
  const now = new Date("2026-07-31");

  const base: Record<string, Record<string, number>> = {
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

  const types = ["inflation", "unemployment", "interestRate", "gdpGrowth"] as const;
  const rc = {} as Record<string, number[]>;
  for (const c of Object.keys(base)) {
    for (const t of types) {
      const b = base[c][t];
      // 12 points historiques en lente évolution
      rc[`${c}-${t}`] = Array.from({ length: 12 }, (_, i) => {
        const wave = Math.sin(i / 2.1) * 0.2;
        const drift = i * 0.02;
        return Math.round((b + wave - drift) * 10) / 10;
      });
    }
  }

  for (const c of Object.keys(base)) {
    for (const t of types) {
      const series = rc[`${c}-${t}`];
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (11 - i));
        const value = series[i];
        const previousValue = series[i - 1] ?? value;
        const change = Math.round((value - previousValue) * 100) / 100;
        records.push({
          id: id++,
          countryCode: c,
          indicatorType: t,
          value,
          previousValue,
          change,
          changeDirection: change > 0.05 ? "up" : change < -0.05 ? "down" : "stable",
          date,
          source: c === "US" ? "FRED" : c === "EU" ? "Eurostat" : "IMF",
          unit: "%",
          createdAt: date,
        });
      }
    }
  }

  return records;
}

const indicators = buildIndicators();

/** Dernière observation (une par pays et indicateur). */
export const STATIC_LATEST_INDICATORS: EconomicIndicator[] = (() => {
  const map = new Map<string, EconomicIndicator>();
  for (const ind of indicators) {
    // la série est déjà triée du plus ancien au plus récent, on garde le dernier
    map.set(`${ind.countryCode}-${ind.indicatorType}`, ind);
  }
  return Array.from(map.values());
})();

/** Historique complet pour un pays + indicateur. */
export function getStaticHistory(countryCode: string, indicatorType: string): EconomicIndicator[] {
  return indicators
    .filter((i) => i.countryCode === countryCode && i.indicatorType === indicatorType)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/* =========================================================================
 * Alertes économiques
 * ========================================================================= */

export const STATIC_ALERTS: EconomicAlert[] = [
  { id: 1, title: "Inflation en décélération", description: "Les pressions inflationnistes mondiales s'atténuent plus vite que prévu, soutenant les actifs risqués.", alertType: "positive", iconClass: "trending-up", createdAt: new Date("2026-07-30") },
  { id: 2, title: "Risque de refinancement EM", description: "Les économies émergentes font face à une pression de refinancement accrue sur la dette externe.", alertType: "warning", iconClass: "alert-triangle", createdAt: new Date("2026-07-28") },
  { id: 3, title: "Nigeria — détérioration", description: "Le régime économique du Nigeria se dégrade (risque élevé, croissance faible).", alertType: "warning", iconClass: "alert-triangle", createdAt: new Date("2026-07-25") },
  { id: 4, title: "Côte d'Ivoire — révision haussière", description: "Prévision de croissance du PIB révisée à la hausse (5.4% → 5.8%).", alertType: "positive", iconClass: "trending-up", createdAt: new Date("2026-07-22") },
  { id: 5, title: "Liquidité banques centrales", description: "Normalisation monétaire mondiale attendue, avec un assouplissement progressif des conditions financières.", alertType: "info", iconClass: "info", createdAt: new Date("2026-07-20") },
];
