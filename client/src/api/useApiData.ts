import { useQuery } from "@tanstack/react-query";
import { USE_API } from "@/api/client";

/* =========================================================================
 * Le socle de la bascule vers l'API.
 *
 * La regle de l'audit est « les donnees reelles deviennent la source
 * principale, les mocks restent le repli, aucune regression visuelle ». Ce
 * hook en est la mise en oeuvre : le repli est le **plancher**, jamais une
 * alternative. Pendant le chargement, sur erreur reseau, sur 404 ou quand
 * VITE_USE_API n'est pas a `true`, la page affiche les donnees statiques.
 * Elle ne peut donc pas se vider parce qu'une route tarde ou tombe.
 *
 * Pourquoi un hook et pas le `queryFn` par defaut de `lib/queryClient.ts` :
 * celui-la concatene la cle de requete en URL et envoie
 * `credentials: "include"`, que le CORS du backend refuse (il repond
 * `Access-Control-Allow-Origin: *` avec `credentials: true`, combinaison que
 * les navigateurs rejettent). Les appels passent donc par `apiFetch`.
 * ========================================================================= */

export interface ApiData<T> {
  /** La valeur a afficher : celle du backend si elle est arrivee, sinon le repli. */
  data: T;
  /** `true` seulement quand la valeur vient reellement du backend. */
  fromApi: boolean;
  /** Renseigne quand l'appel a echoue, pour le diagnostic — pas pour l'ecran. */
  error: Error | null;
  /** `true` pendant le premier chargement, le repli etant deja affiche. */
  loading: boolean;
}

/**
 * Lit une donnee du backend avec repli sur une valeur statique.
 *
 * @param key      cle de cache React Query
 * @param fetcher  l'adaptateur de `client/src/api/`
 * @param fallback la donnee statique equivalente, affichee tant que l'autre
 *                 n'est pas la
 */
export function useApiData<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T>,
  fallback: T
): ApiData<T> {
  const query = useQuery({
    queryKey: key,
    queryFn: fetcher,
    // Sans bascule explicite, aucun appel reseau n'est emis : le mode statique
    // reste strictement hors ligne.
    enabled: USE_API,
    retry: false,
    // Les series macro ne bougent pas a la minute ; cinq minutes evitent de
    // rejouer la requete a chaque navigation entre onglets.
    staleTime: 5 * 60 * 1000,
  });

  if (!USE_API || query.data === undefined) {
    return {
      data: fallback,
      fromApi: false,
      error: (query.error as Error | null) ?? null,
      loading: USE_API && query.isLoading,
    };
  }

  return { data: query.data, fromApi: true, error: null, loading: false };
}

/**
 * Attribut pose sur le conteneur pour rendre la source lisible sans rien
 * changer a l'apparence.
 *
 * Un badge visible serait une regression visuelle, et une page qui ne dit
 * rien laisse croire qu'elle lit l'API alors qu'elle affiche son repli. Un
 * `data-source` se lit dans l'inspecteur et s'affirme dans un test.
 */
export function sourceAttr(fromApi: boolean): { "data-source": string } {
  return { "data-source": fromApi ? "api" : "mock" };
}
