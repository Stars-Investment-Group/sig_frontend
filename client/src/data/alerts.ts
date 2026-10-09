import { useSyncExternalStore } from "react";
import { getRating, getStaticHistory } from "@/data/mockData";

/**
 * Centre d'alertes — source unique.
 *
 * Le texte est redactionnel, les **nombres sont lus sur la donnee**. Les
 * alertes annoncaient jusqu'ici des chiffres que les autres pages
 * contredisaient : le Nigeria « abaisse a 38/100 » pour une notation a 36.
 *
 * L'etat de lecture vit ici et non dans la page, parce que la cloche de
 * l'en-tete compte les non-lues. Elle affichait un « 3 » ecrit en dur, qui ne
 * bougeait pas quand la page passait tout en lu.
 */

export type Severity = "critical" | "warning" | "info" | "positive";
export type AlertCategory = "Regime" | "Rating" | "Market" | "Policy" | "Data";

export interface EcoAlert {
  id: string;
  severity: Severity;
  category: AlertCategory;
  country: string;
  /** Code alpha-3 : sert au drapeau et au lien vers la fiche pays. */
  flag: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

/** Notation composite sur 100, telle que l'affichent les autres pages. */
const score = (code: string) => Math.round(getRating(code).compositeScore * 10);

/** Derniere valeur observee d'une serie. */
const level = (code: string, indicator: string, digits = 1) => {
  const history = getStaticHistory(code, indicator);
  const last = history[history.length - 1];
  return last ? last.value.toFixed(digits) : "n/d";
};

/** Valeur d'il y a `back` periodes, pour un « de X a Y ». */
const prior = (code: string, indicator: string, back = 3, digits = 1) => {
  const history = getStaticHistory(code, indicator);
  const point = history[history.length - 1 - back];
  return point ? point.value.toFixed(digits) : "n/d";
};

const SEED: EcoAlert[] = [
  {
    id: "a1",
    severity: "critical",
    category: "Rating",
    country: "Nigeria",
    flag: "NGA",
    title: `Notation abaissée à ${score("NGA")}/100`,
    description:
      "Risque de refinancement extérieur aggravé ; pression sur les réserves de change. Sous surveillance renforcée.",
    time: "il y a 2 h",
    read: false,
  },
  {
    id: "a2",
    severity: "warning",
    category: "Regime",
    country: "Burkina Faso",
    flag: "BFA",
    title: "Changement de régime : Transition → Détérioration",
    description:
      "Dégradation du climat macroéconomique liée à la pression sécuritaire et fiscale.",
    time: "il y a 5 h",
    read: false,
  },
  {
    id: "a3",
    severity: "positive",
    category: "Regime",
    country: "Côte d'Ivoire",
    flag: "CIV",
    title: "Révision haussière de la croissance 2026F",
    description: `Prévision PIB relevée de ${prior("CIV", "real_gdp_growth")}% à ${level(
      "CIV",
      "real_gdp_growth"
    )}% portée par la production de cacao et les infrastructures.`,
    time: "il y a 8 h",
    read: false,
  },
  {
    id: "a4",
    severity: "info",
    category: "Policy",
    country: "UEMOA",
    flag: "CIV",
    title: "Décision BCEAO attendue le 03/08",
    description: `Consensus d'une baisse de 25 bps du taux directeur, actuellement à ${level(
      "CIV",
      "policy_rate",
      2
    )}%, au vu de l'inflation maîtrisée.`,
    time: "hier",
    read: true,
  },
  {
    id: "a5",
    severity: "warning",
    category: "Market",
    country: "United States",
    flag: "USA",
    title: "Volatilité accrue sur le 10Y US",
    description:
      "Le rendement à 10 ans a bondi de +12 bps cette semaine en réaction aux données d'emploi.",
    time: "hier",
    read: true,
  },
  {
    id: "a6",
    severity: "info",
    category: "Data",
    country: "Euro Area",
    flag: "EMU",
    title: `Inflation IPC révisée à ${level("EMU", "cpi_inflation")}%`,
    description:
      "Les données flash confirment la trajectoire de désinflation vers la cible BCE.",
    time: "il y a 2 j",
    read: true,
  },
  {
    id: "a7",
    severity: "positive",
    category: "Rating",
    country: "Benin",
    flag: "BEN",
    title: "Déficit budgétaire sous surveillance",
    description: `Consolidation fiscale suivie au regard des critères de convergence UEMOA ; notation à ${score(
      "BEN"
    )}/100.`,
    time: "il y a 3 j",
    read: true,
  },
  {
    id: "a8",
    severity: "critical",
    category: "Market",
    country: "Brazil",
    flag: "BRA",
    title: "Pression de refinancement accrue",
    description:
      "Les spreads EMBI brésiliens se sont élargis de 45 bps sur fond de hausse des taux réels.",
    time: "il y a 4 j",
    read: true,
  },
];

/* =========================================================================
 * Petit magasin partage
 *
 * Deux composants eloignes — la page et la cloche de l'en-tete — lisent le
 * meme etat de lecture. Passer par un contexte obligerait a envelopper toute
 * l'application pour trois lignes d'etat.
 * ========================================================================= */

let alerts: EcoAlert[] = SEED;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markAlertRead(id: string) {
  if (alerts.find((a) => a.id === id)?.read) return;
  alerts = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
  emit();
}

export function markAllAlertsRead() {
  if (alerts.every((a) => a.read)) return;
  alerts = alerts.map((a) => ({ ...a, read: true }));
  emit();
}

/** Les alertes et leur etat de lecture, partages par toute l'application. */
export function useAlerts(): EcoAlert[] {
  return useSyncExternalStore(
    subscribe,
    () => alerts,
    () => alerts
  );
}
