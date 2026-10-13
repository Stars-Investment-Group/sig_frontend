import type {
  Country,
  Frequency,
  IndicatorCategory,
  CountryRating,
  MacroIndicator,
  MacroObservation,
  MacroRegime,
  PillarKey,
  PillarScore,
} from "@shared/schema";

/**
 * Jeu de données STATIQUES centralisé (phase frontend seul).
 *
 * Les formes suivent le contrat des 10 modules backend : codes ISO alpha-3,
 * catalogue d'indicateurs, et surtout observations **millésimées** — une même
 * période peut porter plusieurs valeurs publiées à des dates différentes, ce
 * qui alimente l'historique des révisions du Data Explorer.
 */

/** Date d'arrêté du jeu statique. Correspondra au `fetchedAt` du backend. */
export const DATA_AS_OF = new Date("2026-07-31");

/* =========================================================================
 * Module 1 — Pays
 * ========================================================================= */

interface CountrySeed {
  code: string;
  name: string;
  region: string;
  subregion: string;
  incomeLevel: string;
  currency: string;
  status: Country["status"];
  isAggregate?: boolean;
}

const COUNTRY_SEEDS: CountrySeed[] = [
  { code: "USA", name: "United States", region: "Americas", subregion: "Northern America", incomeLevel: "High", currency: "USD", status: "stable" },
  { code: "GBR", name: "United Kingdom", region: "Europe", subregion: "Northern Europe", incomeLevel: "High", currency: "GBP", status: "stable" },
  { code: "EMU", name: "Euro Area", region: "Europe", subregion: "Euro Area", incomeLevel: "High", currency: "EUR", status: "stable", isAggregate: true },
  { code: "JPN", name: "Japan", region: "Asia", subregion: "Eastern Asia", incomeLevel: "High", currency: "JPY", status: "stable" },
  { code: "CAN", name: "Canada", region: "Americas", subregion: "Northern America", incomeLevel: "High", currency: "CAD", status: "watch" },
  { code: "FRA", name: "France", region: "Europe", subregion: "Western Europe", incomeLevel: "High", currency: "EUR", status: "stable" },
  { code: "DEU", name: "Germany", region: "Europe", subregion: "Western Europe", incomeLevel: "High", currency: "EUR", status: "stable" },
  { code: "ITA", name: "Italy", region: "Europe", subregion: "Southern Europe", incomeLevel: "High", currency: "EUR", status: "watch" },
  { code: "ESP", name: "Spain", region: "Europe", subregion: "Southern Europe", incomeLevel: "High", currency: "EUR", status: "stable" },
  { code: "BRA", name: "Brazil", region: "Americas", subregion: "South America", incomeLevel: "Upper-Middle", currency: "BRL", status: "watch" },
  { code: "IND", name: "India", region: "Asia", subregion: "Southern Asia", incomeLevel: "Lower-Middle", currency: "INR", status: "stable" },
  { code: "CHN", name: "China", region: "Asia", subregion: "Eastern Asia", incomeLevel: "Upper-Middle", currency: "CNY", status: "stable" },
  { code: "ZAF", name: "South Africa", region: "Africa", subregion: "Southern Africa", incomeLevel: "Upper-Middle", currency: "ZAR", status: "watch" },
  { code: "CIV", name: "Côte d'Ivoire", region: "UEMOA", subregion: "West Africa", incomeLevel: "Lower-Middle", currency: "XOF", status: "stable" },
  { code: "SEN", name: "Senegal", region: "UEMOA", subregion: "West Africa", incomeLevel: "Lower-Middle", currency: "XOF", status: "watch" },
  { code: "NGA", name: "Nigeria", region: "Africa", subregion: "West Africa", incomeLevel: "Lower-Middle", currency: "NGN", status: "risk" },
  { code: "GHA", name: "Ghana", region: "Africa", subregion: "West Africa", incomeLevel: "Lower-Middle", currency: "GHS", status: "watch" },
  { code: "MAR", name: "Morocco", region: "Africa", subregion: "Northern Africa", incomeLevel: "Lower-Middle", currency: "MAD", status: "stable" },
  { code: "BEN", name: "Benin", region: "UEMOA", subregion: "West Africa", incomeLevel: "Lower-Middle", currency: "XOF", status: "stable" },
  { code: "BFA", name: "Burkina Faso", region: "UEMOA", subregion: "West Africa", incomeLevel: "Low", currency: "XOF", status: "risk" },
  { code: "MLI", name: "Mali", region: "UEMOA", subregion: "West Africa", incomeLevel: "Low", currency: "XOF", status: "risk" },
  { code: "NER", name: "Niger", region: "UEMOA", subregion: "West Africa", incomeLevel: "Low", currency: "XOF", status: "risk" },
  { code: "TGO", name: "Togo", region: "UEMOA", subregion: "West Africa", incomeLevel: "Low", currency: "XOF", status: "watch" },
  { code: "GNB", name: "Guinea-Bissau", region: "UEMOA", subregion: "West Africa", incomeLevel: "Low", currency: "XOF", status: "watch" },
];

export const STATIC_COUNTRIES: Country[] = COUNTRY_SEEDS.map((c) => ({
  code: c.code,
  name: c.name,
  region: c.region,
  subregion: c.subregion,
  incomeLevel: c.incomeLevel,
  currency: c.currency,
  flagUrl: null,
  isAggregate: c.isAggregate ?? false,
  status: c.status,
  lastUpdated: DATA_AS_OF,
}));

/* =========================================================================
 * Module 2 — Catalogue d'indicateurs
 * ========================================================================= */

