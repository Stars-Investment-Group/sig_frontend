import { cn } from "@/lib/utils";

/**
 * Graphe en cascade ("bridge").
 *
 * Deux usages dans les maquettes : le *Rating Bridge* de P6 (du score
 * précédent au score courant) et le *Forecast Revision Waterfall* de P9.
 *
 * L'axe n'est volontairement **pas** ancré à zéro : un pont de notation va de
 * 6,42 à 6,50 et des contributions de 0,02 seraient invisibles à côté d'une
 * colonne partant de 0. Le domaine se cale donc sur l'amplitude réelle.
 *
 * Conséquence directe : les points de départ et d'arrivée sont dessinés en
 * **repères horizontaux**, pas en colonnes pleines. Sur un axe tronqué, deux
 * colonnes pleines de 6,42 et 6,50 apparaissent dans un rapport de 1 à 4 —
 * la hauteur mentirait sur le rapport des valeurs. Le repère donne le niveau
 * sans suggérer de proportion.
 */

export interface WaterfallStep {
  label: string;
  value: number;
}

interface WaterfallProps {
  start: WaterfallStep;
  steps: WaterfallStep[];
  end: WaterfallStep;
  unit?: string;
  decimals?: number;
  height?: number;
  className?: string;
}

interface Column {
  label: string;
  /** Bas de la barre, dans l'unité des données. */
  lo: number;
  /** Haut de la barre, dans l'unité des données. */
  hi: number;
  amount: number;
  kind: "anchor" | "up" | "down";
}

export function Waterfall({
  start,
  steps,
  end,
  unit = "",
  decimals = 2,
  height = 200,
  className,
}: WaterfallProps) {
  // Cumul progressif : chaque contribution flotte entre deux totaux.
  const columns: Column[] = [];
  let running = start.value;

  columns.push({
    label: start.label,
    lo: start.value,
    hi: start.value,
    amount: start.value,
    kind: "anchor",
  });

  for (const step of steps) {
    const next = running + step.value;
    columns.push({
      label: step.label,
      lo: Math.min(running, next),
      hi: Math.max(running, next),
      amount: step.value,
      kind: step.value >= 0 ? "up" : "down",
    });
    running = next;
  }

  columns.push({ label: end.label, lo: end.value, hi: end.value, amount: end.value, kind: "anchor" });

  const bounds = columns.flatMap((c) => [c.lo, c.hi]);
  const rawMin = Math.min(...bounds);
  const rawMax = Math.max(...bounds);
  const span = rawMax - rawMin || Math.max(Math.abs(rawMax), 1) * 0.1;
  const domainMin = rawMin - span * 0.45;
  const domainMax = rawMax + span * 0.45;
  const range = domainMax - domainMin;

  const toPct = (v: number) => ((domainMax - v) / range) * 100;
  const fmt = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(decimals)}${unit}`;

  const tone = { up: "bg-emerald-500", down: "bg-red-500" };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {columns.map((column, index) => {
          const top = toPct(column.hi);

          if (column.kind === "anchor") {
            return (
              <div key={`${column.label}-${index}`} className="relative h-full min-w-0 flex-1">
                {/* Repère de niveau : pas de hauteur proportionnelle. */}
                <div
                  className="absolute w-full rounded-sm bg-slate-500 dark:bg-slate-400"
                  style={{ top: `${top}%`, height: 7 }}
                />
                <span
                  className="absolute w-full text-center text-[10px] font-bold tabular-nums text-foreground"
                  style={{ top: `calc(${top}% - 15px)` }}
                >
                  {column.amount.toFixed(decimals)}
                </span>
              </div>
            );
          }

          const barHeight = Math.max(toPct(column.lo) - top, 1.5);
          return (
            <div key={`${column.label}-${index}`} className="relative h-full min-w-0 flex-1">
              <div
                className={cn("absolute w-full rounded-sm", tone[column.kind])}
                style={{ top: `${top}%`, height: `${barHeight}%` }}
              />
              <span
                className="absolute w-full text-center text-[10px] font-semibold tabular-nums text-foreground"
                style={{ top: `calc(${top}% - 15px)` }}
              >
                {fmt(column.amount)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5">
        {columns.map((column, index) => (
          <p
            key={`label-${column.label}-${index}`}
            className={cn(
              "min-w-0 flex-1 text-center text-[10px] leading-tight",
              column.kind === "anchor" ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {column.label}
          </p>
        ))}
      </div>

      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Axe tronqué sur l&apos;amplitude de la variation : les repères gris donnent le niveau, les
        barres colorées la contribution.
      </p>
    </div>
  );
}
