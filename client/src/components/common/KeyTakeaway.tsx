import type { ReactNode } from "react";
import { Lightbulb, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Encart "Key Takeaway" — present au bas de chaque section des planches P8/P9.
 *
 * Le ton est porte en prop plutot que devine du texte : ces contenus sont
 * editoriaux (redaction analyste), le frontend ne peut pas les qualifier seul.
 */

type Tone = "neutral" | "positive" | "caution";

const TONES: Record<Tone, { wrap: string; icon: string; Icon: typeof Info }> = {
  neutral: {
    wrap: "border-primary/30 bg-primary/5",
    icon: "text-primary",
    Icon: Lightbulb,
  },
  positive: {
    wrap: "border-emerald-500/30 bg-emerald-500/5",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: TrendingUp,
  },
  caution: {
    wrap: "border-amber-500/30 bg-amber-500/5",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
  },
};

export function KeyTakeaway({
  children,
  tone = "neutral",
  label = "Key Takeaway",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const { wrap, icon, Icon } = TONES[tone];
  return (
    <aside className={cn("mt-4 flex gap-2.5 rounded-lg border p-3", wrap, className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", icon)} aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{label} : </span>
        {children}
      </p>
    </aside>
  );
}
