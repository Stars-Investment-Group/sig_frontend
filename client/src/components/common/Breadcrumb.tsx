import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fil d'Ariane.
 *
 * Seul element de navigation sur lequel les planches pays s'accordent : les
 * cinq (P5 a P9) l'affichent au-dessus du titre, la ou leur barre d'onglets se
 * contredit d'une planche a l'autre.
 *
 * Le dernier segment n'est pas un lien — c'est la page courante. Le rendre
 * cliquable ferait croire a une destination differente.
 */

export interface BreadcrumbItem {
  label: string;
  /** Absent pour le segment courant. */
  href?: string;
}

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              )}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="truncate transition-colors hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("truncate", last && "font-medium text-foreground")}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
