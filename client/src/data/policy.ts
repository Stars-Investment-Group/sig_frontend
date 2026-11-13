import { getRegime, getStaticHistory } from "@/data/mockData";
import type { MacroObservation, MacroRegime } from "@shared/schema";

/* =========================================================================
 * Les fixtures du Tracker de Politique.
 *
 * Elles sortent de `PolicyTrackerPage.tsx` pour que l'injecteur et la page
 * lisent la meme source — voir l'en-tete de `markets.ts`, la raison est la
 * meme.
 *
 * Ce qui est redactionnel, et ce qui est lu sur la donnee
 * ------------------------------------------------------
 * `BANK_SEEDS` ne porte que ce que la base ne sait pas dire : le libelle de la
 * banque, sa zone, la cible d'inflation, la date de la prochaine reunion.
 * **Le taux directeur, l'inflation constatee, la trajectoire et l'orientation
 * se lisent sur les series**, et c'est delibere : la page annonçait la BCEAO a
 * 3,00 % quand le catalogue donne 5,2 % a la Cote d'Ivoire, et l'inflation
 * americaine a 2,9 % pour 3,6 % constates. Trois pages ouvertes cote a cote
 * donnaient trois chiffres pour la meme chose.
 *
 * D'ou les fonctions plutot que des constantes : la derivation prend ses
 * sources en parametre, donc la meme page peut la nourrir du statique ou de
 * l'API sans que les deux divergent.
 * ========================================================================= */

export type Tone = "restrictive" | "neutral" | "dovish";

/** Le minimum dont la derivation a besoin. Sous-ensemble de `ProfileSources`. */
export interface PolicySources {
  history(countryCode: string, indicatorCode: string): MacroObservation[];
  regime(countryCode: string): MacroRegime;
}

export const STATIC_POLICY_SOURCES: PolicySources = {
  history: getStaticHistory,
  regime: getRegime,
};

export interface BankSeed {
  /** Alpha-3 : sert de drapeau, de cle de serie et de `countryCode` en base. */
  code: string;
  name: string;
  region: string;
  regionFlag: string;
  nextMeeting: string;
  inflationTarget: string;
}

export interface CentralBankRow extends BankSeed {
  currentRate: string;
  lastChange: string;
  changeDir: "up" | "down" | "flat";
  tone: Tone;
  toneLabel: string;
  inflationNow: string;
  policyBias: string;
  trend: number[];
}

/** Les six banques suivies. */
export const BANK_SEEDS: BankSeed[] = [
  { code: "USA", name: "Réserve fédérale (FOMC)", region: "États-Unis", regionFlag: "USA", nextMeeting: "28 juil. 2026", inflationTarget: "2,0 %" },
  { code: "EMU", name: "BCE", region: "Zone euro", regionFlag: "EMU", nextMeeting: "04 août 2026", inflationTarget: "2,0 %" },
  { code: "GBR", name: "Banque d'Angleterre", region: "Royaume-Uni", regionFlag: "GBR", nextMeeting: "11 août 2026", inflationTarget: "2,0 %" },
  { code: "JPN", name: "Banque du Japon", region: "Japon", regionFlag: "JPN", nextMeeting: "26 sept. 2026", inflationTarget: "2,0 %" },
  { code: "CIV", name: "BCEAO", region: "UEMOA", regionFlag: "CIV", nextMeeting: "03 août 2026", inflationTarget: "1-3 %" },
  { code: "IND", name: "RBI (Inde)", region: "Inde", regionFlag: "IND", nextMeeting: "08 août 2026", inflationTarget: "4,0 %" },
];

/** Le code de banque centrale, pour la colonne `code` de `central_banks`. */
export const BANK_CODE: Record<string, string> = {
  USA: "FED",
  EMU: "ECB",
  GBR: "BOE",
  JPN: "BOJ",
  CIV: "BCEAO",
  IND: "RBI",
};

export const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** L'orientation vient du module 4 ; elle decrit le niveau, pas le mouvement. */
export const TONE_BY_STANCE: Record<string, { tone: Tone; label: string }> = {
  Tight: { tone: "restrictive", label: "Orientation restrictive" },
  Neutral: { tone: "neutral", label: "Orientation neutre" },
  Accommodative: { tone: "dovish", label: "Orientation accommodante" },
};

/**
 * Variation du taux directeur sur un mois, en points de base.
 *
 * Arrondie au quart de point, comme une decision de banque centrale.
 */
export function lastMove(
  code: string,
  src: PolicySources = STATIC_POLICY_SOURCES
): { label: string; dir: "up" | "down" | "flat"; bps: number } {
  const history = src.history(code, "policy_rate");
  const last = history[history.length - 1]?.value;
  const previous = history[history.length - 2]?.value;
  if (last === undefined || previous === undefined) {
    return { label: "n/d", dir: "flat", bps: 0 };
  }
  const bps = Math.round(((last - previous) * 100) / 25) * 25;
  if (bps === 0) return { label: "0 bps", dir: "flat", bps: 0 };
  return { label: `${bps > 0 ? "+" : ""}${bps} bps`, dir: bps > 0 ? "up" : "down", bps };
}

