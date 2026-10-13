/**
 * Types du fil : ce que le backend envoie **reellement**, pas ce que le front
 * voudrait recevoir.
 *
 * Calques sur `prisma/schema.prisma` de `backend_tracker@main`. Deux pieges y
 * sont rendus explicites :
 *  - un `Decimal` Prisma arrive en **chaine** (`"5.60"`), jamais en nombre ;
 *  - une date arrive en **ISO** (`"2026-07-31T00:00:00.000Z"`), jamais en
 *    `Date`.
 *
 * Les convertir au bord, dans `api/*.ts`, plutot que dans les composants :
 * sinon chaque page refait la conversion, et celle qui l'oublie affiche un
 * `NaN` que le typecheck ne voit pas.
 */

/** Un `Decimal` Prisma serialise. */
export type WireDecimal = string;

/** Une date serialisee par Prisma (ISO 8601). */
export type WireDate = string;

/* ========================= Module 1 — Pays ========================= */

export interface WireCountry {
  code: string;
  name: string;
  region: string | null;
  subregion: string | null;
  incomeLevel: string | null;
  currency: string | null;
  latitude: WireDecimal | null;
  longitude: WireDecimal | null;
  flagUrl: string | null;
  isAggregate: boolean;
  createdAt?: WireDate;
  updatedAt?: WireDate;
}

/** `GET /countries/:code/overview` — projection, sans les dates techniques. */
export type WireCountryOverview = Omit<WireCountry, "createdAt" | "updatedAt">;

/* ==================== Module 2 — Catalogue d'indicateurs ==================== */

export interface WireIndicator {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  frequency: string | null;
  source: string | null;
  isSeasonallyAdjusted: boolean;
  coverageStart: WireDate | null;
  coverageEnd: WireDate | null;
  metadata?: Record<string, unknown> | null;
}

/* ====================== Module 3 — Donnees macro ====================== */

/**
 * Une observation.
 *
 * `MacroData` porte `indicatorId` (un UUID) et non le code. Les routes de
 * lecture joignent l'indicateur et le pays, d'ou `indicator` et `country` ci-
 * dessous : c'est par la que le code arrive. **Ne jamais s'appuyer sur
 * `indicatorId` dans le front**, qui raisonne par code.
 *
 * Trois champs que le front calcule et que la table ne stocke pas :
 * `previousValue`, `change` et `changeDirection`.
 */
export interface WireMacroData {
  id: string;
  countryCode: string;
  indicatorId: string;
  vintageDate: WireDate;
  period: WireDate;
  value: WireDecimal;
  isForecast: boolean;
  isEstimate: boolean;
  releaseDate: WireDate | null;
  nextReleaseDate: WireDate | null;
  source: string | null;
  country?: { code: string; name: string };
  indicator?: {
    code: string;
    name: string;
    category: string | null;
    unit: string | null;
  };
}

/* ====================== Module 4 — Regimes macro ====================== */

/**
 * Le regime d'un pays.
 *
 * `riskLevel`, `inflationLevel` et `gdpGrowthLevel` du contrat front **ne sont
 * pas stockes** : ce sont des paliers derives des trois scores. La derivation
 * reste cote client.
 */
export interface WireMacroRegime {
  id: string;
  countryCode: string;
  regime: string;
  momentum: string | null;
  confidence: WireDecimal | null;
  riskScore: WireDecimal | null;
  growthScore: WireDecimal | null;
  inflationScore: WireDecimal | null;
  policyStance: string | null;
  period: WireDate;
  validFrom: WireDate;
  validTo: WireDate | null;
  metadata?: Record<string, unknown> | null;
  country?: { code: string; name: string };
}

/* ===================== Module 5 — Notation pays ===================== */

/**
 * La notation.
 *
 * Les piliers et les moteurs sont des colonnes `Json` : leur forme n'est pas
 * garantie par le schema. On les type au plus pres de ce que le service
 * renvoie, et la conversion tolere une forme inattendue plutot que de casser
 * la page.
 *
 * Absents de la table, et donc derives cote client : `outlook`, `watchStatus`,
 * `confidence`, `rank`, `universe` et `changeSincePrior`.
 */
export interface WireCountryRating {
  id: string;
  countryCode: string;
  overallScore: WireDecimal;
  rating: string | null;
  pillarScores: Record<string, number | WireDecimal> | null;
  positiveDrivers: unknown;
  negativeDrivers: unknown;
  upgradeTriggers: unknown;
  downgradeTriggers: unknown;
  reviewDate: WireDate;
}

/* ================== Modules 7 et 8 — KPI et regions ================== */

export interface WireGlobalKpi {
  id: string;
  kpiCode: string;
  kpiName: string;
  value: WireDecimal;
  previousValue: WireDecimal | null;
  change: WireDecimal | null;
  changeType: string | null;
  unit: string | null;
  period: WireDate;
  metadata?: Record<string, unknown>;
}

export interface WireHouseView {
  id: string;
  title: string | null;
  narrative: string | null;
  outlook: string | null;
  scores: Record<string, unknown> | null;
  regionBreakdown: Record<string, unknown> | null;
  period: WireDate;
}

export interface WireRegionSnapshot {
  id: string;
  regionCode: string;
  regionName: string;
  overallScore: WireDecimal | null;
  momentum: string | null;
  riskScore: WireDecimal | null;
  pillarScores: Record<string, number | WireDecimal> | null;
  period: WireDate;
}

/* ===================== Module 9 — Calendrier ===================== */

export interface WireEvent {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  countryCode: string | null;
  regionCode: string | null;
  eventDate: WireDate;
  /** Heure seule, serialisee par Prisma en `@db.Time` — souvent une ISO. */
  eventTime: WireDate | null;
  impact: string | null;
  /** Entier libre cote base ; la planche n'affiche que trois paliers. */
  importance: number | null;
  source: string | null;
  country?: { code: string; name: string } | null;
}

export interface WireDataRelease {
  id: string;
  indicatorId: string;
  countryCode: string;
  releaseDate: WireDate;
  period: WireDate;
  status: string | null;
  actualValue: WireDecimal | null;
  previousValue: WireDecimal | null;
  indicator?: { code: string; name: string; unit: string | null };
  country?: { code: string; name: string };
}

/* ================= Explorateur de donnees — qualite ================= */

export interface WireDataQuality {
  id: string;
  indicatorId: string;
  countryCode: string;
  sourceReliability: string;
  timeliness: string;
  coverage: string;
  revisionVolatility: string;
  breaksStructuralChanges: string;
  overallScore: WireDecimal;
  period: WireDate;
}
