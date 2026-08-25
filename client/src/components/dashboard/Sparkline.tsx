/**
 * Sparkline SVG léger et réutilisable (sans dépendance externe).
 * Affiche une série sous forme de courbe avec remplissage en dégradé.
 */

interface SparklineProps {
  data: number[];
  /** Couleur de la ligne (accepte hex). Par défaut bleu institutionnel. */
  color?: string;
  width?: number;
  height?: number;
  /** Afficher le remplissage sous la courbe */
  fill?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = "#2563EB",
  width = 88,
  height = 32,
  fill = true,
  className,
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;

  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return { x, y };
  });

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  // Identifiant unique pour le dégradé
  const gid = `${color.replace(/[^a-zA-Z0-9]/g, "")}_${width}x${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className ?? ""}`}
      aria-hidden="true"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${line} ${width},${height}`}
            fill={`url(#${gid})`}
          />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2.2} fill={color} />
    </svg>
  );
}
