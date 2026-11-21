import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { queryClient } from "@/lib/queryClient";
import { ApiError, setAccessToken, setReauthorizer, USE_API } from "@/api/client";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
  type AuthUser,
  type RegisterInput,
  type Tokens,
} from "@/api/auth";

/* =========================================================================
 * La session.
 *
 * Quatre etats, et le premier est le moins evident :
 *
 *   « offline »       — `VITE_USE_API` n'est pas a `true`. Il n'y a pas de
 *                       backend, donc **pas de comptes**, donc rien a
 *                       verifier. C'est le mode de la demonstration publiee
 *                       sur GitHub Pages. Les gardes laissent passer et la
 *                       page le dit : un ecran de connexion qui ne peut
 *                       aboutir serait pire qu'aucun.
 *   « loading »       — un jeton de rafraichissement est en magasin, on
 *                       tente de rouvrir la session avant de rendre la page.
 *   « anonymous »     — pas de session.
 *   « authenticated » — `user` est renseigne.
 *
 * Ou vit le jeton de rafraichissement
 * -----------------------------------
 * Dans `localStorage`, et ce n'est pas le meilleur endroit : une faille XSS
 * le lirait. Le bon emplacement est un cookie `httpOnly`, que ce backend ne
 * peut pas poser aujourd'hui — il repond `Access-Control-Allow-Origin: *`
 * avec `credentials: true`, combinaison que les navigateurs refusent, donc
 * aucune requete creditee ne passe. Le point est signale a l'equipe backend ;
 * en attendant, le jeton d'acces, lui, ne quitte jamais la memoire.
 *
 * Pourquoi un seul renouvellement a la fois
 * -----------------------------------------
 * Le backend **fait tourner** le jeton de rafraichissement et detecte sa
 * reutilisation (`SECURITY_TOKEN_REUSE_DETECTED`, puis 403 et session
 * fermee). Deux requetes qui expirent ensemble en lanceraient deux, et la
 * seconde ferait fermer la session de l'utilisateur. `renewal` garde donc
 * l'unique promesse en cours et tout le monde l'attend.
 * ========================================================================= */

export type AuthStatus = "offline" | "loading" | "anonymous" | "authenticated";

interface AuthValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** `true` des que le cloisonnement doit etre applique (donc hors demo). */
  gated: boolean;
  login(email: string, password: string): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** Cle du jeton de rafraichissement. Le jeton d'acces reste en memoire. */
const STORAGE_KEY = "sig-refresh-token";

/** Marge avant expiration : on renouvelle deux minutes avant l'echeance. */
const RENEW_MARGIN_S = 120;

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Navigation privee, stockage bloque : on repart simplement anonyme.
    return null;
  }
}

