import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch, toNumber } from "@/api/client";
import { toObservations } from "@/api/macro";
import { regimeIndex, useRegimes } from "@/api/regimes";
import { fetchUniverseLatest } from "@/api/universeSources";
import { getRating, getStaticHistory } from "@/data/mockData";
import {
  STATIC_SOURCES,
  type ProfileSources,
} from "@/data/countryProfile";
import type { WireMacroData } from "@/api/types";
import type { CountryRating, MacroObservation, PillarScore } from "@shared/schema";

/* =========================================================================
 * Les sources du profil pays, servies par le backend.
 *
 * Trois requetes en masse, pas une par serie
 * ------------------------------------------
 * La fiche pays lit vingt-quatre series pour son pays et la derniere valeur
 * de six indicateurs pour chacun de ses pairs. Appeler
 * `/macro-data/:pays/:indicateur` autant de fois couterait pres de deux
 * cents requetes, et depuis ici chaque aller-retour prend une demi-seconde.
 * On passe donc par :
 *
 *   `/macro-data?country=XXX`  — les 624 observations du pays, en un appel
 *   `/macro-data/latest`       — la derniere valeur des 24 x 24 series
 *   `/macro-regime`            — un regime par pays (cache partage)
 *   `/country-rating/XXX`      — la notation du pays affiche
 *
 * L'historique complet n'est donc charge que pour le pays de la fiche. Les
 * pairs n'en ont pas besoin : le tableau comparatif ne lit que leur derniere
 * valeur. Une serie reduite a un point suffit, et c'est ce que `latest`
 * fournit.
 *
 * Echelle des scores
 * ------------------
 * **La base stocke les scores sur 100, le contrat front les lit sur 10.** La
 * division se fait ici, une fois, pour le composite comme pour les piliers.
 * Sans elle la fiche afficherait 650 sur 100.
 * ========================================================================= */

/* ----------------------------------------------------------- observations */

type SeriesByIndicator = Map<string, MacroObservation[]>;

/** Regroupe des lignes brutes par code indicateur, chacune triee par periode. */
function groupByIndicator(rows: WireMacroData[]): SeriesByIndicator {
  const parCode = new Map<string, WireMacroData[]>();
  for (const row of rows) {
    const code = row.indicator?.code;
    if (!code) continue;
    const bucket = parCode.get(code) ?? [];
    bucket.push(row);
    parCode.set(code, bucket);
  }

  const out: SeriesByIndicator = new Map();
  parCode.forEach((bucket, code) => out.set(code, toObservations(bucket)));
  return out;
}

async function fetchCountryHistory(code: string): Promise<SeriesByIndicator> {
  const body = await apiFetch<{ data?: WireMacroData[] } | WireMacroData[]>(
    "/macro-data",
    { query: { country: code.toUpperCase() } }
  );
  return groupByIndicator(Array.isArray(body) ? body : body.data ?? []);
}

/* ---------------------------------------------------------------- notation */

interface WireRating {
  countryCode: string;
  overallScore: unknown;
  rating: string | null;
  pillars: Record<string, unknown> | null;
  positiveDrivers: unknown;
  negativeDrivers: unknown;
  upgradeTriggers: unknown;
  downgradeTriggers: unknown;
  reviewDate: string | null;
}

async function fetchRatingRecord(code: string): Promise<WireRating> {
  return apiFetch<WireRating>(`/country-rating/${code.toUpperCase()}`);
}

const sur10 = (value: unknown): number | null => {
  const n = toNumber(value);
  return n === null ? null : Math.round((n / 10) * 100) / 100;
};

/**
 * Fusionne la notation de l'API avec la notation statique.
 *
 * Ce que la table ne porte pas : `outlook`, `watchStatus`, `confidence`,
 * `rank`, `universe`, `changeSincePrior`, et sur chaque pilier le libelle, le
 * `vsPrior` et le percentile. Ces champs restent statiques — et `rank` comme
 * `universe` viendront du classement du screener, dont la route est
 * actuellement inutilisable.
 */
function mergeRating(base: CountryRating, wire: WireRating | null): CountryRating {
  if (!wire) return base;

  const composite = sur10(wire.overallScore);
  const scores = wire.pillars ?? {};

  const pillars: PillarScore[] = base.pillars.map((p) => {
    const score = sur10(scores[p.key]);
    return score === null ? p : { ...p, score };
  });

  const asList = (value: unknown, repli: string[]): string[] =>
    Array.isArray(value) && value.every((v) => typeof v === "string")
      ? (value as string[])
      : repli;

  return {
    ...base,
    compositeScore: composite ?? base.compositeScore,
    pillars,
    upgradeTriggers: asList(wire.upgradeTriggers, base.upgradeTriggers),
    downgradeTriggers: asList(wire.downgradeTriggers, base.downgradeTriggers),
  };
}

/* ------------------------------------------------------------------ hook */

/**
 * Les sources du profil pour un pays donne.
 *
 * `fromApi` ne vaut `true` que si l'historique **de ce pays** est arrive :
 * c'est lui qui porte les chiffres de la fiche. Le reste — regimes, dernieres
 * valeurs de l'univers, notation — complete quand il arrive et retombe sur le
 * statique sinon, serie par serie. Une fiche n'est donc jamais a moitie vide.
 */
export function useCountrySources(code: string): ApiData<ProfileSources> {
  const regimes = useRegimes();

  const histoire = useApiData(
    ["macro-data", "country", code],
    () => fetchCountryHistory(code),
    null as SeriesByIndicator | null
  );

  const dernieres = useApiData(
    ["macro-data", "latest"],
    fetchUniverseLatest,
    null as Map<string, MacroObservation> | null
  );

  const notation = useApiData(
    ["country-rating", code],
    () => fetchRatingRecord(code),
    null as WireRating | null
  );

  const parCode = useMemo(() => regimeIndex(regimes.data), [regimes.data]);

  const sources = useMemo<ProfileSources>(
    () => ({
      regime: (c) => parCode.get(c) ?? STATIC_SOURCES.regime(c),

      rating: (c) =>
        c === code
          ? mergeRating(getRating(c), notation.data)
          : getRating(c),

      history: (c, indicateur) => {
        if (c === code) {
          const serie = histoire.data?.get(indicateur);
          if (serie && serie.length > 0) return serie;
        }
        const point = dernieres.data?.get(`${c}|${indicateur}`);
        if (point) return [point];
        return getStaticHistory(c, indicateur);
      },
    }),
    [code, parCode, notation.data, histoire.data, dernieres.data]
  );

  return {
    data: sources,
    fromApi: histoire.data !== null,
    error: histoire.error ?? notation.error ?? dernieres.error ?? regimes.error,
    loading: histoire.loading,
  };
}
