/**
 * Contrat de types du SIG Global Macro Tracker.
 *
 * Aligne sur les 10 modules specifies par l'equipe backend
 * (`SIG Tracker Module BackEnd.pdf`, valide le 2026-09-30). Ce fichier ne
 * decrit plus une base locale : il decrit la forme des donnees que l'API
 * renverra, afin que le branchement se limite a remplacer la source.
 *
 * Les codes pays suivent l'ISO 3166-1 alpha-3.
 */

export type IsoAlpha3 = string;

/** Periode d'observation : "2026", "2026Q2" ou "2026-07". */
export type Period = string;

/* =========================================================================
 * Module 1 — Countries
 * ========================================================================= */

export type CountryStatus = "stable" | "watch" | "risk";

export interface Country {
  code: IsoAlpha3;
  name: string;
  region: string;
  subregion: string | null;
  incomeLevel: string | null;
  currency: string | null;
  flagUrl: string | null;
  /** Vrai pour les agregats (zone euro, UEMOA...), qui ne sont pas des pays. */
  isAggregate: boolean;
  /** Statut de surveillance SIG — jugement editorial, pas une donnee source. */
  status: CountryStatus;
  lastUpdated: Date | null;
}

/* =========================================================================
 * Module 2 — Macro Indicators (catalogue)
 * ========================================================================= */

export type IndicatorCategory =
  | "Growth"
  | "Inflation"
  | "Fiscal"
  | "External"
  | "Markets"
  | "Labour";

export type Frequency = "Annual" | "Quarterly" | "Monthly";

export interface MacroIndicator {
  /** Code stable du catalogue : `real_gdp_growth`, `cpi_inflation`... */
  code: string;
  name: string;
  description: string | null;
  category: IndicatorCategory;
  unit: string;
  frequency: Frequency;
  source: string;
  isSeasonallyAdjusted: boolean;
  coverageStart: Period | null;
  coverageEnd: Period | null;
}

/* =========================================================================
 * Module 3 — Macro Data (observations millesimees)
 * ========================================================================= */

export type ChangeDirection = "up" | "down" | "stable";

export interface MacroObservation {
  countryCode: IsoAlpha3;
  indicatorCode: string;
  period: Period;
  /** Equivalent `Date` de `period`, pour le tri et les axes de graphiques. */
  date: Date;
  value: number;
  previousValue: number | null;
  change: number | null;
  changeDirection: ChangeDirection | null;
  /**
   * Millesime : date a laquelle cette valeur a ete publiee. Deux observations
   * peuvent partager `period` et differer par `vintageDate` — c'est ce qui
   * permet l'historique des revisions du Data Explorer.
   */
  vintageDate: string;
  releaseDate: string;
  isForecast: boolean;
  source: string;
  unit: string;
}

/* =========================================================================
 * Module 4 — Macro Regimes
 * ========================================================================= */

export type RegimeLabel =
  | "Goldilocks"
  | "Boom"
  | "Recession"
  | "Stagflation"
  | "Recovery"
  | "Expansion"
  | "Transition";

export type Momentum = "Improving" | "Stable" | "Deteriorating";
export type PolicyStance = "Accommodative" | "Neutral" | "Tight";
export type RiskLevel = "low" | "medium" | "high";

export interface MacroRegime {
  countryCode: IsoAlpha3;
  regime: RegimeLabel;
  momentum: Momentum;
  /** Confiance du modele, 0-100. */
  confidence: number;
  /** Score de risque, 0-100 : plus haut = plus risque. */
  riskScore: number;
  growthScore: number;
  inflationScore: number;
  policyStance: PolicyStance;
  riskLevel: RiskLevel;
  /** Palier lisible derive de `inflationScore`. */
  inflationLevel: "high" | "moderate" | "low";
  /** Palier lisible derive de `growthScore`. */
  gdpGrowthLevel: "strong" | "stable" | "slow" | "negative";
  period: Period;
  validFrom: Date;
  validTo: Date | null;
  lastUpdated: Date | null;
}

