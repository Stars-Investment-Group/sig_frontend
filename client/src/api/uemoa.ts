import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch, toNumber } from "@/api/client";

/* =========================================================================
 * Les series BCEAO, servies par le module UEMOA.
 *
 * Ce que c'est, et ce que ce n'est pas
 * ------------------------------------
 * **C'est la seule donnee mesuree de toute l'application.** Tout le reste —
 * les ~15 000 observations de `macro_data`, les notations, les regimes — porte
 * `source = 'SIG-MOCK'` et a ete fabrique pour brancher les pages avant que le
 * pipeline existe. Ces 4 991 observations-ci viennent de la BCEAO via
 * DBnomics. Les deux ne doivent jamais etre melangees sans etiquette.
 *
 * Pourquoi un adaptateur separe et non `macro.ts`
 * ----------------------------------------------
 * Ces series vivent dans `economic_indicators`, pas dans `macro_data`. Ce
 * n'est pas un detail d'implementation : quatre choses les rendent
 * incompatibles avec le contrat de `MacroObservation`.
 *
 *   1. **La periode est une annee nue** — `"2024"`, pas `"2024-07"`. Les
 *      series sont annuelles : DBnomics ne publie aucune frequence
 *      infra-annuelle pour la BCEAO.
 *   2. **Elles s'arretent a 2024.** Le front affiche des points jusqu'en
 *      2026. Afficher 2024 dans un bloc qui annonce 2026 serait faux.
 *   3. **Les codes pays sont en alpha-2** (`CI`), le reste de l'application
 *      en alpha-3 (`CIV`), et l'agregat UMOA est un `country` **nul**.
 *   4. **Les unites ne sont pas celles des KPI.** La plupart de ces series
 *      sont des *niveaux* en milliards de FCFA — le solde budgetaire ivoirien
 *      de 2024 vaut `-2120.6`, pas `-3.2`. Seuls l'inflation, la balance
 *      courante rapportee au PIB et les taux de change sont des ratios.
 *
 * Les verser dans les KPI existants afficherait donc des milliards de FCFA de
 * 2024 sous un libelle annonçant un pourcentage de 2026. D'ou cet adaptateur
 * a part, qui preserve la forme reelle de la donnee au lieu de la deformer
 * pour la faire entrer dans un contrat ecrit pour autre chose.
 *
 * Deux routes, toutes deux publiques
 * ----------------------------------
 *   `/uemoa/series`      — les 119 series distinctes, pour un selecteur
 *   `/uemoa/indicators`  — les observations, filtrables par `country`,
 *                          `dataset`, `provider`, `seriesCode`
 *
 * Sans filtre, la seconde rend les **4 991 lignes** d'un coup : elle n'est pas
 * paginee. On filtre donc toujours, par pays ou par serie.
 *
 * Pas de millesime, et pourquoi
 * -----------------------------
 * La branche `feature/pipeline-millesimes` ajoute `vintageDate` / `isLatest` a
 * cette table, et sa migration `20260906140000` est bien presente dans le
 * depot. Mais en base cette migration est enregistree avec
 * `applied_steps_count = 0` : elle a ete marquee comme appliquee sans que son
 * SQL ne s'execute. Les colonnes n'existent pas, Prisma annonce pourtant
 * « up to date ». Consequence concrete : la contrainte d'unicite reste
 * `(provider, dataset, seriesCode, period)`, donc **chaque resynchronisation
 * ecrase la valeur au lieu d'en garder la revision**. Verifie le 2026-11-13.
 * Cet adaptateur ne lit donc aucun millesime — il n'y en a pas.
 * ========================================================================= */

/** Une ligne brute de `economic_indicators`. `value` est un Float Prisma, donc
 *  un nombre JSON et non une chaine — contrairement aux `Decimal` de
 *  `macro_data`. On passe quand meme par `toNumber`, par prudence de bord. */
export interface WireUemoaObs {
  id: string;
  provider: string;
  dataset: string;
  seriesCode: string;
  seriesName: string;
  country: string | null;
  period: string;
  value: unknown;
  fetchedAt: string;
}

/** Une entree du catalogue rendu par `/uemoa/series`. */
export interface WireUemoaSerie {
  provider: string;
  dataset: string;
  seriesCode: string;
  seriesName: string;
  country: string | null;
  fetchedAt: string;
}

/* ------------------------------------------------------------ les perimetres */

