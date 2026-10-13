import { getCountryProfile, type CountryProfile } from "@/data/countryProfile";
import { STATIC_COUNTRIES, STATIC_INDICATORS, getStaticHistory } from "@/data/mockData";
import type { PillarKey } from "@shared/schema";

/**
 * Couche de comparaison multi-pays (planche P3).
 *
 * Elle ne définit aucune donnée : elle assemble les profils pays déjà dérivés
 * et les normalise pour que des grandeurs hétérogènes — un score sur 10, une
 * croissance en %, un solde en points de PIB — deviennent comparables.
 *
 * La normalisation est un **z-score sur la sélection courante**, pas sur
 * l'univers : c'est ce qu'attend la maquette (« 0 = moyenne du groupe »), et
 * cela veut dire que retirer un pays change les positions des autres. C'est le
 * comportement voulu d'une comparaison entre pairs.
 */

export type MetricGroup = "Macro" | "Fiscal" | "External" | "Markets" | "Structural";

export interface ComparisonMetric {
  key: string;
  label: string;
  group: MetricGroup;
  unit: string;
  /** Sens de lecture : une valeur haute est-elle favorable ? */
  polarity: "higherBetter" | "lowerBetter";
  value: (profile: CountryProfile) => number;
}

const pillar = (profile: CountryProfile, key: PillarKey): number =>
  profile.rating.pillars.find((p) => p.key === key)?.score ?? 5;

export const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: "growth",
    label: "Croissance PIB",
    group: "Macro",
    unit: "%",
    polarity: "higherBetter",
    value: (p) => p.metrics.growth,
  },
  {
    key: "inflation",
    label: "Inflation",
    group: "Macro",
    unit: "%",
    polarity: "lowerBetter",
    value: (p) => p.metrics.inflation,
  },
  {
    key: "unemployment",
    label: "Chômage",
    group: "Macro",
    unit: "%",
    polarity: "lowerBetter",
    value: (p) => p.metrics.unemployment,
  },
  {
    key: "fiscalBalance",
    label: "Solde budgétaire",
    group: "Fiscal",
    unit: "% PIB",
    polarity: "higherBetter",
    value: (p) => p.metrics.fiscalBalance,
  },
  {
    key: "fiscalCapacity",
    label: "Capacité budgétaire",
    group: "Fiscal",
    unit: "/10",
    polarity: "higherBetter",
    value: (p) => pillar(p, "fiscalCapacity"),
  },
  {
    key: "currentAccount",
    label: "Compte courant",
    group: "External",
    unit: "% PIB",
    polarity: "higherBetter",
    value: (p) => p.metrics.currentAccount,
  },
  {
    key: "externalResilience",
    label: "Résilience externe",
    group: "External",
    unit: "/10",
    polarity: "higherBetter",
    value: (p) => pillar(p, "externalResilience"),
  },
  {
    key: "policyRate",
    label: "Taux directeur",
    group: "Markets",
    unit: "%",
    polarity: "lowerBetter",
    value: (p) => p.metrics.policyRate,
  },
  {
    key: "marketAttractiveness",
    label: "Attractivité de marché",
    group: "Markets",
    unit: "/10",
    polarity: "higherBetter",
    value: (p) => pillar(p, "marketAttractiveness"),
  },
  {
    key: "riskScore",
    label: "Score de risque",
    group: "Markets",
    unit: "/100",
    polarity: "lowerBetter",
    value: (p) => p.metrics.riskScore,
  },
  {
    key: "structuralOpportunity",
    label: "Opportunité structurelle",
    group: "Structural",
    unit: "/10",
    polarity: "higherBetter",
    value: (p) => pillar(p, "structuralOpportunity"),
  },
  {
    key: "institutions",
    label: "Qualité institutionnelle",
    group: "Structural",
    unit: "/10",
    polarity: "higherBetter",
    value: (p) => pillar(p, "politicalInstitutionalQuality"),
  },
];

export const METRIC_GROUPS: MetricGroup[] = [
  "Macro",
  "Fiscal",
  "External",
  "Markets",
  "Structural",
];

