import type { ReactNode } from "react";

/**
 * Drapeaux SVG fiables — garantit l'affichage quelque soit l'OS/navigateur
 * (les émojis drapeaux 🇸🇳 ne s'affichent pas sur Windows/Chrome).
 * Rendu 4:3, rounded, léger, sans ID SVG partagés.
 */

type Render = () => ReactNode;

const flags: Record<string, Render> = {
  /* Côte d'Ivoire : orange / blanc / vert */
  CI: () => (
    <>
      <rect x="0" y="0" width="13.34" height="30" fill="#F77F00" />
      <rect x="13.34" y="0" width="13.34" height="30" fill="#FFFFFF" />
      <rect x="26.68" y="0" width="13.32" height="30" fill="#009E60" />
    </>
  ),

  /* Sénégal : vert / jaune / rouge + étoile verte */
  SN: () => (
    <>
      <rect x="0" y="0" width="13.34" height="30" fill="#00853F" />
      <rect x="13.34" y="0" width="13.34" height="30" fill="#FDEF42" />
      <rect x="26.68" y="0" width="13.32" height="30" fill="#E31B23" />
      <path
        d="M 20 9.2 L 22.2 13.3 L 26.6 13.8 L 23.4 16.5 L 24.5 21 L 20 18.5 L 15.5 21 L 16.6 16.5 L 13.4 13.8 L 17.8 13.3 Z"
        fill="#00853F"
      />
    </>
  ),

  /* Bénin : bande verte à gauche + jaune/rouge à droite */
  BJ: () => (
    <>
      <rect x="0" y="0" width="15" height="30" fill="#008751" />
      <rect x="15" y="0" width="25" height="15" fill="#FCD116" />
      <rect x="15" y="15" width="25" height="15" fill="#E8112D" />
    </>
  ),

  /* Ghana : vert / jaune / rouge + étoile noire */
  GH: () => (
    <>
      <rect x="0" y="0" width="40" height="10" fill="#CE1126" />
      <rect x="0" y="10" width="40" height="10" fill="#FCD116" />
      <rect x="0" y="20" width="40" height="10" fill="#006B3F" />
      <path
        d="M 20 11.5 L 22.1 15.2 L 26.2 15.7 L 23.2 18.2 L 24.2 22.3 L 20 20 L 15.8 22.3 L 16.8 18.2 L 13.8 15.7 L 17.9 15.2 Z"
        fill="#000000"
      />
    </>
  ),

  /* Nigeria : vert / blanc / vert */
  NG: () => (
    <>
      <rect x="0" y="0" width="13.34" height="30" fill="#008751" />
      <rect x="13.34" y="0" width="13.34" height="30" fill="#FFFFFF" />
      <rect x="26.68" y="0" width="13.32" height="30" fill="#008751" />
    </>
  ),

  /* France : bleu / blanc / rouge */
  FR: () => (
    <>
      <rect x="0" y="0" width="13.34" height="30" fill="#0055A4" />
      <rect x="13.34" y="0" width="13.34" height="30" fill="#FFFFFF" />
      <rect x="26.68" y="0" width="13.32" height="30" fill="#EF4135" />
    </>
  ),

  /* États-Unis : 13 bandes + canton bleu + 50 étoiles */
  US: () => (
    <>
      <rect x="0" y="0" width="40" height="30" fill="#FFFFFF" />
      <g fill="#B22234">
        {[0, 1, 2, 3, 4, 5, 6].map((b) => (
          <rect key={b} x="0" y={b * 2.31 + (b >= 4 ? 2.31 : 0)} width="40" height="2.31" />
        ))}
      </g>
      <rect x="0" y="0" width="16.5" height="13.5" fill="#3C3B6E" />
      <g fill="#FFFFFF">
        {Array.from({ length: 50 }).map((_, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = (col % 2 === 1 ? 2.5 : 1.1) + col * 1.4;
          const y = 1.1 + row * 2.1;
          return <circle key={i} cx={x} cy={y} r="0.85" />;
        })}
      </g>
    </>
  ),

  /* Royaume-Uni : croix de Saint-Georges + diagonales (Union Jack simplifié) */
  GB: () => (
    <>
      <rect x="0" y="0" width="40" height="30" fill="#012169" />
      <polygon points="0,0 0,30 40,0" fill="#FFFFFF" opacity="0.45" />
      <polygon points="40,0 40,30 0,30" fill="#C8102E" opacity="0.9" />
      <polygon points="40,30 0,0 0,30" fill="#FFFFFF" opacity="0.45" />
      <polygon points="0,30 40,30 40,0" fill="#C8102E" opacity="0.9" />
      <rect x="18" y="0" width="4" height="30" fill="#FFFFFF" />
      <rect x="0" y="13" width="40" height="4" fill="#FFFFFF" />
      <rect x="19" y="0" width="2" height="30" fill="#C8102E" />
      <rect x="0" y="14" width="40" height="2" fill="#C8102E" />
    </>
  ),

  /* Espagne : rouge / jaune / rouge (armoiries simplifiées) */
  ES: () => (
    <>
      <rect x="0" y="0" width="40" height="30" fill="#AA151B" />
      <rect x="0" y="7.5" width="40" height="15" fill="#F1BF00" />
      <rect x="0" y="27" width="40" height="0" fill="#AA151B" />
    </>
  ),

  /* Portugal : vert / rouge + disque */
  PT: () => (
    <>
      <rect x="0" y="0" width="40" height="30" fill="#046A38" />
      <rect x="16" y="0" width="24" height="30" fill="#DA291C" />
      <circle cx="17" cy="15" r="7" fill="#FFE900" />
    </>
  ),

  /* Arabie Saoudite : vert + inscription (approximation) */
  SA: () => (
    <>
      <rect x="0" y="0" width="40" height="30" fill="#165D31" />
      <rect x="10" y="12.5" width="20" height="5" fill="#FFFFFF" rx="1" />
    </>
  ),

  /* Union Européenne : fond bleu + 12 étoiles */
  EU: () => (
    <>
      <rect x="0" y="0" width="40" height="30" fill="#003399" />
      <g fill="#FFCC00">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 15) * (Math.PI / 180);
          const x = 20 + 10 * Math.cos(angle);
          const y = 15 + 10 * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r="1.35" />;
        })}
      </g>
    </>
  ),
};

export function Flag({
  code,
  size = 20,
  className,
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  const key = (code || "").toUpperCase();
  const render = flags[key];
  return (
    <svg
      width={size}
      height={(size * 3) / 4}
      viewBox="0 0 40 30"
      className={`inline-block shrink-0 rounded-[2px] ring-1 ring-slate-200/80 dark:ring-slate-700 ${className ?? ""}`}
      aria-hidden="true"
    >
      {render ? render() : <rect width="40" height="30" fill="#94a3b8" />}
    </svg>
  );
}
