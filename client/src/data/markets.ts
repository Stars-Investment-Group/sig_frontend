/* =========================================================================
 * Les fixtures de la page Marches.
 *
 * Pourquoi un module de donnees et non des constantes dans la page
 * ----------------------------------------------------------------
 * Ces tableaux vivaient dans `MarketsPage.tsx`. Ils en sortent pour que
 * **l'injecteur et la page lisent la meme source** : `scripts/seed-neon.mjs`
 * les ecrit en base, la page les sert en repli, et les deux affichent donc les
 * memes chiffres. C'est ce qui rend le test falsifiable — si un nombre bouge
 * apres branchement, la plomberie est fausse, pas la donnee.
 *
 * Pourquoi les valeurs restent des chaines
 * ----------------------------------------
 * `value: "5 482"` porte sa mise en forme : l'espace milliers, le nombre de
 * decimales, le signe. La base, elle, stocke des `Decimal`. Convertir dans un
 * sens puis dans l'autre doit redonner **exactement** la meme chaine, sinon le
 * branchement deplace la virgule et la maquette bouge. On garde donc la chaine
 * comme reference d'affichage, et `nombreDe` / `variationDe` servent aux deux
 * bouts : l'injecteur pour ecrire, l'adaptateur pour relire.
 *
 * Ou chaque bloc atterrit en base
 * -------------------------------
 *   FX, EQUITIES, COMMODITIES  -> `market_indices`, separes par `category`
 *   BONDS                      -> `sovereign_yields` (taux + variation en bps)
 *   FUNDING, MOOD              -> `market_conditions`
 *   MARKET_HOURS               -> `market_hours`
 *
 * `/markets/commodities` filtre sur `category = 'commodity'` : la valeur du
 * champ est donc un contrat, pas une etiquette libre.
 * ========================================================================= */

export type MarketCategory = "fx" | "equity" | "commodity";

/** Une ligne de marche telle que la page l'affiche. */
export interface MarketRow {
  /** Code court, unique dans toute la table : c'est la cle d'unicite en base. */
  code: string;
  /** Le libelle affiche. */
  name: string;
  category: MarketCategory;
  /** Le pays ou la zone, en alpha-3, pour le drapeau. `null` si mondial. */
  countryCode: string | null;
  /** La valeur, mise en forme. */
  value: string;
  /** La variation, mise en forme, signe compris. */
  change: string;
  up: boolean;
  /** L'unite affichee a cote de la valeur, quand il y en a une. */
  unit: string | null;
  /** La micro-courbe, quand le bloc en montre une. */
  spark: number[] | null;
}

/* ------------------------------------------------------------- conversions */

/**
 * La valeur numerique d'une chaine affichee.
 *
 * Gere l'espace milliers (`"5 482"`, y compris l'espace insecable), la virgule
 * decimale et le signe pourcent. Rend `null` plutot que `NaN` : une valeur
 * illisible doit se voir, pas se propager en silence.
 */
export function nombreDe(affiche: string): number | null {
  const nettoye = affiche
    .replace(/[\s  ]/g, "")
    .replace(/%|bps|pts/gi, "")
    .replace(",", ".")
    .trim();
  if (nettoye === "" || nettoye === "n/d") return null;
  const n = Number(nettoye);
  return Number.isFinite(n) ? n : null;
}

/** La variation numerique. Meme lecture, le signe inclus. */
export function variationDe(affiche: string): number | null {
  return nombreDe(affiche);
}

/**
 * Le nombre de decimales de la chaine, pour reformater une valeur venue de
 * l'API a l'identique.
 *
 * `toFixed(1)` sur un taux affiche `4.25` le ramenerait a `4.3` et deplacerait
 * la colonne : la precision se deduit de la fixture, elle ne se choisit pas.
 */
export function decimalesDe(affiche: string): number {
  const m = affiche.replace(/[\s  ]/g, "").match(/[.,](\d+)/);
  return m ? m[1].length : 0;
}

/**
 * Remet en forme une **variation** comme la fixture de reference l'ecrivait :
 * meme precision, meme unite, et le signe du nombre et non celui de la
 * reference.
 *
 * C'est la nuance qui compte : `commeLaFixture` ne met un `+` que si la
 * reference en portait un, ce qui est juste pour une valeur mais faux pour une
 * variation — une hausse dont la fixture etait une baisse s'afficherait sans
 * signe, et se lirait comme une baisse.
 */