/** Jeux de métriques proposés par le sélecteur « Metric Set » de la maquette. */
export const METRIC_SETS: Record<string, { label: string; groups: MetricGroup[] }> = {
  all: { label: "Toutes les métriques", groups: METRIC_GROUPS },
  macro: { label: "Macro seulement", groups: ["Macro"] },
  fiscalExternal: { label: "Budgétaire & externe", groups: ["Fiscal", "External"] },
  marketsStructural: { label: "Marchés & structurel", groups: ["Markets", "Structural"] },
};

/* =========================================================================
 * Normalisation
 * ========================================================================= */

/**
 * Z-score orienté « favorable » : positif = meilleur que la moyenne du groupe,
 * quelle que soit la polarité de la métrique.
 *
 * L'écart-type peut être nul (un seul pays, ou des valeurs identiques) : on
 * renvoie alors 0 plutôt qu'une division par zéro, ce qui affiche « à la
 * moyenne » — exact, puisque tout le monde l'est.
 */
function orientedZScores(values: number[], polarity: "higherBetter" | "lowerBetter"): number[] {
  const n = values.length;
  if (n === 0) return [];
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);
  const sign = polarity === "higherBetter" ? 1 : -1;
  return values.map((v) => (sd === 0 ? 0 : (sign * (v - mean)) / sd));
}

export interface ComparisonCell {
  raw: number;
  /** Z-score orienté sur la sélection, arrondi au centième. */
  z: number;
  /**
   * Score 0-100 normalisé **sur la sélection**, orienté favorable.
   *
   * C'est l'échelle que demande la planche P3 : « scores are normalized on a
   * 0-100 scale across all peers ». Elle se lit sans connaître l'écart-type, là
   * où le z-score suppose une habitude statistique. Le z-score reste affiché
   * dans la table détaillée, où il apporte la dispersion.
   */
  score: number;
  /** Rang dans la sélection, 1 = meilleur. */
  rank: number;
}

export interface ComparisonRow {
  metric: ComparisonMetric;
  /** Une cellule par pays, dans l'ordre de la sélection. */
  cells: ComparisonCell[];
}

export interface ComparisonScorecard {
  code: string;
  name: string;
  /** Score composite ramené sur 100, comme la page Compare de la maquette. */
  score100: number;
  rank: number;
  changeSincePrior: number;
  outlook: CountryProfile["rating"]["outlook"];
  spark: number[];
  /** Moyenne des z-scores : position d'ensemble dans le groupe. */
  compositeZ: number;
}

