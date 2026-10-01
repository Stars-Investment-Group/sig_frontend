import type {
  Theme,
  ThemeSignal,
  ThemeSignalSeverity,
  ThemeSnapshot,
} from "@shared/schema";
import { getCountryProfile } from "@/data/countryProfile";
import { STATIC_COUNTRIES, STATIC_INDICATORS, getStaticHistory } from "@/data/mockData";

/**
 * Module 11 — Themes.
 *
 * Les huit themes de base sont ceux du document de specification
 * (`Tracker Section Theme Explore SIG.pdf`). Deux partis pris :
 *
 * 1. Le **perimetre pays** est resolu depuis `STATIC_COUNTRIES`, pas saisi en
 *    dur : « UEMOA », « Tous » ou « International » deviennent des predicats.
 *    Les compteurs suivront donc le jeu de donnees jusqu'aux 208 pays.
 * 2. Les **signaux sont calcules** sur les series et les regimes existants, pas
 *    rediges. Un signal invente afficherait une alerte que rien ne justifie, et
 *    c'est precisement ce qu'un operateur viendrait verifier ici.
 *
 * Le catalogue ne compte pour l'instant que quatre indicateurs : chaque theme
 * distingue donc ceux qu'il peut reellement montrer de ceux que la spec prevoit
 * (`plannedIndicators`), plutot que d'annoncer une couverture inexistante.
 */

type CountryScope = "all" | "uemoa" | "uemoa_africa" | "international";

interface ThemeSeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  scope: CountryScope;
  /** Indicateurs du catalogue effectivement rattachables au theme. */
  indicatorCodes: string[];
  /** Indicateurs prevus par la spec mais absents du catalogue module 2. */
  plannedIndicators: string[];
  /**
   * Le theme suit-il le cycle macro ? Seuls ceux-la remontent une bascule de
   * regime. Sans ce filtre, le meme signal generique apparaissait sur les huit
   * themes, ce qui donnait a lire huit alertes la ou il n'y en avait qu'une.
   */
  tracksRegime?: boolean;
}

/** Les 8 themes de base de la specification, dans l'ordre d'affichage. */
const SEEDS: ThemeSeed[] = [
  {
    code: "inflation_prices",
    name: "Inflation & Prices",
    description: "Suivi de l'inflation et des prix",
    icon: "flame",
    color: "#EF4444",
    scope: "uemoa_africa",
    indicatorCodes: ["cpi_inflation"],
    plannedIndicators: ["Inflation sous-jacente", "Prix alimentaires", "Prix énergétiques"],
  },
  {
    code: "monetary_policy",
    name: "Monetary Policy",
    description: "Orientation des banques centrales et conditions monétaires",
    icon: "landmark",
    color: "#2563EB",
    scope: "uemoa",
    indicatorCodes: ["policy_rate"],
    plannedIndicators: ["Taux interbancaires", "Masse monétaire M2"],
    tracksRegime: true,
  },
  {
    code: "sovereign_risk",
    name: "Sovereign Risk",
    description: "Soutenabilité de la dette et prime de risque souverain",
    icon: "shield-alert",
    color: "#DC2626",
    scope: "all",
    indicatorCodes: [],
    plannedIndicators: ["Dette / PIB", "Notation souveraine", "Spreads"],
    tracksRegime: true,
  },
  {
    code: "external_trade",
    name: "External Trade",
    description: "Échanges extérieurs et balance commerciale",
    icon: "ship",
    color: "#0891B2",
    scope: "all",
    indicatorCodes: [],
    plannedIndicators: ["Exportations", "Importations", "Balance commerciale"],
  },
  {
    code: "commodities",
    name: "Commodities",
    description: "Matières premières agricoles, minières et énergétiques",
    icon: "wheat",
    color: "#D97706",
    scope: "international",
    indicatorCodes: [],
    plannedIndicators: ["Cacao", "Café", "Coton", "Pétrole", "Or"],
  },
  {
    code: "business_climate",
    name: "Business Climate",
    description: "Environnement des affaires, gouvernance et capital humain",
    icon: "building-2",
    color: "#7C3AED",
    scope: "all",
    indicatorCodes: ["unemployment_rate"],
    plannedIndicators: ["Business environment", "Gouvernance", "Capital humain"],
  },
  {
    code: "political_stability",
    name: "Political Stability",
    description: "Cycle électoral, gouvernance et risque politique",
    icon: "scale",
    color: "#64748B",
    scope: "all",
    indicatorCodes: [],
    plannedIndicators: ["Élections", "Gouvernance", "Risque politique"],
  },
  {
    code: "growth_activity",
    name: "Growth & Activity",
    description: "Croissance, production et demande intérieure",
    icon: "trending-up",
    color: "#059669",
    scope: "all",
    indicatorCodes: ["real_gdp_growth"],
    plannedIndicators: ["Production industrielle", "Consommation", "Investissement"],
    tracksRegime: true,
  },
];

