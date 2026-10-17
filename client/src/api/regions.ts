import { useMemo } from "react";
import { useApiData, type ApiData } from "@/api/useApiData";
import { apiFetch, toNumber } from "@/api/client";
import {
  regimeMatrixRows,
  regionSnapshots,
  type RegimeMatrixRow,
  type RegionSnapshot,
} from "@/data/mockDashboard";

/* =========================================================================
 * Module 8 — les regions, servies par l'API.
 *
 * Le decoupage
 * ------------
 * `/regions` en connait cinq — Africa, Americas, Asia, Europe, UEMOA — ceux
 * de la colonne `region` des pays. La planche en affichait six, d'un
 * decoupage de presentation qui lui etait propre (Africa ex-UEMOA, USA, Asia
 * ex-Japan, Latin America). **Decision du 2026-10-17 : la planche adopte
 * celui de la base.** Le repli statique est derive des memes pays, donc les
 * deux modes affichent la meme chose.
 *
 * Ce que la table porte, et ce qu'elle ne porte pas
 * -------------------------------------------------
 * `region_snapshots` a `momentum`, `riskScore`, `overallScore` et
 * `pillarScores`. Elle n'a ni le **libelle de regime** dominant ni l'ecart
 * par rapport a la revue precedente. Le premier est repris du repli, calcule
 * sur les memes pays ; le second reste a zero, la maquette ne l'affichant pas.
 * ========================================================================= */

interface WireRegion {
  regionCode: string;
  regionName: string;
  overallScore: unknown;
  momentum: string | null;
  riskScore: unknown;
  period: string;
}

interface WireHeatmap {
  regionCode: string;
  regionName: string;
  period: string;
  heatmap: Record<string, unknown> | null;
}

/** Momentum du regime vers le vocabulaire de la legende de la carte. */
function statusFromMomentum(momentum: string | null): RegionSnapshot["status"] {
  if (momentum === "Improving") return "Positive";
  if (momentum === "Deteriorating") return "Watch";
  return "Stable";
}

async function fetchRegions(): Promise<WireRegion[]> {
  const body = await apiFetch<{ data?: WireRegion[] } | WireRegion[]>("/regions");
  return Array.isArray(body) ? body : body.data ?? [];
}

/**
 * Les instantanes regionaux, du backend quand il repond, du statique sinon.
 *
 * Le libelle de regime n'etant pas stocke, il est repris de la ligne statique
 * de meme region — calculee sur les memes pays, donc coherente. Une region que
 * le repli ignore garde un tiret plutot qu'un regime emprunte a une voisine.
 */
export function useRegionSnapshots(): ApiData<RegionSnapshot[]> {
  const { data, fromApi, error, loading } = useApiData(
    ["regions", "list"],
    fetchRegions,
    [] as WireRegion[]
  );

  const rows = useMemo<RegionSnapshot[]>(() => {
    if (data.length === 0) return regionSnapshots;

    const parRegion = new Map(regionSnapshots.map((r) => [r.region, r]));
    return data
      .map((w) => ({
        region: w.regionName,
        regime: parRegion.get(w.regionName)?.regime ?? "—",
        status: statusFromMomentum(w.momentum),
        riskScore: Math.round(toNumber(w.riskScore) ?? 0),
        // L'ecart par rapport a la revue precedente n'existe pas en base.
        delta: 0,
      }))
      .sort((a, b) => a.region.localeCompare(b.region));
  }, [data]);

  return {
    data: rows,
    fromApi: fromApi && data.length > 0,
    error,
    loading,
  };
}

/* ------------------------------------------------- matrice des regimes */

/**
 * La matrice regionale : son score d'ensemble vient de l'API, ses cinq
 * colonnes du repli.
 *
 * Pourquoi la carte de chaleur n'est pas appelee
 * ---------------------------------------------
 * `/regions/:code/heatmap` porterait les sept piliers par region, soit
 * exactement la source des cinq colonnes. Elle repond **404 pour quatre
 * regions sur cinq** : `regions.service.ts` passe `code.toUpperCase()` au
 * `where` alors que les regions stockees sont capitalisees — « Africa »,
 * « Europe » —, si bien que seule « UEMOA », deja en capitales, correspond.
 * L'API se contredit : `/regions` en liste cinq, cette route en sert une.
 *
 * L'appeler quand meme ferait quatre 404 dans la console a chaque chargement
 * de l'accueil, pour un repli qui affiche de toute facon les memes chiffres —
 * il derive les memes piliers, cote client. On attend donc le correctif
 * backend. Le jour venu, il suffira de lire `heatmap[COLONNES[colonne]]` et
 * d'inverser par `100 - force`, la base stockant les piliers sur 100.
 *
 * `overall`, lui, vient bien de l'API : les deux blocs sont cote a cote a
 * l'ecran, et deux risques differents pour la meme region se verraient.
 */
export function useRegimeMatrix(
  snapshots: RegionSnapshot[]
): ApiData<RegimeMatrixRow[]> {
  const rows = useMemo<RegimeMatrixRow[]>(() => {
    const parRegion = new Map(regimeMatrixRows.map((r) => [r.region, r]));

    return snapshots.map((snap) => {
      const repli = parRegion.get(snap.region);
      return {
        region: snap.region,
        overall: snap.riskScore,
        growth: repli?.growth ?? snap.riskScore,
        inflation: repli?.inflation ?? snap.riskScore,
        external: repli?.external ?? snap.riskScore,
        fiscal: repli?.fiscal ?? snap.riskScore,
        policy: repli?.policy ?? snap.riskScore,
      };
    });
  }, [snapshots]);

  return { data: rows, fromApi: false, error: null, loading: false };
}