export interface Comparison {
  profiles: CountryProfile[];
  rows: ComparisonRow[];
  scorecards: ComparisonScorecard[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Ramene une valeur sur 0-100 **contre l'univers entier**, pas contre la
 * selection.
 *
 * Normaliser sur la selection forcait, dans chaque colonne, un 0 et un 100
 * exacts : la grille devenait un damier rouge et vert ou le meilleur et le
 * pire du groupe ecrasaient toute nuance, et les scores bougeaient des qu'on
 * ajoutait un pays. Contre l'univers, les valeurs se repartissent reellement
 * et restent stables d'une selection a l'autre — c'est ce que montre la
 * planche P3, dont aucun score n'atteint les bornes.
 *
 * Les bornes s'elargissent de 10% de part et d'autre pour qu'un pays extreme
 * ne sature pas l'echelle.
 */
const UNIVERSE_RANGE = new Map<string, { min: number; max: number }>();

function universeRange(metric: ComparisonMetric): { min: number; max: number } {
  const cached = UNIVERSE_RANGE.get(metric.key);
  if (cached) return cached;

  const values = STATIC_COUNTRIES.map((c) => metric.value(getCountryProfile(c.code)));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.1 || 1;
  const range = { min: min - pad, max: max + pad };
  UNIVERSE_RANGE.set(metric.key, range);
  return range;
}

function normalize0100(metric: ComparisonMetric, value: number): number {
  const { min, max } = universeRange(metric);
  const span = max - min;
  if (span === 0) return 50;
  const t = Math.max(0, Math.min(1, (value - min) / span));
  return Math.round((metric.polarity === "higherBetter" ? t : 1 - t) * 100);
}

export function buildComparison(codes: string[], groups: MetricGroup[]): Comparison {
  const profiles = codes.map((code) => getCountryProfile(code));
  const metrics = COMPARISON_METRICS.filter((m) => groups.includes(m.group));

  const rows: ComparisonRow[] = metrics.map((metric) => {
    const raws = profiles.map((p) => metric.value(p));
    const zs = orientedZScores(raws, metric.polarity);
    const scores = raws.map((raw) => normalize0100(metric, raw));

    // Rang : 1 au z-score le plus favorable.
    const order = zs
      .map((z, i) => ({ z, i }))
      .sort((a, b) => b.z - a.z)
      .map((x) => x.i);
    const rankByIndex = new Map<number, number>();
    order.forEach((index, position) => rankByIndex.set(index, position + 1));

    return {
      metric,
      cells: raws.map((raw, i) => ({
        raw,
        z: round2(zs[i]),
        score: scores[i],
        rank: rankByIndex.get(i) ?? 1,
      })),
    };
  });

  const compositeZs = profiles.map((_, i) => {
    if (rows.length === 0) return 0;
    return round2(rows.reduce((sum, row) => sum + row.cells[i].z, 0) / rows.length);
  });

  const scored = profiles.map((profile, i) => ({
    profile,
    score100: Math.round(profile.rating.compositeScore * 10),
    compositeZ: compositeZs[i],
  }));

  const ranking = [...scored].sort((a, b) => b.score100 - a.score100).map((s) => s.profile.country.code);

  const scorecards: ComparisonScorecard[] = scored.map(({ profile, score100, compositeZ }) => ({
    code: profile.country.code,
    name: profile.country.name,
    score100,
    rank: ranking.indexOf(profile.country.code) + 1,
    changeSincePrior: profile.rating.changeSincePrior,
    outlook: profile.rating.outlook,
    spark: getStaticHistory(profile.country.code, "real_gdp_growth").map((o) => o.value),
    compositeZ,
  }));

  return { profiles, rows, scorecards };
}

/* =========================================================================
 * Séries normalisées (section « Normalized Trend Comparison »)
 * ========================================================================= */

export interface NormalizedSeries {
  code: string;
  name: string;
  /** Écart à la moyenne longue période de la série, en écarts-types. */
  points: number[];
  periods: string[];
}

/**
 * Chaque pays est normalisé **sur sa propre histoire**, pas sur le groupe :
 * la maquette annonce « 0 = moyenne long terme ». Comparer des trajectoires
 * ainsi centrées montre qui s'écarte de son régime habituel, ce qu'une
 * superposition de niveaux bruts ne dit pas.
 */
export function buildNormalizedSeries(codes: string[], indicatorCode: string): NormalizedSeries[] {
  return codes.map((code) => {
    const history = getStaticHistory(code, indicatorCode);
    const values = history.map((o) => o.value);
    const n = values.length || 1;
    const mean = values.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    const profile = getCountryProfile(code);
    return {
      code,
      name: profile.country.name,
      periods: history.map((o) => o.period),
      points: values.map((v) => (sd === 0 ? 0 : round2((v - mean) / sd))),
    };
  });
}

export const COMPARABLE_INDICATORS = STATIC_INDICATORS.map((i) => ({
  code: i.code,
  name: i.name,
  unit: i.unit,
}));

/* =========================================================================
 * Secteurs stratégiques
 * ========================================================================= */

export const SECTOR_NAMES = [
  "Agriculture",
  "Infrastructure",
  "Énergie",
  "Industrie",
  "Économie numérique",
] as const;

function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Scores sectoriels 0-100.
 *
 * Aucun module backend ne couvre les secteurs : le score est ancré sur le
 * pilier d'opportunité structurelle du pays, avec un écart déterministe par
 * secteur. Les écarts relatifs entre pays restent donc cohérents avec la
 * notation, ce qui est le minimum exigible d'une comparaison sectorielle.
 */
export function buildSectorScores(codes: string[]): { sector: string; scores: number[] }[] {
  return SECTOR_NAMES.map((sector) => ({
    sector,
    scores: codes.map((code) => {
      const profile = getCountryProfile(code);
      const base = pillar(profile, "structuralOpportunity") * 10;
      const tilt = (hash01(`${code}:${sector}`) - 0.5) * 34;
      return Math.max(5, Math.min(98, Math.round(base + tilt)));
    }),
  }));
}
