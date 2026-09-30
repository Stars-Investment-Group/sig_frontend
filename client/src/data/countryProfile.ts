import type { Country, CountryRating, MacroRegime } from "@shared/schema";
import {
  DATA_AS_OF,
  STATIC_COUNTRIES,
  STATIC_REGIMES,
  getRating,
  getStaticHistory,
} from "@/data/mockData";

/**
 * Profil pays consolidé.
 *
 * La fiche pays affichait jusqu'ici les chiffres de la Côte d'Ivoire quel que
 * soit le pays sélectionné : le sélecteur changeait le drapeau et le titre,
 * pas les données. Ce module reconstruit un profil **cohérent pour chacun des
 * 16 pays** à partir des seules sources typées (modules 1, 3, 4 et 5), afin
 * que les six onglets réagissent réellement au changement de pays.
 *
 * Tout ce qui est dérivé ici est destiné à disparaître : le backend fournira
 * ces agrégats. La forme des objets rendus est donc ce qui compte.
 */

/* =========================================================================
 * Utilitaires
 * ========================================================================= */

/** Hachage déterministe : un même pays doit produire la même série à chaque rendu. */
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const pct = (n: number) => `${round1(n).toFixed(1)}%`;

/** Dernière valeur observée d'un indicateur du catalogue. */
function latest(countryCode: string, indicatorCode: string): number | null {
  const history = getStaticHistory(countryCode, indicatorCode);
  return history.length ? history[history.length - 1].value : null;
}

/** Série complète d'un indicateur, pour les sparklines. */
function series(countryCode: string, indicatorCode: string): number[] {
  return getStaticHistory(countryCode, indicatorCode).map((o) => o.value);
}

/** Variation de la dernière observation par rapport à la précédente. */
function lastChange(countryCode: string, indicatorCode: string): number {
  const history = getStaticHistory(countryCode, indicatorCode);
  if (history.length < 2) return 0;
  return round1(history[history.length - 1].value - history[history.length - 2].value);
}

/* =========================================================================
 * Types
 * ========================================================================= */

export interface ProfileKpi {
  id: string;
  label: string;
  value: string;
  /** Variation par rapport à la période précédente, en points. */
  delta: number;
  deltaLabel: string;
  previous: string;
  spark: number[];
  polarity: "higherBetter" | "lowerBetter";
  /** `true` quand la valeur est dérivée faute d'indicateur au catalogue. */
  derived?: boolean;
}

export interface ProfileLine {
  label: string;
  value: string;
}

export interface ProfileYear {
  year: string;
  actual: number | null;
  forecast: number | null;
}

export interface ProfileForecastRow {
  indicator: string;
  a2023: number;
  a2024: number;
  f2025: number;
  f2026: number;
  f2027: number;
  spark: number[];
  polarity: "higherBetter" | "lowerBetter";
}

export interface ProfilePeer {
  code: string;
  name: string;
  growth: number;
  inflation: number;
  fiscal: number;
  score: number;
}

export interface CountryProfile {
  country: Country;
  regime: MacroRegime;
  rating: CountryRating;
  /** Repères macro, tous exprimés en % ou en points de PIB. */
  metrics: {
    growth: number;
    inflation: number;
    policyRate: number;
    unemployment: number;
    fiscalBalance: number;
    currentAccount: number;
    riskScore: number;
  };
  kpis: ProfileKpi[];
  regimeLines: ProfileLine[];
  gdpPath: ProfileYear[];
  forecastRows: ProfileForecastRow[];
  peers: ProfilePeer[];
  houseView: { stance: CountryRating["outlook"]; bullets: string[] };
  lastUpdated: Date;
}

/* =========================================================================
 * Dérivations
 * ========================================================================= */

/**
 * Solde budgétaire et compte courant ne sont pas encore au catalogue du
 * module 2. Ils sont déduits du score de risque et du niveau de revenu, ce
 * qui garantit au moins la cohérence de signe avec le reste de la fiche.
 */
