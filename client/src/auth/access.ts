/* =========================================================================
 * Les niveaux d'acces des pages — `Acces_Pages_Tracker.pdf`, 2026-11-21.
 *
 * Ce fichier est la **seule source de verite** du cloisonnement, comme
 * `components/country/tabs.ts` l'est pour les onglets : le routeur, la
 * sidebar, la recherche globale et les gardes le lisent tous. Changer le
 * niveau d'une page doit rester la modification d'une ligne.
 *
 *   A — public          : tout le contenu, sans compte.
 *   B — public + detail : la page s'affiche, le detail demande un compte.
 *   C — prive           : rien sans compte ; renvoi vers la connexion.
 *
 * Ce que ce cloisonnement protege, et ce qu'il ne protege pas
 * -----------------------------------------------------------
 * Il est **la seule chose** qui rende le niveau C reel cote navigateur, pour
 * une raison contre-intuitive : sans lui, une page privee ouverte sans jeton
 * ne se viderait pas. Les routes protegees repondraient 401, `useApiData`
 * retomberait sur son repli, et la page s'afficherait **entierement remplie**
 * de chiffres fabriques. Un visiteur non connecte verrait une page complete
 * et credible. Le repli, qui est une qualite partout ailleurs, est ici le
 * piege.
 *
 * Il ne remplace pour autant aucune protection serveur : tout ce qui est
 * sensible doit rester derriere le garde JWT du backend. Une garde d'ecran
 * se contourne avec la console du navigateur ; elle protege l'experience,
 * pas la donnee.
 * ========================================================================= */

export type AccessLevel = "A" | "B" | "C";

export interface PageAccess {
  /** Prefixe de chemin, sans le `base` de Vite. */
  path: string;
  level: AccessLevel;
  /** Le nom de la page dans le document, pour les messages et l'audit. */
  label: string;
}

/**
 * Le tableau du document, ligne pour ligne.
 *
 * L'ordre n'a pas d'importance : la resolution prend le prefixe **le plus
 * long**, de sorte que `/countries/CIV/notation` trouve `/countries` et non
 * `/`.
 */
export const PAGE_ACCESS: PageAccess[] = [
  { path: "/", level: "A", label: "Global Overview" },
  { path: "/indicators", level: "A", label: "Indicators" },
  { path: "/markets", level: "A", label: "Markets" },
  { path: "/calendar", level: "A", label: "Calendar" },

  { path: "/regions", level: "B", label: "Régions" },
  { path: "/countries", level: "B", label: "Countries" },
  { path: "/themes", level: "B", label: "Themes" },
  { path: "/policy", level: "B", label: "Policy Tracker" },

  { path: "/regimes", level: "C", label: "Régimes" },
  { path: "/alerts", level: "C", label: "Alerts" },
  { path: "/watchlist", level: "C", label: "Watchlist" },
  { path: "/reports", level: "C", label: "Reports" },
  { path: "/data", level: "C", label: "Data Explorer" },
  { path: "/screener", level: "C", label: "Screener" },
  { path: "/settings", level: "C", label: "Settings" },

  /* --- Les deux pages que le document ne cite pas ---------------------- */

  /**
   * `/compare` n'est pas dans le tableau. Elle n'a pas d'entree de menu et ne
   * s'atteint que depuis la fiche pays et la recherche : le document, qui
   * part du menu, ne pouvait pas la voir. Elle est classee **C** par analogie
   * avec le Screener et l'Explorateur, les deux autres outils qui balaient
   * les 24 pays a la fois. **A confirmer** : c'est une lecture, pas une ligne
   * du document.
   */
  { path: "/compare", level: "C", label: "Comparaison multi-pays" },

  /** L'ecran de connexion lui-meme, forcement ouvert. */
  { path: "/login", level: "A", label: "Connexion" },
];

/**
 * Le niveau d'une page.
 *
 * Par defaut **C**, et c'est volontaire : une page ajoutee sans etre inscrite
 * ici doit se fermer, pas s'ouvrir. L'oubli se voit alors tout de suite, au
 * lieu de publier sans bruit un ecran qui devait etre reserve.
 */
export function accessOf(pathname: string): AccessLevel {
  return pageOf(pathname)?.level ?? "C";
}

/** La fiche de la page, pour nommer ce qui est reserve dans l'invitation. */
export function pageOf(pathname: string): PageAccess | null {
  const path = normalise(pathname);
  if (path === "/") return PAGE_ACCESS[0];

  let best: PageAccess | null = null;
  for (const entry of PAGE_ACCESS) {
    if (entry.path === "/") continue;
    if (path === entry.path || path.startsWith(`${entry.path}/`)) {
      if (!best || entry.path.length > best.path.length) best = entry;
    }
  }
  return best;
}

/** Retire la requete, le fragment et la barre finale. */
function normalise(pathname: string): string {
  const path = pathname.split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}
