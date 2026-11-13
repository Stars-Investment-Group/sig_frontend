import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch } from "@/api/client";
import {
  MOIS_AFFICHES,
  REPORTS,
  type Frequency,
  type Report,
  type ReportType,
} from "@/data/reports";

/* =========================================================================
 * Module 14 — les Rapports, servis par l'API.
 *
 * Pourquoi cette page sert son repli aujourd'hui
 * ----------------------------------------------
 * **`GET /reports` repond 400 en toutes circonstances.** Le controleur valide
 * ses parametres d'URL avec le DTO de *creation* (`findAll(@Query() filters:
 * CreateReportDto)`), et ce DTO declare `category`, `startDate` et `endDate`
 * sans aucun decorateur `class-validator`. Le filtre global tourne en
 * `forbidNonWhitelisted`, et comme la cible TypeScript materialise les champs
 * declares, il voit trois proprietes non autorisees — **meme quand l'URL n'en
 * porte aucune**. D'ou `["property category should not exist", ...]` sur un
 * `/reports` nu. Verifie le 2026-11-13, signale a l'equipe backend ; la
 * correction est d'une ligne par champ.
 *
 * Ce hook appelle quand meme la route. `useApiData` traite l'erreur comme une
 * absence, donc la page affiche ses nine rapports de reference, exactement
 * comme avant. **Le jour ou la route est corrigee, la page s'allume seule**,
 * sans un mot de code a changer. C'est pour cela qu'on branche malgre la
 * panne plutot que d'attendre.
 *
 * Pourquoi `/reports/featured` ne suffit pas
 * -----------------------------------------
 * Elle fonctionne, et rend `{ data, total }`. Mais elle ne rend que les
 * rapports marques en avant — **deux sur neuf**. Brancher la page dessus
 * afficherait une bibliotheque de deux entrees la ou la maquette en montre
 * neuf : une regression, pas un branchement. Elle n'est donc pas utilisee.
 * ========================================================================= */

interface WireReport {
  id: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string | null;
  readingTimeMin: number | null;
  pageCount: number | null;
  publishDate: string;
  isFeatured: boolean;
  isActive: boolean;
}

const TYPES: ReportType[] = ["House View", "Macro", "Markets", "Policy", "Sector"];
const FREQUENCES: Frequency[] = [
  "Hebdomadaire",
  "Mensuel",
  "Trimestriel",
  "Ponctuel",
];

async function fetchReports(): Promise<WireReport[]> {
  const body = await apiFetch<{ data?: WireReport[] } | WireReport[]>("/reports");
  return Array.isArray(body) ? body : body.data ?? [];
}

/** `2026-08-01T00:00:00.000Z` vers `01 août 2026`, comme la page l'affiche. */
function afficheLaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "n/d";
  // En UTC : la date de publication est un jour, pas un instant, et la lire en
  // heure locale la decalerait d'un jour a l'ouest de Greenwich.
  return `${String(d.getUTCDate()).padStart(2, "0")} ${
    MOIS_AFFICHES[d.getUTCMonth()]
  } ${d.getUTCFullYear()}`;
}

/**
 * La bibliotheque de rapports.
 *
 * Les deux vocabulaires fermes de la page — le type et la frequence — sont
 * **valides** et non pas acceptes tels quels : ils pilotent une couleur, une
 * icone et un filtre, et une valeur inconnue casserait la recherche dans
 * `TYPE_META`. Une categorie que le front ne connait pas tombe donc en
 * « Macro », la plus generale, plutot que de rendre la carte muette.
 */
export function useReports(): ApiData<Report[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["reports", "list"],
    fetchReports,
    [] as WireReport[]
  );

  const lignes = useMemo<Report[]>(() => {
    const actifs = data.filter((r) => r.isActive !== false);
    if (actifs.length === 0) return REPORTS;

    const parTitre = new Map(REPORTS.map((r) => [r.title, r]));

    return actifs
      // Le tri se fait **avant** la mise en forme, sur la date ISO : une fois
      // ecrite « 01 août 2026 », la date ne se trie plus par comparaison de
      // chaines. La route trie deja, mais on ne s'y fie pas.
      .slice()
      .sort((a, b) => String(b.publishDate).localeCompare(String(a.publishDate)))
      .map((w) => {
        const repli = parTitre.get(w.title);
        const type = TYPES.includes(w.category as ReportType)
          ? (w.category as ReportType)
          : repli?.type ?? "Macro";
        const frequence =
          w.frequency && FREQUENCES.includes(w.frequency as Frequency)
            ? (w.frequency as Frequency)
            : repli?.frequency ?? "Ponctuel";

        return {
          id: w.id,
          title: w.title,
          summary: w.description ?? repli?.summary ?? "",
          type,
          frequency: frequence,
          date: afficheLaDate(w.publishDate),
          readTime:
            w.readingTimeMin !== null
              ? `${w.readingTimeMin} min`
              : repli?.readTime ?? "n/d",
          pages: w.pageCount ?? repli?.pages ?? 0,
          featured: w.isFeatured,
        };
      });
  }, [data]);

  return { data: lignes, fromApi: fromApi && data.length > 0, error, loading };
}
