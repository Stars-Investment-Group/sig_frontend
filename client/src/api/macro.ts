import type {
  Country,
  CountryStatus,
  Frequency,
  IndicatorCategory,
  MacroIndicator,
  MacroObservation,
  MacroRegime,
} from "@shared/schema";
import { apiFetch, toDate, toIsoDay, toNumber, toNumberOr, toPeriod } from "./client";
import type {
  WireCountry,
  WireIndicator,
  WireMacroData,
  WireMacroRegime,
} from "./types";

/**
 * Adaptateurs du backend vers le contrat du front.
 *
 * Ce fichier est le **seul** endroit ou les deux formes se rencontrent. Tout
 * ce que la base ne stocke pas et que les pages affichent — paliers de risque,
 * variation d'une periode a l'autre, statut de surveillance — se derive ici,
 * une fois, plutot que dans chaque composant.
 */

/* ========================= Module 1 — Pays ========================= */

/**
 * Le statut de surveillance est un **jugement editorial** : il n'existe pas
 * dans `countries`. On le derive du score de risque du regime quand on l'a,
 * et on retombe sur « stable » sinon — jamais sur une valeur inventee par
 * pays, qui se mettrait a contredire le regime affiche a cote.
 */
export function statusFromRisk(riskScore: number | null): CountryStatus {
  if (riskScore === null) return "stable";
  if (riskScore >= 60) return "risk";
  if (riskScore >= 35) return "watch";
  return "stable";
}

export function toCountry(
  wire: WireCountry,
  riskScore: number | null = null
): Country {
  return {
    code: wire.code,
    name: wire.name,
    // `region` est nullable cote base mais le contrat front la veut presente :
    // une region vide casserait les groupements et les filtres.
    region: wire.region ?? "Non classé",
    subregion: wire.subregion,
    incomeLevel: wire.incomeLevel,
    currency: wire.currency,
    flagUrl: wire.flagUrl,
    isAggregate: wire.isAggregate,
    status: statusFromRisk(riskScore),
    lastUpdated: toDate(wire.updatedAt),
  };
}

export async function fetchCountries(params?: {
  region?: string;
  income?: string;
}): Promise<WireCountry[]> {
  return apiFetch<WireCountry[]>("/countries", { query: params });
}

export async function fetchCountry(code: string): Promise<WireCountry> {
  return apiFetch<WireCountry>(`/countries/${code.toUpperCase()}`);
}

export async function fetchRegions(): Promise<string[]> {
  return apiFetch<string[]>("/countries/regions");
}

/* ==================== Module 2 — Catalogue ==================== */

/** Les six categories du contrat ; tout le reste tombe sur « Markets ». */
const CATEGORIES: IndicatorCategory[] = [
  "Growth",
  "Inflation",
  "Fiscal",
  "External",
  "Markets",
  "Labour",
];

const FREQUENCIES: Frequency[] = ["Annual", "Quarterly", "Monthly"];

export function toIndicator(wire: WireIndicator): MacroIndicator {
  const category = CATEGORIES.find(
    (c) => c.toLowerCase() === (wire.category ?? "").toLowerCase()
  );
  const frequency = FREQUENCIES.find(
    (f) => f.toLowerCase() === (wire.frequency ?? "").toLowerCase()
  );
  return {
    code: wire.code,
    name: wire.name,
    description: wire.description,
    // Une categorie inconnue ne doit pas faire planter un filtre typé : on la
    // range dans « Markets » et on garde l'original dans le nom si besoin.
    category: category ?? "Markets",
    unit: wire.unit ?? "",
    frequency: frequency ?? "Monthly",
    source: wire.source ?? "n/d",
    isSeasonallyAdjusted: wire.isSeasonallyAdjusted,
    coverageStart: wire.coverageStart ? toPeriod(wire.coverageStart) : null,
    coverageEnd: wire.coverageEnd ? toPeriod(wire.coverageEnd) : null,
  };
}

export async function fetchIndicators(params?: {
  category?: string;
}): Promise<WireIndicator[]> {
  return apiFetch<WireIndicator[]>("/indicators", { query: params });
}

export async function fetchIndicatorCategories(): Promise<string[]> {
  return apiFetch<string[]>("/indicators/categories");
}

/* ====================== Module 3 — Donnees macro ====================== */

/**
 * Convertit une serie.
 *
 * `previousValue`, `change` et `changeDirection` **ne sont pas stockes** : le
 * backend ne renvoie qu'une valeur par periode et par millesime. On les
 * calcule ici, sur la serie triee, parce qu'une observation isolee ne peut pas
 * les connaitre.
 *
 * Les observations doivent arriver d'un **meme millesime** : melanger les
 * millesimes ferait comparer une valeur revisee a une estimation.
 */
