import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch, toNumber } from "@/api/client";
import {
  BONDS,
  COMMODITIES,
  EQUITIES,
  FUNDING,
  FX,
  commeLaFixture,
  commeVariation,
  type ConditionRow,
  type MarketRow,
  type YieldRow,
} from "@/data/markets";

/* =========================================================================
 * Module 12 — les Marches, servis par l'API.
 *
 * Trois routes, toutes publiques
 * ------------------------------
 *   `/markets/indices`     — les 14 indices, devises et matieres premieres,
 *                            separes par `category`
 *   `/markets/yields`      — les 5 taux souverains
 *   `/markets/conditions`  — les conditions de financement
 *
 * `/markets/commodities` existe aussi, mais il ne fait que filtrer
 * `/markets/indices` sur `category = 'commodity'` : l'appeler en plus
 * ajouterait un aller-retour pour une donnee deja recue.
 *
 * Les nombres arrivent en nombres
 * -------------------------------
 * Contrairement a `/macro-data`, dont les `Decimal` arrivent en **chaines**,
 * ces routes convertissent cote serveur (`value: Number(...)`). On passe quand
 * meme par `toNumber`, par prudence de bord : une route qui changerait d'avis
 * ne doit pas rendre `NaN` a l'ecran.
 *
 * Pourquoi la fixture reste la reference de mise en forme
 * ------------------------------------------------------
 * La base stocke `5482`, la maquette affiche `5 482` ; elle stocke `4.1`, la
 * maquette affiche `4.10%`. Le nombre de decimales, l'espace milliers et le
 * signe sont **portes par la fixture**, pas par la base. `commeLaFixture`
 * reformate donc chaque valeur sur le modele de la chaine statique de meme
 * code. Sans cela, `toFixed(1)` sur un taux affiche `4.25` le ramenerait a
 * `4.3` et deplacerait la colonne.
 *
 * Une table vide n'est pas une donnee
 * -----------------------------------
 * `useApiData` ne protege pas contre le tableau vide : `[]` est defini, donc
 * il devient la donnee avec `fromApi: true`, et la page s'affiche blanche.
 * Ces huit tables etaient vides il y a une heure. Chaque hook ci-dessous
 * traite donc **longueur zero comme une absence** et rend son repli.
 * ========================================================================= */

interface WireIndex {
  code: string;
  name: string;
  countryCode: string | null;
  region: string | null;
  category: string | null;
  currentValue: unknown;
  dailyChange: unknown;
  unit: string | null;
}

interface WireYield {
  countryCode: string | null;
  instrumentName: string;
  maturity: string | null;
  yieldRate: unknown;
  changeBps: unknown;
}

interface WireCondition {
  indicatorCode: string;
  indicatorName: string;
  value: unknown;
  status: string | null;
}

/* ------------------------------------------------------------------ indices */

async function fetchIndices(): Promise<WireIndex[]> {
  const body = await apiFetch<{ data?: WireIndex[] } | WireIndex[]>("/markets/indices");
  return Array.isArray(body) ? body : body.data ?? [];
}

/**
 * Fusionne une ligne d'API avec sa fixture de meme code.
 *
 * La fixture apporte ce que la table n'a pas : la micro-courbe (`spark`), que
 * `market_indices` ne stocke pas. L'API apporte la valeur et la variation.
 * Un code que la fixture ignore garde quand meme sa ligne, sans courbe : une
 * nouvelle devise ajoutee en base doit apparaitre, pas disparaitre.
 */
function mergeIndex(wire: WireIndex, repli: MarketRow | undefined): MarketRow {
  const valeur = toNumber(wire.currentValue);
  const variation = toNumber(wire.dailyChange);
  const categorie =
    wire.category === "fx" || wire.category === "equity" || wire.category === "commodity"
      ? wire.category
      : repli?.category ?? "equity";

  return {
    code: wire.code,
    name: wire.name,
    category: categorie,
    countryCode: wire.countryCode ?? repli?.countryCode ?? null,
    value:
      valeur === null
        ? repli?.value ?? "n/d"
        : commeLaFixture(valeur, repli?.value ?? "0.00"),
    change:
      variation === null
        ? repli?.change ?? "n/d"
        : commeVariation(variation, repli?.change ?? "+0.00%"),
    // La direction se lit sur le nombre, jamais sur la fixture : c'est
    // precisement ce que l'API est censee rafraichir.
    up: variation === null ? repli?.up ?? false : variation >= 0,
    unit: wire.unit ?? repli?.unit ?? null,
    spark: repli?.spark ?? null,
  };
}

interface Marches {
  fx: MarketRow[];
  equities: MarketRow[];
  commodities: MarketRow[];
}

const REPLI_MARCHES: Marches = { fx: FX, equities: EQUITIES, commodities: COMMODITIES };

