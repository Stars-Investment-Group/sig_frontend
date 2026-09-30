import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Matrice coloree generique.
 *
 * Sert la *Regional Regime Matrix* de P1, la *Multi-Horizon Trend Matrix* de P5
 * et la *Comparison Heatmap* de P3. Deux echelles sont necessaires :
 *  - `sequential` pour un score borne (risque 0-100, les 5 paliers de P1) ;
 *  - `diverging` pour une force de tendance signee (-1 a +1 en P5).
 *
 * La polarite est explicite : 80/100 est un bon score de croissance et un
 * mauvais score de risque, la couleur ne peut pas se deduire du seul nombre.
 */

export interface HeatmapRow {
  label: string;
  /** Une valeur par colonne ; `null` pour une case sans donnee. */
  values: (number | null)[];
  /**
   * Regroupement optionnel. Les lignes consecutives partageant un groupe sont
   * precedees d'un intitule : c'est ce qu'attend la *Comparison Heatmap* de P3,
   * dont les metriques sont rangees par famille.
   */
  group?: string;
  /** Suffixe affiche apres la valeur brute en info-bulle. */
  unit?: string;
}

interface HeatmapProps {
  columns: string[];
  rows: HeatmapRow[];
  scale?: "sequential" | "diverging";
  /** Bornes du domaine. Par defaut 0-100 (sequential) ou -1/+1 (diverging). */
  min?: number;
  max?: number;
  polarity?: "higherBetter" | "lowerBetter";
  format?: (value: number) => string;
  /** Intitule de la colonne des libelles de ligne. */
  rowHeader?: string;
  legend?: { label: string; className: string }[];
  className?: string;
}

const GOOD_STRONG = "bg-emerald-500/85 text-white";
const GOOD = "bg-emerald-500/35 text-foreground";
const NEUTRAL = "bg-muted text-muted-foreground";
const BAD = "bg-red-500/35 text-foreground";
const BAD_STRONG = "bg-red-500/85 text-white";

/** Cinq paliers, du plus favorable au moins favorable. */
const LADDER = [GOOD_STRONG, GOOD, NEUTRAL, BAD, BAD_STRONG];

function bandFor(
  value: number,
  min: number,
  max: number,
  polarity: "higherBetter" | "lowerBetter"
): string {
  const span = max - min || 1;
  const t = Math.max(0, Math.min(1, (value - min) / span));
  // Index 0 = plus favorable : on inverse quand une hausse est defavorable.
  const favorability = polarity === "higherBetter" ? t : 1 - t;
  const index = Math.min(LADDER.length - 1, Math.floor((1 - favorability) * LADDER.length));
  return LADDER[index];
}

export function Heatmap({
  columns,
  rows,
  scale = "sequential",
  min,
  max,
  polarity = "higherBetter",
  format,
  rowHeader = "",
  legend,
  className,
}: HeatmapProps) {
  const lo = min ?? (scale === "diverging" ? -1 : 0);
  const hi = max ?? (scale === "diverging" ? 1 : 100);
  const fmt =
    format ?? ((v: number) => (scale === "diverging" ? v.toFixed(2) : Math.round(v).toString()));

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {rowHeader}
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="px-1 py-1 text-center text-[10px] font-medium leading-tight text-muted-foreground"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <Fragment key={row.label}>
                {row.group && row.group !== rows[rowIndex - 1]?.group && (
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={columns.length + 1}
                      className="px-2 pb-0.5 pt-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {row.group}
                    </th>
                  </tr>
                )}
              <tr>
                <th
                  scope="row"
                  className="whitespace-nowrap px-2 py-1 text-left text-xs font-medium text-foreground"
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td key={`${row.label}-${columns[i] ?? i}`} className="p-0">
                    {value === null ? (
                      <div className="rounded-md bg-muted/40 px-2 py-1.5 text-center text-[11px] text-muted-foreground">
                        -
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "rounded-md px-2 py-1.5 text-center text-[11px] font-semibold tabular-nums",
                          bandFor(value, lo, hi, polarity)
                        )}
                      >
                        {fmt(value)}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {legend && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("h-3 w-3 rounded-sm", l.className)} />
              {l.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Legende des 5 paliers de risque de la maquette P1. */
export const RISK_LEGEND = [
  { label: "0-20", className: GOOD_STRONG },
  { label: "21-40", className: GOOD },
  { label: "41-60", className: NEUTRAL },
  { label: "61-80", className: BAD },
  { label: "81-100", className: BAD_STRONG },
];
