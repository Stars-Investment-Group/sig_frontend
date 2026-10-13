import { apiFetch, toDate, toNumber, toNumberOr, toPeriod } from "./client";
import type {
  WireDataRelease,
  WireEvent,
  WireGlobalKpi,
  WireHouseView,
  WireRegionSnapshot,
} from "./types";

/**
 * Modules 5 a 9 : notation, screener, KPI globaux, regions, calendrier.
 *
 * **L'enveloppe de reponse n'est pas uniforme**, contrairement a ce qu'on
 * pouvait croire apres les modules 1 a 4. Trois conventions coexistent :
 *  - la plupart des routes rendent l'enregistrement ou le tableau nu ;
 *  - `/country-screener` **pagine** : `{ data, pagination }` ;
 *  - `/global-kpi/movers` et `/global-kpi/heatmap` enveloppent sous une cle
 *    nommee : `{ movers }`, `{ heatmap }`.
 *
 * La serialisation varie elle aussi : `regions` convertit ses `Decimal` en
 * nombres (`Number(snapshot.overallScore)`) la ou `countries` et `macro-data`
 * les laissent en chaines. `toNumber` accepte les deux — c'est pour cela qu'on
 * ne lit jamais un champ numerique directement.
 *
 * Chaque ecart est signale ici plutot que laisse au composant : une page qui
 * oublierait de deballer `{ movers }` afficherait une liste vide sans erreur.
 */

/* ===================== Module 5 — Notation pays ===================== */

export interface RatingSnapshot {
  countryCode: string;
  overallScore: number;
  /** Note en lettres ; nulle tant que le backend ne la calcule pas. */
  rating: string | null;
  pillars: Record<string, number>;
  reviewDate: Date | null;
}

interface WireRatingPillars {
  countryCode: string;
  overallScore: unknown;
  rating: string | null;
  pillars: Record<string, unknown> | null;
  reviewDate: string;
}

/** Les scores de piliers sont une colonne `Json` : la forme n'est pas garantie. */
function toPillars(raw: Record<string, unknown> | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
    const score = toNumber(value);
    if (score !== null) out[key] = score;
  }
  return out;
}

export async function fetchRatingPillars(
  countryCode: string
): Promise<RatingSnapshot> {
  const wire = await apiFetch<WireRatingPillars>(
    `/country-rating/${countryCode.toUpperCase()}/pillars`
  );
  return {
    countryCode: wire.countryCode,
    overallScore: toNumberOr(wire.overallScore, 0),
    rating: wire.rating,
    // La route nomme le champ `pillars`, pas `pillarScores` comme la colonne.
    pillars: toPillars(wire.pillars),
    reviewDate: toDate(wire.reviewDate),
  };
}

export interface RatingDriver {
  label?: string;
  impact?: number;
  rationale?: string;
}

export interface RatingDrivers {
  countryCode: string;
  positiveDrivers: RatingDriver[];
  negativeDrivers: RatingDriver[];
}

/** Les moteurs sont du `Json` libre : on tolere une forme inattendue. */
function toDrivers(raw: unknown): RatingDriver[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) =>
    typeof item === "string"
      ? { label: item }
      : {
          label: (item as RatingDriver)?.label,
          impact: toNumber((item as RatingDriver)?.impact) ?? undefined,
          rationale: (item as RatingDriver)?.rationale,
        }
  );
}

export async function fetchRatingDrivers(
  countryCode: string
): Promise<RatingDrivers> {
  const wire = await apiFetch<{
    countryCode: string;
    positiveDrivers: unknown;
    negativeDrivers: unknown;
  }>(`/country-rating/${countryCode.toUpperCase()}/drivers`);
  return {
    countryCode: wire.countryCode,
    positiveDrivers: toDrivers(wire.positiveDrivers),
    negativeDrivers: toDrivers(wire.negativeDrivers),
  };
}

export async function fetchRatingTriggers(countryCode: string): Promise<{
  upgradeTriggers: string[];
  downgradeTriggers: string[];
}> {
  const wire = await apiFetch<{
    upgradeTriggers: unknown;
    downgradeTriggers: unknown;
  }>(`/country-rating/${countryCode.toUpperCase()}/triggers`);
  const toList = (raw: unknown) =>
    Array.isArray(raw) ? raw.map((x) => String(x)) : [];
  return {
    upgradeTriggers: toList(wire.upgradeTriggers),
    downgradeTriggers: toList(wire.downgradeTriggers),
  };
}