/**
 * Catalogue d'indicateurs — module 2.
 *
 * Les vingt entrees sont **celles que les maquettes nomment** : la matrice
 * multi-horizons de P5 attend sept familles, ses panneaux avances / coincidents
 * / retardes six series chacun, et le Macro Snapshot de P8 en cite quatre de
 * plus. Avec quatre indicateurs, ces pages affichaient des lignes vides —
 * honnete, mais illisible.
 *
 * `family` sert aux panneaux de P5 : un indicateur avance tourne avant le
 * cycle, un retarde le confirme. `block` regroupe pour la matrice.
 */

export type IndicatorFamily = "leading" | "coincident" | "lagging";
export type IndicatorBlock =
  | "Growth"
  | "Inflation"
  | "External"
  | "Fiscal"
  | "Financial Conditions"
  | "Policy & Liquidity"
  | "Sentiment";

export interface CatalogueEntry extends MacroIndicator {
  family: IndicatorFamily;
  block: IndicatorBlock;
  /**
   * Libelle compact pour les tables a colonnes serrees (panneaux de P5,
   * en-tetes de la heatmap de P3). Vaut `name` quand il tient deja.
   */
  shortName: string;
}

/** Profil d'un indicateur : niveau type et ecart selon le niveau de revenu. */
interface IndicatorSeed {
  code: string;
  name: string;
  description: string;
  category: IndicatorCategory;
  unit: string;
  frequency: Frequency;
  family: IndicatorFamily;
  block: IndicatorBlock;
  /** Libelle compact ; absent quand `name` tient dans une colonne etroite. */
  shortName?: string;
  /** Niveau de reference pour une economie avancee. */
  advanced: number;
  /** Niveau de reference pour une economie a revenu plus faible. */
  emerging: number;
  /** L'indicateur peut-il passer sous zero ? */
  canBeNegative?: boolean;
  /**
   * Une hausse est-elle defavorable ? Vrai pour l'inflation, le chomage, le
   * taux directeur, la dette, les creances douteuses. Sans cette information,
   * aucune page ne peut colorer correctement une variation.
   */
  lowerIsBetter?: boolean;
}

