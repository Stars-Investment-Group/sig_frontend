import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch } from "@/api/client";
import { toObservations } from "@/api/macro";
import { getStaticHistory } from "@/data/mockData";
import type { WireMacroData } from "@/api/types";
import type { MacroObservation } from "@shared/schema";

/* =========================================================================
 * Les series d'un bloc d'indicateurs, pour tous les pays.
 *
 * Pourquoi par indicateur et non par pays
 * ---------------------------------------
 * La matrice des indicateurs croise vingt-quatre pays et les deux a sept
 * indicateurs du bloc ouvert. Chaque cellule a besoin des **deux derniers
 * points** — la valeur et sa variation — et la colonne active affiche une
 * sparkline, donc la serie entiere. `/macro-data/latest` n'en donne qu'un
 * point : la variation tomberait a zero partout et les sparklines seraient
 * plates.
 *
 * `GET /macro-data?indicator=XXX` rend en revanche les 624 lignes de cet
 * indicateur pour les vingt-quatre pays, en un appel. Un bloc coute donc
 * entre deux et sept requetes, et non vingt-quatre.
 *
 * Concurrence bridee
 * ------------------
 * Les requetes partent par lots de trois. Le pool Prisma du backend est
 * etroit et chaque aller-retour prend une demi-seconde : sept appels
 * simultanes le saturent, et les autres routes repondent alors 400 — c'est
 * exactement ce qui arrive quand `/country-screener` tourne.
 * ========================================================================= */

/** Series d'un indicateur, indexees par code pays. */
type ParPays = Map<string, MacroObservation[]>;

async function fetchIndicator(code: string): Promise<[string, ParPays]> {
  const body = await apiFetch<{ data?: WireMacroData[] } | WireMacroData[]>(
    "/macro-data",
    { query: { indicator: code } }
  );
  const rows = Array.isArray(body) ? body : body.data ?? [];

  const parPays = new Map<string, WireMacroData[]>();
  for (const row of rows) {
    const bucket = parPays.get(row.countryCode) ?? [];
    bucket.push(row);
    parPays.set(row.countryCode, bucket);
  }

  const out: ParPays = new Map();
  parPays.forEach((bucket, pays) => out.set(pays, toObservations(bucket)));
  return [code, out];
}

/** Par lots, pour ne pas saturer le pool du backend. */
async function parLots<T, R>(
  items: T[],
  taille: number,
  travail: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += taille) {
    const lot = await Promise.all(items.slice(i, i + taille).map(travail));
    out.push(...lot);
  }
  return out;
}

async function fetchBloc(codes: string[]): Promise<Map<string, ParPays>> {
  const paires = await parLots(codes, 3, fetchIndicator);
  return new Map(paires);
}

/**
 * Un accesseur de serie pour le bloc demande.
 *
 * Signature identique a `getStaticHistory`, qui reste le repli indicateur par
 * indicateur : un code que l'API n'a pas rendu garde sa serie statique plutot
 * que de vider sa colonne.
 */
export type SeriesLookup = (
  countryCode: string,
  indicatorCode: string
) => MacroObservation[];

export function useIndicatorSeries(codes: string[]): ApiData<SeriesLookup> {
  // La cle de cache doit etre stable : un bloc est un ensemble, pas un ordre.
  const cle = useMemo(() => [...codes].sort().join(","), [codes]);

  const { data, fromApi, error, loading } = useApiData(
    ["macro-data", "par-indicateur", cle],
    () => fetchBloc(cle ? cle.split(",") : []),
    null as Map<string, ParPays> | null
  );

  const lookup = useMemo<SeriesLookup>(
    () => (countryCode, indicatorCode) => {
      const serie = data?.get(indicatorCode)?.get(countryCode);
      if (serie && serie.length > 0) return serie;
      return getStaticHistory(countryCode, indicatorCode);
    },
    [data]
  );

  return { data: lookup, fromApi: fromApi && data !== null, error, loading };
}