/* ===================== Module 6 — Screener ===================== */

export interface ScreenerRow {
  rank: number;
  countryCode: string;
  countryName: string;
  region: string | null;
  incomeLevel: string | null;
  growth: number | null;
  inflation: number | null;
  overallScore: number | null;
  /** Le backend y met le **momentum** du regime, pas une perspective notee. */
  outlook: string | null;
  trend: string | null;
}

export interface ScreenerPage {
  rows: ScreenerRow[];
  page: number;
  limit: number;
  total: number;
}

export interface ScreenerQuery {
  region?: string;
  income?: string;
  minGrowth?: number;
  maxInflation?: number;
  minRating?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Le screener est la **seule route paginee** du contrat. Lire `response` comme
 * un tableau donnerait une page vide sans la moindre erreur.
 *
 * Attention : cote backend l'inflation est cherchee sous le code
 * `inflation_rate`, alors que notre catalogue la nomme `cpi_inflation`. Tant
 * que l'ecart n'est pas tranche, la colonne peut revenir nulle. A confirmer
 * avec l'equipe backend.
 */
export async function fetchScreener(
  query: ScreenerQuery = {}
): Promise<ScreenerPage> {
  const wire = await apiFetch<{
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number };
  }>("/country-screener", { query: query as Record<string, string | number> });

  return {
    rows: (wire.data ?? []).map((row, index) => ({
      rank: Number(row.rank ?? index + 1),
      countryCode: String(row.countryCode ?? ""),
      countryName: String(row.countryName ?? ""),
      region: (row.region as string) ?? null,
      incomeLevel: (row.incomeLevel as string) ?? null,
      growth: toNumber(row.growth),
      inflation: toNumber(row.inflation),
      overallScore: toNumber(row.overallScore),
      outlook: (row.outlook as string) ?? null,
      trend: (row.trend as string) ?? null,
    })),
    page: wire.pagination?.page ?? 1,
    limit: wire.pagination?.limit ?? 0,
    total: wire.pagination?.total ?? 0,
  };
}

/* ===================== Module 7 — KPI globaux ===================== */

export interface GlobalKpi {
  code: string;
  name: string;
  value: number;
  previousValue: number | null;
  change: number | null;
  changeType: string | null;
  unit: string | null;
  period: string;
}

export function toKpi(wire: WireGlobalKpi): GlobalKpi {
  return {
    code: wire.kpiCode,
    name: wire.kpiName,
    value: toNumberOr(wire.value, 0),
    previousValue: toNumber(wire.previousValue),
    change: toNumber(wire.change),
    changeType: wire.changeType,
    unit: wire.unit,
    period: toPeriod(wire.period),
  };
}

export async function fetchKpis(): Promise<GlobalKpi[]> {
  const rows = await apiFetch<WireGlobalKpi[]>("/global-kpi/kpis");
  return rows.map(toKpi);
}

export async function fetchHouseView(): Promise<WireHouseView | null> {
  return apiFetch<WireHouseView | null>("/global-kpi/house-view");
}

export async function fetchRiskIndex(): Promise<GlobalKpi | null> {
  const wire = await apiFetch<WireGlobalKpi | null>("/global-kpi/risk-index");
  return wire ? toKpi(wire) : null;
}

export interface Mover {
  countryCode: string;
  countryName: string;
  region: string | null;
  score: number | null;
  change: number | null;
}

/** `{ movers }` : enveloppe nommee. Sans le deballage, la carte reste vide. */
export async function fetchMovers(): Promise<Mover[]> {
  const wire = await apiFetch<{ movers: Record<string, unknown>[] }>(
    "/global-kpi/movers"
  );
  return (wire.movers ?? []).map((m) => ({
    countryCode: String(m.countryCode ?? (m.country as { code?: string })?.code ?? ""),
    countryName: String(
      m.countryName ?? (m.country as { name?: string })?.name ?? ""
    ),
    region: ((m.country as { region?: string })?.region ?? m.region ?? null) as
      | string
      | null,
    score: toNumber(m.overallScore ?? m.score),
    change: toNumber(m.change),
  }));
}

