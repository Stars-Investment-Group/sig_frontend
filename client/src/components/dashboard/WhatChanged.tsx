import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/Flag";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { useI18n } from "@/lib/i18n";
import { whatChanged, type ChangeLog } from "@/data/mockDashboard";

/**
 * What Changed (vs Previous Update) — planche P1.
 *
 * La maquette en fait un **tableau** pleine largeur : Pays/Region, Indicateur,
 * Variation, Nouveau, Precedent, Impact, Note. L'ancienne liste a puces ne
 * donnait ni la valeur precedente ni la nouvelle, alors que c'est precisement
 * ce qu'on vient verifier ici.
 */

const IMPACT_TONE: Record<ChangeLog["impact"], string> = {
  Positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Neutral: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Negative: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

/**
 * L'impact est un jugement analyste, deja porte par la donnee : la couleur de
 * la variation doit s'y accorder plutot que se deduire du signe. Une balance
 * externe qui baisse est negative, un score de risque qui monte aussi.
 *
 * On choisit donc la polarite qui fait rendre `DeltaBadge` dans la teinte de
 * l'impact : quand hausse et impact favorable coincident, c'est `higherBetter`.
 */
function polarityOf(row: ChangeLog): "higherBetter" | "lowerBetter" {
  const rising = (row.change ?? 0) > 0;
  const favorable = row.impact === "Positive";
  return rising === favorable ? "higherBetter" : "lowerBetter";
}

export function WhatChanged() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("whatChanged.title")}</h2>
          <p className="text-xs text-muted-foreground">Révisions des 7 derniers jours</p>
        </div>
        <a
          href="#changes"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Voir tous les changements
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2.5 font-medium">Pays / Région</th>
              <th className="px-2 py-2.5 font-medium">Indicateur</th>
              <th className="px-2 py-2.5 text-right font-medium">Variation</th>
              <th className="px-2 py-2.5 text-right font-medium">Nouveau</th>
              <th className="px-2 py-2.5 text-right font-medium">Précédent</th>
              <th className="px-2 py-2.5 font-medium">Impact</th>
              <th className="px-2 py-2.5 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {whatChanged.map((row) => (
              <tr
                key={`${row.entity}-${row.indicator}`}
                className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="px-2 py-3">
                  <span className="flex items-center gap-1.5">
                    {row.code ? (
                      <Flag code={row.code} size={16} />
                    ) : (
                      <span className="inline-block h-3 w-4 shrink-0 rounded-[2px] bg-muted" aria-hidden="true" />
                    )}
                    <span className="text-xs font-medium text-foreground">{row.entity}</span>
                  </span>
                </td>
                <td className="px-2 py-3 text-xs text-muted-foreground">{row.indicator}</td>
                <td className="px-2 py-3 text-right">
                  {row.change === null ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <DeltaBadge
                      value={row.change}
                      unit={row.changeUnit ?? "pp"}
                      polarity={polarityOf(row)}
                      decimals={row.changeUnit === "pts" ? 0 : 1}
                    />
                  )}
                </td>
                <td className="px-2 py-3 text-right text-xs font-semibold tabular-nums text-foreground">
                  {row.newValue}
                </td>
                <td className="px-2 py-3 text-right text-xs tabular-nums text-muted-foreground">
                  {row.prevValue}
                </td>
                <td className="px-2 py-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${IMPACT_TONE[row.impact]}`}
                  >
                    {row.impact}
                  </span>
                </td>
                <td className="px-2 py-3 text-xs text-muted-foreground">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
