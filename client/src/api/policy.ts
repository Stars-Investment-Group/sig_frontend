import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch, toNumber } from "@/api/client";
import {
  BANK_CODE,
  BANK_SEEDS,
  MONTHS_FR,
  TONE_BY_STANCE,
  centralBanks,
  policyBiasOf,
  recentActions,
  type CentralBankRow,
  type PolicyActionRow,
} from "@/data/policy";

/* =========================================================================
 * Module 13 — le Tracker de Politique, servi par l'API.
 *
 *   `/policy/central-banks`  — `{ summary, banks[] }`
 *   `/policy/actions`        — les dernieres decisions, tableau nu
 *
 * `/policy/summary` et `/policy/stance-legend` existent aussi. Le premier
 * n'est affiche nulle part aujourd'hui ; la seconde rend la legende des
 * orientations, que le front porte deja dans `TONE_BY_STANCE` avec ses
 * libelles français. Ni l'un ni l'autre n'est appele.
 *
 * Ce que la table porte, et ce qu'elle ne porte pas
 * ------------------------------------------------
 * `central_banks` a le taux directeur, sa derniere variation, la date de
 * celle-ci et l'orientation. Elle n'a **ni la cible d'inflation, ni la date de
 * la prochaine reunion, ni l'inflation constatee, ni la trajectoire** du taux
 * sur six mois. Les deux premieres sont redactionnelles et viennent de
 * `BANK_SEEDS` ; les deux dernieres sont des series, et se lisent sur
 * `cpi_inflation` et `policy_rate` cote front, comme le repli les lit deja.
 *
 * La page reste donc un melange assume : l'API decide du taux et de
 * l'orientation, la fixture du calendrier et des cibles, les series de la
 * courbe. C'est le partage habituel — l'API possede ce qu'elle stocke.
 *
 * La jointure, et son piege
 * -------------------------
 * `central_banks.code` vaut `FED`, `ECB`, `BCEAO`... alors que le front repere
 * ses banques par le code **pays** alpha-3 (`USA`, `EMU`, `CIV`), qui est
 * aussi la cle de ses series. `BANK_CODE` fait la correspondance, et c'est le
 * seul point de traduction. `/policy/actions` nomme sa banque `bankCode`,
 * mais c'est le code de la banque (`ECB`), pas le pays : l'inverse de
 * `BANK_CODE` est donc necessaire la aussi.
 * ========================================================================= */

interface WireBank {
  code: string;
  name: string;
  countryCode: string | null;
  region: string | null;
  currentRate: unknown;
  lastChangeBps: unknown;
  lastChangeDate: string | null;
  stance: string | null;
}

interface WireAction {
  bankCode: string;
  bankName: string;
  actionDate: string;
  actionType: string;
  rateBefore: unknown;
  rateAfter: unknown;
  changeBps: unknown;
  rationale: string | null;
}

/** `FED` vers `USA` : l'inverse de `BANK_CODE`. */
const PAYS_DE_BANQUE: Record<string, string> = Object.fromEntries(
  Object.entries(BANK_CODE).map(([pays, banque]) => [banque, pays])
);

/* ------------------------------------------------------------ banques */

async function fetchBanks(): Promise<WireBank[]> {
  const body = await apiFetch<{ banks?: WireBank[] } | WireBank[]>(
    "/policy/central-banks"
  );
  return Array.isArray(body) ? body : body.banks ?? [];
}

/**
 * Les six banques, taux et orientation de l'API, le reste du repli.
 *
 * `fromApi` ne vaut `true` que si au moins une banque est revenue : la table
 * etait vide ce matin, et `useApiData` laisserait passer un tableau vide comme
 * une donnee valide.
 */