const INDICATOR_SEEDS: IndicatorSeed[] = [
  // --- Croissance -------------------------------------------------------
  { code: "real_gdp_growth", name: "Croissance du PIB", description: "Croissance du PIB réel en glissement annuel.", category: "Growth", unit: "%", frequency: "Monthly", family: "coincident", block: "Growth", advanced: 1.8, emerging: 5.2, canBeNegative: true },
  { code: "industrial_production", name: "Production industrielle", description: "Variation annuelle de la production industrielle.", category: "Growth", unit: "%", frequency: "Monthly", shortName: "Prod. industrielle", family: "coincident", block: "Growth", advanced: 1.2, emerging: 4.6, canBeNegative: true },
  { code: "retail_sales", name: "Ventes de détail", description: "Variation annuelle des ventes de détail en volume.", category: "Growth", unit: "%", frequency: "Monthly", family: "coincident", block: "Growth", advanced: 1.6, emerging: 5.1, canBeNegative: true },
  { code: "building_permits", name: "Permis de construire", description: "Variation annuelle des permis de construire délivrés.", category: "Growth", unit: "%", frequency: "Monthly", shortName: "Permis de construire", family: "leading", block: "Growth", advanced: 2.4, emerging: 12.0, canBeNegative: true },

  // --- Inflation --------------------------------------------------------
  { code: "cpi_inflation", name: "Inflation (CPI)", description: "Variation annuelle de l'indice des prix à la consommation.", category: "Inflation", unit: "%", frequency: "Monthly", family: "coincident", block: "Inflation", advanced: 2.4, emerging: 5.1, canBeNegative: true, lowerIsBetter: true },
  { code: "core_inflation", name: "Inflation sous-jacente", description: "Inflation hors énergie et alimentation.", category: "Inflation", unit: "%", frequency: "Monthly", shortName: "Inflation sous-jac.", family: "lagging", block: "Inflation", advanced: 2.2, emerging: 4.3, canBeNegative: true, lowerIsBetter: true },
  { code: "food_prices", name: "Prix alimentaires", description: "Variation annuelle des prix alimentaires.", category: "Inflation", unit: "%", frequency: "Monthly", family: "coincident", block: "Inflation", advanced: 2.8, emerging: 7.4, canBeNegative: true, lowerIsBetter: true },
  { code: "energy_prices", name: "Prix énergétiques", description: "Variation annuelle des prix de l'énergie.", category: "Inflation", unit: "%", frequency: "Monthly", family: "leading", block: "Inflation", advanced: 3.1, emerging: 6.2, canBeNegative: true, lowerIsBetter: true },

  // --- Emploi -----------------------------------------------------------
  { code: "unemployment_rate", name: "Chômage", description: "Part de la population active sans emploi.", category: "Labour", unit: "%", frequency: "Monthly", family: "lagging", block: "Growth", advanced: 5.4, emerging: 8.2, lowerIsBetter: true },
  { code: "employment_growth", name: "Croissance de l'emploi", description: "Variation annuelle de l'emploi total.", category: "Labour", unit: "%", frequency: "Monthly", shortName: "Emploi (a/a)", family: "coincident", block: "Growth", advanced: 1.1, emerging: 2.8, canBeNegative: true },
  { code: "capacity_utilisation", name: "Taux d'utilisation des capacités", description: "Part des capacités de production effectivement utilisées.", category: "Labour", unit: "%", frequency: "Monthly", shortName: "Taux d'utilisation", family: "lagging", block: "Growth", advanced: 79.0, emerging: 71.0 },

  // --- Externe ----------------------------------------------------------
  { code: "current_account", name: "Compte courant", description: "Solde du compte courant en points de PIB.", category: "External", unit: "% PIB", frequency: "Quarterly", family: "lagging", block: "External", advanced: 0.8, emerging: -2.6, canBeNegative: true },
  { code: "export_growth", name: "Croissance des exportations", description: "Variation annuelle des exportations de biens et services.", category: "External", unit: "%", frequency: "Monthly", shortName: "Exportations (a/a)", family: "coincident", block: "External", advanced: 2.9, emerging: 9.4, canBeNegative: true },
  { code: "export_orders", name: "Carnets de commandes export", description: "Indice des commandes à l'exportation.", category: "External", unit: "idx", frequency: "Monthly", shortName: "Commandes export", family: "leading", block: "External", advanced: 50.8, emerging: 51.4 },
  { code: "fx_reserves", name: "Réserves de change", description: "Réserves exprimées en mois d'importations.", category: "External", unit: " mois", frequency: "Monthly", family: "lagging", block: "External", advanced: 6.5, emerging: 3.8 },
  { code: "terms_of_trade", name: "Termes de l'échange", description: "Variation annuelle des termes de l'échange.", category: "External", unit: "%", frequency: "Quarterly", shortName: "Termes de l'échange", family: "lagging", block: "External", advanced: 0.4, emerging: -1.8, canBeNegative: true },

  // --- Budgetaire -------------------------------------------------------
  { code: "fiscal_balance", name: "Solde budgétaire", description: "Solde budgétaire global en points de PIB.", category: "Fiscal", unit: "% PIB", frequency: "Quarterly", family: "lagging", block: "Fiscal", advanced: -3.2, emerging: -4.1, canBeNegative: true },
  { code: "public_debt", name: "Dette publique", description: "Dette publique brute en points de PIB.", category: "Fiscal", unit: "% PIB", frequency: "Quarterly", family: "lagging", block: "Fiscal", advanced: 92.0, emerging: 56.0, lowerIsBetter: true },

  // --- Conditions financieres ------------------------------------------
  { code: "policy_rate", name: "Taux directeur", description: "Taux directeur de la banque centrale de référence.", category: "Markets", unit: "%", frequency: "Monthly", family: "leading", block: "Policy & Liquidity", advanced: 3.4, emerging: 6.2, lowerIsBetter: true },
  { code: "credit_growth", name: "Croissance du crédit", description: "Variation annuelle du crédit au secteur privé.", category: "Markets", unit: "%", frequency: "Monthly", shortName: "Crédit (a/a)", family: "leading", block: "Financial Conditions", advanced: 2.6, emerging: 9.1, canBeNegative: true },
  { code: "money_supply", name: "Masse monétaire (M2)", description: "Variation annuelle de l'agrégat monétaire M2.", category: "Markets", unit: "%", frequency: "Monthly", shortName: "Masse monétaire M2", family: "leading", block: "Policy & Liquidity", advanced: 3.2, emerging: 10.8, canBeNegative: true },
  { code: "npl_ratio", name: "Créances douteuses", description: "Part des créances douteuses dans le total des prêts.", category: "Markets", unit: "%", frequency: "Quarterly", family: "lagging", block: "Financial Conditions", advanced: 2.1, emerging: 6.4, lowerIsBetter: true },

  // --- Sentiment --------------------------------------------------------
  { code: "pmi_composite", name: "PMI composite", description: "Indice des directeurs d'achat ; 50 sépare expansion et contraction.", category: "Growth", unit: "idx", frequency: "Monthly", family: "leading", block: "Sentiment", advanced: 51.2, emerging: 52.6 },
  { code: "consumer_confidence", name: "Confiance des ménages", description: "Indice de confiance des consommateurs.", category: "Growth", unit: "idx", frequency: "Monthly", shortName: "Confiance ménages", family: "leading", block: "Sentiment", advanced: 98.0, emerging: 103.0 },
];

/** Les quatre indicateurs historiques gardent leurs valeurs calibrees a la main. */
const CALIBRATED: Record<string, Record<string, number>> = {
  USA: { cpi_inflation: 2.9, unemployment_rate: 3.7, policy_rate: 4.25, real_gdp_growth: 2.3 },
  GBR: { cpi_inflation: 3.1, unemployment_rate: 4.3, policy_rate: 4.75, real_gdp_growth: 1.2 },
  EMU: { cpi_inflation: 2.4, unemployment_rate: 6.4, policy_rate: 3.4, real_gdp_growth: 1.6 },
  JPN: { cpi_inflation: 1.8, unemployment_rate: 2.5, policy_rate: 0.0, real_gdp_growth: 0.7 },
  CAN: { cpi_inflation: 2.6, unemployment_rate: 5.8, policy_rate: 4.25, real_gdp_growth: 1.4 },
  FRA: { cpi_inflation: 2.3, unemployment_rate: 7.2, policy_rate: 3.4, real_gdp_growth: 1.1 },
  DEU: { cpi_inflation: 2.2, unemployment_rate: 3.3, policy_rate: 3.4, real_gdp_growth: 0.3 },
  ITA: { cpi_inflation: 1.9, unemployment_rate: 7.6, policy_rate: 3.4, real_gdp_growth: 0.9 },
  ESP: { cpi_inflation: 2.7, unemployment_rate: 11.7, policy_rate: 3.4, real_gdp_growth: 2.0 },
  BRA: { cpi_inflation: 4.1, unemployment_rate: 7.9, policy_rate: 10.5, real_gdp_growth: 2.0 },
  IND: { cpi_inflation: 5.4, unemployment_rate: 7.1, policy_rate: 6.5, real_gdp_growth: 6.3 },
  CHN: { cpi_inflation: 0.9, unemployment_rate: 5.2, policy_rate: 3.0, real_gdp_growth: 4.8 },
  ZAF: { cpi_inflation: 5.1, unemployment_rate: 32.1, policy_rate: 7.75, real_gdp_growth: 1.2 },
  CIV: { cpi_inflation: 3.2, unemployment_rate: 3.4, policy_rate: 4.5, real_gdp_growth: 5.8 },
  SEN: { cpi_inflation: 4.1, unemployment_rate: 6.2, policy_rate: 4.5, real_gdp_growth: 4.5 },
  NGA: { cpi_inflation: 9.2, unemployment_rate: 4.2, policy_rate: 12.0, real_gdp_growth: 1.8 },
};

