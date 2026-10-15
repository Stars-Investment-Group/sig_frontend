/**
 * Client HTTP du backend SIG.
 *
 * Contrat releve sur `Stars-Investment-Group/backend_tracker@main` le
 * 2026-10-13 :
 *  - base `http://localhost:3000`, **aucun prefixe global** (`/api` ne sert que
 *    Swagger) ;
 *  - les reponses sont les **enregistrements Prisma bruts**, en camelCase, sans
 *    enveloppe `{ success, data }` — aucun intercepteur global ne les emballe,
 *    seuls des gardes sont enregistres dans `app.module.ts` ;
 *  - les erreurs ont une forme stable, posee par `AllExceptionsFilter` ;
 *  - les champs `Decimal` de Prisma arrivent en **chaines**, les dates en ISO ;
 *  - les listes ne sont **pas paginees**.
 *
 * Tout ce dont les pages macro ont besoin est `@Public()` : pays, indicateurs,
 * donnees macro, regimes, notation, screener, regions, KPI globaux, calendrier
 * et explorateur. Seuls `alerts` et `watchlists` demandent un jeton.
 */

/** Forme d'erreur posee par `AllExceptionsFilter` cote backend. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;
  readonly url: string;

  constructor(url: string, status: number, body: ApiErrorBody | null) {
    const detail = Array.isArray(body?.message)
      ? body?.message.join(", ")
      : body?.message;
    super(detail ? `${status} ${detail}` : `${status} sur ${url}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body ?? null;
    this.url = url;
  }
}

/**
 * Base de l'API.
 *
 * `VITE_API_URL` la surcharge au build — c'est ce qui changera a
 * l'hebergement OVH, sans toucher au code.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ??
  "http://localhost:3000";

/**
 * Faut-il appeler l'API ?
 *
 * Tant que `VITE_USE_API` ne vaut pas `"true"`, l'application tourne sur les
 * donnees statiques. C'est ce qui permet de livrer l'integration par morceaux
 * sans jamais casser une page : la regle de l'audit est que la donnee reelle
 * devienne la source primaire **et que les mocks restent le repli**.
 */
export const USE_API: boolean = import.meta.env.VITE_USE_API === "true";

/**
 * Delai au-dela duquel une requete est abandonnee, en millisecondes.
 *
 * Genereux a dessein. Les pages affichent leurs donnees statiques tant que la
 * reponse n'est pas la (`useApiData`), donc un delai long ne retarde aucun
 * affichage : il laisse seulement sa chance a une base endormie. Un point
 * d'acces Neon suspendu met une dizaine de secondes a se reveiller, et douze
 * secondes faisaient echouer la premiere requete apres une periode creuse —
 * la page restait sur ses mocks sans raison.
 *
 * `VITE_API_TIMEOUT_MS` permet de le resserrer en production, ou le serveur
 * est cense repondre vite et ou un appel qui traine vaut mieux abandonne.
 */
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30_000);

let accessToken: string | null = null;

/** Memorise le jeton pour les routes protegees (`alerts`, `watchlists`). */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export interface RequestOptions {
  /** Parametres de requete ; les valeurs nulles ou vides sont ignorees. */
  query?: Record<string, string | number | boolean | undefined | null>;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    `${API_BASE_URL}/`
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Appelle le backend et rend le JSON type.
 *
 * On n'envoie **pas** `credentials: "include"` : le backend repond
 * `Access-Control-Allow-Origin: *` avec `credentials: true`, combinaison que
 * les navigateurs refusent pour une requete creditee. L'authentification passe
 * par l'en-tete `Authorization`, qui n'en a pas besoin.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(path, options.query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Un signal fourni par l'appelant doit pouvoir annuler aussi.
  options.signal?.addEventListener("abort", () => controller.abort(), {
    once: true,
  });

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let body: ApiErrorBody | null = null;
      try {
        body = (await response.json()) as ApiErrorBody;
      } catch {
        // Une 502 d'un proxy ne rend pas forcement du JSON.
      }
      throw new ApiError(url, response.status, body);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/* =========================================================================
 * Conversions de bord
 *
 * Prisma serialise ses `Decimal` en **chaines** et ses dates en ISO. Laisser
 * passer une chaine la ou le reste de l'application attend un nombre produit
 * des `NaN` silencieux dans les graphiques et des tris faux.
 * ========================================================================= */

/** Nombre depuis un `Decimal` Prisma, `null` quand la valeur est absente. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Comme `toNumber`, mais avec une valeur de repli explicite. */
export function toNumberOr(value: unknown, fallback: number): number {
  return toNumber(value) ?? fallback;
}

/** Date depuis une chaine ISO, `null` quand elle est absente ou invalide. */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Periode `YYYY-MM` depuis une date ISO ; c'est la cle des series du front. */
export function toPeriod(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Jour `YYYY-MM-DD`, pour les millesimes et les dates de publication. */
export function toIsoDay(value: unknown): string | null {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}