/** Resout le perimetre pays d'un theme sur le jeu de donnees courant. */
function countriesInScope(scope: CountryScope): string[] {
  switch (scope) {
    case "uemoa":
      return STATIC_COUNTRIES.filter((c) => c.region === "UEMOA").map((c) => c.code);
    case "uemoa_africa":
      return STATIC_COUNTRIES.filter(
        (c) => c.region === "UEMOA" || c.region === "Africa"
      ).map((c) => c.code);
    case "international":
      // Les matieres premieres se suivent sur les economies exportatrices.
      return STATIC_COUNTRIES.filter((c) => !c.isAggregate).map((c) => c.code);
    default:
      return STATIC_COUNTRIES.map((c) => c.code);
  }
}

/* =========================================================================
 * Signaux calcules
 * ========================================================================= */

/** Seuils de declenchement par indicateur, en unite de l'indicateur. */
const THRESHOLDS: Record<string, { max: number; label: string }> = {
  cpi_inflation: { max: 6, label: "Inflation" },
  policy_rate: { max: 8, label: "Taux directeur" },
  unemployment_rate: { max: 12, label: "Chômage" },
};

function severityFor(value: number, threshold: number): ThemeSignalSeverity {
  const excess = value / threshold;
  if (excess >= 1.6) return "critical";
  if (excess >= 1.3) return "high";
  if (excess >= 1.1) return "medium";
  return "low";
}

/**
 * Construit les signaux d'un theme depuis les donnees reelles :
 * depassement de seuil sur ses indicateurs, et bascule de regime sur ses pays.
 */
function buildSignals(seed: ThemeSeed, codes: string[]): ThemeSignal[] {
  const signals: ThemeSignal[] = [];

  for (const indicatorCode of seed.indicatorCodes) {
    const threshold = THRESHOLDS[indicatorCode];
    if (!threshold) continue;

    for (const code of codes) {
      const history = getStaticHistory(code, indicatorCode);
      const latest = history[history.length - 1];
      if (!latest || latest.value <= threshold.max) continue;

      const country = STATIC_COUNTRIES.find((c) => c.code === code);
      signals.push({
        id: `${seed.code}-${code}-${indicatorCode}`,
        themeCode: seed.code,
        signalType: "threshold_breach",
        severity: severityFor(latest.value, threshold.max),
        countryCode: code,
        countryName: country?.name ?? code,
        message: `${threshold.label} à ${latest.value.toFixed(1)}% — au-dessus du seuil de ${threshold.max}%`,
        triggeredAt: latest.releaseDate,
        isActive: true,
      });
    }
  }

  // Bascule de regime : reservee aux themes qui suivent le cycle macro.
  for (const code of seed.tracksRegime ? codes : []) {
    const profile = getCountryProfile(code);
    if (profile.regime.momentum !== "Deteriorating") continue;
    signals.push({
      id: `${seed.code}-${code}-regime`,
      themeCode: seed.code,
      signalType: "regime_shift",
      severity: profile.metrics.riskScore >= 65 ? "high" : "medium",
      countryCode: code,
      countryName: profile.country.name,
      message: `Régime ${profile.regime.regime.toLowerCase()} en dégradation — risque ${profile.metrics.riskScore}/100`,
      triggeredAt: profile.lastUpdated.toISOString(),
      isActive: true,
    });
  }

  return signals.sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));
}

/**
 * Note un indicateur sur 100, 100 etant la situation la plus favorable.
 *
 * Chaque serie a sa propre lecture : une inflation de 2% est saine, un taux de
 * croissance de 2% est moyen. La table dit, par indicateur, la valeur ideale et
 * l'amplitude au-dela de laquelle le score tombe a zero.
 */
const SCORING: Record<string, { ideal: number; span: number }> = {
  cpi_inflation: { ideal: 2, span: 8 },
  policy_rate: { ideal: 3, span: 10 },
  unemployment_rate: { ideal: 4, span: 20 },
  real_gdp_growth: { ideal: 6, span: 8 },
};