export function commeVariation(valeur: number, reference: string): string {
  const decimales = decimalesDe(reference);
  const unite = /%/.test(reference)
    ? "%"
    : /bps/i.test(reference)
      ? " bps"
      : /pts/i.test(reference)
        ? " pts"
        : "";
  const abs = Math.abs(valeur).toFixed(decimales);
  const corps = reference.includes(",") ? abs.replace(".", ",") : abs;
  const signe = valeur > 0 ? "+" : valeur < 0 ? "-" : "";
  return `${signe}${corps}${unite}`;
}

/** Remet en forme un nombre comme la fixture de reference l'ecrivait. */
export function commeLaFixture(valeur: number, reference: string): string {
  const decimales = decimalesDe(reference);
  const texte = valeur.toFixed(decimales);
  const virgule = reference.includes(",");
  const [entier, frac] = texte.split(".");

  // Le separateur de milliers est repris **tel qu'il est ecrit** dans la
  // reference, et non remplace par un equivalent visuel. La fixture utilise
  // une espace ordinaire ; reinjecter une insecable donnerait un resultat
  // identique a l'oeil et different au caractere — donc un test qui compare
  // les deux modes echoue sans que rien ne se voie a l'ecran. C'est
  // exactement la derive que cette fonction existe pour empecher.
  const sep = reference.match(/[\s  ]/);
  const groupe = sep
    ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, sep[0])
    : entier;
  const joint = frac ? `${groupe}${virgule ? "," : "."}${frac}` : groupe;
  return reference.trimStart().startsWith("+") && valeur > 0 ? `+${joint}` : joint;
}

/* --------------------------------------------------------------- les blocs */

export const FX: MarketRow[] = [
  { code: "EURUSD", name: "EUR/USD", category: "fx", countryCode: "EMU", value: "1.0812", change: "+0.18%", up: true, unit: null, spark: [1.052, 1.064, 1.058, 1.072, 1.078, 1.076, 1.081] },
  { code: "USDJPY", name: "USD/JPY", category: "fx", countryCode: "JPN", value: "153.42", change: "-0.42%", up: false, unit: null, spark: [151.2, 152.1, 151.8, 152.9, 153.4, 153.1, 153.4] },
  { code: "GBPUSD", name: "GBP/USD", category: "fx", countryCode: "GBR", value: "1.2910", change: "+0.09%", up: true, unit: null, spark: [1.271, 1.283, 1.279, 1.288, 1.294, 1.29, 1.291] },
  { code: "XOFUSD", name: "XOF/USD", category: "fx", countryCode: "CIV", value: "575.20", change: "-0.02%", up: false, unit: null, spark: [582, 580, 578, 577, 576, 575.5, 575.2] },
];

export const EQUITIES: MarketRow[] = [
  { code: "SPX", name: "S&P 500", category: "equity", countryCode: "USA", value: "5 482", change: "+0.64%", up: true, unit: null, spark: [5120, 5190, 5340, 5410, 5390, 5470, 5482] },
  { code: "SX5E", name: "Euro Stoxx 50", category: "equity", countryCode: "EMU", value: "4 918", change: "-0.12%", up: false, unit: null, spark: [4820, 4890, 4950, 4920, 4960, 4925, 4918] },
  { code: "UKX", name: "FTSE 100", category: "equity", countryCode: "GBR", value: "8 415", change: "+0.30%", up: true, unit: null, spark: [8210, 8250, 8320, 8380, 8360, 8400, 8415] },
  { code: "NKY", name: "Nikkei 225", category: "equity", countryCode: "JPN", value: "39 850", change: "+0.48%", up: true, unit: null, spark: [38100, 38700, 39300, 39000, 39500, 39650, 39850] },
  { code: "BRVMC", name: "BRVM Composite", category: "equity", countryCode: "CIV", value: "245.18", change: "+0.82%", up: true, unit: null, spark: [231, 235, 238, 240, 242, 243, 245] },
  { code: "NGXASI", name: "NGX (Nigeria)", category: "equity", countryCode: "NGA", value: "98 720", change: "-0.35%", up: false, unit: null, spark: [100500, 100100, 99500, 99200, 99000, 99050, 98720] },
];

export const COMMODITIES: MarketRow[] = [
  { code: "XAU", name: "Or (XAU)", category: "commodity", countryCode: null, value: "2 410", change: "+0.8%", up: true, unit: "USD/oz", spark: null },
  { code: "BRENT", name: "Pétrole (Brent)", category: "commodity", countryCode: null, value: "78.2", change: "-0.6%", up: false, unit: "USD/bbl", spark: null },
  { code: "DXY", name: "Indice USD (DXY)", category: "commodity", countryCode: null, value: "101.9", change: "-0.2%", up: false, unit: "pts", spark: null },
  { code: "BTC", name: "BTC", category: "commodity", countryCode: null, value: "64 500", change: "+2.1%", up: true, unit: "USD", spark: null },
];

