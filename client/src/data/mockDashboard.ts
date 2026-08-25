/**
 * Données de démonstration du Dashboard Global Overview.
 *
 * ⚠️ Ces données sont ILLUSTRATIVES — en attente des données dynamiques
 * fournies par la couche backend / pipeline ETL (gouvernance §H).
 * Toute valeur affichée doit être remplacée par la donnée gouvernée réelle.
 */

/* ================= Range 1 — Headline KPIs ================= */

export interface IndicatorKpi {
  id: string;
  label: string;
  value: string;
  unit?: string;
  /** Sous-titre affiché sous le libellé (ex: "GDP · Real") */
  subtitle?: string;
  /** Unité du delta (ex: "pp", "bps", "pts") */
  deltaUnit?: string;
  /** Date/point de comparaison du footer (ex: "Apr 2025") */
  comparisonDate?: string;
  period: string;      // ex: "vs Apr 2025"
  delta: number;       // variation vs baseline
  spark: number[];     // série pour le mini graphique
  icon: "growth" | "inflation" | "rate" | "risk";
}

export const globalKpis: IndicatorKpi[] = [
  {
    id: "growth",
    label: "Global Growth",
    value: "3.1",
    unit: "%",
    subtitle: "GDP · Real",
    delta: 0.4,
    deltaUnit: "pp",
    comparisonDate: "Apr 2025",
    period: "2026F",
    spark: [2.1, 2.4, 2.6, 2.8, 2.9, 3.0, 3.1],
    icon: "growth",
  },
  {
    id: "inflation",
    label: "Global Inflation",
    value: "3.8",
    unit: "%",
    subtitle: "CPI · YoY",
    delta: -0.3,
    deltaUnit: "pp",
    comparisonDate: "Apr 2025",
    period: "2026F",
    spark: [5.1, 4.8, 4.5, 4.3, 4.1, 3.9, 3.8],
    icon: "inflation",
  },
  {
    id: "rate",
    label: "Global Policy Rate",
    value: "4.25",
    unit: "%",
    subtitle: "Central banks",
    delta: -0.25,
    deltaUnit: "bps",
    comparisonDate: "Apr 2025",
    period: "2026F",
    spark: [5.5, 5.25, 5.0, 4.75, 4.5, 4.25, 4.25],
    icon: "rate",
  },
  {
    id: "risk",
    label: "Global Risk Index",
    value: "52",
    unit: "/100",
    subtitle: "Composite",
    delta: 3,
    deltaUnit: "pts",
    comparisonDate: "Apr 2025",
    period: "2026F",
    spark: [41, 44, 47, 49, 50, 51, 52],
    icon: "risk",
  },
];

export const houseView = {
  title: "SIG House View",
  status: "Risk-on",
  conviction: "High conviction",
  horizon: "12M",
  summary:
    "Momentum global reste résilient grâce à la normalisation de l'inflation et des conditions financières attendues plus souples. Les risques de refinancement se concentrent sur les EM, avec des opportunités sélectives en UEMOA.",
  linkLabel: "View full house view →",
};

/* ================= Range 2 — Regime Map & Region Snapshot ================= */

export interface RiskLegend {
  label: string;
  level: "Low" | "Moderate" | "Elevated" | "High";
  hex: string;
}

export const riskLegend: RiskLegend[] = [
  { label: "Positive / Low Risk", level: "Low", hex: "#22C55E" },
  { label: "Stable / Moderate", level: "Moderate", hex: "#3B82F6" },
  { label: "Fragile / Elevated", level: "Elevated", hex: "#F59E0B" },
  { label: "High Risk", level: "High", hex: "#EF4444" },
];

export interface RegionSnapshot {
  region: string;
  regime: string;
  status: "Positive" | "Stable" | "Watch" | "Negative";
  riskScore: number;  // 0-100
  delta: number;      // changement vs revue précédente
}

