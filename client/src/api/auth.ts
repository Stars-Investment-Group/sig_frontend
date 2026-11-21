import { apiFetch } from "@/api/client";

/* =========================================================================
 * Le module d'authentification, releve sur le backend le 2026-11-21.
 *
 * Trois routes sont `@Public()` — `register`, `login`, `refresh` — et deux
 * demandent le jeton : `logout` et `me`. Rien ici n'est suppose : chaque
 * enveloppe ci-dessous a ete lue dans `src/auth/auth.service.ts` et
 * `auth.controller.ts`, qui ne les emballent pas de la meme facon.
 *
 *   POST /auth/login     -> { success, message, user, accessToken,
 *                             refreshToken, tokenType, expiresIn }
 *   POST /auth/register  -> la meme forme
 *   POST /auth/refresh   -> { accessToken, refreshToken, tokenType,
 *                             expiresIn }   **sans `user`**
 *   GET  /auth/me        -> { success, user }
 *   POST /auth/logout    -> { success, message }
 *
 * Le jeton d'acces vit **une heure** (`expiresIn: 3600`), celui de
 * rafraichissement sept jours. C'est ce qui impose le renouvellement
 * silencieux d'`AuthContext` : sans lui, une session ouverte le matin
 * echouerait a midi sur la premiere route protegee, et `useApiData`
 * afficherait tranquillement le repli a la place — une page « privee »
 * remplie de chiffres fabriques, sans le moindre signal.
 * ========================================================================= */

export type UserRole = "USER" | "ADMIN" | (string & {});

/** Le profil tel que le backend le rend, prive de ses deux hachages. */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  role: UserRole;
  theme: string;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** Duree de vie du jeton d'acces, en secondes (3600 aujourd'hui). */
  expiresIn: number;
}

export interface Session extends Tokens {
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

interface WireSession {
  success: boolean;
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface WireTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

function toSession(body: WireSession): Session {
  return {
    user: body.user,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: body.expiresIn ?? 3600,
  };
}

export async function loginRequest(
  email: string,
  password: string
): Promise<Session> {
  return toSession(
    await apiFetch<WireSession>("/auth/login", {
      method: "POST",
      body: { email, password },
    })
  );
}

/**
 * Inscription.
 *
 * Le backend impose un mot de passe de 8 caracteres au moins, avec une
 * majuscule, une minuscule et un chiffre ou un symbole
 * (`RegisterDto.@Matches`). La meme regle est verifiee cote ecran avant
 * l'envoi, pour que l'utilisateur la lise avant le refus plutot qu'apres.
 */
export async function registerRequest(input: RegisterInput): Promise<Session> {
  return toSession(
    await apiFetch<WireSession>("/auth/register", {
      method: "POST",
      // Les champs vides sont omis : le DTO les declare optionnels, pas vides.
      body: {
        email: input.email,
        password: input.password,
        ...(input.firstName ? { firstName: input.firstName } : {}),
        ...(input.lastName ? { lastName: input.lastName } : {}),
        ...(input.company ? { company: input.company } : {}),
      },
    })
  );
}

/**
 * Renouvelle la paire de jetons.
 *
 * Le backend **fait tourner** le jeton de rafraichissement : il en rend un
 * nouveau et invalide l'ancien, et une reutilisation du precedent declenche
 * `SECURITY_TOKEN_REUSE_DETECTED` puis un 403. Il faut donc toujours stocker
 * celui que cette reponse rend, jamais reutiliser celui qu'on a envoye.
 */
export async function refreshRequest(refreshToken: string): Promise<Tokens> {
  const body = await apiFetch<WireTokens>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: body.expiresIn ?? 3600,
  };
}

/** Le profil de la session en cours ; exige l'en-tete `Authorization`. */
export async function meRequest(): Promise<AuthUser> {
  const body = await apiFetch<{ success: boolean; user: AuthUser }>("/auth/me");
  return body.user;
}

/** Revoque le jeton de rafraichissement cote serveur. */
export async function logoutRequest(): Promise<void> {
  await apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" });
}

/** Initiales pour la pastille d'avatar, sans jamais rendre une chaine vide. */
export function initialsOf(user: AuthUser): string {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

/** Nom affichable, avec l'adresse pour seul recours. */
export function displayNameOf(user: AuthUser): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email;
}
