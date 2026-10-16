import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { fetchSeries, fetchVintages, toObservations } from "@/api/macro";
import {
  STATIC_INDICATORS,
  getStaticHistory,
  getVintages,
} from "@/data/mockData";
import type { MacroObservation } from "@shared/schema";

/* =========================================================================
 * Module 3 — l'Explorateur de Donnees, servi par l'API.
 *
 * C'est la page que la dimension millesime rendait possible, et la seule qui
 * montre les revisions : une periode n'y a pas une valeur mais une suite
 * d'etats de connaissance. Les colonnes « 3M Ago » et « 1Y Ago » de la
 * maquette ne sont pas des periodes anterieures, ce sont des **millesimes**
 * anterieurs de la meme periode.
 *
 * Deux requetes
 * -------------
 *   `/macro-data/:pays/:indicateur`           — la serie, millesime final
 *   `/macro-data/:pays/:indicateur/vintages`  — toutes les revisions
 *
 * Les deux rendent les memes 26 lignes brutes sur 12 periodes. La premiere
 * passe par `toObservations`, qui reduit au millesime final ; la seconde est
 * lue brute, puisque c'est precisement l'empilement des millesimes qui
 * l'interesse.
 * ========================================================================= */

export interface VintageRow {
  /** La periode, `YYYY-MM`. Nommee `year` par la page, qui date d'avant. */
  year: string;
  latest: number;
  prev: number;
  change: number;
  first: string;
  obs: number;
}

export interface ExplorerSeries {
  chart: { year: string; value: number }[];
  vintageRows: VintageRow[];
  source: string;
  frequency: "Monthly" | "Quarterly";
  range: { from: string; to: string };
  /** Les millesimes d'une periode, du plus recent au plus ancien. */
  vintagesFor(period: string): MacroObservation[];
  /**
   * Valeur d'une periode **telle qu'on la connaissait** il y a N mois : le
   * millesime le plus recent publie avant la date cible.
   */
  valueAsOf(period: string, monthsBack: number): number | null;
}

/* ------------------------------------------------------------ derivations */

function buildRows(
  history: MacroObservation[],
  vintagesFor: (period: string) => MacroObservation[]
): VintageRow[] {
  return history
    .slice()
    .reverse()
    .map((obs) => {
      const vintages = vintagesFor(obs.period);
      const previous = vintages[1] ?? null;
      return {
        year: obs.period,
        latest: obs.value,
        prev: previous ? previous.value : obs.value,
        change: previous ? Math.round((obs.value - previous.value) * 10) / 10 : 0,
        first: vintages[vintages.length - 1]?.releaseDate ?? obs.releaseDate,
        obs: vintages.length,
      };
    });
}

function makeValueAsOf(
  vintagesFor: (period: string) => MacroObservation[]
): ExplorerSeries["valueAsOf"] {
  return (period, monthsBack) => {
    const vintages = vintagesFor(period);
    if (!vintages.length) return null;

    const [y, m, d] = vintages[0].vintageDate.split("-").map(Number);
    // Les dates de millesime sont calees au 1er du mois : pas de debordement.
    const target = new Date(y, m - 1 - monthsBack, d);
    const pad = (n: number) => String(n).padStart(2, "0");
    const targetIso = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
      target.getDate()
    )}`;

    const known = vintages.find((v) => v.vintageDate <= targetIso);
    return known ? known.value : null;
  };
}

function assemble(
  indicatorCode: string,
  history: MacroObservation[],
  vintagesFor: (period: string) => MacroObservation[]
): ExplorerSeries {
  const chart = history.map((o) => ({ year: o.period, value: o.value }));
  const meta = STATIC_INDICATORS.find((i) => i.code === indicatorCode);

  return {
    chart,
    vintageRows: buildRows(history, vintagesFor),
    // Source et frequence sont des metadonnees de catalogue. La route
    // `/indicators/:code` les porte aussi, mais le front les a deja et elles
    // ne changent pas d'un millesime a l'autre.
    source: meta?.source ?? "n/d",
    frequency: meta?.frequency === "Monthly" ? "Monthly" : "Quarterly",
    range: {
      from: chart[0]?.year ?? "n/d",
      to: chart[chart.length - 1]?.year ?? "n/d",
    },
    vintagesFor,
    valueAsOf: makeValueAsOf(vintagesFor),
  };
}

/* ------------------------------------------------------------------ hook */

interface Charge {
  history: MacroObservation[];
  /** Les millesimes groupes par periode, du plus recent au plus ancien. */
  parPeriode: Map<string, MacroObservation[]>;
}

async function fetchExplorer(country: string, indicator: string): Promise<Charge> {
  const [serie, millesimes] = await Promise.all([
    fetchSeries(country, indicator),
    fetchVintages(country, indicator),
  ]);

  const history = toObservations(serie);

  const parPeriode = new Map<string, MacroObservation[]>();
  for (const obs of toutesLesLignes(millesimes)) {
    const bucket = parPeriode.get(obs.period) ?? [];
    bucket.push(obs);
    parPeriode.set(obs.period, bucket);
  }
  // Du plus recent au plus ancien : la page lit `[0]` comme le millesime
  // courant et `[1]` comme le precedent.
  parPeriode.forEach((bucket) =>
    bucket.sort((a, b) => b.vintageDate.localeCompare(a.vintageDate))
  );

  return { history, parPeriode };
}

/**
 * Convertit les lignes de millesimes **sans** les reduire.
 *
 * `toObservations` ne garde qu'un millesime par periode — c'est ce qu'il faut
 * pour une serie, et exactement ce qu'il ne faut pas ici. On convertit donc
 * ligne par ligne : chacune devient une observation isolee, ce qui laisse
 * `previousValue` nul, sans consequence puisque cette page compare des
 * millesimes et non des periodes.
 */
function toutesLesLignes(
  rows: Parameters<typeof toObservations>[0]
): MacroObservation[] {
  return rows.flatMap((row) => toObservations([row]));
}

/**
 * La serie de l'explorateur, du backend quand il repond, du statique sinon.
 *
 * Le repli reconstruit exactement la meme forme depuis `getStaticHistory` et
 * `getVintages` : la page ne sait pas d'ou viennent ses lignes.
 */
export function useExplorerSeries(
  country: string,
  indicator: string
): ApiData<ExplorerSeries> {
  const { data, fromApi, error, loading } = useApiData(
    ["explorer", country, indicator],
    () => fetchExplorer(country, indicator),
    null as Charge | null
  );

  const serie = useMemo<ExplorerSeries>(() => {
    if (data && data.history.length > 0) {
      const vintagesFor = (period: string) => data.parPeriode.get(period) ?? [];
      return assemble(indicator, data.history, vintagesFor);
    }
    return assemble(indicator, getStaticHistory(country, indicator), (period) =>
      getVintages(country, indicator, period)
    );
  }, [data, country, indicator]);

  return {
    data: serie,
    fromApi: fromApi && (data?.history.length ?? 0) > 0,
    error,
    loading,
  };
}
