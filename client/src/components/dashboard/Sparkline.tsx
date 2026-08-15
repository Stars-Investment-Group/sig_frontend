/**
 * Sparkline SVG léger et réutilisable (sans dépendance externe).
 * Affiche une série de points sous forme de ligne miniaturisée.
 */
export function Sparkline({
  data,
  width = 80,
  height = 28,
  positive = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  const color = positive ? "#22C55E" : "#8B5CF6";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      {/* zone remplie sous la courbe */}
      <polygon
        points={`0,${height} ${line} ${width},${height}`}
        fill={color}
        opacity={0.12}
      />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2} fill={color} />
    </svg>
  );
}