export const STATIC_INDICATORS: CatalogueEntry[] = INDICATOR_SEEDS.map((seed) => ({
  code: seed.code,
  name: seed.name,
  shortName: seed.shortName ?? seed.name,
  description: seed.description,
  category: seed.category,
  unit: seed.unit,
  frequency: seed.frequency,
  source: "IMF-WEO",
  isSeasonallyAdjusted: seed.category === "Growth" || seed.category === "Labour",
  coverageStart: null,
  coverageEnd: null,
  family: seed.family,
  block: seed.block,
}));

/**
 * Sens de lecture de chaque indicateur.
 *
 * Expose depuis le catalogue plutot que redeclare page par page : trois
 * composants portaient leur propre table de quatre entrees, qui serait devenue
 * fausse des l'ajout d'un indicateur.
 */
export const INDICATOR_POLARITY: Record<string, "higherBetter" | "lowerBetter"> =
  Object.fromEntries(
    INDICATOR_SEEDS.map((seed) => [seed.code, seed.lowerIsBetter ? "lowerBetter" : "higherBetter"])
  );

/** Indicateurs d'une famille donnee (avances, coincidents, retardes). */
export function indicatorsByFamily(family: IndicatorFamily): CatalogueEntry[] {
  return STATIC_INDICATORS.filter((i) => i.family === family);
}

/** Indicateurs d'un bloc de la matrice multi-horizons. */
export function indicatorsByBlock(block: IndicatorBlock): CatalogueEntry[] {
  return STATIC_INDICATORS.filter((i) => i.block === block);
}

/** Les sept blocs de la matrice, dans l'ordre de la planche P5. */
export const INDICATOR_BLOCKS: IndicatorBlock[] = [
  "Growth",
  "Inflation",
  "External",
  "Fiscal",
  "Financial Conditions",
  "Policy & Liquidity",
  "Sentiment",
];

/** Codes du catalogue, dans l'ordre d'affichage. */
export const INDICATOR_CODES = STATIC_INDICATORS.map((i) => i.code);

/* =========================================================================
 * Module 3 — Observations millésimées
 * ========================================================================= */

/**
 * Niveau de depart de chaque couple pays / indicateur.
 *
 * Les quatre series historiques gardent leurs valeurs calibrees a la main ;
 * les seize autres sont **derivees** du profil de l'indicateur et du niveau de
 * revenu du pays, avec un ecart deterministe. Saisir 16 x 20 valeurs a la main
 * produirait trois cent vingt nombres impossibles a maintenir et faux de toute
 * facon : seul le backend connaitra les vrais.
 */
const BASE_VALUES: Record<string, Record<string, number>> = (() => {
  const table: Record<string, Record<string, number>> = {};

  for (const country of COUNTRY_SEEDS) {
    const advanced = country.incomeLevel === "High";
    const row: Record<string, number> = {};

    for (const seed of INDICATOR_SEEDS) {
      const calibrated = CALIBRATED[country.code]?.[seed.code];
      if (calibrated !== undefined) {
        row[seed.code] = calibrated;
        continue;
      }
      const reference = advanced ? seed.advanced : seed.emerging;
      // Ecart de +/- 18% autour de la reference, stable d'un rendu a l'autre.
      const spread = Math.abs(reference) * 0.18 + 0.2;
      const value = reference + (hash01(`${country.code}:${seed.code}:base`) - 0.5) * 2 * spread;
      row[seed.code] = Math.round((seed.canBeNegative ? value : Math.max(0.1, value)) * 10) / 10;
    }

    table[country.code] = row;
  }

  return table;
})();

const HISTORY_LENGTH = 12;
/** Nombre de périodes récentes portant une campagne de révision complète. */
const REVISED_PERIODS = 4;

/**
 * Décalages, en mois, entre une période et ses millésimes.
 *
 * Les décalages **négatifs** sont des prévisions : ce qu'on annonçait pour la
 * période avant qu'elle ne se termine. Sans eux, l'Explorateur de données ne
 * pouvait rien afficher dans ses colonnes « il y a 6 mois » et « il y a 1 an »,
 * puisque toutes les publications tenaient dans les deux mois suivant la
 * période. Un historique de révisions qui ne couvre que deux mois ne permet pas
 * de voir une révision.
 */
const VINTAGE_OFFSETS = [-12, -6, -3, 1, 2, 3];
/** Le millésime définitif : la première publication après la période. */
const FINAL_OFFSET = 3;
/** Les périodes anciennes n'ont gardé que leur publication finale. */
const LAST_VINTAGE_ONLY = [FINAL_OFFSET];

const round1 = (n: number) => Math.round(n * 10) / 10;
const pad = (n: number) => String(n).padStart(2, "0");

/** Formatage local : `toISOString` decalerait la date selon le fuseau. */
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoMonth = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

/**
 * Periode calee sur le 1er du mois. Partir du 31 juillet et reculer d'un mois
 * deborderait sur le mois suivant (le 31 juin n'existe pas), ce qui ferait
 * collapser plusieurs periodes sur la meme valeur.
 */