export function useCentralBanks(): ApiData<CentralBankRow[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["policy", "central-banks"],
    fetchBanks,
    [] as WireBank[]
  );

  const lignes = useMemo<CentralBankRow[]>(() => {
    const repli = centralBanks();
    if (data.length === 0) return repli;

    const parPays = new Map(repli.map((b) => [b.code, b]));
    const parBanque = new Map(data.map((w) => [w.code, w]));

    // On parcourt les six graines, et non les lignes de l'API : l'ordre de la
    // maquette est celui-la, et une banque absente de la base doit garder sa
    // carte plutot que de disparaitre du tableau.
    return BANK_SEEDS.map((seed) => {
      const base = parPays.get(seed.code);
      if (!base) return repli[0];

      const wire = parBanque.get(BANK_CODE[seed.code] ?? seed.code);
      if (!wire) return base;

      const taux = toNumber(wire.currentRate);
      const bps = toNumber(wire.lastChangeBps);
      const stance = wire.stance
        ? TONE_BY_STANCE[wire.stance] ?? TONE_BY_STANCE.Neutral
        : null;

      // La trajectoire reste celle des series : la table n'en a pas, et c'est
      // elle qui porte le biais affiche sous la carte. Remplacer le dernier
      // point par celui de l'API ferait mentir la pente d'un point sur sept.
      return {
        ...base,
        currentRate:
          taux === null
            ? base.currentRate
            : `${taux.toFixed(2).replace(".", ",")} %`,
        lastChange:
          bps === null
            ? base.lastChange
            : bps === 0
              ? "0 bps"
              : `${bps > 0 ? "+" : ""}${bps} bps`,
        changeDir:
          bps === null ? base.changeDir : bps > 0 ? "up" : bps < 0 ? "down" : "flat",
        tone: stance?.tone ?? base.tone,
        toneLabel: stance?.label ?? base.toneLabel,
        policyBias: policyBiasOf(base.trend),
      };
    });
  }, [data]);

  return { data: lignes, fromApi: fromApi && data.length > 0, error, loading };
}

/* ----------------------------------------------------------- decisions */

async function fetchActions(): Promise<WireAction[]> {
  const body = await apiFetch<{ data?: WireAction[] } | WireAction[]>(
    "/policy/actions"
  );
  return Array.isArray(body) ? body : body.data ?? [];
}

/**
 * Les dernieres decisions.
 *
 * `rationale` porte deja la phrase affichee, ecrite par l'injecteur depuis la
 * meme derivation que le repli. Si une vraie decision arrive un jour sans
 * phrase, on la reconstruit depuis les taux plutot que d'afficher une ligne
 * muette.
 */
export function usePolicyActions(limite = 6): ApiData<PolicyActionRow[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["policy", "actions"],
    fetchActions,
    [] as WireAction[]
  );

  const lignes = useMemo<PolicyActionRow[]>(() => {
    if (data.length === 0) return recentActions(undefined, limite);

    return data
      .map((w) => {
        const bps = toNumber(w.changeBps) ?? 0;
        const avant = toNumber(w.rateBefore);
        const apres = toNumber(w.rateAfter);
        const quand = new Date(w.actionDate);
        const periode = `${quand.getUTCFullYear()}-${String(
          quand.getUTCMonth() + 1
        ).padStart(2, "0")}`;

        return {
          date: `${MONTHS_FR[quand.getUTCMonth()]} ${quand.getUTCFullYear()}`,
          bank: w.bankName,
          bankCode: PAYS_DE_BANQUE[w.bankCode] ?? w.bankCode,
          action:
            w.rationale ??
            `${bps > 0 ? "Hausse" : "Baisse"} de ${Math.abs(bps)} bps du taux directeur${
              apres === null ? "" : ` à ${apres.toFixed(2).replace(".", ",")} %`
            }`,
          dir: (bps > 0 ? "up" : "down") as "up" | "down",
          period: periode,
          bps,
          rateAfter: apres ?? 0,
          rateBefore: avant ?? 0,
        };
      })
      // La route trie par date decroissante, mais on ne s'y fie pas : deux
      // decisions du meme mois y arrivent dans un ordre arbitraire.
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, limite);
  }, [data, limite]);

  return { data: lignes, fromApi: fromApi && data.length > 0, error, loading };
}