function writeStored(token: string | null): void {
  try {
    if (token === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Rien a faire : la session vivra le temps de l'onglet.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (!USE_API) return "offline";
    return readStored() ? "loading" : "anonymous";
  });

  /** Le minuteur de renouvellement anticipe. */
  const timer = useRef<number | null>(null);
  /** L'unique renouvellement en cours, partage par tous les appelants. */
  const renewal = useRef<Promise<boolean> | null>(null);
  /** Attente avant la prochaine tentative, en secondes, apres un echec. */
  const backoff = useRef(0);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const endSession = useCallback(() => {
    clearTimer();
    setAccessToken(null);
    writeStored(null);
    setUser(null);
    setStatus("anonymous");
    // Sans cela, les reponses obtenues avec le jeton resteraient en cache et
    // la page suivante afficherait, sous un bandeau « non connecte », les
    // donnees de la session fermee.
    queryClient.clear();
  }, [clearTimer]);

  /**
   * Coupe la session **sans jeter** le jeton de rafraichissement.
   *
   * C'est le cas d'un echec passager : 429 du limiteur de debit, 502 d'un
   * proxy, reseau coupe. Le jeton est peut-etre encore parfaitement valide,
   * et le detruire deconnecterait l'utilisateur pour une raison qui n'a rien
   * a voir avec lui. Mesure du 2026-11-21 : dix-huit navigations d'affilee
   * suffisent a declencher le limiteur du backend, et la session tombait.
   */
  const suspendSession = useCallback(() => {
    clearTimer();
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
  }, [clearTimer]);

  /** Pose la paire de jetons et arme le renouvellement anticipe. */
  const applyTokens = useCallback(
    (tokens: Tokens, onExpiry: () => Promise<boolean>) => {
      setAccessToken(tokens.accessToken);
      writeStored(tokens.refreshToken);
      clearTimer();
      const delay = Math.max(30, (tokens.expiresIn || 3600) - RENEW_MARGIN_S);
      timer.current = window.setTimeout(() => void onExpiry(), delay * 1000);
    },
    [clearTimer]
  );

  /**
   * Renouvelle la session. Rend `false` quand il n'y a plus rien a sauver —
   * l'appelant doit alors considerer l'utilisateur deconnecte.
   */
  const renew = useCallback((): Promise<boolean> => {
    if (renewal.current) return renewal.current;

    const stored = readStored();
    if (!stored) return Promise.resolve(false);

    const run = (async () => {
      try {
        const tokens = await refreshRequest(stored);
        backoff.current = 0;
        applyTokens(tokens, renew);
        return true;
      } catch (e) {
        // Seul un refus d'authentification condamne la session. Tout le
        // reste — 429, 5xx, reseau — est passager : on garde le jeton et on
        // reessaie, en espacant les tentatives.
        const refuse =
          e instanceof ApiError && (e.status === 401 || e.status === 403);
        if (refuse) {
          endSession();
        } else {
          suspendSession();
          backoff.current = Math.min(
            backoff.current ? backoff.current * 2 : 30,
            300
          );
          timer.current = window.setTimeout(
            () => void renew(),
            backoff.current * 1000
          );
        }
        return false;
      } finally {
        renewal.current = null;
      }
    })();

    renewal.current = run;
    return run;
  }, [applyTokens, endSession, suspendSession]);

  /* ----------------------------------------------- ouverture de session */

  useEffect(() => {
    if (!USE_API) return;

    // `apiFetch` s'en sert pour rattraper un 401 et rejouer la requete.
    setReauthorizer(renew);

    let annule = false;
    const stored = readStored();
    if (!stored) {
      setStatus("anonymous");
      return () => setReauthorizer(null);
    }

    void (async () => {
      const ok = await renew();
      if (annule) return;
      if (!ok) return; // `renew` a deja ferme la session.
      try {
        const profil = await meRequest();
        if (annule) return;
        setUser(profil);
        setStatus("authenticated");
      } catch {
        if (!annule) endSession();
      }
    })();

    return () => {
      annule = true;
      setReauthorizer(null);
    };
    // `renew` et `endSession` sont stables, la session ne se rouvre donc
    // qu'au montage.
  }, [renew, endSession]);

  useEffect(() => clearTimer, [clearTimer]);

  /* ------------------------------------------------------------ actions */

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await loginRequest(email, password);
      applyTokens(session, renew);
      // Les pages ouvertes avant la connexion ont pu mettre en cache des
      // replis ou des 401 ; on les rejoue avec le jeton.
      queryClient.clear();
      setUser(session.user);
      setStatus("authenticated");
    },
    [applyTokens, renew]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await registerRequest(input);
      applyTokens(session, renew);
      queryClient.clear();
      setUser(session.user);
      setStatus("authenticated");
    },
    [applyTokens, renew]
  );

  const logout = useCallback(async () => {
    try {
      // Revoque le jeton de rafraichissement cote serveur. Un echec reseau
      // ne doit pas empecher la deconnexion locale.
      await logoutRequest();
    } catch {
      // On ferme la session localement quoi qu'il arrive.
    }
    endSession();
  }, [endSession]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      gated: status !== "offline",
      login,
      register,
      logout,
    }),
    [status, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth doit etre appele dans <AuthProvider>");
  }
  return value;
}

/**
 * `true` quand l'utilisateur a droit a un contenu reserve.
 *
 * Hors ligne, personne ne peut se connecter : refuser condamnerait la
 * demonstration sans rien proteger, puisqu'il n'y a alors aucune donnee
 * reelle a couvrir — le mode statique n'emet aucune requete.
 */
export function useHasAccount(): boolean {
  const { status } = useAuth();
  return status === "offline" || status === "authenticated";
}

/**
 * L'etat d'acces d'un bloc reserve, vu par l'ecran.
 *
 * Le troisieme cas est celui qu'on oublie : pendant que la session se
 * rouvre, on ne sait pas encore. Repondre « verrouille » afficherait
 * « demande un compte » a un utilisateur connecte, une seconde, a chaque
 * chargement de page — un clignotement qui ment.
 */
export function useAccessState(): "granted" | "locked" | "pending" {
  const { status } = useAuth();
  if (status === "offline" || status === "authenticated") return "granted";
  if (status === "loading") return "pending";
  return "locked";
}