/* =========================================================================
 * Module 5 — Country Ratings
 * ========================================================================= */

export type PillarKey =
  | "macroStrength"
  | "macroResilience"
  | "fiscalCapacity"
  | "externalResilience"
  | "politicalInstitutionalQuality"
  | "structuralOpportunity"
  | "marketAttractiveness";

export interface PillarScore {
  key: PillarKey;
  label: string;
  /** Score sur 10, comme les maquettes. */
  score: number;
  vsPrior: number;
  percentile: number;
}

export interface RatingDriver {
  label: string;
  impact: number;
  rationale: string;
}

export interface CountryRating {
  countryCode: IsoAlpha3;
  /** Score composite sur 10 (equivaut au /100 de la page Compare). */
  compositeScore: number;
  outlook: "Positive" | "Stable" | "Negative";
  watchStatus: string | null;
  confidence: number;
  rank: number;
  universe: number;
  changeSincePrior: number;
  reviewDate: Date;
  pillars: PillarScore[];
  positiveDrivers: RatingDriver[];
  negativeDrivers: RatingDriver[];
  upgradeTriggers: string[];
  downgradeTriggers: string[];
}

/* =========================================================================
 * Module 9 — Events & Calendar
 * ========================================================================= */

export type EventImpact = "low" | "medium" | "high";

export interface EconomicEvent {
  id: string;
  title: string;
  countryCode: IsoAlpha3;
  eventDate: Date;
  impact: EventImpact;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  unit: string | null;
}

/* =========================================================================
 * Module 11 — Themes
 *
 * Specifie par `Tracker Section Theme Explore SIG.pdf` (valide le 2026-10-01).
 * Un theme est un regroupement **transversal** d'indicateurs, de pays et de
 * signaux autour d'un sujet d'analyse : ni un pays, ni un indicateur isole.
 *
 * Attention au contrat de transport : contrairement aux modules 1 a 10 qui
 * renvoient des enregistrements Prisma bruts, les routes `/themes` enveloppent
 * la charge utile dans `{ success, data }`. Le client devra deballer.
 * ========================================================================= */

export interface Theme {
  /** Code stable : `inflation_prices`, `monetary_policy`... */
  code: string;
  name: string;
  description: string | null;
  /** Nom d'icone fourni par le backend (`flame`, `landmark`...). */
  icon: string | null;
  /** Couleur d'accent hexadecimale. */
  color: string | null;
  displayOrder: number;
  isActive: boolean;
  countryCount: number;
  indicatorCount: number;
  activeSignals: number;
}

export type ThemeTrend = "improving" | "stable" | "deteriorating";

/** Vue agregee d'un theme — `GET /themes/:code/snapshot`. */
export interface ThemeSnapshot extends Theme {
  /** Score moyen du theme sur l'ensemble des pays concernes, 0-100. */
  averageScore: number;
  trend: ThemeTrend;
}

export type ThemeSignalType = "threshold_breach" | "trend_change" | "regime_shift";
export type ThemeSignalSeverity = "critical" | "high" | "medium" | "low";

/** Signal rattache a un theme — `GET /themes/:code/signals`. */
export interface ThemeSignal {
  id: string;
  themeCode: string;
  signalType: ThemeSignalType;
  severity: ThemeSignalSeverity;
  countryCode: IsoAlpha3 | null;
  countryName: string | null;
  message: string;
  triggeredAt: string;
  isActive: boolean;
}

/** Lien theme <-> indicateur, avec sa ponderation. */
export interface ThemeIndicatorLink {
  indicatorCode: string;
  weight: number;
  displayOrder: number;
}

/* =========================================================================
 * Alertes SIG — signal editorial, sans module backend dedie
 * ========================================================================= */

export type AlertType = "info" | "warning" | "positive";

export interface EconomicAlert {
  id: number;
  title: string;
  description: string;
  alertType: AlertType;
  iconClass: string;
  createdAt: Date | null;
}
