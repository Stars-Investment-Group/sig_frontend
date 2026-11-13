/* =========================================================================
 * Les fixtures de la page Rapports.
 *
 * Elles sortent de `ReportsPage.tsx` pour que l'injecteur et la page lisent la
 * meme source — voir l'en-tete de `markets.ts`.
 *
 * Les dates sont ecrites comme la page les affiche
 * -----------------------------------------------
 * `"01 août 2026"` est la chaine affichee ; la colonne `publish_date` attend
 * une date. `dateDe` fait la conversion, et c'est le seul endroit ou le mois
 * français est interprete. Ecrire les deux formes cote a cote les laisserait
 * diverger au premier ajout de rapport.
 *
 * Attention a la route de liste
 * -----------------------------
 * `GET /reports` repond **400 en toutes circonstances** : le controleur valide
 * ses parametres d'URL avec le DTO de creation, dont les champs n'ont aucun
 * decorateur, si bien que le filtre global les rejette comme non autorises —
 * meme quand l'URL n'en porte aucun. Seules `/reports/featured` et
 * `/reports/categories` sont exploitables. Signale a l'equipe backend le
 * 2026-11-13 ; la correction est d'une ligne par champ.
 * ========================================================================= */

export type ReportType = "House View" | "Macro" | "Markets" | "Policy" | "Sector";
export type Frequency = "Hebdomadaire" | "Mensuel" | "Trimestriel" | "Ponctuel";

export interface Report {
  id: string;
  title: string;
  summary: string;
  type: ReportType;
  frequency: Frequency;
  /** La date affichee, `01 août 2026`. */
  date: string;
  /** Le temps de lecture affiche, `18 min`. */
  readTime: string;
  pages: number;
  featured: boolean;
}

/**
 * Les mois tels que la page les ecrit, indexes de 0 a 11.
 *
 * Separe de la table de lecture ci-dessous, qui fait l'inverse et accepte
 * plusieurs orthographes : un seul tableau ne peut pas servir aux deux sens
 * sans choisir une forme d'ecriture par mois.
 */
export const MOIS_AFFICHES = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

const MOIS_FR: Record<string, number> = {
  "janv.": 1, "févr.": 2, mars: 3, "avr.": 4, mai: 5, juin: 6,
  "juil.": 7, "août": 8, "sept.": 9, "oct.": 10, "nov.": 11, "déc.": 12,
  // Formes longues, au cas ou un rapport serait saisi autrement.
  janvier: 1, février: 2, avril: 4, juillet: 7, septembre: 9,
  octobre: 10, novembre: 11, décembre: 12,
};

/**
 * `"01 août 2026"` vers `"2026-08-01"`.
 *
 * Rend `null` sur une date illisible plutot que de deviner : une date fausse
 * sur un rapport se lit comme une publication qui n'a pas eu lieu.
 */
export function dateDe(affiche: string): string | null {
  const m = affiche.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m) return null;
  const mois = MOIS_FR[m[2].toLowerCase()];
  if (!mois) return null;
  return `${m[3]}-${String(mois).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Les minutes de lecture, pour la colonne `reading_time_min`. */
export function minutesDe(readTime: string): number | null {
  const m = readTime.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export const REPORTS: Report[] = [
  { id: "r1", title: "SIG House View — T3 2026", summary: "Vision stratégique trimestrielle : normalisation monétaire mondiale, opportunités sélectives en UEMOA et gestion des risques de refinancement EM.", type: "House View", frequency: "Trimestriel", date: "01 août 2026", readTime: "18 min", pages: 42, featured: true },
  { id: "r2", title: "Perspectives marchés émergents", summary: "Analyse approfondie des primes de risque, flux de capitaux et soutenabilité de la dette dans les économies émergentes et frontières.", type: "Markets", frequency: "Mensuel", date: "28 juil. 2026", readTime: "12 min", pages: 28, featured: false },
  { id: "r3", title: "Rapport inflation & taux directeurs", summary: "Trajectoire des banques centrales, désinflation en cours et implications pour les courbes de taux souveraines.", type: "Macro", frequency: "Mensuel", date: "22 juil. 2026", readTime: "10 min", pages: 24, featured: true },
  { id: "r4", title: "Moniteur des régimes macro", summary: "Classification et évolution des régimes économiques par région, avec signaux d'alerte et changements notables.", type: "Macro", frequency: "Hebdomadaire", date: "18 juil. 2026", readTime: "7 min", pages: 16, featured: false },
  { id: "r5", title: "Tracker de politique monétaire", summary: "Suivi des décisions des banques centrales (FOMC, BCE, BCEAO, BoJ, RBI) et orientations de politique.", type: "Policy", frequency: "Hebdomadaire", date: "15 juil. 2026", readTime: "8 min", pages: 18, featured: false },
  { id: "r6", title: "Secteur cacao & agro-industrie", summary: "Analyse de la filière cacao en Côte d'Ivoire : prix, production, transformation locale et impacts macroéconomiques.", type: "Sector", frequency: "Trimestriel", date: "10 juil. 2026", readTime: "14 min", pages: 30, featured: false },
  { id: "r7", title: "Note flash — Décision BCEAO", summary: "Réaction immédiate à la décision de politique monétaire de la BCEAO et implications pour la notation des pays UEMOA.", type: "Policy", frequency: "Ponctuel", date: "03 juil. 2026", readTime: "5 min", pages: 8, featured: false },
  { id: "r8", title: "Global Growth Outlook 2026-2027", summary: "Perspectives de croissance mondiale, scénarios de risque et impacts sur les allocations d'actifs.", type: "Macro", frequency: "Trimestriel", date: "28 juin 2026", readTime: "16 min", pages: 36, featured: false },
  { id: "r9", title: "Revue trimestrielle des thèmes", summary: "Lecture transversale des huit thèmes suivis : où les signaux se concentrent, quels périmètres se dégradent et ce qui a changé depuis le trimestre précédent.", type: "Markets", frequency: "Trimestriel", date: "20 juin 2026", readTime: "11 min", pages: 22, featured: false },
];
