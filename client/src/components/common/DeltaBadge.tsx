import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Variation chiffrée signée, avec flèche et couleur sémantique.
 *
 * La polarité est explicite car elle s'inverse selon l'indicateur : une hausse
 * est favorable pour la croissance, défavorable pour l'inflation ou le risque.
 */

interface DeltaBadgeProps {
  value: number;
  /** Suffixe affiché après la valeur : "pp", "bps", "/100"… */
  unit?: string;
  /** Sens de lecture : une hausse est-elle une bonne ou une mauvaise nouvelle ? */
  polarity?: "higherBetter" | "lowerBetter";
  /** `inline` pour un texte discret, `pill` pour une pastille colorée. */
  variant?: "inline" | "pill";
  decimals?: number;
  /** Seuil sous lequel la valeur est traitée comme stable. */
  epsilon?: number;
  className?: string;
}

export function DeltaBadge({
  value,
  unit = "",
  polarity = "higherBetter",
  variant = "inline",
  decimals = 1,
  epsilon = 0.001,
  className,
}: DeltaBadgeProps) {
  const stable = Math.abs(value) <= epsilon;
  const favorable = polarity === "higherBetter" ? value > 0 : value < 0;

  const tone = stable
    ? "neutral"
    : favorable
      ? "good"
      : "bad";

  const Icon = stable ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;

  const inlineTone = {
    good: "text-green-600 dark:text-green-500",
    bad: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  }[tone];

  const pillTone = {
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    bad: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    neutral: "bg-muted text-muted-foreground",
  }[tone];

  const formatted = `${value > epsilon ? "+" : ""}${value.toFixed(decimals)}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-semibold tabular-nums",
        variant === "pill"
          ? cn("rounded-full px-2 py-0.5 text-[11px]", pillTone)
          : cn("text-xs", inlineTone),
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {formatted}
      {unit && <span className="ml-0.5 font-medium">{unit}</span>}
    </span>
  );
}
