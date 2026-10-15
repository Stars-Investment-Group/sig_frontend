/**
 * Données de démonstration du Dashboard Global Overview.
 *
 * ⚠️ Ces données sont ILLUSTRATIVES — en attente des données dynamiques
 * fournies par la couche backend / pipeline ETL (gouvernance §H).
 * Toute valeur affichée doit être remplacée par la donnée gouvernée réelle.
 */

import {
  STATIC_COUNTRIES,
  STATIC_REGIMES,
  getRating,
  getRegime,
  getStaticHistory,
} from "@/data/mockData";

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
  /** Precision entre parentheses apres le libelle (ex: "2026F", "Weighted Avg."). */
  qualifier?: string;
  /** Qualificatif affiche apres la valeur, en petit (ex: "YoY"). */
  valueSuffix?: string;
  period: string;      // ex: "vs Apr 2025"
  delta: number;       // variation vs baseline
  spark: number[];     // série pour le mini graphique
  icon: "growth" | "inflation" | "rate" | "risk";
}

export const globalKpis: IndicatorKpi[] = [
  {
    id: "growth",
    qualifier: "2026F",
    valueSuffix: "YoY",
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
    qualifier: "2026F",
    valueSuffix: "YoY",
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
    qualifier: "Weighted Avg.",
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
  { region: "USA", regime: "Expansion", status: "Positive", riskScore: 24, delta: -2 },
  { region: "Asia ex-Japan", regime: "Recovery", status: "Stable", riskScore: 40, delta: 0 },
  { region: "Latin America", regime: "Stress", status: "Watch", riskScore: 58, delta: +4 },
];

/* ================= Range 3 — Top Movers / Watchlist ================= */

export interface CountryMover {
  code: string;
  name: string;
  /** Bloc regional affiche sous le nom, comme dans la maquette. */
  region: string;
  score: number;         // 0-100 SIG Notation
  delta: number;         // variation du score (+5 / -3)
  status: "Improving" | "Deteriorating" | "Stable";
  spark: number[];
}

/**
 * Les six plus forts mouvements de notation, **calcules** sur l'univers.
 *
 * Les six lignes etaient ecrites a la main et donnaient la Cote d'Ivoire a
 * 72/100 avec +5, quand la notation derivee la place a 65 avec +2. La carte
 * « Top Movers » de l'accueil contredisait ainsi le screener, la liste de
 * suivi et la fiche pays, toutes visibles au meme moment.
 *
 * Un mouvement se mesure sur la variation depuis la revue precedente, pas sur
 * le niveau : un pays stable en tete de classement n'a rien a faire ici.
 */
export const topMovers: CountryMover[] = STATIC_COUNTRIES.map((country) => {
  const rating = getRating(country.code);
  const regime = STATIC_REGIMES.find((r) => r.countryCode === country.code);
  const history = getStaticHistory(country.code, "real_gdp_growth").slice(-7);
  return {
    code: country.code,
    name: country.name,
    region: country.region,
    score: Math.round(rating.compositeScore * 10),
    delta: Math.round(rating.changeSincePrior * 10),
    status: (regime?.momentum ?? "Stable") as CountryMover["status"],
    spark: history.map((o) => o.value),
  };
})
  .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  .slice(0, 6);


/* ================= Range 4 — What Changed & Country Screener ================= */

export interface ChangeLog {
  date: string;
  /** Pays ou region concerne. */
  entity: string;
  /** Code ISO alpha-3 pour le drapeau ; absent pour une region. */
  code?: string;
  /** Indicateur revise, colonne "Indicator" de la maquette. */
  indicator: string;
  /** Variation signee, dans l'unite de l'indicateur. `null` quand elle n'a pas de sens. */
  change: number | null;
  /** Unite de la variation : "pp", "pts"... */
  changeUnit?: string;
  /** Nouvelle valeur, deja formatee (l'echelle varie d'une ligne a l'autre). */
  newValue: string;
  /** Valeur precedente, formatee. */
  prevValue: string;
  impact: "Positive" | "Negative" | "Neutral";
  /** Commentaire analyste, colonne "Note". */
  note: string;
}

/**
 * Les revisions de la derniere mise a jour.
 *
 * La note est redactionnelle, **les chiffres sont lus sur les series**. La
 * table annoncait le Nigeria a 3,1 % de croissance pour 2,4 % constates, la
 * France a 1,4 % d'inflation pour 2,6 %, et l'Afrique du Sud a 56/100 de
 * risque pour 71. Le Screener, deux cartes plus bas sur la meme page, disait
 * autre chose.
 */
const CHANGE_SEEDS: {
  date: string;
  entity: string;
  code?: string;
  indicator: string;
  series?: { code: string; indicator: string };
  changeUnit?: string;
  newValue?: string;
  prevValue?: string;
  impact: ChangeLog["impact"];
  note: string;
}[] = [
  {
    date: "2026-07-18",
    entity: "Nigeria",
    code: "NGA",
    indicator: "Croissance 2026F",
    series: { code: "NGA", indicator: "real_gdp_growth" },
    changeUnit: "pp",
    impact: "Positive",
    note: "Production petroliere en hausse ; stabilite du change qui s'ameliore",
  },
  {
    date: "2026-07-16",
    entity: "France",
    code: "FRA",
    indicator: "Inflation 2026F",
    series: { code: "FRA", indicator: "cpi_inflation" },
    changeUnit: "pp",
    impact: "Positive",
    note: "Effets de base energie ; services en deceleration",
  },
  {
    date: "2026-07-14",
    entity: "Bresil",
    code: "BRA",
    indicator: "Balance externe",
    series: { code: "BRA", indicator: "current_account" },
    changeUnit: "pp",
    impact: "Negative",
    note: "Importations en hausse ; termes de l'echange moins porteurs",
  },
  {
    date: "2026-07-11",
    entity: "UEMOA",
    indicator: "Orientation monetaire",
    newValue: "Neutre",
    prevValue: "Restrictive",
    impact: "Positive",
    note: "Taux reels qui se detendent avec la desinflation",
  },
  {
    date: "2026-07-09",
    entity: "Afrique du Sud",
    code: "ZAF",
    indicator: "Score de risque",
    changeUnit: "pts",
    impact: "Negative",
    note: "Pression sur le change ; risque d'execution budgetaire",
  },
];

export const whatChanged: ChangeLog[] = CHANGE_SEEDS.map((seed) => {
  // Le score de risque ne vient pas d'une serie mais du module 4.
  if (seed.indicator === "Score de risque" && seed.code) {
    const score = getRegime(seed.code).riskScore;
    return {
      date: seed.date,
      entity: seed.entity,
      code: seed.code,
      indicator: seed.indicator,
      change: 4,
      changeUnit: seed.changeUnit,
      newValue: `${score}/100`,
      prevValue: `${score - 4}/100`,
      impact: seed.impact,
      note: seed.note,
    };
  }
  if (!seed.series) {
    return {
      date: seed.date,
      entity: seed.entity,
      code: seed.code,
      indicator: seed.indicator,
      change: null,
      changeUnit: seed.changeUnit,
      newValue: seed.newValue ?? "—",
      prevValue: seed.prevValue ?? "—",
      impact: seed.impact,
      note: seed.note,
    };
  }
  const history = getStaticHistory(seed.series.code, seed.series.indicator);
  const last = history[history.length - 1]?.value ?? 0;
  const previous = history[history.length - 4]?.value ?? last;
  return {
    date: seed.date,
    entity: seed.entity,
    code: seed.code,
    indicator: seed.indicator,
    change: Math.round((last - previous) * 10) / 10,
    changeUnit: seed.changeUnit,
    newValue: `${last.toFixed(1)}%`,
    prevValue: `${previous.toFixed(1)}%`,
    impact: seed.impact,
    note: seed.note,
  };
});

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


/* ================= Range 5 — Regional Regime Matrix ================= */

/**
 * Matrice regionale des scores de risque, 0 a 100.
 *
 * La maquette affiche des **nombres** dans des cellules colorees, pas des
 * pastilles : l'ecart entre 32 et 58 se lit, ce qu'une teinte seule ne donne
 * pas. L'echelle est un risque, donc **une valeur basse est favorable**.
 *
 * La colonne Overall n'est pas saisie : elle est **reprise de
 * `regionSnapshots`**. Les deux blocs sont cote a cote a l'ecran ; les laisser
 * diverger afficherait deux scores de risque differents pour la meme region.
 */
export interface RegimeMatrixRow {
  region: string;
  /** Score d'ensemble, repris de la vue regionale. */
  overall: number;
  growth: number;
  inflation: number;
  external: number;
  fiscal: number;
  policy: number;
}

/** Sous-scores par region ; l'ensemble vient de `regionSnapshots`. */
const MATRIX_SUBSCORES: Record<string, Omit<RegimeMatrixRow, "region" | "overall">> = {
  UEMOA: { growth: 30, inflation: 38, external: 30, fiscal: 34, policy: 28 },
  "Africa ex-UEMOA": { growth: 52, inflation: 55, external: 46, fiscal: 50, policy: 42 },
  Europe: { growth: 32, inflation: 26, external: 24, fiscal: 30, policy: 28 },
  USA: { growth: 20, inflation: 28, external: 26, fiscal: 30, policy: 22 },
  "Asia ex-Japan": { growth: 36, inflation: 38, external: 42, fiscal: 44, policy: 40 },
  "Latin America": { growth: 56, inflation: 64, external: 60, fiscal: 58, policy: 52 },
};

export const regimeMatrixRows: RegimeMatrixRow[] = regionSnapshots.map((r) => ({
  region: r.region,
  overall: r.riskScore,
  ...(MATRIX_SUBSCORES[r.region] ?? {
    growth: r.riskScore,
    inflation: r.riskScore,
    external: r.riskScore,
    fiscal: r.riskScore,
    policy: r.riskScore,
  }),
}));


/* ================= Range 5 — Upcoming Events ================= */

export interface ConfidenceSlice {
  label: string;      // ex: "High Confidence"
  value: number;      // % ex: 68
  color: string;      // hex
}

export const confidenceSlices: ConfidenceSlice[] = [
  { label: "High Confidence", value: 68, color: "#16A34A" },
  { label: "Medium Confidence", value: 18, color: "#F59E0B" },
  { label: "Low Confidence", value: 6, color: "#EF4444" },
  { label: "No Data", value: 8, color: "#CBD5E1" },
];

/* ================= Pied de Dashboard — How to Use ================= */

export interface GuideFeature {
  icon: "screener" | "movers" | "events" | "confidence";
  title: string;
  text: string;
}

export const guideFeatures: GuideFeature[] = [
  { icon: "screener", title: "Filtrer les pays", text: "Utilisez le Country Screener pour trier par régime, risque et indicateurs clés." },
  { icon: "movers", title: "Suivre les mouvements", text: "Surveillez les Top Movers et les changements récents de notation chaque semaine." },
  { icon: "events", title: "Anticiper les événements", text: "Consultez le calendrier des publications et décisions de politique monétaire (30 jours)." },
  { icon: "confidence", title: "Évaluer la confiance", text: "La jauge de confiance indique la fiabilité des données pour chaque indicateur." },
];

/* ================= Regions — Blocs macroéconomiques (cartes) ================= */

export type BlockRegime = "recovery" | "transition" | "fragile";

export interface RegionBlock {
  id: string;
  name: string;        // ex: "UEMOA"
  count: number;       // nb de pays
  regime: BlockRegime; // régime dominant
  growth: number;      // score agrégé 0-100
  inflation: number;
  fiscal: number;
  risk: number;
  event: string;       // alerte / événement majeur
}

/**
 * Rattachement d'un pays a son bloc d'affichage.
 *
 * Les regions du contrat (`Country.region`) sont « UEMOA », « Africa »,
 * « Europe », « Americas », « Asia » ; la page Regions raisonne par blocs.
 * C'est la seule traduction entre les deux, et elle vit ici pour qu'aucune
 * page n'en invente une autre : la table precedente classait l'Afrique du Sud
 * en APAC.
 */
const BLOCK_OF_REGION: Record<string, RegionFilter> = {
  UEMOA: "uemoa",
  Africa: "africa",
  Europe: "emea",
  Americas: "americas",
  Asia: "apac",
};

const BLOCK_NAMES: { id: RegionFilter; name: string; event: string }[] = [
  {
    id: "uemoa",
    name: "UEMOA",
    event: "Décision de politique monétaire BCEAO attendue le 03/08/2026.",
  },
  {
    id: "africa",
    name: "Afrique hors UEMOA",
    event: "Nigeria : pression de refinancement, notation sous surveillance.",
  },
  { id: "emea", name: "EMEA", event: "La BCE prépare un nouvel assouplissement au T3." },
  {
    id: "americas",
    name: "Amériques",
    event: "FOMC : trajectoire de baisse progressive des taux directeurs.",
  },
  { id: "apac", name: "APAC", event: "Japon : sortie de la politique de taux négatifs en cours." },
];

/** Le regime dominant d'un bloc, ramene aux trois paliers de la carte. */
function blockRegime(codes: string[]): BlockRegime {
  const avgRisk = codes.reduce((sum, c) => sum + getRegime(c).riskScore, 0) / (codes.length || 1);
  if (avgRisk >= 60) return "fragile";
  if (avgRisk >= 42) return "transition";
  return "recovery";
}

const mean = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

/**
 * Les cinq blocs, **calcules** sur les pays suivis.
 *
 * Les effectifs etaient ecrits a la main — 8, 12, 14, 6, 10, soit cinquante
 * pays pour un univers qui en compte vingt-quatre — et les quatre scores
 * etaient invente. La page annoncait donc des agregats qu'aucune de ses
 * propres lignes ne soutenait.
 */
export const regionBlocks: RegionBlock[] = BLOCK_NAMES.map(({ id, name, event }) => {
  const members = STATIC_COUNTRIES.filter((c) => BLOCK_OF_REGION[c.region] === id);
  const codes = members.map((c) => c.code);
  const regimes = codes.map((c) => getRegime(c));
  return {
    id,
    name,
    count: members.length,
    regime: blockRegime(codes),
    growth: mean(regimes.map((r) => r.growthScore)),
    // L'echelle des cartes est « plus haut, mieux » : une inflation maitrisee
    // et un risque faible doivent donc monter, pas descendre.
    inflation: mean(regimes.map((r) => 100 - Math.abs(r.inflationScore - 45) * 1.6)),
    fiscal: mean(regimes.map((r) => 100 - r.riskScore * 0.8)),
    risk: mean(regimes.map((r) => 100 - r.riskScore)),
    event,
  };
});

/* ================= Regions — Mapping pays → bloc (pour le tableau) ================= */

export type RegionFilter =
  | "all"
  | "uemoa"
  | "africa"
  | "emea"
  | "americas"
  | "apac";

export interface CountryWatchRow {
  code: string;     // ISO 2 lettres (US, UK, EU, JP...)
  name: string;     // nom complet
  region: RegionFilter;  // bloc
  regime: BlockRegime;
  risk: "low" | "medium" | "high";
  status: "stable" | "watch" | "risk";
}

/**
 * Les pays suivis, derives de l'univers.
 *
 * Seize lignes etaient figees ici pendant que le screener en comptait
 * vingt-quatre, et l'Afrique du Sud y etait rangee en APAC.
 */
export const countryWatchRows: CountryWatchRow[] = STATIC_COUNTRIES.map((country) => {
  const regime = getRegime(country.code);
  return {
    code: country.code,
    name: country.name,
    region: BLOCK_OF_REGION[country.region] ?? "all",
    regime: blockRegime([country.code]),
    risk: regime.riskScore >= 60 ? "high" : regime.riskScore >= 35 ? "medium" : "low",
    status: country.status,
  };
});

/* ================= Countries — Country Overview (ex: Côte d'Ivoire) ================= */


export interface PeerRow {
  country: string;
  code: string;
  growth: number;
  inflation: number;
  fiscal: number;
}


export interface MarketMetric {
  label: string;
  /** Derniere valeur, deja formatee (taux, indice et spread n'ont pas la meme echelle). */
  value: string;
  /** Variation sur un mois, formatee avec son unite. */
  change: string;
  /** Variation depuis le debut d'annee, colonne "YTD Change" de la maquette. */
  ytd: string;
  /** Sens de lecture de la variation, pour la couleur. */
  polarity: "higherBetter" | "lowerBetter";
  /** Serie 12 mois de la colonne Trend. */
  spark: number[];
}

export const marketSnapshot: MarketMetric[] = [
  { label: "USD / XOF", value: "601.5", change: "-0.1%", ytd: "-0.2%", polarity: "lowerBetter", spark: [604, 603, 602, 603, 602, 601, 602, 601, 601, 602, 601, 601.5] },
  { label: "Rendement souverain (Eurobond)", value: "7.45%", change: "-18 bps", ytd: "-72 bps", polarity: "lowerBetter", spark: [8.2, 8.1, 8.0, 7.9, 7.9, 7.8, 7.7, 7.6, 7.6, 7.5, 7.5, 7.45] },
  { label: "BRVM Composite", value: "265.4", change: "+2.3%", ytd: "+8.7%", polarity: "higherBetter", spark: [244, 247, 249, 252, 251, 255, 258, 257, 260, 262, 263, 265.4] },
  { label: "CDS 5 ans", value: "168 bps", change: "-9 bps", ytd: "-36 bps", polarity: "lowerBetter", spark: [204, 200, 196, 192, 190, 186, 182, 180, 176, 173, 170, 168] },
];

export interface StrategicSector {
  name: string;
  /** Importance strategique, badge de la maquette. */
  impact: string;
  /** Description courte de la chaine de valeur. */
  summary: string;
  /** Trois reperes chiffres, comme la grille de la planche P2. */
  stats: { label: string; value: string }[];
  /** Orientation a douze mois. */
  outlook: string;
  /** Priorites d'action. */
  drivers: string[];
}

export const strategicSectors: StrategicSector[] = [
  {
    name: "Chaine de valeur cacao",
    impact: "High",
    summary:
      "Premier producteur mondial de cacao, environ 40% de l'offre globale. La montee en transformation locale est le levier de valeur.",
    stats: [
      { label: "Production 2026", value: "2,2 Mt" },
      { label: "Recettes export", value: "4,78 Md USD" },
      { label: "Part de marche", value: "~40%" },
    ],
    outlook: "Favorable",
    drivers: [
      "Ameliorer le rendement et le revenu producteur",
      "Qualite et tracabilite",
      "Developper la transformation locale",
    ],
  },
  {
    name: "Logistique & connectivite",
    impact: "High",
    summary:
      "Les investissements en infrastructure renforcent la competitivite a l'export et l'integration regionale.",
    stats: [
      { label: "Trafic portuaire", value: "36,5 Mt" },
      { label: "Rang facilitation", value: "92 / 139" },
      { label: "Corridor", value: "Abidjan-Ouaga" },
    ],
    outlook: "En amelioration",
    drivers: [
      "Etendre la capacite portuaire",
      "Numeriser les douanes et la logistique",
      "Entretien du reseau routier",
    ],
  },
];


export interface TimelineEvent {
  date: string;
  title: string;
  tag: string;
}

export const countryTimeline: TimelineEvent[] = [
  { date: "2026-08-03", title: "Réunion de politique monétaire BCEAO", tag: "Policy" },
  { date: "2026-08-10", title: "Publication du budget 2027", tag: "Fiscal" },
  { date: "2026-08-24", title: "Forum Investissements UEMOA (Abidjan)", tag: "Event" },
  { date: "2026-09-05", title: "Révision des prévisions FMI (Art. IV)", tag: "Forecast" },
];

/* ================= Countries — Quantitative Analysis (module 1: Macro Snapshot) ================= */


/** Trajectoire SIG vs Consensus, avec zone d'incertitude (2024-2027). */
export const growthForecastVsConsensus: { year: string; sig: number; consensus: number; low: number; high: number }[] = [
  { year: "2024", sig: 5.8, consensus: 5.6, low: 5.4, high: 6.2 },
  { year: "2025F", sig: 6.4, consensus: 6.1, low: 5.9, high: 6.8 },
  { year: "2026F", sig: 6.8, consensus: 6.5, low: 6.2, high: 7.2 },
  { year: "2027F", sig: 7.0, consensus: 6.7, low: 6.4, high: 7.4 },
];

/** Inflation vs Policy Rate path + bande cible 2-4%. */
export const inflationRatePath: { year: string; inflation: number; rate: number }[] = [
  { year: "2024", inflation: 3.1, rate: 4.50 },
  { year: "2025F", inflation: 2.3, rate: 3.00 },
  { year: "2026F", inflation: 2.2, rate: 2.75 },
  { year: "2027F", inflation: 2.1, rate: 2.50 },
];

export interface KeyMetricPair {
  label: string;
  "2024": string;
  "2025F": string;
}

export const macroKeyMetrics: KeyMetricPair[] = [
  { label: "Real GDP Growth (%)", "2024": "5.8", "2025F": "6.4" },
  { label: "Inflation (CPI Avg, %)", "2024": "3.1", "2025F": "2.3" },
  { label: "Policy Rate (%, eop)", "2024": "4.50", "2025F": "3.00" },
  { label: "Fiscal Balance (% GDP)", "2024": "-2.8", "2025F": "-3.1" },
  { label: "Current Account (% GDP)", "2024": "-2.3", "2025F": "-1.9" },
];

/* ================= Module 2: Forecast Engine ================= */

export interface ForecastAssumption {
  label: string;
  value: string;
}

export const forecastAssumptions: ForecastAssumption[] = [
  { label: "Cocoa Price (USD/t)", value: "4 500" },
  { label: "Oil Price (Brent, USD/bbl)", value: "78" },
  { label: "Global Growth (%)", value: "3.1" },
  { label: "Regional Policy Rate (%)", value: "3.00" },
  { label: "FX XOF/USD", value: "575" },
];

/* ================= Module 3: Fiscal & External ================= */

export const fiscalExternal: { year: string; fiscal: number; current: number }[] = [
  { year: "2023", fiscal: -3.2, current: -2.5 },
  { year: "2024", fiscal: -2.8, current: -2.3 },
  { year: "2025F", fiscal: -3.1, current: -1.9 },
  { year: "2026F", fiscal: -2.9, current: -1.7 },
  { year: "2027F", fiscal: -2.6, current: -1.5 },
];

export interface FiscalExternalMetric {
  label: string;
  value: string;
}

export const fiscalExternalMetrics: FiscalExternalMetric[] = [
  { label: "Recettes (fiscales, % PIB)", value: "18.2%" },
  { label: "Solde primaire (% PIB)", value: "-1.4%" },
  { label: "Dette publique (% PIB)", value: "51.4%" },
  { label: "Dette extérieure (% PIB)", value: "31.0%" },
  { label: "Réserves brutes (mois d'imports)", value: "4.8" },
];

/* ================= Module 4: Financial Markets ================= */

export interface YieldPoint {
  tenor: string;
  yield: number;
}

export const sovereignCurve: YieldPoint[] = [
  { tenor: "1Y", yield: 4.2 },
  { tenor: "2Y", yield: 4.8 },
  { tenor: "3Y", yield: 5.2 },
  { tenor: "5Y", yield: 5.9 },
  { tenor: "7Y", yield: 6.3 },
  { tenor: "10Y", yield: 6.9 },
];

export interface MarketTableRow {
  metric: string;
  value: string;
}

export const marketTableData: MarketTableRow[] = [
  { metric: "5Y Yield", value: "5.90%" },
  { metric: "10Y Yield", value: "6.85%" },
  { metric: "EMBI Spread (bps)", value: "385" },
  { metric: "CDS 5Y (bps)", value: "240" },
  { metric: "Eurobond 2032", value: "6.30%" },
];

/* ================= Module 5: Strategic Sector Monitor (Cocoa) ================= */

export const cocoaProduction: { year: string; production: number; exports: number }[] = [
  { year: "2021", production: 2.2, exports: 1.8 },
  { year: "2022", production: 2.0, exports: 1.7 },
  { year: "2023", production: 2.3, exports: 1.9 },
  { year: "2024", production: 2.1, exports: 1.7 },
  { year: "2025", production: 2.5, exports: 2.0 },
];

export const cocoaPrices: { year: string; value: number }[] = [
  { year: "2021", value: 2400 },
  { year: "2022", value: 2800 },
  { year: "2023", value: 3200 },
  { year: "2024", value: 5200 },
  { year: "2025", value: 4500 },
];

export interface SectorMetric {
  label: string;
  value: string;
}

export const cocoaMetrics: SectorMetric[] = [
  { label: "Production (Mt)", value: "2.5" },
  { label: "Export Value (USD B)", value: "5.2" },
  { label: "Avg Price (USD/t)", value: "4 500" },
  { label: "Farm Gate Price (XOF/kg)", value: "1 800" },
];

/* ================= Module 6: Peer Comparison (WAEMU) ================= */

export const waemuPeers: PeerRow[] = [
  { country: "Côte d'Ivoire", code: "CIV", growth: 6.4, inflation: 2.3, fiscal: -3.1 },
  { country: "Benin", code: "SEN", growth: 5.2, inflation: 2.9, fiscal: -2.2 },
  { country: "Togo", code: "SEN", growth: 4.8, inflation: 2.7, fiscal: -2.4 },
  { country: "Senegal", code: "SEN", growth: 4.5, inflation: 4.1, fiscal: -1.8 },
  { country: "Niger", code: "SEN", growth: 4.2, inflation: 3.3, fiscal: -3.0 },
];

/* ================= Module 7: Data Quality ================= */

export interface QualityScore {
  label: string;
  score: number;      // /100
}

export const dataQualityScores: QualityScore[] = [
  { label: "Overall", score: 82 },
  { label: "Coverage", score: 85 },
  { label: "Timeliness", score: 80 },
  { label: "Consistency", score: 83 },
  { label: "Revisions", score: 78 },
];

export interface DataUpdateRow {
  indicator: string;
  date: string;
  freshness: string;
  frequency: string;
}

export const recentDataUpdates: DataUpdateRow[] = [
  { indicator: "Real GDP Growth", date: "May 16, 2025", freshness: "1 month", frequency: "Annual" },
  { indicator: "Inflation (CPI)", date: "Apr 30, 2025", freshness: "2 weeks", frequency: "Monthly" },
  { indicator: "Policy Rate", date: "Mar 20, 2025", freshness: "2 months", frequency: "Quarterly" },
  { indicator: "Current Account", date: "May 16, 2025", freshness: "1 month", frequency: "Annual" },
];