/** Les trois blocs d'indices, de l'API quand elle repond, du statique sinon. */
export function useMarketIndices(): ApiData<Marches> {
  const { data, fromApi, error, loading } = useApiData(
    ["markets", "indices"],
    fetchIndices,
    [] as WireIndex[]
  );

  const blocs = useMemo<Marches>(() => {
    if (data.length === 0) return REPLI_MARCHES;

    const parCode = new Map(
      [...FX, ...EQUITIES, ...COMMODITIES].map((r) => [r.code, r])
    );
    const lignes = data.map((w) => mergeIndex(w, parCode.get(w.code)));

    // L'ordre de la maquette est celui des fixtures, pas celui de la base,
    // qui trie par date de mise a jour. Les codes inconnus ferment la liste.
    const rang = new Map([...FX, ...EQUITIES, ...COMMODITIES].map((r, i) => [r.code, i]));
    lignes.sort(
      (a, b) => (rang.get(a.code) ?? 999) - (rang.get(b.code) ?? 999)
    );

    const par = (c: string) => lignes.filter((l) => l.category === c);
    const fx = par("fx");
    const equities = par("equity");
    const commodities = par("commodity");

    // Un bloc vide retombe sur le sien : la page a trois cartes, et une seule
    // categorie manquante ne doit pas en vider une.
    return {
      fx: fx.length > 0 ? fx : FX,
      equities: equities.length > 0 ? equities : EQUITIES,
      commodities: commodities.length > 0 ? commodities : COMMODITIES,
    };
  }, [data]);

  return { data: blocs, fromApi: fromApi && data.length > 0, error, loading };
}

/* --------------------------------------------------------------------- taux */

async function fetchYields(): Promise<WireYield[]> {
  const body = await apiFetch<{ data?: WireYield[] } | WireYield[]>("/markets/yields");
  return Array.isArray(body) ? body : body.data ?? [];
}

/**
 * Les taux souverains.
 *
 * La jointure se fait sur `instrumentName`, faute de code : la table n'en a
 * pas. C'est fragile — renommer un instrument cote backend casserait la
 * reprise de mise en forme — mais le repli couvre ce cas, et un code serait a
 * demander a l'equipe backend plutot qu'a bricoler ici.
 *
 * Attention a l'unite : ici `changeBps` est en **points de base**, alors que
 * `dailyChange` des indices est en pourcent. Deux colonnes voisines, deux
 * unites : les confondre afficherait « -2 % » pour deux points de base.
 */
export function useSovereignYields(): ApiData<YieldRow[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["markets", "yields"],
    fetchYields,
    [] as WireYield[]
  );

  const lignes = useMemo<YieldRow[]>(() => {
    if (data.length === 0) return BONDS;

    const parNom = new Map(BONDS.map((b) => [b.label, b]));
    const rang = new Map(BONDS.map((b, i) => [b.label, i]));

    return data
      .map((w) => {
        const repli = parNom.get(w.instrumentName);
        const taux = toNumber(w.yieldRate);
        const bps = toNumber(w.changeBps);
        return {
          label: w.instrumentName,
          countryCode: w.countryCode ?? repli?.countryCode ?? null,
          maturity: w.maturity ?? repli?.maturity ?? null,
          value:
            taux === null
              ? repli?.value ?? "n/d"
              : `${commeLaFixture(taux, repli?.value ?? "0.00")}%`,
          change:
            bps === null
              ? repli?.change ?? "n/d"
              : commeVariation(bps, repli?.change ?? "+0 bps"),
          up: bps === null ? repli?.up ?? false : bps > 0,
        };
      })
      .sort((a, b) => (rang.get(a.label) ?? 999) - (rang.get(b.label) ?? 999));
  }, [data]);

  return { data: lignes, fromApi: fromApi && data.length > 0, error, loading };
}

/* --------------------------------------------------------------- conditions */

async function fetchConditions(): Promise<WireCondition[]> {
  const body = await apiFetch<{ data?: WireCondition[] } | WireCondition[]>(
    "/markets/conditions"
  );
  return Array.isArray(body) ? body : body.data ?? [];
}

/**
 * Les conditions de financement.
 *
 * `status` porte ce que la page affiche — parfois un mot (« Accommodant »),
 * parfois un taux (« 2.8% »). La colonne `value` ne vaut quelque chose que
 * dans le second cas. Le ton, lui, n'a **pas de colonne** : il est repris de
 * la fixture de meme code, et une condition inconnue arrive en neutre plutot
 * qu'en rouge — une alerte que rien ne justifie est pire qu'une absence.
 *
 * La route rend aussi la ligne de synthese `GLOBAL_MOOD`, que la page
 * n'affiche pas : elle est ecartee ici pour ne pas ajouter une cinquieme
 * ligne a un bloc qui en compte quatre.
 */
export function useMarketConditions(): ApiData<ConditionRow[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["markets", "conditions"],
    fetchConditions,
    [] as WireCondition[]
  );

  const lignes = useMemo<ConditionRow[]>(() => {
    const utiles = data.filter(
      (c) => !/^GLOBAL_(MOOD|SENTIMENT|RISK_SENTIMENT)$/.test(c.indicatorCode)
    );
    if (utiles.length === 0) return FUNDING;

    const parCode = new Map(FUNDING.map((f) => [f.code, f]));
    const rang = new Map(FUNDING.map((f, i) => [f.code, i]));

    return utiles
      .map((w) => {
        const repli = parCode.get(w.indicatorCode);
        const valeur = toNumber(w.value);
        return {
          code: w.indicatorCode,
          label: w.indicatorName || repli?.label || w.indicatorCode,
          stance:
            w.status ??
            (valeur !== null
              ? commeLaFixture(valeur, repli?.stance ?? "0.0")
              : repli?.stance ?? "n/d"),
          tone: repli?.tone ?? "neutral",
        };
      })
      .sort((a, b) => (rang.get(a.code) ?? 999) - (rang.get(b.code) ?? 999));
  }, [data]);

  return {
    data: lignes,
    fromApi: fromApi && data.length > 0,
    error,
    loading,
  };
}