function derivedFiscalBalance(regime: MacroRegime, country: Country): number {
  const base = country.incomeLevel === "High" ? 2.0 : 1.5;
  return round1(-(base + regime.riskScore / 22));
}

function derivedCurrentAccount(rating: CountryRating, country: Country): number {
  const external = rating.pillars.find((p) => p.key === "externalResilience")?.score ?? 5;
  const tilt = country.incomeLevel === "High" ? 0.6 : -0.4;
  return round1((external - 5.2) * 1.3 + tilt);
}

function growthRegimeLabel(regime: MacroRegime): string {
  switch (regime.gdpGrowthLevel) {
    case "strong":
      return "Above Potential";
    case "stable":
      return "At Potential";
    case "slow":
      return "Below Potential";
    default:
      return "Contracting";
  }
}

function inflationRegimeLabel(regime: MacroRegime, trend: number): string {
  const level =
    regime.inflationLevel === "high"
      ? "Elevated"
      : regime.inflationLevel === "moderate"
        ? "Moderate"
        : "Subdued";
  const direction = trend < -0.05 ? "easing" : trend > 0.05 ? "rising" : "stable";
  return `${level} & ${direction}`;
}

function pillarLabel(rating: CountryRating, key: string, scale: [string, string, string]): string {
  const score = rating.pillars.find((p) => p.key === key)?.score ?? 5;
  if (score >= 6.5) return scale[0];
  if (score >= 4.5) return scale[1];
  return scale[2];
}

/** Position dans le cycle, lue depuis le régime du module 4. */
function cyclePosition(regime: MacroRegime): string {
  switch (regime.regime) {
    case "Expansion":
    case "Boom":
      return "Mid-to-late expansion";
    case "Recovery":
      return "Early expansion";
    case "Goldilocks":
      return "Mid expansion";
    case "Transition":
      return "Late cycle / inflection";
    case "Stagflation":
      return "Late cycle under stress";
    default:
      return "Contraction";
  }
}

function buildHouseView(
  country: Country,
  regime: MacroRegime,
  rating: CountryRating,
  metrics: CountryProfile["metrics"]
): CountryProfile["houseView"] {
  const bullets = [
    `Régime ${regime.regime.toLowerCase()} avec un momentum ${regime.momentum.toLowerCase()} — croissance à ${pct(metrics.growth)}.`,
    `Inflation ${regime.inflationLevel === "high" ? "encore élevée" : regime.inflationLevel === "moderate" ? "modérée" : "contenue"} à ${pct(metrics.inflation)}, politique monétaire ${regime.policyStance.toLowerCase()}.`,
    `${rating.positiveDrivers[0]?.label ?? "Fondamentaux"} : ${rating.positiveDrivers[0]?.rationale ?? "principal soutien de la notation."}`,
    `Point de vigilance — ${rating.negativeDrivers[0]?.label ?? "profil de risque"} : ${rating.negativeDrivers[0]?.rationale ?? "à surveiller."}`,
  ];
  if (country.isAggregate) {
    bullets.push("Agrégat de zone : les dispersions internes ne sont pas reflétées par ces scores.");
  }
  return { stance: rating.outlook, bullets };
}

/**
 * Trajectoire annuelle de croissance, 2021 à 2027F.
 *
 * La série statique est mensuelle sur 12 mois : elle ne suffit pas à tracer un
 * historique annuel. L'ancrage se fait sur la dernière valeur connue, avec un
 * profil déterministe autour — remplacé dès que le module 3 servira des
 * périodes annuelles et le drapeau `isForecast`.
 */
