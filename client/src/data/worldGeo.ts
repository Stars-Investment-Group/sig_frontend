/**
 * Passerelle entre le contrat de données et le fond de carte.
 *
 * Le TopoJSON monde (`world-110m.json`, Natural Earth 110 m via `world-atlas`
 * 2.0.2, domaine public) identifie les pays par leur code **ISO 3166-1
 * numérique**. Le reste de l'application travaille en **alpha-3**. Cette table
 * est le seul point de traduction : sans elle, le rapprochement se ferait par
 * nom de pays, ce qui casse au premier « Côte d'Ivoire » contre « Ivory Coast ».
 *
 * Provenance du fichier : `node_modules/world-atlas@2.0.2/countries-110m.json`,
 * copié dans le dépôt pour qu'aucun appel réseau ne soit nécessaire.
 */

/** Alpha-3 -> ISO 3166-1 numérique, pour les pays réellement suivis. */
export const ALPHA3_TO_NUMERIC: Record<string, string> = {
  BRA: "076",
  CAN: "124",
  CHN: "156",
  CIV: "384",
  DEU: "276",
  ESP: "724",
  FRA: "250",
  GBR: "826",
  IND: "356",
  ITA: "380",
  JPN: "392",
  NGA: "566",
  SEN: "686",
  USA: "840",
  ZAF: "710",
};

/**
 * La zone euro n'est pas un pays : elle n'a pas de tracé.
 *
 * `Country.isAggregate` prévoit ce cas côté contrat ; côté carte, l'agrégat
 * colore ses pays membres. Les membres que l'application suit **individuellement**
 * (France, Allemagne, Italie, Espagne) gardent leur propre couleur : un tracé ne
 * peut pas porter deux états, et la donnée la plus fine doit gagner.
 */
export const AGGREGATE_MEMBERS: Record<string, string[]> = {
  EMU: [
    "040", // Autriche
    "056", // Belgique
    "191", // Croatie
    "196", // Chypre
    "233", // Estonie
    "246", // Finlande
    "250", // France
    "276", // Allemagne
    "300", // Grèce
    "372", // Irlande
    "380", // Italie
    "428", // Lettonie
    "440", // Lituanie
    "442", // Luxembourg
    "470", // Malte
    "528", // Pays-Bas
    "620", // Portugal
    "703", // Slovaquie
    "705", // Slovénie
    "724", // Espagne
  ],
};

/**
 * Construit la table inverse numérique -> alpha-3 pour une sélection de pays.
 *
 * Les pays suivis individuellement sont inscrits **après** les membres
 * d'agrégats, donc les écrasent : c'est ainsi que la France reste « France » et
 * non « zone euro ».
 */
export function buildNumericIndex(trackedCodes: string[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const code of trackedCodes) {
    const members = AGGREGATE_MEMBERS[code];
    if (members) {
      for (const numeric of members) index.set(numeric, code);
    }
  }

  for (const code of trackedCodes) {
    const numeric = ALPHA3_TO_NUMERIC[code];
    if (numeric) index.set(numeric, code);
  }

  return index;
}