function periodOf(monthsBeforeEnd: number): { period: string; date: Date } {
  const date = new Date(DATA_AS_OF.getFullYear(), DATA_AS_OF.getMonth() - monthsBeforeEnd, 1);
  return { period: isoMonth(date), date };
}

function sourceOf(countryCode: string): string {
  if (countryCode === "USA") return "FRED";
  if (countryCode === "EMU") return "Eurostat";
  if (countryCode === "CIV" || countryCode === "SEN") return "BCEAO";
  return "IMF";
}

/** Indicateurs qui ne peuvent pas passer sous zero. */
const FLOOR_AT_ZERO = new Set(
  INDICATOR_SEEDS.filter((seed) => !seed.canBeNegative).map((seed) => seed.code)
);

/**
 * Trajectoire d'un couple pays / indicateur.
 *
 * La forme depend du pays **et** de l'indicateur, pas seulement du niveau de
 * depart : une sinusoide commune a tout le monde donnait des variations
 * identiques pour les 16 pays, ce qui rendait la diffusion et la matrice de
 * tendances constantes — donc fausses. L'amplitude suit le niveau, car une
 * inflation a 9% bouge plus qu'un taux directeur a 0%.
 */
function seriesShape(countryCode: string, indicatorCode: string, base: number): number[] {
  const seed = `${countryCode}:${indicatorCode}`;
  const amplitude = Math.max(0.15, Math.min(0.7, Math.abs(base) * 0.07 + 0.15));
  const phase = hash01(`${seed}:phase`) * Math.PI * 2;
  const wavelength = 2.2 + hash01(`${seed}:wave`) * 3.4;
  const drift = (hash01(`${seed}:drift`) - 0.5) * 0.09;
  const floor = FLOOR_AT_ZERO.has(indicatorCode);

  return Array.from({ length: HISTORY_LENGTH }, (_, i) => {
    const wave = Math.sin(phase + i / wavelength) * amplitude;
    const noise = (hash01(`${seed}:${i}`) - 0.5) * amplitude;
    const value = base + wave + noise + (i - HISTORY_LENGTH + 1) * drift;
    return round1(floor ? Math.max(0, value) : value);
  });
}

function buildObservations(): MacroObservation[] {
  const rows: MacroObservation[] = [];

  for (const countryCode of Object.keys(BASE_VALUES)) {
    for (const indicatorCode of INDICATOR_CODES) {
      const base = BASE_VALUES[countryCode][indicatorCode];
      const source = sourceOf(countryCode);

      const series = seriesShape(countryCode, indicatorCode, base);

      for (let i = 0; i < HISTORY_LENGTH; i++) {
        const { period, date } = periodOf(HISTORY_LENGTH - 1 - i);
        const value = series[i];
        const previousValue = i > 0 ? series[i - 1] : null;
        const change = previousValue === null ? null : round1(value - previousValue);

        // Les périodes récentes portent une campagne de révision complète.
        const revised = i >= HISTORY_LENGTH - REVISED_PERIODS;
        const offsets = revised ? VINTAGE_OFFSETS : LAST_VINTAGE_ONLY;

        for (const offset of offsets) {
          const vintageDate = new Date(date.getFullYear(), date.getMonth() + offset, 1);
          // Un millésime postérieur à la date d'arrêté n'existe pas encore.
          if (vintageDate > DATA_AS_OF) continue;

          // Un millésime publié avant la fin de la période est une prévision :
          // ce qu'on anticipait alors, pas ce qui a été constaté.
          const isForecast = offset <= 0;
          // Plus on remonte, plus l'estimation s'écarte de la valeur définitive.
          const distance = Math.abs(offset);
          // Le sens de la révision doit être **propre à la série**. Il suivait
          // la parité de l'index de période, donc la même pour les 24 pays et
          // les 24 indicateurs : au dernier point, dont le millésime définitif
          // n'existe pas encore, toutes les séries étaient révisées dans le
          // même sens. La page Indicateurs affichait « 24 en amélioration,
          // 0 en dégradation » sur la croissance du PIB. Même artefact que la
          // sinusoïde partagée corrigée plus haut : cela se lit comme une
          // donnée alors que ce n'en est pas une.
          const wobble = hash01(`${countryCode}:${indicatorCode}:${period}:${offset}`) - 0.5;
          const drift =
            offset === FINAL_OFFSET
              ? 0
              : round1(distance * 0.16 * wobble * (isForecast ? 1.6 : 1));

          rows.push({
            countryCode,
            indicatorCode,
            period,
            date,
            value: round1(value - drift),
            previousValue,
            change,
            changeDirection:
              change === null ? null : change > 0.05 ? "up" : change < -0.05 ? "down" : "stable",
            vintageDate: iso(vintageDate),
            releaseDate: iso(vintageDate),
            isForecast,
            source,
            unit: "%",
          });
        }
      }
    }
  }

  return rows;
}

/** Toutes les observations, tous millésimes confondus. */
export const STATIC_OBSERVATIONS: MacroObservation[] = buildObservations();

/** Ne garde que le millésime le plus récent de chaque période. */
function latestVintage(rows: MacroObservation[]): MacroObservation[] {
  const byPeriod = new Map<string, MacroObservation>();
  for (const row of rows) {
    const current = byPeriod.get(row.period);
    if (!current || row.vintageDate > current.vintageDate) byPeriod.set(row.period, row);
  }
  return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
}

/** Historique d'un couple pays / indicateur, au dernier millésime connu. */
export function getStaticHistory(countryCode: string, indicatorCode: string): MacroObservation[] {
  return latestVintage(
    STATIC_OBSERVATIONS.filter(
      (o) => o.countryCode === countryCode && o.indicatorCode === indicatorCode
    )
  );
}