function buildGdpPath(countryCode: string, growth: number): ProfileYear[] {
  const years = ["2021", "2022", "2023", "2024", "2025F", "2026F", "2027F"];
  const drift = (hash01(`${countryCode}:gdp`) - 0.5) * 1.6;
  return years.map((year, i) => {
    const isForecast = year.endsWith("F");
    const offset = (hash01(`${countryCode}:gdp:${year}`) - 0.5) * 1.4;
    const trendToNow = (i - 3) * 0.18;
    const value = round1(growth + offset + trendToNow + (isForecast ? drift * 0.5 : 0));
    return {
      year,
      actual: isForecast ? null : value,
      forecast: isForecast ? value : null,
    };
  });
}

function buildForecastRows(
  countryCode: string,
  metrics: CountryProfile["metrics"]
): ProfileForecastRow[] {
  const definitions: {
    indicator: string;
    now: number;
    polarity: "higherBetter" | "lowerBetter";
  }[] = [
    { indicator: "Real GDP Growth (%)", now: metrics.growth, polarity: "higherBetter" },
    { indicator: "Inflation, avg (%)", now: metrics.inflation, polarity: "lowerBetter" },
    { indicator: "Fiscal Balance (% GDP)", now: metrics.fiscalBalance, polarity: "higherBetter" },
    { indicator: "Current Account (% GDP)", now: metrics.currentAccount, polarity: "higherBetter" },
    { indicator: "Policy Rate (%)", now: metrics.policyRate, polarity: "lowerBetter" },
    { indicator: "Unemployment (%)", now: metrics.unemployment, polarity: "lowerBetter" },
  ];

  return definitions.map((d) => {
    const step = (key: string, weight: number) =>
      round1(d.now + (hash01(`${countryCode}:${d.indicator}:${key}`) - 0.5) * 1.1 * weight);
    const a2023 = step("2023", 1.4);
    const a2024 = step("2024", 1.0);
    const f2025 = round1(d.now);
    const f2026 = step("2026", 0.8);
    const f2027 = step("2027", 1.0);
    return {
      ...d,
      a2023,
      a2024,
      f2025,
      f2026,
      f2027,
      spark: [a2023, a2024, f2025, f2026, f2027],
    };
  });
}

/** Pairs du même bloc régional, à défaut de la même tranche de revenu. */
function buildPeers(country: Country): ProfilePeer[] {
  const sameRegion = STATIC_COUNTRIES.filter(
    (c) => c.region === country.region && c.code !== country.code
  );
  const pool = (
    sameRegion.length >= 2
      ? sameRegion
      : STATIC_COUNTRIES.filter(
          (c) => c.incomeLevel === country.incomeLevel && c.code !== country.code
        )
  ).slice(0, 5);

  return [country, ...pool].map((c) => {
    const regime = STATIC_REGIMES.find((r) => r.countryCode === c.code) ?? STATIC_REGIMES[0];
    const rating = getRating(c.code);
    return {
      code: c.code,
      name: c.name,
      growth: latest(c.code, "real_gdp_growth") ?? 0,
      inflation: latest(c.code, "cpi_inflation") ?? 0,
      fiscal: derivedFiscalBalance(regime, c),
      score: rating.compositeScore,
    };
  });
}

/* =========================================================================
 * Point d'entrée
 * ========================================================================= */

