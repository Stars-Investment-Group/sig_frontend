import { cn } from "@/lib/utils";

/**
 * Jauge de score — deux formes tirees des maquettes :
 *  - `arc` : demi-cercle du SIG Composite Score (x,x / 10) en tete de P6 ;
 *  - `donut` : anneau des pourcentages de confiance et de couverture (P6, P8).
 *
 * La couleur suit le score, pas l'appelant : un meme seuil doit produire la
 * meme teinte partout, sinon les pages se contredisent visuellement.
 */

type Variant = "arc" | "donut";

/** Palier de couleur, exprime en fraction du maximum (0 a 1). */
function toneFor(fraction: number): string {
  if (fraction >= 0.75) return "#059669"; // emerald-600
  if (fraction >= 0.55) return "#2563EB"; // blue-600
  if (fraction >= 0.35) return "#D97706"; // amber-600
  return "#DC2626"; // red-600
}

interface ScoreGaugeProps {
  value: number;
  max?: number;
  variant?: Variant;
  /** Diametre (donut) ou largeur (arc), en pixels. */
  size?: number;
  /** Texte au centre. Par defaut la valeur formatee. */
  display?: string;
  /** Libelle sous la valeur, a l'interieur de la jauge. */
  caption?: string;
  decimals?: number;
  className?: string;
  /** Description lue par les lecteurs d'ecran. */
  ariaLabel?: string;
}

export function ScoreGauge({
  value,
  max = 10,
  variant = "arc",
  size = 132,
  display,
  caption,
  decimals = 1,
  className,
  ariaLabel,
}: ScoreGaugeProps) {
  const fraction = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const color = toneFor(fraction);
  const text = display ?? value.toFixed(decimals);
  const label = ariaLabel ?? `Score ${text} sur ${max}`;

  if (variant === "donut") {
    const r = 42;
    const stroke = 10;
    const circumference = 2 * Math.PI * r;
    return (
      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={label}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth={stroke}
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-foreground">{text}</span>
          {caption && (
            <span className="px-2 text-center text-[10px] leading-tight text-muted-foreground">
              {caption}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Arc : demi-cercle, ouvert vers le bas.
  const R = 44;
  const CX = 56;
  const CY = 52;
  const arcLength = Math.PI * R;
  const path = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  return (
    <div className={cn("inline-flex flex-col items-center", className)} role="img" aria-label={label}>
      <svg viewBox="0 0 112 62" style={{ width: size }} className="overflow-visible">
        <path d={path} fill="none" strokeWidth={11} strokeLinecap="round" className="stroke-muted" />
        <path
          d={path}
          fill="none"
          strokeWidth={11}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - fraction)}
        />
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          className="fill-foreground text-[20px] font-bold tabular-nums"
        >
          {text}
        </text>
        <text x={CX} y={CY + 8} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          / {max}
        </text>
      </svg>
      {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

/** Barre horizontale de score, utilisee dans les tableaux de piliers et de pairs. */
export function ScoreBar({
  value,
  max = 10,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const fraction = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full"
        style={{ width: `${fraction * 100}%`, backgroundColor: toneFor(fraction) }}
      />
    </div>
  );
}