export function toObservations(rows: WireMacroData[]): MacroObservation[] {
  const sorted = [...rows].sort((a, b) =>
    String(a.period).localeCompare(String(b.period))
  );

  return sorted.map((row, index) => {
    const value = toNumberOr(row.value, 0);
    const previous = index > 0 ? toNumber(sorted[index - 1].value) : null;
    const change = previous === null ? null : Math.round((value - previous) * 100) / 100;
    return {
      countryCode: row.countryCode,
      // Le front raisonne par code ; `indicatorId` est un UUID sans usage ici.
      indicatorCode: row.indicator?.code ?? "",
      period: toPeriod(row.period),
      date: toDate(row.period) ?? new Date(0),
      value,
      previousValue: previous,
      change,
      changeDirection:
        change === null ? null : change > 0.05 ? "up" : change < -0.05 ? "down" : "stable",
      vintageDate: toIsoDay(row.vintageDate) ?? "",
      releaseDate: toIsoDay(row.releaseDate) ?? toIsoDay(row.vintageDate) ?? "",
      isForecast: row.isForecast,
      source: row.source ?? "n/d",
      unit: row.indicator?.unit ?? "",
    };
  });
}

/**
 * Serie d'un couple pays / indicateur, au dernier millesime.
 *
 * **Cette route ne rend pas un tableau** mais un objet qui enveloppe la serie :
 * `{ countryCode, countryName, indicatorCode, indicatorName, series }`. Ses
 * deux voisines, `/vintages` et `/latest`, rendent bien des tableaux — l'ecart
 * ne se devine pas et se verifie a l'appel.
 *
 * Le code et le nom de l'indicateur sont ici au niveau de l'enveloppe, pas sur
 * chaque point : on les redescend sur les observations, que le reste de
 * l'application lit par code.
 */
export async function fetchSeries(
  countryCode: string,
  indicatorCode: string,
  range?: { from?: string; to?: string }
): Promise<WireMacroData[]> {
  const wrapper = await apiFetch<{
    countryCode: string;
    indicatorCode: string;
    indicatorName: string;
    series: WireMacroData[];
  }>(`/macro-data/${countryCode.toUpperCase()}/${indicatorCode.toLowerCase()}`, {
    query: range,
  });

  return (wrapper.series ?? []).map((row) => ({
    ...row,
    countryCode: row.countryCode ?? wrapper.countryCode,
    indicator: row.indicator ?? {
      code: wrapper.indicatorCode,
      name: wrapper.indicatorName,
      category: null,
      unit: null,
    },
  }));
}

/** Tous les millesimes d'une periode — c'est ce qui nourrit les revisions. */
export async function fetchVintages(
  countryCode: string,
  indicatorCode: string,
  period?: string
): Promise<WireMacroData[]> {
  return apiFetch<WireMacroData[]>(
    `/macro-data/${countryCode.toUpperCase()}/${indicatorCode.toLowerCase()}/vintages`,
    { query: { period } }
  );
}

/** Derniere observation connue, tous pays ou pour un pays donne. */
export async function fetchLatest(params?: {
  country?: string;
  indicator?: string;
}): Promise<WireMacroData[]> {
  return apiFetch<WireMacroData[]>("/macro-data/latest", { query: params });
}

/* ====================== Module 4 — Regimes ====================== */

/**
 * Les trois paliers lisibles du contrat front ne sont pas stockes : la base ne
 * garde que les scores. Les seuils sont ceux deja utilises par les pages, pour
 * que le branchement ne deplace aucune pastille.
 */
const toRiskLevel = (score: number | null): MacroRegime["riskLevel"] =>
  score === null ? "medium" : score >= 60 ? "high" : score >= 35 ? "medium" : "low";

const toInflationLevel = (score: number | null): MacroRegime["inflationLevel"] =>
  score === null ? "moderate" : score >= 60 ? "high" : score >= 40 ? "moderate" : "low";

const toGrowthLevel = (score: number | null): MacroRegime["gdpGrowthLevel"] =>
  score === null
    ? "slow"
    : score >= 75
      ? "strong"
      : score >= 55
        ? "stable"
        : score >= 35
          ? "slow"
          : "negative";

export function toRegime(wire: WireMacroRegime): MacroRegime {
  const riskScore = toNumber(wire.riskScore);
  const growthScore = toNumber(wire.growthScore);
  const inflationScore = toNumber(wire.inflationScore);
  return {
    countryCode: wire.countryCode,
    regime: wire.regime as MacroRegime["regime"],
    momentum: (wire.momentum ?? "Stable") as MacroRegime["momentum"],
    confidence: toNumberOr(wire.confidence, 0),
    riskScore: riskScore ?? 0,
    growthScore: growthScore ?? 0,
    inflationScore: inflationScore ?? 0,
    policyStance: (wire.policyStance ?? "Neutral") as MacroRegime["policyStance"],
    riskLevel: toRiskLevel(riskScore),
    inflationLevel: toInflationLevel(inflationScore),
    gdpGrowthLevel: toGrowthLevel(growthScore),
    period: toPeriod(wire.period),
    validFrom: toDate(wire.validFrom) ?? new Date(0),
    validTo: toDate(wire.validTo),
    lastUpdated: toDate(wire.validFrom),
  };
}

export async function fetchRegimes(): Promise<WireMacroRegime[]> {
  return apiFetch<WireMacroRegime[]>("/macro-regime");
}

export async function fetchRegime(countryCode: string): Promise<WireMacroRegime> {
  return apiFetch<WireMacroRegime>(`/macro-regime/${countryCode.toUpperCase()}`);
}
