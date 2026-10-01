import { useRef } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Flag } from "@/components/Flag";
import { useI18n } from "@/lib/i18n";
import { watchlist, type CountryMover } from "@/data/mockDashboard";
import { cn } from "@/lib/utils";

/**
 * Top Movers / Watchlist — planche P1.
 *
 * La maquette en fait un **carrousel horizontal** avec une fleche de defilement
 * a droite, pas une grille qui se replie. La difference compte des que la liste
 * de suivi depasse six pays : une grille repousserait le reste de la page vers
 * le bas, le carrousel garde la rangee a hauteur constante.
 */

const STATUS_STYLE: Record<CountryMover["status"], { Icon: typeof ArrowUpRight; cls: string; spark: string }> = {
  Improving: { Icon: ArrowUpRight, cls: "text-green-600 dark:text-green-500", spark: "#22C55E" },
  Deteriorating: { Icon: ArrowDownRight, cls: "text-red-600 dark:text-red-400", spark: "#EF4444" },
  Stable: { Icon: Minus, cls: "text-blue-600 dark:text-blue-400", spark: "#3B82F6" },
};

export function TopMovers() {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // Un peu moins qu'une largeur visible : on garde une carte de repere.
    track.scrollBy({ left: direction * (track.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{t("topMovers.title")}</h2>
        <div className="flex items-center gap-2">
          <button className="text-sm font-medium text-primary hover:underline">
            {t("topMovers.manage")}
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Faire défiler vers la gauche"
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Faire défiler vers la droite"
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        role="list"
        aria-label={t("topMovers.title")}
      >
        {watchlist.map((country) => (
          <div key={country.code} role="listitem" className="w-56 shrink-0 snap-start">
            <MoverCard country={country} />
          </div>
        ))}
      </div>
    </section>
  );
}

function MoverCard({ country: c }: { country: CountryMover }) {
  const [, navigate] = useLocation();
  const style = STATUS_STYLE[c.status];

  return (
    <button
      onClick={() => navigate(`/countries/${c.code}/summary`)}
      className="card-surface flex w-full flex-col p-4 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <Flag code={c.code} size={22} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">{c.name}</p>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">{c.region}</p>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn("text-2xl font-bold tabular-nums", style.cls)}>
          {c.delta > 0 ? "+" : ""}
          {c.delta}
        </span>
        <span className="text-[11px] text-muted-foreground">
          vers {c.score}/100
        </span>
      </div>

      <div className="mt-2">
        <Sparkline data={c.spark} color={style.spark} width={200} height={30} className="w-full" />
      </div>

      <span className={cn("mt-2 inline-flex items-center gap-1 text-[11px] font-semibold", style.cls)}>
        <style.Icon className="h-3.5 w-3.5" />
        {c.status}
      </span>
    </button>
  );
}
