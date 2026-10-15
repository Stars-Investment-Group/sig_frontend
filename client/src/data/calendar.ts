import { getStaticHistory } from "@/data/mockData";

/* =========================================================================
 * Calendrier des publications et evenements macroeconomiques.
 *
 * Pourquoi cette liste vit ici et pas dans la page
 * ------------------------------------------------
 * Elle etait ecrite deux fois : douze entrees dans `CalendarPage`, six dans
 * `mockDashboard.upcomingEvents` pour la carte d'accueil. Les deux listes se
 * recouvraient sans concorder — l'accueil annoncait le FOMC au 28 juillet, le
 * calendrier au 2 septembre, et les deux etaient visibles le meme jour. Une
 * seule liste porte desormais le fait ; la carte d'accueil n'en montre que les
 * premieres lignes.
 *
 * La date, l'heure, l'intitule et l'importance sont redactionnels : ils
 * viennent du calendrier officiel des instituts. **La valeur precedente, elle,
 * est une observation** — `series` relie l'evenement a la serie qui la porte,
 * pour qu'elle ne puisse pas contredire le reste de l'application. Les
 * evenements sans equivalent au catalogue (emploi non agricole americain,
 * deficit budgetaire federal) gardent leur valeur ecrite, faute de serie.
 * ========================================================================= */

export type EventImportance = "High" | "Medium" | "Low";

export type EventCategory =
  | "Monetary"
  | "Inflation"
  | "Growth"
  | "Employment"
  | "Fiscal"
  | "Trade";

export interface CalendarEvent {
  /** `YYYY-MM-DD`. */
  date: string;
  /** Heure locale de publication, `HH:MM`. */
  time: string;
  title: string;
  /** Libelle affiche : un pays, une zone ou une union. */
  country: string;
  /** Code alpha-3 pour `<Flag />`. */
  flag: string;
  category: EventCategory;
  importance: EventImportance;
  /** Derniere valeur publiee, lue dans la serie quand il y en a une. */
  previous?: string;
  forecast?: string;
}

/** Rattachement a la serie qui porte la valeur precedente. */
interface SeriesLink {
  code: string;
  indicator: string;
  digits?: number;
  /** Afficher le signe pour une grandeur qui peut etre negative. */
  sign?: boolean;
}

const SEEDS: (Omit<CalendarEvent, "previous"> & {
  series?: SeriesLink;
  previous?: string;
})[] = [
  { date: "2026-08-03", time: "14:00", title: "Décision de taux BCEAO", country: "UEMOA", flag: "CIV", category: "Monetary", importance: "High", series: { code: "CIV", indicator: "policy_rate", digits: 2 }, forecast: "-25 bps attendus" },
  { date: "2026-08-05", time: "09:30", title: "PIB trimestriel Q2", country: "Côte d'Ivoire", flag: "CIV", category: "Growth", importance: "Medium", series: { code: "CIV", indicator: "real_gdp_growth", sign: true }, forecast: "stable" },
  { date: "2026-08-05", time: "14:30", title: "Inflation IPC zone euro (flash)", country: "Zone euro", flag: "EMU", category: "Inflation", importance: "High", series: { code: "EMU", indicator: "cpi_inflation" }, forecast: "en repli" },
  { date: "2026-08-07", time: "14:30", title: "Rapport emploi US (NFP)", country: "États-Unis", flag: "USA", category: "Employment", importance: "High", previous: "206K", forecast: "180K" },
  { date: "2026-08-11", time: "12:00", title: "Décision Banque d'Angleterre", country: "Royaume-Uni", flag: "GBR", category: "Monetary", importance: "High", series: { code: "GBR", indicator: "policy_rate", digits: 2 }, forecast: "statu quo" },
  { date: "2026-08-12", time: "10:00", title: "Inflation IPC Nigeria", country: "Nigeria", flag: "NGA", category: "Inflation", importance: "High", series: { code: "NGA", indicator: "cpi_inflation" }, forecast: "en repli" },
  { date: "2026-08-14", time: "14:30", title: "Inflation IPC US", country: "États-Unis", flag: "USA", category: "Inflation", importance: "Medium", series: { code: "USA", indicator: "cpi_inflation" }, forecast: "stable" },
  { date: "2026-08-18", time: "03:00", title: "PIB T2 Japon", country: "Japon", flag: "JPN", category: "Growth", importance: "Medium", series: { code: "JPN", indicator: "real_gdp_growth", sign: true }, forecast: "en hausse" },
  { date: "2026-08-21", time: "16:00", title: "Balance courante UEMOA", country: "UEMOA", flag: "CIV", category: "Trade", importance: "Low", series: { code: "CIV", indicator: "current_account", sign: true }, forecast: "stable" },
  { date: "2026-08-26", time: "13:00", title: "Budget fédéral (déficit)", country: "États-Unis", flag: "USA", category: "Fiscal", importance: "Medium", series: { code: "USA", indicator: "fiscal_balance", sign: true }, forecast: "stable" },
  { date: "2026-08-28", time: "05:30", title: "Décision RBI (Inde)", country: "Inde", flag: "IND", category: "Monetary", importance: "High", series: { code: "IND", indicator: "policy_rate", digits: 2 }, forecast: "statu quo" },
  { date: "2026-09-02", time: "14:00", title: "Réunion FOMC", country: "États-Unis", flag: "USA", category: "Monetary", importance: "High", series: { code: "USA", indicator: "policy_rate", digits: 2 }, forecast: "-25 bps attendus" },
];

/** Le calendrier complet, trie chronologiquement. */
export const CALENDAR_EVENTS: CalendarEvent[] = SEEDS.map(
  ({ series, previous, ...event }) => {
    if (!series) return { ...event, previous };
    const history = getStaticHistory(series.code, series.indicator);
    const last = history[history.length - 1]?.value;
    if (last === undefined) return { ...event, previous };
    const text = last.toFixed(series.digits ?? 1).replace(".", ",");
    return {
      ...event,
      previous: `${series.sign && last > 0 ? "+" : ""}${text} %`,
    };
  }
).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

/**
 * Les `n` prochaines echeances, pour la carte d'accueil.
 *
 * Le calendrier etant deja trie, les premieres lignes **sont** les
 * prochaines : inutile de filtrer sur la date du jour, qui ferait vider la
 * carte des que les donnees statiques prendraient de l'age.
 */
export function upcomingCalendarEvents(n = 6): CalendarEvent[] {
  return CALENDAR_EVENTS.slice(0, n);
}