/** Révisions successives d'une période, du millésime le plus récent au plus ancien. */
export function getVintages(
  countryCode: string,
  indicatorCode: string,
  period: string
): MacroObservation[] {
  return STATIC_OBSERVATIONS.filter(
    (o) =>
      o.countryCode === countryCode && o.indicatorCode === indicatorCode && o.period === period
  ).sort((a, b) => b.vintageDate.localeCompare(a.vintageDate));
}

/** Dernière observation connue, par pays et par indicateur. */
export const STATIC_LATEST_INDICATORS: MacroObservation[] = (() => {
  const out: MacroObservation[] = [];
  for (const countryCode of Object.keys(BASE_VALUES)) {
    for (const indicatorCode of INDICATOR_CODES) {
      const history = getStaticHistory(countryCode, indicatorCode);
      if (history.length) out.push(history[history.length - 1]);
    }
  }
  return out;
})();

/* =========================================================================
 * Module 4 — Régimes macroéconomiques
 * ========================================================================= */

interface RegimeSeed {
  countryCode: string;
  regime: MacroRegime["regime"];
  momentum: MacroRegime["momentum"];
  policyStance: MacroRegime["policyStance"];
  riskScore: number;
  growthScore: number;
  inflationScore: number;
}

const REGIME_SEEDS: RegimeSeed[] = [
  { countryCode: "USA", regime: "Recovery", momentum: "Improving", policyStance: "Tight", riskScore: 24, growthScore: 68, inflationScore: 52 },
  { countryCode: "GBR", regime: "Recovery", momentum: "Stable", policyStance: "Tight", riskScore: 41, growthScore: 54, inflationScore: 58 },
  { countryCode: "EMU", regime: "Recovery", momentum: "Improving", policyStance: "Neutral", riskScore: 38, growthScore: 58, inflationScore: 48 },
  { countryCode: "JPN", regime: "Transition", momentum: "Stable", policyStance: "Accommodative", riskScore: 40, growthScore: 46, inflationScore: 34 },
  { countryCode: "CAN", regime: "Recovery", momentum: "Stable", policyStance: "Tight", riskScore: 36, growthScore: 52, inflationScore: 50 },
  { countryCode: "FRA", regime: "Recovery", momentum: "Stable", policyStance: "Neutral", riskScore: 42, growthScore: 50, inflationScore: 47 },
  { countryCode: "DEU", regime: "Transition", momentum: "Deteriorating", policyStance: "Neutral", riskScore: 45, growthScore: 32, inflationScore: 46 },
  { countryCode: "ITA", regime: "Transition", momentum: "Stable", policyStance: "Neutral", riskScore: 48, growthScore: 44, inflationScore: 44 },
  { countryCode: "ESP", regime: "Recovery", momentum: "Improving", policyStance: "Neutral", riskScore: 39, growthScore: 62, inflationScore: 51 },
  { countryCode: "BRA", regime: "Transition", momentum: "Deteriorating", policyStance: "Tight", riskScore: 62, growthScore: 48, inflationScore: 68 },
  { countryCode: "IND", regime: "Expansion", momentum: "Improving", policyStance: "Neutral", riskScore: 44, growthScore: 84, inflationScore: 62 },
  { countryCode: "CHN", regime: "Transition", momentum: "Stable", policyStance: "Accommodative", riskScore: 47, growthScore: 66, inflationScore: 28 },
  { countryCode: "ZAF", regime: "Recession", momentum: "Deteriorating", policyStance: "Tight", riskScore: 71, growthScore: 30, inflationScore: 64 },
  { countryCode: "CIV", regime: "Expansion", momentum: "Improving", policyStance: "Neutral", riskScore: 32, growthScore: 82, inflationScore: 53 },
  { countryCode: "SEN", regime: "Transition", momentum: "Stable", policyStance: "Neutral", riskScore: 45, growthScore: 70, inflationScore: 58 },
  { countryCode: "NGA", regime: "Recession", momentum: "Deteriorating", policyStance: "Tight", riskScore: 78, growthScore: 34, inflationScore: 88 },
  { countryCode: "GHA", regime: "Recovery", momentum: "Improving", policyStance: "Tight", riskScore: 58, growthScore: 64, inflationScore: 74 },
  { countryCode: "MAR", regime: "Recovery", momentum: "Stable", policyStance: "Neutral", riskScore: 43, growthScore: 60, inflationScore: 44 },
  { countryCode: "BEN", regime: "Expansion", momentum: "Improving", policyStance: "Neutral", riskScore: 38, growthScore: 78, inflationScore: 46 },
  { countryCode: "BFA", regime: "Transition", momentum: "Deteriorating", policyStance: "Neutral", riskScore: 66, growthScore: 54, inflationScore: 52 },
  { countryCode: "MLI", regime: "Transition", momentum: "Deteriorating", policyStance: "Neutral", riskScore: 68, growthScore: 48, inflationScore: 56 },
  { countryCode: "NER", regime: "Transition", momentum: "Stable", policyStance: "Neutral", riskScore: 70, growthScore: 52, inflationScore: 50 },
  { countryCode: "TGO", regime: "Recovery", momentum: "Improving", policyStance: "Neutral", riskScore: 52, growthScore: 66, inflationScore: 44 },
  { countryCode: "GNB", regime: "Transition", momentum: "Stable", policyStance: "Neutral", riskScore: 64, growthScore: 56, inflationScore: 48 },
];

const toInflationLevel = (score: number): MacroRegime["inflationLevel"] =>
  score >= 60 ? "high" : score >= 40 ? "moderate" : "low";

