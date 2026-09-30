import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Enveloppe de section des fiches pays.
 *
 * Les maquettes repetent partout le meme bloc : un titre, parfois un
 * sous-titre, parfois une action a droite, puis le contenu. Centraliser ce
 * cadre evite de redupliquer `card-surface p-5` et la hierarchie de titres
 * dans les six onglets.
 */

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Contenu aligne a droite du titre : selecteur, bouton, legende... */
  action?: ReactNode;
  /** Pastille placee juste apres le titre (orientation, statut...). */
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Retire le fond et la bordure : utile pour imbriquer une sous-section. */
  bare?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  action,
  badge,
  children,
  className,
  bare = false,
}: SectionCardProps) {
  return (
    <section className={cn(bare ? "" : "card-surface p-5", className)}>
      {(title || action) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {badge}
              </div>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** Sous-titre de niveau 3, pour les sections qui se decoupent en panneaux. */
export function SubHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-semibold text-foreground", className)}>{children}</h3>
  );
}
