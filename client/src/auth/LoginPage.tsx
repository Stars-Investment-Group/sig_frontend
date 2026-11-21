import { useMemo, useState } from "react";
import { Link, Redirect, useLocation, useSearch } from "wouter";
import { AlertCircle, Loader2, Lock, LogIn, UserPlus } from "lucide-react";
import { ApiError, USE_API } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { pageOf } from "@/auth/access";
import { cn } from "@/lib/utils";

/* =========================================================================
 * Connexion et inscription.
 *
 * Deux choses la distinguent d'un formulaire de connexion ordinaire.
 *
 * 1. Elle sait dire **pourquoi** elle est la. Le document d'acces renvoie
 *    ici depuis une page de niveau C, et une porte qui ne dit pas ce qu'elle
 *    ferme est juste un mur : `?next=` sert donc a nommer la page attendue
 *    autant qu'a y revenir.
 * 2. Elle sait qu'elle peut etre **inutilisable**. Sur la demonstration
 *    publiee, `VITE_USE_API` n'est pas pose : il n'y a pas de backend, donc
 *    aucun compte. Le formulaire le dit au lieu d'echouer sur un appel
 *    reseau vers `localhost`.
 * ========================================================================= */

/** La regle du backend, `RegisterDto.@Matches`, verifiee avant l'envoi. */
const FORT = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

function motDePasseInvalide(mdp: string): string | null {
  if (mdp.length < 8) return "Au moins 8 caractères.";
  if (!FORT.test(mdp)) {
    return "Une majuscule, une minuscule et un chiffre ou un symbole.";
  }
  return null;
}

/** Traduit l'echec en une phrase lisible plutot qu'en code HTTP. */
function messageDErreur(e: unknown, inscription: boolean): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "Email ou mot de passe incorrect.";
    if (e.status === 409) return "Un compte existe déjà avec cette adresse.";
    if (e.status === 0) return "Le serveur n'a pas répondu.";
    const brut = Array.isArray(e.body?.message)
      ? e.body?.message.join(" · ")
      : e.body?.message;
    if (brut) return brut;
  }
  if (e instanceof Error && e.name === "AbortError") {
    return "Le serveur n'a pas répondu dans le délai imparti.";
  }
  return inscription
    ? "La création du compte a échoué."
    : "La connexion a échoué.";
}

export function LoginPage() {
  const { status, login, register } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const next = params.get("next") || "/";
  const [inscription, setInscription] = useState(
    params.get("mode") === "inscription"
  );

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [societe, setSociete] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  // Deja connecte : on ne montre pas un formulaire, on va ou l'on allait.
  if (status === "authenticated") return <Redirect to={next} replace />;

  const cible = pageOf(next);
  const faible = inscription ? motDePasseInvalide(motDePasse) : null;
  const pretAEnvoyer =
    email.trim().length > 3 && motDePasse.length > 0 && !faible && !envoi;

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!pretAEnvoyer) return;
    setErreur(null);
    setEnvoi(true);
    try {
      if (inscription) {
        await register({
          email: email.trim(),
          password: motDePasse,
          firstName: prenom.trim() || undefined,
          lastName: nom.trim() || undefined,
          company: societe.trim() || undefined,
        });
      } else {
        await login(email.trim(), motDePasse);
      }
      navigate(next, { replace: true });
    } catch (e) {
      setErreur(messageDErreur(e, inscription));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-6" data-page-access="A">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {inscription ? (
              <UserPlus className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {inscription ? "Créer un compte" : "Connexion"}
            </h1>
            <p className="text-xs text-muted-foreground">
              SIG Global Macro Tracker
            </p>
          </div>
        </div>

        {/* Pourquoi l'utilisateur est ici, quand il vient d'une page fermee. */}
        {cible && next !== "/" && (
          <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{cible.label}</span>{" "}
            est réservé aux titulaires d&apos;un compte. Vous y serez ramené
            aussitôt connecté.
          </p>
        )}

        {/* Le cas ou le formulaire ne peut pas aboutir : on le dit. */}
        {!USE_API && (
          <div className="mt-4 flex gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Cette démonstration tourne <strong>sans backend</strong> : aucun
              compte ne peut y être créé ni vérifié. Toutes les pages y sont
              donc ouvertes, et les chiffres affichés sont illustratifs.
            </span>
          </div>
        )}

        <form onSubmit={soumettre} className="mt-5 space-y-4">
          <Champ
            id="email"
            label="Adresse email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />

          {inscription && (
            <div className="grid grid-cols-2 gap-3">
              <Champ
                id="prenom"
                label="Prénom"
                value={prenom}
                onChange={setPrenom}
                autoComplete="given-name"
                optionnel
              />
              <Champ
                id="nom"
                label="Nom"
                value={nom}
                onChange={setNom}
                autoComplete="family-name"
                optionnel
              />
            </div>
          )}

          {inscription && (
            <Champ
              id="societe"
              label="Société"
              value={societe}
              onChange={setSociete}
              autoComplete="organization"
              optionnel
            />
          )}

          <div>
            <Champ
              id="mdp"
              label="Mot de passe"
              type="password"
              autoComplete={inscription ? "new-password" : "current-password"}
              value={motDePasse}
              onChange={setMotDePasse}
              required
            />
            {inscription && (
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  motDePasse.length === 0
                    ? "text-muted-foreground"
                    : faible
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {faible ??
                  (motDePasse.length === 0
                    ? "8 caractères minimum, une majuscule, une minuscule et un chiffre ou un symbole."
                    : "Mot de passe conforme.")}
              </p>
            )}
          </div>

          {erreur && (
            <div
              role="alert"
              className="flex gap-2.5 rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!pretAEnvoyer}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {envoi ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {inscription ? "Créer le compte" : "Se connecter"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {inscription ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button
            type="button"
            onClick={() => {
              setInscription((v) => !v);
              setErreur(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            {inscription ? "Se connecter" : "Créer un compte"}
          </button>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground hover:underline">
          Revenir aux pages publiques
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- un champ */

function Champ({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  optionnel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  optionnel?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
        {optionnel && (
          <span className="ml-1 font-normal normal-case tracking-normal">
            (facultatif)
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