/** `{ heatmap }` : meme piege que `movers`. */
export async function fetchGlobalHeatmap(): Promise<Record<string, unknown>[]> {
  const wire = await apiFetch<{ heatmap: Record<string, unknown>[] }>(
    "/global-kpi/heatmap"
  );
  return wire.heatmap ?? [];
}

/* ===================== Module 8 — Regions ===================== */

export interface RegionSnapshot {
  regionCode: string;
  regionName: string;
  overallScore: number | null;
  momentum: string | null;
  riskScore: number | null;
  pillarScores: Record<string, number>;
  period: string;
}

export function toRegionSnapshot(
  wire: WireRegionSnapshot | Record<string, unknown>
): RegionSnapshot {
  const raw = wire as WireRegionSnapshot;
  return {
    regionCode: raw.regionCode,
    regionName: raw.regionName,
    // Ce module convertit deja ses `Decimal` en nombres, contrairement aux
    // autres. `toNumber` accepte les deux formes.
    overallScore: toNumber(raw.overallScore),
    momentum: raw.momentum,
    riskScore: toNumber(raw.riskScore),
    pillarScores: toPillars(raw.pillarScores as Record<string, unknown> | null),
    period: toPeriod(raw.period),
  };
}

export async function fetchRegionList(): Promise<unknown> {
  return apiFetch("/regions");
}

export async function fetchRegionSnapshot(code: string): Promise<RegionSnapshot> {
  const wire = await apiFetch<WireRegionSnapshot>(
    `/regions/${code.toUpperCase()}/snapshot`
  );
  return toRegionSnapshot(wire);
}

export async function fetchRegionCountries(
  code: string
): Promise<{ regionCode: string; countries: unknown[] }> {
  return apiFetch(`/regions/${code.toUpperCase()}/countries`);
}

/* ===================== Module 9 — Calendrier ===================== */

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  countryCode: string | null;
  countryName: string | null;
  regionCode: string | null;
  /** Jour `YYYY-MM-DD` ; l'heure vit dans un champ separe cote base. */
  date: string;
  time: string | null;
  impact: string | null;
  eventType: string;
  source: string | null;
}

export function toCalendarEvent(wire: WireEvent): CalendarEvent {
  const date = toDate(wire.eventDate);
  return {
    id: wire.id,
    title: wire.title,
    description: wire.description,
    countryCode: wire.countryCode,
    countryName: wire.country?.name ?? null,
    regionCode: wire.regionCode,
    date: date ? date.toISOString().slice(0, 10) : "",
    // `eventTime` est un `@db.Time` : Prisma le serialise comme une date dont
    // seule l'heure a du sens.
    time: wire.eventTime ? String(wire.eventTime).slice(11, 16) : null,
    impact: wire.impact,
    eventType: wire.eventType,
    source: wire.source,
  };
}

export async function fetchUpcomingEvents(): Promise<CalendarEvent[]> {
  const rows = await apiFetch<WireEvent[]>("/calendar/events/upcoming");
  return rows.map(toCalendarEvent);
}

export async function fetchEvents(params?: {
  from?: string;
  to?: string;
  country?: string;
}): Promise<CalendarEvent[]> {
  const rows = await apiFetch<WireEvent[]>("/calendar/events", { query: params });
  return rows.map(toCalendarEvent);
}

export interface DataRelease {
  id: string;
  countryCode: string;
  indicatorCode: string | null;
  indicatorName: string | null;
  releaseDate: string;
  period: string;
  status: string | null;
  actualValue: number | null;
  previousValue: number | null;
  unit: string | null;
}

export function toDataRelease(wire: WireDataRelease): DataRelease {
  const release = toDate(wire.releaseDate);
  return {
    id: wire.id,
    countryCode: wire.countryCode,
    indicatorCode: wire.indicator?.code ?? null,
    indicatorName: wire.indicator?.name ?? null,
    releaseDate: release ? release.toISOString().slice(0, 10) : "",
    period: toPeriod(wire.period),
    status: wire.status,
    actualValue: toNumber(wire.actualValue),
    previousValue: toNumber(wire.previousValue),
    unit: wire.indicator?.unit ?? null,
  };
}

export async function fetchReleases(params?: {
  from?: string;
  to?: string;
}): Promise<DataRelease[]> {
  const rows = await apiFetch<WireDataRelease[]>("/calendar/releases", {
    query: params,
  });
  return rows.map(toDataRelease);
}
