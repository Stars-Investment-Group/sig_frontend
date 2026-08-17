import { Target, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Carte éditoriale — SIG House View (maquette p08_global_impl).
 * Icône cible + titre en haut, paragraphe au milieu, lien en bas.
 */
export function HouseViewCard() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5">
      {/* Header — icône cible + titre */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-blue-50 text-blue-600 dark:border-slate-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Target className="h-5 w-5" />
        </div>
        <h3 className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200">
          {t("house.title")}
        </h3>
      </div>

      {/* Paragraphe textuel au milieu */}
      <p className="mt-3 flex-1 text-xs leading-relaxed text-slate-600 dark:text-muted-foreground">
        {t("house.summary")}
      </p>

      {/* Lien en bas */}
      <a
        href="#house-view"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        {t("house.link")}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
