import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch } from "@/api/client";
import { toObservations } from "@/api/macro";
import { regimeIndex, useRegimes } from "@/api/regimes";
import { getRating, getStaticHistory } from "@/data/mockData";
import { STATIC_SOURCES, type ProfileSources } from "@/data/countryProfile";
import type { WireMacroData } from "@/api/types";
import type { MacroObservation } from "@shared/schema";

/* =========================================================================
 * Les sources du profil pour **tout l'univers**.
 *
 * A quoi cela sert
 * ----------------
 * Le screener, la liste de suivi, les themes et les parametres appellent
 * `getCountryProfile` dans une boucle sur vingt-quatre pays. La fiche pays a
 * ses propres sources (`countrySources.ts`), qui chargent l'historique
 * complet d'un seul pays ; ces quatre pages, elles, n'affichent que des
 * dernieres valeurs — croissance, inflation, solde budgetaire, risque — et le
 * regime. Deux requetes en masse suffisent donc, la ou charger l'historique
 * des vingt-quatre pays en demanderait vingt-quatre.
 *
 *   `/macro-data/latest`  — la derniere valeur des 576 series, en un appel
 *   `/macro-regime`       — un regime par pays (cache partage avec la carte)
 *
 * Ce que ce branchement ne couvre pas, et pourquoi
 * -----------------------------------------------
 * **Le score composite reste statique.** Aucune route ne rend la notation des
 * vingt-quatre pays : `/country-rating/:pays` en sert un seul, et
 * `/global-kpi/movers` tronque a dix (`movers.slice(0, 10)`, code en dur, sans
 * parametre). Les appeler un par un depuis le navigateur reproduirait cote
 * client le N+1 que l'on reproche au screener — vingt-quatre allers-retours
 * HTTP pour une colonne.
 *
 * Les chiffres concordent aujourd'hui parce que la base a ete semee depuis ces
 * memes fixtures : rien ne se voit a l'ecran. Le jour ou le backend calculera
 * de vraies notations, cette colonne divergera du reste de la page, et il
 * faudra une route en masse. La demande est minuscule de leur cote : un
 * `?limit=` sur `/global-kpi/movers`, ou un `GET /country-rating` sans
 * parametre.
 * ========================================================================= */

/**
 * Derniere valeur de chaque serie de l'univers, indexee `PAYS|indicateur`.
 *
 * Exportee parce que la fiche pays s'en sert aussi, pour ses pairs. La cle
 * de cache etant la meme des deux cotes, la requete ne part qu'une fois.
 */
export async function fetchUniverseLatest(): Promise<Map<string, MacroObservation>> {
  const body = await apiFetch<{ data?: WireMacroData[] } | WireMacroData[]>(
    "/macro-data/latest"
  );
  const rows = Array.isArray(body) ? body : body.data ?? [];

  const out = new Map<string, MacroObservation>();
  for (const row of rows) {
    const code = row.indicator?.code;
    if (!code) continue;
    // Une ligne isolee : `previousValue` et `change` restent nuls, ce qui est
    // exact — une observation seule ne connait pas celle qui la precede. Ces
    // pages n'en lisent pas.
    const [obs] = toObservations([row]);
    if (obs) out.set(`${row.countryCode}|${code}`, obs);
  }
  return out;
}

/**
 * Les sources d'univers, pour les pages qui parcourent les pays.
 *
 * `fromApi` ne vaut `true` que si les dernieres valeurs sont arrivees : ce
 * sont elles qui portent les chiffres de ces tableaux. Le regime complete
 * quand il arrive, et chaque serie retombe sur le statique independamment —
 * un tableau n'est donc jamais a moitie vide.
 */
export function useUniverseSources(): ApiData<ProfileSources> {
  const regimes = useRegimes();

  const dernieres = useApiData(
    ["macro-data", "latest"],
    fetchUniverseLatest,
    null as Map<string, MacroObservation> | null
  );

  const parCode = useMemo(() => regimeIndex(regimes.data), [regimes.data]);

  const sources = useMemo<ProfileSources>(
    () => ({
      regime: (c) => parCode.get(c) ?? STATIC_SOURCES.regime(c),

      // Pas de notation servie par l'API ici : voir l'en-tete.
      rating: (c) => getRating(c),

      history: (c, indicateur) => {
        const point = dernieres.data?.get(`${c}|${indicateur}`);
        if (point) return [point];
        return getStaticHistory(c, indicateur);
      },
    }),
    [parCode, dernieres.data]
  );

  return {
    data: sources,
    fromApi: dernieres.data !== null,
    error: dernieres.error ?? regimes.error,
    loading: dernieres.loading,
  };
}
