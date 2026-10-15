import { useApiData, type ApiData } from "@/api/useApiData";
import { fetchKpis, fetchMovers, type GlobalKpi, type Mover } from "@/api/analytics";
import {
  buildMover,
  globalKpis,
  topMovers,
  type CountryMover,
  type IndicatorKpi,
} from "@/data/mockDashboard";

/* =========================================================================
 * Planche P1 — la bande des quatre KPI mondiaux, servie par l'API.
 *
 * Partage des roles
 * -----------------
 * `global_kpis` porte le **chiffre** : valeur, valeur precedente, variation.
 * Elle ne porte ni sparkline, ni icone, ni sous-titre — la maquette en a
 * besoin, le modele ne les prevoit pas. L'API fournit donc les nombres et le
 * fixture la presentation, jusqu'a ce que le backend sache servir une serie
 * courte par KPI.
 *
 * Le nombre de decimales est repris de la chaine du fixture, pas fixe ici :
 * la maquette montre « 3.1 » pour la croissance et « 4.25 » pour le taux. Un
 * `toFixed(1)` uniforme afficherait « 4.3 » et la bande changerait d'aspect a
 * la bascule, ce que l'audit interdit explicitement.
 * ========================================================================= */

/** Codes de la table, en regard des identifiants du fixture. */
const CODE_BY_ICON: Record<IndicatorKpi["id"], string> = {
  growth: "global_growth",
  inflation: "global_inflation",
  rate: "global_policy_rate",
  // `/global-kpi/risk-index` interroge ce code en dur cote backend.
  risk: "risk_index",
};

/** Decimales affichees par le fixture, pour ne pas changer la mise en forme. */
function decimalsOf(text: string): number {
  return (text.split(".")[1] ?? "").length;
}

/**
 * Fusionne un KPI de l'API avec sa presentation statique.
 *
 * Un code absent de la reponse garde entierement sa ligne statique : une
 * colonne vide serait pire que la valeur illustrative qu'elle remplace.
 */
function merge(mock: IndicatorKpi, rows: GlobalKpi[]): IndicatorKpi {
  const row = rows.find((r) => r.code === CODE_BY_ICON[mock.id]);
  if (!row) return mock;

  return {
    ...mock,
    value: row.value.toFixed(decimalsOf(mock.value)),
    delta: row.change ?? mock.delta,
  };
}

/**
 * Les quatre KPI de la planche, du backend quand il repond, du fixture sinon.
 *
 * Le repli n'est pas un secours exceptionnel : c'est le plancher. Tant que la
 * requete est en vol, la bande affiche les valeurs statiques et ne clignote
 * pas.
 */
export function useGlobalKpis(): ApiData<IndicatorKpi[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["global-kpi", "kpis"],
    fetchKpis,
    [] as GlobalKpi[]
  );

  return {
    data: globalKpis.map((mock) => merge(mock, data)),
    fromApi: fromApi && data.length > 0,
    error,
    loading,
  };
}

/* ---------------------------------------------- Top Movers (planche P1) */

/**
 * Les six plus forts mouvements de notation.
 *
 * Ce que l'API apporte et ce qu'elle n'apporte pas
 * ------------------------------------------------
 * `/global-kpi/movers` donne le score courant, le score precedent et l'ecart.
 * Elle ne donne ni sparkline ni momentum de regime, que la maquette affiche :
 * la fleche et la couleur de la courbe viennent du momentum, pas du sens de
 * l'ecart. Ce sont deux notions distinctes — un pays peut gagner des points de
 * notation tout en restant en regime de transition — et les confondre
 * changerait le sens de la fleche sans que rien ne le signale.
 *
 * L'ordre, en revanche, revient a l'API : c'est elle qui sait qui a le plus
 * bouge. Un pays qu'elle ne renvoie pas n'est pas un pays stable, c'est un
 * pays dont elle ignore le mouvement — faute de deux revues de notation.
 */
export function useTopMovers(): ApiData<CountryMover[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["global-kpi", "movers"],
    fetchMovers,
    [] as Mover[]
  );

  if (!fromApi || data.length === 0) {
    return { data: topMovers, fromApi: false, error, loading };
  }

  const rows = data
    .map((m) => {
      const base = buildMover(m.countryCode);
      if (!base) return null;
      return {
        row: {
          ...base,
          score: m.score === null ? base.score : Math.round(m.score),
          delta: m.change === null ? base.delta : Math.round(m.change),
        },
        // Le tri se fait sur l'ecart **non arrondi**. Arrondi, il vaut +3 pour
        // cinq pays sur six et l'ordre des ex aequo revient au hasard du
        // retour de l'API ; la rangee changerait d'ordre a chaque appel.
        exact: Math.abs(m.change ?? base.delta / 10),
      };
    })
    .filter((m): m is { row: CountryMover; exact: number } => m !== null)
    .sort((a, b) => b.exact - a.exact)
    .slice(0, 6)
    .map((m) => m.row);

  // Une liste vide apres filtrage voudrait dire que l'API parle de pays que le
  // catalogue ignore : mieux vaut la planche statique qu'une rangee vide.
  return rows.length > 0
    ? { data: rows, fromApi: true, error: null, loading: false }
    : { data: topMovers, fromApi: false, error, loading };
}
