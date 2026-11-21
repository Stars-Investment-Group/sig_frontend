import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, LogIn, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { loginHref } from "@/auth/Gate";
import { displayNameOf, initialsOf } from "@/api/auth";
import { cn } from "@/lib/utils";

/* =========================================================================
 * Le bloc de droite de l'en-tete.
 *
 * Il remplace l'avatar « AB / Alex B. / SIG Research » de la maquette, qui
 * etait ecrit en dur. Un nom d'utilisateur invente est de la meme famille
 * que le chiffre invente : il affirme une session qui n'existe pas, et rien
 * a l'ecran ne permet de s'en rendre compte.
 *
 * Trois etats, un par situation reelle :
 *   — connecte  : les initiales, le nom, la societe ou le role, et de quoi
 *                 se deconnecter ;
 *   — anonyme   : un bouton de connexion ;
 *   — hors ligne: une pastille « Démonstration », parce qu'il n'y a pas de
 *                 backend et donc aucun compte possible — proposer une
 *                 connexion serait proposer une impasse.
 * ========================================================================= */

export function UserMenu() {
  const { status, user, logout } = useAuth();
  const [location] = useLocation();
  const [ouvert, setOuvert] = useState(false);
  const boite = useRef<HTMLDivElement>(null);

  // Fermeture au clic exterieur et a la touche d'echappement.
  useEffect(() => {
    if (!ouvert) return;
    const auClic = (e: MouseEvent) => {
      if (!boite.current?.contains(e.target as Node)) setOuvert(false);
    };
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", auClic);
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("mousedown", auClic);
      document.removeEventListener("keydown", auClavier);
    };
  }, [ouvert]);

  if (status === "offline") {
    return (
      <div className="flex items-center border-l border-border pl-3 md:pl-4">
        <span
          className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          title="Aucun backend n'est configuré : les pages réservées restent ouvertes et les chiffres sont illustratifs."
          data-session="offline"
        >
          Démonstration
        </span>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center border-l border-border pl-3 md:pl-4">
        <div
          className="h-8 w-8 animate-pulse rounded-full bg-muted"
          data-session="loading"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center border-l border-border pl-3 md:pl-4">
        <Link
          href={loginHref(location)}
          data-session="anonymous"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <LogIn className="h-3.5 w-3.5" />
          Se connecter
        </Link>
      </div>
    );
  }

  const sousTitre = user.company || (user.role === "ADMIN" ? "Administrateur" : "SIG Research");

  return (
    <div
      ref={boite}
      className="relative flex items-center border-l border-border pl-3 md:pl-4"
      data-session="authenticated"
    >
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-md py-1 pr-1 text-left"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B192C] text-xs font-semibold text-white">
          {initialsOf(user)}
        </span>
        <span className="hidden md:block">
          <span className="block text-sm font-bold leading-none text-foreground">
            {displayNameOf(user)}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
            {sousTitre}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted-foreground transition-transform md:block",
            ouvert && "rotate-180"
          )}
        />
      </button>

      {ouvert && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
              {displayNameOf(user)}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Link
            href="/settings"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Paramètres
          </Link>
          <button
            type="button"
            onClick={() => {
              setOuvert(false);
              void logout();
            }}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
