import { useApiData, type ApiData } from "@/api/useApiData";
import { fetchRegimes, toRegime } from "@/api/macro";
import { STATIC_REGIMES } from "@/data/mockData";
import type { MacroRegime } from "@shared/schema";

/* =========================================================================
 * Module 4 — les regimes macro, servis par l'API.
 *
 * `/macro-regime` rend un regime par pays, exactement ce que `STATIC_REGIMES`
 * contient. Le repli est donc de meme forme et de meme cardinalite : la
 * bascule ne deplace aucune pastille.
 *
 * Une precaution qui compte
 * -------------------------
 * `macro_regimes` n'a **aucune contrainte d'unicite** cote base. Rien
 * n'empeche deux regimes courants pour le meme pays, et la carte comme le
 * compteur de la page afficheraient alors un pays deux fois. On ne garde donc
 * que le premier regime rencontre par pays, la route les rendant du plus
 * recent au plus ancien.
 * ========================================================================= */

/** Un seul regime par pays, le plus recent. */
function dedupe(rows: MacroRegime[]): MacroRegime[] {
  const vu = new Map<string, MacroRegime>();
  for (const r of rows) {
    if (!vu.has(r.countryCode)) vu.set(r.countryCode, r);
  }
  return Array.from(vu.values());
}

/**
 * La liste des regimes, du backend quand il repond, du statique sinon.
 *
 * Les pages lisent `data` sans savoir d'ou il vient — c'est le but. Un
 * tableau vide n'est jamais rendu : une carte des regimes sans couleur et une
 * carte en panne se ressemblent trop.
 */
export function useRegimes(): ApiData<MacroRegime[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["macro-regime", "list"],
    async () => dedupe((await fetchRegimes()).map(toRegime)),
    [] as MacroRegime[]
  );

  return data.length > 0
    ? { data, fromApi, error, loading }
    : { data: STATIC_REGIMES, fromApi: false, error, loading };
}

/**
 * Index par code, pour les pages qui cherchent un pays plutot qu'une liste.
 *
 * Volontairement sans repli implicite sur un autre pays : c'est la regle
 * `?? LIST[0]` qui avait fait herite huit pays de la notation americaine.
 * Une absence se lit `undefined` et se traite sur place.
 */
export function regimeIndex(rows: MacroRegime[]): Map<string, MacroRegime> {
  return new Map(rows.map((r) => [r.countryCode, r]));
}