function scoreOf(indicatorCode: string, value: number): number {
  const rule = SCORING[indicatorCode];
  if (!rule) return 50;
  const distance = Math.abs(value - rule.ideal) / rule.span;
  return Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
}

/** Solde des pays dont l'indicateur evolue favorablement sur trois periodes. */
function trendOf(countryCodes: string[], indicatorCode: string): number {
  let net = 0;
  for (const code of countryCodes) {
    const history = getStaticHistory(code, indicatorCode);
    if (history.length < 4) continue;
    const latest = history[history.length - 1].value;
    const prior = history[history.length - 4].value;
    const improving =
      scoreOf(indicatorCode, latest) > scoreOf(indicatorCode, prior) + 1
        ? 1
        : scoreOf(indicatorCode, latest) < scoreOf(indicatorCode, prior) - 1
          ? -1
          : 0;
    net += improving;
  }
  return net;
}

/* =========================================================================
 * Construction
 * ========================================================================= */

export interface ThemeDetail extends Omit<ThemeSnapshot, "averageScore"> {
  /** `null` tant qu'aucun indicateur du theme n'est au catalogue. */
  averageScore: number | null;
  /** Pays du perimetre, codes alpha-3. */
  countryCodes: string[];
  /** Indicateurs du catalogue rattaches au theme. */
  indicators: { code: string; name: string; unit: string }[];
  /** Indicateurs prevus par la spec, pas encore au catalogue. */
  plannedIndicators: string[];
  signals: ThemeSignal[];
}

function buildTheme(seed: ThemeSeed, order: number): ThemeDetail {
  const countryCodes = countriesInScope(seed.scope);
  const signals = buildSignals(seed, countryCodes);

  const indicatorCodes = seed.indicatorCodes;

  /**
   * Score du theme, 0-100.
   *
   * Il se calcule sur **les indicateurs du theme**, pas sur le score composite
   * des pays du perimetre : ce dernier ne depend pas du sujet, et six themes
   * partageant le meme perimetre affichaient donc le meme chiffre. Un theme
   * sans indicateur au catalogue n'a pas de score — `null` plutot qu'un nombre
   * qui ne voudrait rien dire.
   */
  const averageScore = indicatorCodes.length
    ? Math.round(
        indicatorCodes.reduce((sum, indicatorCode) => {
          const values = countryCodes
            .map((c) => getStaticHistory(c, indicatorCode).at(-1)?.value)
            .filter((v): v is number => v !== undefined);
          if (!values.length) return sum;
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          return sum + scoreOf(indicatorCode, mean);
        }, 0) / indicatorCodes.length
      )
    : null;

  // La tendance suit le sens des indicateurs du theme sur trois periodes ;
  // a defaut d'indicateur, le solde des momentums du perimetre.
  const net = indicatorCodes.length
    ? indicatorCodes.reduce((sum, indicatorCode) => sum + trendOf(countryCodes, indicatorCode), 0)
    : countryCodes.filter((c) => getCountryProfile(c).regime.momentum === "Improving").length -
      countryCodes.filter((c) => getCountryProfile(c).regime.momentum === "Deteriorating").length;

  const indicators = seed.indicatorCodes
    .map((code) => STATIC_INDICATORS.find((i) => i.code === code))
    .filter(Boolean)
    .map((i) => ({ code: i!.code, name: i!.name, unit: i!.unit }));

  return {
    code: seed.code,
    name: seed.name,
    description: seed.description,
    icon: seed.icon,
    color: seed.color,
    displayOrder: order,
    isActive: true,
    countryCount: countryCodes.length,
    // La spec compte les indicateurs prevus, pas seulement ceux deja servis.
    indicatorCount: indicators.length + seed.plannedIndicators.length,
    activeSignals: signals.filter((s) => s.isActive).length,
    averageScore,
    trend: net > 0 ? "improving" : net < 0 ? "deteriorating" : "stable",
    countryCodes,
    indicators,
    plannedIndicators: seed.plannedIndicators,
    signals,
  };
}

export const STATIC_THEMES: ThemeDetail[] = SEEDS.map(buildTheme);

export function getTheme(code: string): ThemeDetail | undefined {
  return STATIC_THEMES.find((t) => t.code === code);
}

/** Vue liste, equivalente a `GET /themes`. */
export const THEME_LIST: Theme[] = STATIC_THEMES.map(
  ({ countryCodes: _c, indicators: _i, plannedIndicators: _p, signals: _s, averageScore: _a, trend: _t, ...theme }) => theme
);
