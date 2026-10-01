import { getCountryProfile } from "@/data/countryProfile";
import { STATIC_COUNTRIES, getStaticHistory } from "@/data/mockData";
import type { CountryRating } from "@shared/schema";

/**
 * Lignes du Country Screener.
 *
 * Derivees des profils pays plutot qu'ecrites a la main : le screener suit
 * ainsi le jeu de donnees sans entretien, il ne peut plus contredire la fiche
 * pays vers laquelle il pointe, et il passera a 208 lignes sans rien changer
 * ici le jour ou le module 1 les servira.
 */

export interface ScreenerRow {
  /** Rang par score composite, 1 = meilleur. */
  rank: number;
  country: string;
  code: string;
  region: string;
  income: string;
  regime: string;
  /** Croissance projetee, en %. */
  growth: number;
  inflation: number;
  /** Balance externe, en points de PIB. */
  external: number;
  /** Score de risque 0-100 : une valeur basse est favorable. */
  riskScore: number;
  outlook: CountryRating["outlook"];
  trend: "Improving" | "Stable" | "Deteriorating";
  /** Serie courte pour la colonne Tendance. */
  spark: number[];
}

/** Le momentum du module 4 donne directement la tendance affichee. */
const TREND_BY_MOMENTUM = {
  Improving: "Improving",
  Stable: "Stable",
  Deteriorating: "Deteriorating",
} as const;

export function buildScreenerRows(): ScreenerRow[] {
  const rows = STATIC_COUNTRIES.map((country) => {
    const profile = getCountryProfile(country.code);
    return {
      rank: 0, // renseigne apres tri
      country: country.name,
      code: country.code,
      region: country.region,
      income: country.incomeLevel ?? "n/d",
      regime: profile.regime.regime,
      growth: profile.metrics.growth,
      inflation: profile.metrics.inflation,
      external: profile.metrics.currentAccount,
      riskScore: profile.metrics.riskScore,
      outlook: profile.rating.outlook,
      trend: TREND_BY_MOMENTUM[profile.regime.momentum],
      spark: getStaticHistory(country.code, "real_gdp_growth").slice(-6).map((o) => o.value),
      compositeScore: profile.rating.compositeScore,
    };
  });

  // Le rang suit le score composite, comme la colonne Rank de la maquette.
  rows.sort((a, b) => b.compositeScore - a.compositeScore);
  return rows.map(({ compositeScore: _composite, ...row }, index) => ({
    ...row,
    rank: index + 1,
  }));
}
