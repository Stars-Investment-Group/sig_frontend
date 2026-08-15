/**
 * Couche HTTP centralisée pour les appels vers l'API backend.
 *
 * Chaque service (`forecasts`, `intelligence`, etc.) s'appuie sur ces
 * fonctions afin de garantir une gestion d'erreur et une authentification
 * (credentials) cohérentes sur toute l'application.
 */

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = `${res.status}: ${res.statusText}`;
    try {
      // Tentative de récupération d'un message d'erreur structuré
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Réponse non-JSON : on garde le message HTTP par défaut
    }
    throw new Error(message);
  }
}

/** Exécute un GET et retourne le corps JSON typé. */
export async function httpGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  await throwIfResNotOk(response);
  return response.json() as Promise<T>;
}

/** Construit une URL à partir d'un chemin et de paramètres de requête. */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}