export function getCountryProfile(countryCode: string): CountryProfile {
  const country =
    STATIC_COUNTRIES.find((c) => c.code === countryCode) ?? STATIC_COUNTRIES[0];
  const regime =
    STATIC_REGIMES.find((r) => r.countryCode === country.code) ?? STATIC_REGIMES[0];
  const rating = getRating(country.code);

  const metrics = {
    growth: latest(country.code, "real_gdp_growth") ?? 0,
    inflation: latest(country.code, "cpi_inflation") ?? 0,
    policyRate: latest(country.code, "policy_rate") ?? 0,
    unemployment: latest(country.code, "unemployment_rate") ?? 0,
    fiscalBalance: derivedFiscalBalance(regime, country),
    currentAccount: derivedCurrentAccount(rating, country),
    riskScore: regime.riskScore,
  };

  const inflationTrend = lastChange(country.code, "cpi_inflation");

  const kpis: ProfileKpi[] = [
    {
      id: "growth",
      label: "Real GDP Growth",
      value: pct(metrics.growth),
      delta: lastChange(country.code, "real_gdp_growth"),
      deltaLabel: "vs période précédente",
      previous: pct(metrics.growth - lastChange(country.code, "real_gdp_growth")),
      spark: series(country.code, "real_gdp_growth"),
      polarity: "higherBetter",
    },
    {
      id: "inflation",
      label: "Inflation (CPI)",
      value: pct(metrics.inflation),
      delta: inflationTrend,
      deltaLabel: "vs période précédente",
      previous: pct(metrics.inflation - inflationTrend),
      spark: series(country.code, "cpi_inflation"),
      polarity: "lowerBetter",
    },
    {
      id: "fiscal",
      label: "Fiscal Balance (% GDP)",
      value: pct(metrics.fiscalBalance),
      delta: round1((hash01(`${country.code}:fiscal:delta`) - 0.55) * 1.2),
      deltaLabel: "vs exercice précédent",
      previous: pct(metrics.fiscalBalance - 0.3),
      spark: series(country.code, "real_gdp_growth").map((v, i) =>
        round1(metrics.fiscalBalance + (v - metrics.growth) * 0.2 + i * 0.02)
      ),
      polarity: "higherBetter",
      derived: true,
    },
    {
      id: "current",
      label: "Current Account (% GDP)",
      value: pct(metrics.currentAccount),
      delta: round1((hash01(`${country.code}:current:delta`) - 0.45) * 1.4),
      deltaLabel: "vs exercice précédent",
      previous: pct(metrics.currentAccount - 0.2),
      spark: series(country.code, "cpi_inflation").map((v, i) =>
        round1(metrics.currentAccount - (v - metrics.inflation) * 0.25 + i * 0.01)
      ),
      polarity: "higherBetter",
      derived: true,
    },
    {
      id: "rate",
      label: "Policy Rate",
      value: pct(metrics.policyRate),
      delta: lastChange(country.code, "policy_rate"),
      deltaLabel: "vs période précédente",
      previous: pct(metrics.policyRate - lastChange(country.code, "policy_rate")),
      spark: series(country.code, "policy_rate"),
      polarity: "lowerBetter",
    },
    {
      id: "risk",
      label: "Overall Risk",
      value: `${metrics.riskScore}/100`,
      delta: -round1(rating.changeSincePrior * 8),
      deltaLabel: "vs revue précédente",
      previous: `${Math.round(metrics.riskScore + rating.changeSincePrior * 8)}/100`,
      spark: series(country.code, "cpi_inflation").map((v) =>
        round1(metrics.riskScore + (v - metrics.inflation) * 2)
      ),
      polarity: "lowerBetter",
      derived: true,
    },
  ];

  const regimeLines: ProfileLine[] = [
    { label: "Regime", value: `${regime.regime} / ${regime.momentum}` },
    { label: "Growth Regime", value: growthRegimeLabel(regime) },
    { label: "Inflation Regime", value: inflationRegimeLabel(regime, inflationTrend) },
    {
      label: "External Position",
      value: pillarLabel(rating, "externalResilience", ["Comfortable", "Adequate", "Stretched"]),
    },
    {
      label: "Fiscal Stance",
      value: pillarLabel(rating, "fiscalCapacity", ["Ample space", "Limited space", "Constrained"]),
    },
    { label: "Policy Stance", value: regime.policyStance },
    { label: "Cycle Position", value: cyclePosition(regime) },
  ];

  return {
    country,
    regime,
    rating,
    metrics,
    kpis,
    regimeLines,
    gdpPath: buildGdpPath(country.code, metrics.growth),
    forecastRows: buildForecastRows(country.code, metrics),
    peers: buildPeers(country),
    houseView: buildHouseView(country, regime, rating, metrics),
    lastUpdated: country.lastUpdated ?? DATA_AS_OF,
  };
}