const toGrowthLevel = (score: number): MacroRegime["gdpGrowthLevel"] =>
  score >= 75 ? "strong" : score >= 55 ? "stable" : score >= 35 ? "slow" : "negative";

const toRiskLevel = (score: number): MacroRegime["riskLevel"] =>
  score >= 60 ? "high" : score >= 35 ? "medium" : "low";

export const STATIC_REGIMES: MacroRegime[] = REGIME_SEEDS.map((r) => ({
  countryCode: r.countryCode,
  regime: r.regime,
  momentum: r.momentum,
  confidence: 60 + ((r.growthScore + (100 - r.riskScore)) % 35),
  riskScore: r.riskScore,
  growthScore: r.growthScore,
  inflationScore: r.inflationScore,
  policyStance: r.policyStance,
  riskLevel: toRiskLevel(r.riskScore),
  inflationLevel: toInflationLevel(r.inflationScore),
  gdpGrowthLevel: toGrowthLevel(r.growthScore),
  period: isoMonth(DATA_AS_OF),
  validFrom: new Date("2026-01-01"),
  validTo: null,
  lastUpdated: DATA_AS_OF,
}));

/* =========================================================================
 * Module 5 — Country Ratings
 *
 * Les notations sont **dérivées** des scores de régime plutôt qu'écrites à la
 * main : les 16 pays doivent tous avoir une fiche cohérente, et une valeur
 * saisie à la main finirait par contredire le régime affiché juste au-dessus.
 * Le backend fournira les vrais scores ; seule la source changera.
 * ========================================================================= */

/** Pondération des 7 piliers — somme = 1. Alimente le Score Decomposition. */
export const PILLAR_WEIGHTS: Record<PillarKey, number> = {
  macroStrength: 0.2,
  macroResilience: 0.15,
  fiscalCapacity: 0.18,
  externalResilience: 0.15,
  politicalInstitutionalQuality: 0.14,
  structuralOpportunity: 0.1,
  marketAttractiveness: 0.08,
};

export const PILLAR_LABELS: Record<PillarKey, string> = {
  macroStrength: "Macro Strength",
  macroResilience: "Macro Resilience",
  fiscalCapacity: "Fiscal Capacity",
  externalResilience: "External Resilience",
  politicalInstitutionalQuality: "Political & Institutional Quality",
  structuralOpportunity: "Structural Opportunity",
  marketAttractiveness: "Market Attractiveness",
};

/** Ordre d'affichage retenu par la maquette P6. */
export const PILLAR_ORDER: PillarKey[] = [
  "macroStrength",
  "macroResilience",
  "fiscalCapacity",
  "externalResilience",
  "politicalInstitutionalQuality",
  "structuralOpportunity",
  "marketAttractiveness",
];

/**
 * Hachage déterministe : même entrée, même sortie à chaque rendu.
 * `Math.random()` ferait bouger les scores à chaque navigation.
 */
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const clamp10 = (v: number) => Math.max(0.5, Math.min(9.8, Math.round(v * 10) / 10));

/** Base de chaque pilier, exprimée sur 10 à partir des signaux du module 4. */
function pillarBase(key: PillarKey, regime: MacroRegime, country: Country): number {
  const growth = regime.growthScore / 10;
  const safety = (100 - regime.riskScore) / 10;
  // Une inflation proche de 45/100 est la plus saine : on note l'écart à la cible.
  const priceStability = (100 - Math.abs(regime.inflationScore - 45) * 1.6) / 10;
  const advanced = country.incomeLevel === "High";

  switch (key) {
    case "macroStrength":
      return growth * 0.7 + priceStability * 0.3;
    case "macroResilience":
      return safety * 0.6 + priceStability * 0.4;
    case "fiscalCapacity":
      return safety * 0.5 + (advanced ? 6.2 : 4.6) * 0.5;
    case "externalResilience":
      return safety * 0.45 + (advanced ? 6.8 : 4.9) * 0.55;
    case "politicalInstitutionalQuality":
      return advanced ? 7.4 : 5.1;
    case "structuralOpportunity":
      return growth * 0.8 + (advanced ? 3.4 : 6.1) * 0.2;
    case "marketAttractiveness":
      return safety * 0.35 + growth * 0.35 + (advanced ? 7.0 : 4.8) * 0.3;
  }
}

const OUTLOOK_BY_MOMENTUM: Record<MacroRegime["momentum"], CountryRating["outlook"]> = {
  Improving: "Positive",
  Stable: "Stable",
  Deteriorating: "Negative",
};

const WATCH_BY_STATUS: Record<Country["status"], string | null> = {
  stable: null,
  watch: "On Watch — Negative",
  risk: "Under Review — Negative",
};

/** Justification par pilier : côté favorable, puis côté défavorable. */
const RATIONALE: Record<PillarKey, [string, string]> = {
  macroStrength: [
    "Croissance au-dessus de la moyenne du groupe de pairs, inflation proche de la cible.",
    "Croissance en deçà du potentiel, avec un écart d'inflation persistant.",
  ],
  macroResilience: [
    "Amortisseurs macroéconomiques suffisants pour absorber un choc exogène.",
    "Marges de manœuvre étroites : un choc se transmettrait vite à l'activité.",
  ],
  fiscalCapacity: [
    "Trajectoire de dette soutenable et accès au financement préservé.",
    "Charge d'intérêts croissante et espace budgétaire réduit.",
  ],
  externalResilience: [
    "Réserves adéquates et compte courant financé par des flux stables.",
    "Besoin de financement externe élevé au regard des réserves disponibles.",
  ],
  politicalInstitutionalQuality: [
    "Cadre institutionnel prévisible, politique économique lisible.",
    "Incertitude institutionnelle et risque d'exécution des réformes.",
  ],
  structuralOpportunity: [
    "Moteurs structurels porteurs : démographie, investissement, montée en valeur.",
    "Diversification limitée, dépendance à un nombre restreint de secteurs.",
  ],
  marketAttractiveness: [
    "Valorisations attractives et liquidité de marché en amélioration.",
    "Profondeur de marché limitée et prime de risque élevée.",
  ],
};

