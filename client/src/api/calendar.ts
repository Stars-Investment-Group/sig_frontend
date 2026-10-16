import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch } from "@/api/client";
import {
  CALENDAR_EVENTS,
  type CalendarEvent,
  type EventCategory,
  type EventImportance,
} from "@/data/calendar";

/* =========================================================================
 * Module 9 — le calendrier, servi par l'API.
 *
 * Partage des roles
 * -----------------
 * `/calendar/events` decide **quels** evenements existent et **quand** : date,
 * heure, intitule, categorie, importance. Trois choses lui manquent, que la
 * page affiche :
 *
 * - la **valeur precedente**, qui est une observation et doit rester lue dans
 *   les series, sans quoi le calendrier pourrait annoncer un taux BCEAO que
 *   le Tracker de Politique contredit deux entrees de sidebar plus haut ;
 * - le **libelle de zone**, qui n'est pas le nom du pays : la decision BCEAO
 *   s'affiche « UEMOA » et l'inflation flash « Zone euro », alors que leurs
 *   codes pays sont CIV et EMU ;
 * - le **drapeau**, choisi par le front.
 *
 * Le rapprochement se fait sur date + intitule, cle stable puisque c'est
 * exactement celle qui a servi a semer la table. Un evenement que le fixture
 * ne connait pas s'affiche quand meme, avec le nom du pays pour libelle et
 * sans valeur precedente : mieux vaut une ligne incomplete qu'une ligne
 * absente du calendrier.
 * ========================================================================= */

interface WireEvent {
  id: string;
  title: string;
  eventType: string | null;
  description: string | null;
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  eventDate: string;
  eventTime: string | null;
  impact: string | null;
  importance: number | null;
  source: string | null;
}

const CATEGORIES: EventCategory[] = [
  "Monetary",
  "Inflation",
  "Growth",
  "Employment",
  "Fiscal",
  "Trade",
];

/** `eventType` est une colonne libre : on ne retient que les categories connues. */
function toCategory(value: string | null): EventCategory {
  const found = CATEGORIES.find((c) => c === value);
  return found ?? "Growth";
}

/**
 * `impact` porte le libelle, `importance` le rang numerique. On lit le
 * libelle, et le rang seulement s'il manque — les deux colonnes peuvent
 * diverger si une autre source alimente la table.
 */
function toImportance(impact: string | null, rang: number | null): EventImportance {
  if (impact === "High" || impact === "Medium" || impact === "Low") return impact;
  if (rang === null) return "Low";
  return rang >= 3 ? "High" : rang === 2 ? "Medium" : "Low";
}

/** `1970-01-01T14:00:00.000Z` vers `14:00`. Colonne `Time` : seule l'heure compte. */
function toHeure(value: string | null): string {
  if (!value) return "00:00";
  const m = value.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "00:00";
}

function toEvent(wire: WireEvent, parCle: Map<string, CalendarEvent>): CalendarEvent {
  const date = wire.eventDate.slice(0, 10);
  const fixture = parCle.get(`${date}|${wire.title}`);

  return {
    date,
    time: toHeure(wire.eventTime),
    title: wire.title,
    country: fixture?.country ?? wire.countryName ?? wire.region ?? "—",
    flag: fixture?.flag ?? wire.countryCode ?? "",
    category: toCategory(wire.eventType),
    importance: toImportance(wire.impact, wire.importance),
    previous: fixture?.previous,
    // `description` porte « Attendu : ... » tel que le seed l'a ecrit ; le
    // fixture reste la source du libelle de prevision quand il connait la ligne.
    forecast:
      fixture?.forecast ??
      wire.description?.replace(/^Attendu\s*:\s*/, "") ??
      undefined,
  };
}

async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const body = await apiFetch<{ events?: WireEvent[] } | WireEvent[]>(
    "/calendar/events"
  );
  const rows = Array.isArray(body) ? body : body.events ?? [];

  const parCle = new Map(
    CALENDAR_EVENTS.map((e) => [`${e.date}|${e.title}`, e] as const)
  );

  return rows
    .map((w) => toEvent(w, parCle))
    .sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
    );
}

/**
 * Le calendrier, du backend quand il repond, du statique sinon.
 *
 * Un calendrier vide n'est jamais rendu : une page sans echeance et une page
 * en panne se ressemblent trop, et celle-ci sert a preparer des reunions.
 */
export function useCalendarEvents(): ApiData<CalendarEvent[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["calendar", "events"],
    fetchCalendarEvents,
    [] as CalendarEvent[]
  );

  return data.length > 0
    ? { data, fromApi, error, loading }
    : { data: CALENDAR_EVENTS, fromApi: false, error, loading };
}