/** Le biais suit la pente du taux sur six mois, et ne peut donc pas la nier. */
export function policyBiasOf(rates: number[]): string {
  if (rates.length < 2) return "Historique insuffisant";
  const span = rates[rates.length - 1] - rates[0];
  if (span <= -0.25) return "Cycle de baisse en cours";
  if (span >= 0.25) return "Cycle de hausse en cours";
  return "Statu quo prolongé";
}

/** Les six banques, chiffres lus sur les series. */
export function centralBanks(
  src: PolicySources = STATIC_POLICY_SOURCES
): CentralBankRow[] {
  return BANK_SEEDS.map((seed) => {
    const rates = src.history(seed.code, "policy_rate");
    const inflation = src.history(seed.code, "cpi_inflation");
    const move = lastMove(seed.code, src);
    const trend = rates.slice(-7).map((o) => o.value);
    const stance =
      TONE_BY_STANCE[src.regime(seed.code).policyStance] ?? TONE_BY_STANCE.Neutral;
    return {
      ...seed,
      currentRate: `${(rates[rates.length - 1]?.value ?? 0).toFixed(2).replace(".", ",")} %`,
      lastChange: move.label,
      changeDir: move.dir,
      inflationNow: `${(inflation[inflation.length - 1]?.value ?? 0).toFixed(1)} %`.replace(".", ","),
      trend,
      tone: stance.tone,
      toneLabel: stance.label,
      policyBias: policyBiasOf(trend),
    };
  });
}

export interface PolicyActionRow {
  /** Le mois affiche, `juil. 2026`. */
  date: string;
  bank: string;
  /** Le code alpha-3 de la banque, pour la jointure en base. */
  bankCode: string;
  action: string;
  dir: "up" | "down";
  /** La periode `YYYY-MM` de la decision, pour le tri et la date en base. */
  period: string;
  bps: number;
  /** Le taux apres decision, et celui d'avant. */
  rateAfter: number;
  rateBefore: number;
}

/**
 * Les dernieres decisions effectives, lues sur les series.
 *
 * La frise etait figee : elle annonçait la BCEAO « en baisse a 3,00 % » quand
 * la carte juste au-dessus donnait un autre taux, dans l'autre sens. Une page
 * ne peut pas se contredire a trente pixels d'intervalle.
 *
 * Deux decisions au plus par banque, les six plus recentes retenues.
 */
export function recentActions(
  src: PolicySources = STATIC_POLICY_SOURCES,
  limite = 6
): PolicyActionRow[] {
  return BANK_SEEDS.flatMap((seed) => {
    const history = src.history(seed.code, "policy_rate");
    const actions: PolicyActionRow[] = [];
    for (let i = history.length - 1; i > 0 && actions.length < 2; i -= 1) {
      const bps = Math.round(((history[i].value - history[i - 1].value) * 100) / 25) * 25;
      if (bps === 0) continue;
      const [year, month] = history[i].period.split("-");
      actions.push({
        date: `${MONTHS_FR[Number(month) - 1]} ${year}`,
        bank: seed.name,
        bankCode: seed.code,
        action: `${bps > 0 ? "Hausse" : "Baisse"} de ${Math.abs(bps)} bps du taux directeur à ${history[i].value.toFixed(2).replace(".", ",")} %`,
        dir: bps > 0 ? "up" : "down",
        period: history[i].period,
        bps,
        rateAfter: history[i].value,
        rateBefore: history[i - 1].value,
      });
    }
    return actions;
  })
    .sort((a, b) => b.period.localeCompare(a.period))
    .slice(0, limite);
}

/**
 * Le resume mondial, lu par `/policy/summary`.
 *
 * Il n'est affiche nulle part aujourd'hui, mais la route le lit. Ses deux
 * compteurs sont **derives** des memes series que la frise : un resume qui
 * annoncerait trois baisses quand la frise en montre une se verrait.
 */
export function globalPolicySummary(
  src: PolicySources = STATIC_POLICY_SOURCES
): {
  narrative: string;
  cutsCount: number;
  banksFollowed: number;
  globalRateCorridor: string;
} {
  const banques = centralBanks(src);
  const baisses = recentActions(src, BANK_SEEDS.length * 2).filter(
    (a) => a.dir === "down"
  ).length;
  const taux = banques
    .map((b) => Number(b.currentRate.replace(",", ".").replace(/[^\d.-]/g, "")))
    .filter((n) => Number.isFinite(n));
  const bas = Math.min(...taux);
  const haut = Math.max(...taux);

  return {
    narrative:
      baisses > 0
        ? "Normalisation en cours : la majorite des banques suivies a entame ou poursuit un cycle de baisse, a des rythmes differents selon la desinflation constatee."
        : "Statu quo dominant : les taux directeurs restent a leur niveau, les banques suivies attendant une desinflation confirmee.",
    cutsCount: baisses,
    banksFollowed: BANK_SEEDS.length,
    globalRateCorridor: `${bas.toFixed(2).replace(".", ",")} % – ${haut.toFixed(2).replace(".", ",")} %`,
  };
}
