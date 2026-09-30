import { AlertTriangle, ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { CountryRating, MacroRegime } from "@shared/schema";
import { cn } from "@/lib/utils";

/**
 * Pastilles partagees par les onglets de la fiche pays.
 *
 * Elles portent un vocabulaire : orientation, momentum, statut de
 * surveillance. Les centraliser evite que deux onglets colorent la meme
 * notion differemment.
 */

const PILL = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

const OUTLOOK_TONE: Record<CountryRating["outlook"], string> = {
  Positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Stable: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Negative: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const OUTLOOK_ICON: Record<CountryRating["outlook"], typeof Minus> = {
  Positive: TrendingUp,
  Stable: ArrowRight,
  Negative: TrendingDown,
};

export function OutlookBadge({ outlook }: { outlook: CountryRating["outlook"] }) {
  const Icon = OUTLOOK_ICON[outlook];
  return (
    <span className={cn(PILL, OUTLOOK_TONE[outlook])}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {outlook}
    </span>
  );
}

const MOMENTUM_TONE: Record<MacroRegime["momentum"], string> = {
  Improving: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Stable: "bg-muted text-muted-foreground",
  Deteriorating: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function MomentumBadge({ momentum }: { momentum: MacroRegime["momentum"] }) {
  const Icon = momentum === "Improving" ? TrendingUp : momentum === "Stable" ? Minus : TrendingDown;
  return (
    <span className={cn(PILL, MOMENTUM_TONE[momentum])}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {momentum}
    </span>
  );
}

/** Statut de surveillance : absent quand le pays n'est pas sous revue. */
export function WatchBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className={cn(PILL, "bg-muted text-muted-foreground")}>Aucune surveillance</span>
    );
  }
  return (
    <span className={cn(PILL, "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400")}>
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      {status}
    </span>
  );
}

/** Mention de gouvernance exigee par la maquette P6. */
export const MODEL_DISCLAIMER =
  "Les scores sont une sortie de modele. L'orientation et le statut de surveillance relevent du jugement analyste.";
