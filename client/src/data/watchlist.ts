/**
 * Composition de la liste de suivi.
 *
 * Seule l'appartenance est une donnee : ce que l'utilisateur a place sous
 * surveillance. Tout ce qui s'affiche a cote — regime, score, risque,
 * croissance, inflation — se lit sur le profil pays, pour que la liste ne
 * puisse pas contredire la fiche vers laquelle elle pointe.
 *
 * Le compteur de l'en-tete lit cette meme liste. Il affichait auparavant la
 * longueur de `topMovers`, qui n'a rien a voir : l'en-tete annoncait six
 * entrees quand la page en montrait huit.
 */
export interface WatchedCountry {
  code: string;
  /** Epingle en tete de liste. */
  pinned: boolean;
}

export const WATCHED_COUNTRIES: WatchedCountry[] = [
  { code: "CIV", pinned: true },
  { code: "SEN", pinned: true },
  { code: "NGA", pinned: true },
  { code: "USA", pinned: false },
  { code: "IND", pinned: false },
  { code: "EMU", pinned: false },
  { code: "GBR", pinned: false },
  { code: "JPN", pinned: false },
];
