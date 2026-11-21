import { Link, Redirect, useLocation } from "wouter";
import { Lock, LogIn } from "lucide-react";
import { useAccessState, useAuth, useHasAccount } from "@/auth/AuthContext";
import { pageOf } from "@/auth/access";

/* =========================================================================
 * Les deux gardes du document d'acces.
 *
 *   <PagePrivee>    niveau C — rien sans compte. L'utilisateur anonyme part
 *                   vers `/login?next=…` et **revient ici** une fois connecte.
 *   <DetailPrive>   niveau B — la page s'affiche, ce bloc-ci est remplace par
 *                   une invitation. Rien n'est masque par CSS : le contenu
 *                   n'est pas rendu du tout, donc pas lisible dans le DOM.
 *
 * `data-access` est a ces gardes ce que `data-source` est aux hooks d'API :
 * invisible a l'ecran, mais un test peut affirmer qu'un bloc est verrouille
 * au lieu de se fier a une capture.
 * ========================================================================= */

/** Chemin courant, requete comprise, pour le retour apres connexion. */
export function useNextTarget(): string {
  const [location] = useLocation();
  const search = typeof window === "undefined" ? "" : window.location.search;
  return `${location}${search}`;
}

export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}

/* ------------------------------------------------------- niveau C */

/**
 * Enveloppe une page privee.
 *
 * Tant que la session se rouvre (`loading`), on affiche un squelette plutot
 * que de rediriger : rediriger un utilisateur deja connecte parce que son
 * jeton n'est pas encore revenu le deconnecterait a chaque rechargement.
 */
export function PagePrivee({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const autorise = useHasAccount();
  const next = useNextTarget();

  if (status === "loading") {
    return (
      <div
        className="space-y-4"
        aria-busy="true"
        aria-label="Ouverture de la session"
        data-access="loading"
      >
        <div className="h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!autorise) return <Redirect to={loginHref(next)} replace />;

  return <>{children}</>;
}

/* ------------------------------------------------------- niveau B */

interface DetailPriveProps {
  /** Ce que l'invitation annonce, par exemple « la fiche détaillée ». */
  quoi: string;
  /** Une phrase de plus sur ce que le compte donne a voir. */
  detail?: string;
  children: React.ReactNode;
}

/**
 * Remplace un detail reserve par une invitation a se connecter.
 *
 * Le document demande de « renvoyer vers ce detail apres connexion » : le
 * lien emporte donc l'URL courante, `?code=` et `?codes=` compris, puisque
 * c'est la que vit le detail ouvert.
 */
export function DetailPrive({ quoi, detail, children }: DetailPriveProps) {
  const etat = useAccessState();
  const next = useNextTarget();

  // Session en cours de reouverture : ni l'un ni l'autre. Un squelette, le
  // temps de savoir — annoncer « demande un compte » a quelqu'un qui en a un
  // serait un clignotement mensonger a chaque chargement.
  if (etat === "pending") {
    return (
      <div
        data-access="pending"
        aria-busy="true"
        className="h-48 animate-pulse rounded-xl border border-border bg-card"
      />
    );
  }

  if (etat === "granted") {
    return <div data-access="granted">{children}</div>;
  }

  return (
    <div
      data-access="locked"
      className="rounded-xl border border-dashed border-border bg-card p-8 text-center"
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {quoi} demande un compte
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
        {detail ??
          "Le reste de la page reste librement consultable. Connectez-vous pour ouvrir ce détail — vous serez ramené ici."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link
          href={loginHref(next)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <LogIn className="h-4 w-4" />
          Se connecter
        </Link>
        <Link
          href={`${loginHref(next)}&mode=inscription`}
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- diagnostic */

/**
 * Le niveau d'acces de la page courante, pose sur le conteneur principal.
 *
 * Il rend le tableau du document verifiable d'un seul balayage : un test
 * parcourt les seize routes et lit `data-page-access`, au lieu de deduire le
 * niveau de ce qui s'affiche.
 */
export function usePageAccessAttr(): Record<string, string> {
  const [location] = useLocation();
  const { status } = useAuth();
  return {
    "data-page-access": pageOf(location)?.level ?? "C",
    "data-session": status,
  };
}