/**
 * Alpha-2 BCEAO vers alpha-3 de l'application.
 *
 * Les huit membres de l'UEMOA sont tous dans `STATIC_COUNTRIES`, donc chacun a
 * son drapeau et son libelle. L'agregat « Ensemble UMOA » arrive avec un
 * `country` **nul** : on le nomme `UEMOA`, qui est la cle deja utilisee par la
 * vue regionale.
 */
const ALPHA3: Record<string, string> = {
  BJ: "BEN",
  BF: "BFA",
  CI: "CIV",
  GW: "GNB",
  ML: "MLI",
  NE: "NER",
  SN: "SEN",
  TG: "TGO",
};

const ALPHA2 = Object.fromEntries(
  Object.entries(ALPHA3).map(([a2, a3]) => [a3, a2])
) as Record<string, string>;

/** La cle de perimetre de l'application pour une ligne BCEAO. */
export function perimetreOf(country: string | null): string {
  if (country === null) return "UEMOA";
  return ALPHA3[country] ?? country;
}

/** L'inverse, pour filtrer une requete depuis un code de l'application. */
export function alpha2Of(perimetre: string): string | null {
  if (perimetre === "UEMOA") return null;
  return ALPHA2[perimetre] ?? perimetre;
}

/* ------------------------------------------------------------ les indicateurs */

/**
 * La cle d'indicateur, partagee par les neuf perimetres d'une meme serie.
 *
 * Un code BCEAO est un prefixe pays de trois lettres suivi d'un suffixe
 * commun : `AAASR1015A0BP` est le PIB nominal ivoirien, `KKKSR1015A0BP` le
 * senegalais, et les deux partagent `SR1015A0BP`. Le prefixe est documente
 * dans `series.config.ts` du backend — AAA = Cote d'Ivoire, KKK = Senegal,
 * ZZZ = Ensemble UMOA.
 *
 * Le decoupage se verifie sur le contenu de la base : 119 series donnent
 * 15 suffixes, et la repartition par jeu de donnees retombe exactement —
 * PIBN 3 x 9 = 27, IMECO 7 x 9 = 63, IHPC 9, TAUXINFL_A 9, TOFE 9, TC_A 2
 * (UMOA seul). Total 119.
 */
export function indicatorKeyOf(seriesCode: string): string {
  return seriesCode.slice(3);
}

/**
 * Le libelle d'un indicateur, deduit de `seriesName`.
 *
 * DBnomics prefixe le nom du perimetre : « COTE D'IVOIRE – Solde budgetaire
 * global, avec dons (...) ». Le perimetre est deja porte par la colonne du
 * tableau, donc on ne le repete pas. Le separateur est un tiret demi-cadratin
 * entoure d'espaces, et non un trait d'union : couper sur `-` tronquerait
 * « Guinee-Bissau » et tous les noms composes.
 */
export function libelleOf(seriesName: string): string {
  const i = seriesName.indexOf(" – ");
  return (i === -1 ? seriesName : seriesName.slice(i + 3)).trim();
}

/* ------------------------------------------------------------------ requetes */

async function fetchCatalogue(): Promise<WireUemoaSerie[]> {
  const body = await apiFetch<{ data?: WireUemoaSerie[] } | WireUemoaSerie[]>(
    "/uemoa/series"
  );
  return Array.isArray(body) ? body : body.data ?? [];
}

interface Filtres {
  country?: string | null;
  dataset?: string;
  seriesCode?: string;
}

async function fetchObservations(f: Filtres): Promise<WireUemoaObs[]> {
  // `country` nul est l'agregat UMOA, pas « tous les pays » : la route filtre
  // sur egalite, donc on ne peut pas le cibler par ce parametre. On demande
  // alors la serie par son code, qui est unique.
  const query: Record<string, string> = {};
  if (f.country) query.country = f.country;
  if (f.dataset) query.dataset = f.dataset;
  if (f.seriesCode) query.seriesCode = f.seriesCode;

  const body = await apiFetch<{ data?: WireUemoaObs[] } | WireUemoaObs[]>(
    "/uemoa/indicators",
    { query }
  );
  return Array.isArray(body) ? body : body.data ?? [];
}

/* ------------------------------------------------------------- vues derivees */

/** Un point d'une serie annuelle BCEAO. */
export interface PointAnnuel {
  /** L'annee, telle que stockee : `"2024"`. */
  annee: string;
  valeur: number;
}