/** Les trois blocs d'indices, dans l'ordre ou la page les presente. */
export const MARKET_INDICES: MarketRow[] = [...FX, ...EQUITIES, ...COMMODITIES];

/* ------------------------------------------------------------ obligations */

export interface YieldRow {
  /** Le libelle affiche. Sert aussi de cle : la table n'a pas de code. */
  label: string;
  countryCode: string | null;
  /** La maturite, quand elle est explicite dans le libelle. */
  maturity: string | null;
  /** Le taux, mis en forme, signe pourcent compris. */
  value: string;
  /** La variation, en points de base. */
  change: string;
  up: boolean;
}

export const BONDS: YieldRow[] = [
  { label: "Rendement 10Y US", countryCode: "USA", maturity: "10Y", value: "4.10%", change: "-2 bps", up: false },
  { label: "Rendement 10Y Allemagne", countryCode: "EMU", maturity: "10Y", value: "2.42%", change: "+1 bps", up: true },
  { label: "Rendement 10Y Japon", countryCode: "JPN", maturity: "10Y", value: "0.95%", change: "0 bps", up: false },
  { label: "Rendement 10Y Italie", countryCode: "ITA", maturity: "10Y", value: "3.58%", change: "-4 bps", up: false },
  { label: "Eurobond Côte d'Ivoire 2032", countryCode: "CIV", maturity: "2032", value: "6.30%", change: "-8 bps", up: false },
];

/* ----------------------------------------------------- conditions de marche */

export type ConditionTone = "positive" | "neutral" | "negative";

export interface ConditionRow {
  /** Le code technique, cle de lecture cote API. */
  code: string;
  label: string;
  /** Ce que la page affiche : parfois un taux, parfois un mot. */
  stance: string;
  tone: ConditionTone;
}

export const FUNDING: ConditionRow[] = [
  { code: "FED_FUNDS_STANCE", label: "Primary Dealers Libor / Fed Funds", stance: "Neutral", tone: "neutral" },
  { code: "OIS_3M_EUR", label: "OIS 3M EUR", stance: "2.8%", tone: "neutral" },
  { code: "EMBI_RISK", label: "Risque EM (EMBI)", stance: "Élevé", tone: "negative" },
  { code: "GLOBAL_LIQUIDITY", label: "Conditions de liquidité globales", stance: "Accommodant", tone: "positive" },
];

/**
 * L'humeur d'ensemble, lue par `/markets/summary`.
 *
 * Ce bloc n'est affiche nulle part aujourd'hui : la route le cherche sous
 * `GLOBAL_MOOD`, `GLOBAL_SENTIMENT` ou `GLOBAL_RISK_SENTIMENT`, et sans ligne
 * elle rend un resume sans humeur. Il est injecte pour que la route reponde
 * completement, et sa valeur est celle du bloc liquidite ci-dessus, dont il
 * est la synthese — deux chiffres differents pour la meme chose se verraient
 * le jour ou la page l'affichera.
 */
export const MOOD: ConditionRow = {
  code: "GLOBAL_MOOD",
  label: "Humeur de marché",
  stance: "Accommodant",
  tone: "positive",
};

/* -------------------------------------------------------- heures de marche */

/**
 * Les horaires des places suivies.
 *
 * Ce sont des **faits publics**, pas des chiffres fabriques : contrairement au
 * reste de la base, rien ici n'est illustratif. La table n'ayant pas de
 * colonne `source`, ces lignes ne portent pas la marque `SIG-MOCK`, et c'est
 * volontaire.
 */
export interface MarketHoursRow {
  market: string;
  timezone: string;
  open: string;
  close: string;
}

export const MARKET_HOURS: MarketHoursRow[] = [
  { market: "New York (NYSE)", timezone: "America/New_York", open: "09:30", close: "16:00" },
  { market: "Londres (LSE)", timezone: "Europe/London", open: "08:00", close: "16:30" },
  { market: "Francfort (XETRA)", timezone: "Europe/Berlin", open: "09:00", close: "17:30" },
  { market: "Tokyo (TSE)", timezone: "Asia/Tokyo", open: "09:00", close: "15:00" },
  { market: "Abidjan (BRVM)", timezone: "Africa/Abidjan", open: "09:00", close: "15:00" },
];