export const regionSnapshots: RegionSnapshot[] = [
  { region: "UEMOA", regime: "Recovery", status: "Positive", riskScore: 32, delta: -3 },
  { region: "Africa ex-UEMOA", regime: "Transition", status: "Stable", riskScore: 48, delta: +1 },
  { region: "Europe", regime: "Expansion", status: "Positive", riskScore: 28, delta: -1 },
  { region: "US", regime: "Expansion", status: "Positive", riskScore: 24, delta: -2 },
  { region: "Asia ex-Japan", regime: "Recovery", status: "Stable", riskScore: 40, delta: 0 },
  { region: "Latin America", regime: "Stress", status: "Watch", riskScore: 58, delta: +4 },
];

/* ================= Range 3 — Top Movers / Watchlist ================= */

export interface CountryMover {
  code: string;
  name: string;
  flag: string;
  score: number;         // 0-100 SIG Notation
  delta: number;         // variation du score (+5 / -3)
  status: "Improving" | "Deteriorating" | "Stable";
  spark: number[];
}

export const topMovers: CountryMover[] = [
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", score: 72, delta: 5, status: "Improving", spark: [52, 55, 58, 62, 65, 68, 72] },
  { code: "SN", name: "Senegal", flag: "🇸🇳", score: 63, delta: -3, status: "Deteriorating", spark: [74, 72, 70, 68, 66, 64, 63] },
  { code: "BJ", name: "Benin", flag: "🇧🇯", score: 60, delta: 2, status: "Improving", spark: [52, 54, 55, 56, 58, 59, 60] },
  { code: "GH", name: "Ghana", flag: "🇬🇭", score: 58, delta: 0, status: "Stable", spark: [59, 58, 58, 59, 58, 58, 58] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", score: 38, delta: -4, status: "Deteriorating", spark: [46, 44, 43, 42, 40, 39, 38] },
  { code: "US", name: "United States", flag: "🇺🇸", score: 78, delta: 1, status: "Stable", spark: [75, 76, 76, 77, 77, 78, 78] },
];

export const watchlist: CountryMover[] = topMovers;

/* ================= Range 4 — What Changed & Country Screener ================= */

export interface ChangeLog {
  date: string;
  entity: string;
  type: string;
  change: string;
  impact: "Positive" | "Negative" | "Neutral";
}

export const whatChanged: ChangeLog[] = [
  { date: "2026-07-18", entity: "Nigeria", type: "Notation", change: "Score 42 → 38 · risque élevé aggravé", impact: "Negative" },
  { date: "2026-07-16", entity: "Burkina Faso", type: "Regime", change: "Transition → détérioration", impact: "Negative" },
  { date: "2026-07-14", entity: "Côte d'Ivoire", type: "Forecast", change: "PIB 5.4% → 5.8% (révision haussière)", impact: "Positive" },
  { date: "2026-07-11", entity: "Benin", type: "Forecast", change: "Déficit budgétaire < 3% confirmé", impact: "Positive" },
  { date: "2026-07-09", entity: "Latin America", type: "Regime", change: "Pression de refinancement accrue", impact: "Negative" },
];

export interface ScreenerRow {
  country: string;
  code: string;        // code pays ISO pour drapeau SVG
  regime: string;
  risk: "Low" | "Medium" | "High";
  growth: number;      // prévision PIB
  inflation: number;
  external: number;    // solde extérieur (% PIB)
  trend: "Improving" | "Deteriorating" | "Stable";
}

export const screenerRows: ScreenerRow[] = [
  { country: "Côte d'Ivoire", code: "CI", regime: "Recovery", risk: "Low", growth: 5.8, inflation: 3.2, external: 1.4, trend: "Improving" },
  { country: "Senegal", code: "SN", regime: "Transition", risk: "Medium", growth: 4.5, inflation: 4.1, external: -0.8, trend: "Deteriorating" },
  { country: "Benin", code: "BJ", regime: "Recovery", risk: "Low", growth: 5.2, inflation: 2.9, external: 0.6, trend: "Improving" },
  { country: "Ghana", code: "GH", regime: "Recovery", risk: "Medium", growth: 4.0, inflation: 6.8, external: -1.2, trend: "Stable" },
  { country: "Nigeria", code: "NG", regime: "Stress", risk: "High", growth: 1.8, inflation: 9.2, external: -3.1, trend: "Deteriorating" },
  { country: "United States", code: "US", regime: "Expansion", risk: "Low", growth: 2.3, inflation: 2.9, external: 1.1, trend: "Stable" },
];
