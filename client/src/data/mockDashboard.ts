/**
 * Données de démonstration du Dashboard Global Overview.
 *
 * ⚠️ Ces données sont ILLUSTRATIVES — en attente des données dynamiques
 * fournies par la couche backend / pipeline ETL (gouvernance §H).
 * Toute valeur affichée doit être remplacée par la donnée gouvernée réelle.
 */

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: number;         // variation en % (positive ou négative)
  deltaLabel: string;    // ex: "+0.4 pp vs revue"
  source: string;
  period: string;
  trend: "up" | "down" | "neutral";
}

export const globalKpis: KpiCard[] = [
  {
    id: "growth",
    label: "Global Growth",
    value: "3.1",
    unit: "%",
    delta: 0.4,
    deltaLabel: "+0.4 pp vs revue",
    source: "SIG · consensus",
    period: "2026f",
    trend: "up",
  },
  {
    id: "inflation",
    label: "Global Inflation",
    value: "3.8",
    unit: "%",
    delta: -0.3,
    deltaLabel: "-0.3 pp vs revue",
    source: "SIG · consensus",
    period: "2026f",
    trend: "down",
  },
  {
    id: "policy",
    label: "Global Policy Rate",
    value: "4.25",
    unit: "%",
    delta: -0.25,
    deltaLabel: "-25 bps vs revue",
    source: "Central banks",
    period: "2026f",
    trend: "down",
  },
  {
    id: "risk",
    label: "Global Risk Index",
    value: "52",
    unit: "/100",
    delta: 3,
    deltaLabel: "+3 pts vs revue",
    source: "SIG Notation",
    period: "As of Jul 2026",
    trend: "up",
  },
  {
    id: "house",
    label: "SIG House View",
    value: "Risk-on",
    unit: "",
    delta: 0,
    deltaLabel: "Neutre / progressive",
    source: "SIG Research",
    period: "Jul 2026",
    trend: "neutral",
  },
];

export interface RegionSnapshot {
  region: string;
  regime: string;
  outlook: "Positive" | "Stable" | "Watch" | "Negative";
  riskLevel: "Low" | "Medium" | "High";
  momentum: number; // 0-100
  changed: string;
}

export const regionSnapshots: RegionSnapshot[] = [
  { region: "UEMOA", regime: "Recovery", outlook: "Positive", riskLevel: "Medium", momentum: 68, changed: "+2" },
  { region: "West Africa", regime: "Transition", outlook: "Stable", riskLevel: "Medium", momentum: 55, changed: "0" },
  { region: "North Africa", regime: "Recovery", outlook: "Stable", riskLevel: "Medium", momentum: 52, changed: "-1" },
  { region: "Global DM", regime: "Expansion", outlook: "Positive", riskLevel: "Low", momentum: 71, changed: "+1" },
  { region: "Global EM", regime: "Recovery", outlook: "Watch", riskLevel: "High", momentum: 47, changed: "-2" },
];

export interface CountryMover {
  code: string;
  name: string;
  flag: string;        // emoji drapeau illustratif
  score: number;       // 0-100 (sig Notation)
  deltaScore: number;  // variation du score
  risk: "Low" | "Medium" | "High";
  spark: number[];     // série sparkline
}

export const topMovers: CountryMover[] = [
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", score: 72, deltaScore: +4, risk: "Low", spark: [50, 55, 58, 60, 64, 68, 72] },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", score: 63, deltaScore: -2, risk: "Medium", spark: [70, 68, 67, 66, 65, 63, 62] },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", score: 41, deltaScore: +5, risk: "High", spark: [30, 33, 35, 36, 39, 41, 46] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", score: 38, deltaScore: -4, risk: "High", spark: [55, 50, 47, 44, 42, 40, 38] },
  { code: "US", name: "United States", flag: "🇺🇸", score: 78, deltaScore: +1, risk: "Low", spark: [72, 73, 74, 76, 77, 77, 78] },
  { code: "EU", name: "Euro Area", flag: "🇪🇺", score: 66, deltaScore: 0, risk: "Medium", spark: [70, 68, 67, 66, 66, 66, 66] },
];

export const watchlist: CountryMover[] = topMovers.slice(0, 4);

export interface ChangeLog {
  date: string;
  entity: string;
  type: string;
  change: string;
}

export const whatChanged: ChangeLog[] = [
  { date: "2026-07-18", entity: "Nigeria", type: "Notation", change: "Score 42 → 38 · risque élevé aggravé" },
  { date: "2026-07-16", entity: "Burkina Faso", type: "Regime", change: "Transition → détérioration" },
  { date: "2026-07-14", entity: "Côte d'Ivoire", type: "Forecast", change: "PIB 5.4% → 5.8% (révision haussière)" },
  { date: "2026-07-11", entity: "UEMOA", type: "Policy", change: "Taux directeur maintenu à 4.25%" },
];

export interface ScreenerRow {
  country: string;
  flag: string;
  regime: string;
  risk: "Low" | "Medium" | "High";
  growth: number;
  inflation: number;
  score: number;
}

export const screenerRows: ScreenerRow[] = [
  { country: "Côte d'Ivoire", flag: "🇨🇮", regime: "Recovery", risk: "Low", growth: 5.8, inflation: 3.2, score: 72 },
  { country: "Sénégal", flag: "🇸🇳", regime: "Transition", risk: "Medium", growth: 4.5, inflation: 4.1, score: 63 },
  { country: "Ghana", flag: "🇬🇭", regime: "Recovery", risk: "Medium", growth: 4.0, inflation: 6.8, score: 58 },
  { country: "Burkina Faso", flag: "🇧🇫", regime: "Deterioration", risk: "High", growth: 2.1, inflation: 5.6, score: 41 },
  { country: "Nigeria", flag: "🇳🇬", regime: "Stress", risk: "High", growth: 1.8, inflation: 9.2, score: 38 },
  { country: "United States", flag: "🇺🇸", regime: "Expansion", risk: "Low", growth: 2.3, inflation: 2.9, score: 78 },
];