/** Une serie BCEAO, pour un indicateur et un perimetre. */
export interface SerieBceao {
  seriesCode: string;
  /** La cle partagee par les neuf perimetres. */
  indicateur: string;
  dataset: string;
  /** `CIV`, `SEN`, ... ou `UEMOA` pour l'agregat. */
  perimetre: string;
  libelle: string;
  points: PointAnnuel[];
  /** Le dernier point connu, ou `null` si la serie est vide. */
  dernier: PointAnnuel | null;
  /** La couverture reelle, qui varie d'une serie a l'autre. */
  couverture: { de: string; a: string } | null;
}

/** Regroupe des lignes brutes en series, triees par annee croissante. */
export function toSeries(rows: WireUemoaObs[]): SerieBceao[] {
  const parCode = new Map<string, WireUemoaObs[]>();
  for (const row of rows) {
    const bucket = parCode.get(row.seriesCode) ?? [];
    bucket.push(row);
    parCode.set(row.seriesCode, bucket);
  }

  const out: SerieBceao[] = [];
  parCode.forEach((bucket, seriesCode) => {
    const points = bucket
      .map((r) => ({ annee: String(r.period), valeur: toNumber(r.value) }))
      .filter((p): p is PointAnnuel => p.valeur !== null)
      .sort((a, b) => a.annee.localeCompare(b.annee));

    const tete = bucket[0];
    out.push({
      seriesCode,
      indicateur: indicatorKeyOf(seriesCode),
      dataset: tete.dataset,
      perimetre: perimetreOf(tete.country),
      libelle: libelleOf(tete.seriesName),
      points,
      dernier: points.length > 0 ? points[points.length - 1] : null,
      couverture:
        points.length > 0
          ? { de: points[0].annee, a: points[points.length - 1].annee }
          : null,
    });
  });

  return out.sort(
    (a, b) =>
      a.indicateur.localeCompare(b.indicateur) ||
      a.perimetre.localeCompare(b.perimetre)
  );
}

/* --------------------------------------------------------------------- hooks */

/**
 * Le catalogue des series disponibles.
 *
 * **Le repli est vide, volontairement.** Partout ailleurs le repli statique
 * est le plancher : une page ne peut pas se vider parce qu'une route est
 * lente. Ici il n'y a rien a replier — ces series n'ont pas d'equivalent
 * fabrique, et en inventer un reintroduirait exactement la confusion que cet
 * adaptateur existe pour eviter. Une liste vide se dit a l'ecran ; elle ne se
 * remplit pas de faux.
 */
export function useUemoaCatalogue(): ApiData<WireUemoaSerie[]> {
  return useApiData(["uemoa", "series"], fetchCatalogue, [] as WireUemoaSerie[]);
}

/**
 * Les series d'un perimetre.
 *
 * `UEMOA` vise l'agregat, dont le `country` est nul : la route ne sait pas le
 * cibler, donc on lit tout le jeu de donnees et on filtre ici. C'est le seul
 * cas ou l'on ramene plus que necessaire, et il ne concerne que les series
 * regionales.
 */
export function useUemoaParPerimetre(perimetre: string): ApiData<SerieBceao[]> {
  const a2 = alpha2Of(perimetre);

  const brut = useApiData(
    ["uemoa", "indicators", "perimetre", perimetre],
    () => (a2 === null ? fetchObservations({}) : fetchObservations({ country: a2 })),
    null as WireUemoaObs[] | null
  );

  const series = useMemo<SerieBceao[]>(() => {
    if (!brut.data) return [];
    const toutes = toSeries(brut.data);
    return a2 === null ? toutes.filter((s) => s.perimetre === "UEMOA") : toutes;
  }, [brut.data, a2]);

  return {
    data: series,
    fromApi: brut.fromApi && series.length > 0,
    error: brut.error,
    loading: brut.loading,
  };
}

/** Une serie precise, par son code BCEAO. */
export function useUemoaSerie(seriesCode: string): ApiData<SerieBceao | null> {
  const brut = useApiData(
    ["uemoa", "indicators", "serie", seriesCode],
    () => fetchObservations({ seriesCode }),
    null as WireUemoaObs[] | null
  );

  const serie = useMemo<SerieBceao | null>(() => {
    if (!brut.data || brut.data.length === 0) return null;
    return toSeries(brut.data)[0] ?? null;
  }, [brut.data]);

  return {
    data: serie,
    fromApi: brut.fromApi && serie !== null,
    error: brut.error,
    loading: brut.loading,
  };
}