/** Seuils de révision, formulés comme les déclencheurs de la maquette. */
const TRIGGERS: Record<PillarKey, [string, string]> = {
  macroStrength: [
    "Croissance du PIB réel durablement au-dessus de 5% sur 4 trimestres",
    "Croissance du PIB réel sous 2% pendant deux trimestres consécutifs",
  ],
  macroResilience: [
    "Score de risque composite ramené sous 35/100",
    "Score de risque composite au-dessus de 65/100",
  ],
  fiscalCapacity: [
    "Déficit budgétaire ramené sous 3% du PIB",
    "Dette publique au-dessus de 70% du PIB",
  ],
  externalResilience: [
    "Réserves de change portées au-delà de 5 mois d'importations",
    "Réserves de change sous 3 mois d'importations",
  ],
  politicalInstitutionalQuality: [
    "Mise en œuvre effective du programme de réformes annoncé",
    "Rupture du cadre de politique économique ou instabilité prolongée",
  ],
  structuralOpportunity: [
    "Concrétisation des investissements structurants annoncés",
    "Report ou annulation des grands projets d'investissement",
  ],
  marketAttractiveness: [
    "Compression durable du spread souverain sous 300 bps",
    "Écartement du spread souverain au-delà de 700 bps",
  ],
};

function buildRating(country: Country, regime: MacroRegime): CountryRating {
  const pillars: PillarScore[] = PILLAR_ORDER.map((key) => {
    const jitter = (hash01(`${country.code}:${key}`) - 0.5) * 1.2;
    const score = clamp10(pillarBase(key, regime, country) + jitter);
    // La variation depuis la revue precedente doit **aller dans le sens du
    // momentum**. Tiree d'un hash seul, elle pouvait afficher « +1 » a cote
    // d'un outlook negatif, sur la meme carte.
    // Les plages ne se recouvrent pas : a « Stable » correspond au plus un
    // point de score, a « Improving » au moins un. Sans cette separation, une
    // carte pouvait afficher « Stable » a cote de « +3 ».
    const drift =
      regime.momentum === "Improving" ? 0.26 : regime.momentum === "Deteriorating" ? -0.26 : 0;
    const vsPrior =
      Math.round(((hash01(`${country.code}:${key}:prior`) - 0.5) * 0.24 + drift) * 100) / 100;
    return {
      key,
      label: PILLAR_LABELS[key],
      score,
      vsPrior,
      percentile: Math.max(1, Math.min(99, Math.round(score * 9.4))),
    };
  });

  const composite =
    Math.round(pillars.reduce((sum, p) => sum + p.score * PILLAR_WEIGHTS[p.key], 0) * 10) / 10;

  const byScore = [...pillars].sort((a, b) => b.score - a.score);
  const average = pillars.reduce((s, p) => s + p.score, 0) / pillars.length;

  return {
    countryCode: country.code,
    compositeScore: composite,
    outlook: OUTLOOK_BY_MOMENTUM[regime.momentum],
    watchStatus: WATCH_BY_STATUS[country.status],
    confidence: regime.confidence,
    rank: 0, // renseigné après tri de l'univers
    universe: 208,
    changeSincePrior:
      Math.round(pillars.reduce((s, p) => s + p.vsPrior * PILLAR_WEIGHTS[p.key], 0) * 100) / 100,
    reviewDate: DATA_AS_OF,
    pillars,
    positiveDrivers: byScore.slice(0, 3).map((p) => ({
      label: p.label,
      impact: Math.round((p.score - average) * 100) / 100,
      rationale: RATIONALE[p.key][0],
    })),
    negativeDrivers: byScore
      .slice(-3)
      .reverse()
      .map((p) => ({
        label: p.label,
        impact: Math.round((p.score - average) * 100) / 100,
        rationale: RATIONALE[p.key][1],
      })),
    upgradeTriggers: byScore.slice(-3).map((p) => TRIGGERS[p.key][0]),
    downgradeTriggers: byScore.slice(0, 3).map((p) => TRIGGERS[p.key][1]),
  };
}

export const STATIC_RATINGS: CountryRating[] = (() => {
  const ratings = STATIC_COUNTRIES.map((country) => {
    return buildRating(country, getRegime(country.code));
  });

  // Le rang se lit dans l'univers complet : on classe les 16 pays connus, puis
  // on projette leur position sur les 208 pays annoncés par la maquette.
  const ordered = [...ratings].sort((a, b) => b.compositeScore - a.compositeScore);
  ordered.forEach((rating, index) => {
    rating.rank = Math.max(1, Math.round(((index + 0.5) / ordered.length) * 208));
  });

  return ratings;
})();

/**
 * Regime d'un pays. Leve si le pays n'en a pas : rendre celui du premier de la
 * liste a deja donne la notation des Etats-Unis a cinq pays d'Afrique de
 * l'Ouest, sans un mot en console.
 */
export function getRegime(countryCode: string): MacroRegime {
  const regime = STATIC_REGIMES.find((r) => r.countryCode === countryCode);
  if (!regime) {
    throw new Error(`Aucun regime pour ${countryCode} : ajoutez-le a REGIME_SEEDS.`);
  }
  return regime;
}

export function getRating(countryCode: string): CountryRating {
  return STATIC_RATINGS.find((r) => r.countryCode === countryCode) ?? STATIC_RATINGS[0];
}
