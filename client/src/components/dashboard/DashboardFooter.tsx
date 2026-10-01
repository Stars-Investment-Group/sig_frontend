import {
  Activity,
  ArrowRight,
  Calendar,
  Minus,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  confidenceSlices,
  guideFeatures,
  signalAlerts,
  type SignalAlert,
} from "@/data/mockDashboard";
import { STATIC_COUNTRIES, STATIC_INDICATORS } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";

/**
 * Pied du Global Overview — planche P1.
 *
 * La maquette pose **trois cartes cote a cote** : alertes, confiance et mode
 * d'emploi. La confiance y est une barre horizontale suivie de trois chiffres
 * de couverture, pas un anneau : un donut a quatre parts ne se lit pas a cette
 * taille, et la maquette veut qu'on lise « 208 sur 208 » d'un coup d'oeil.
 *
 * Les compteurs de couverture sont **calcules sur le jeu reel** et non figes a
 * 208 sur 208. Le perimetre de la beta etant de 208 pays, afficher la cible
 * comme atteinte masquerait exactement l'ecart qu'on veut suivre.
 */

/** Cibles de la beta, arretees avec l'equipe produit. */
const TARGET_COUNTRIES = 208;
const TARGET_INDICATORS = 156;

const IMPACT_STYLE: Record<SignalAlert["impact"], { Icon: typeof TrendingUp; cls: string }> = {
  Positive: { Icon: TrendingUp, cls: "text-green-600 dark:text-green-500" },
  Negative: { Icon: TrendingDown, cls: "text-red-600 dark:text-red-400" },
  Neutral: { Icon: Minus, cls: "text-blue-600 dark:text-blue-400" },
};

const GUIDE_ICON = {
  screener: SlidersHorizontal,
  movers: Activity,
  events: Calendar,
  confidence: ShieldCheck,
};

export function DashboardFooter() {
  const { t } = useI18n();

  // Confiance d'ensemble : part des donnees jugees fiables ou acceptables.
  // Les libelles de `confidenceSlices` sont en anglais ("Low Confidence",
  // "No Data") ; filtrer sur des mots francais renvoyait 100%.
  const EXCLUDED = ["Low Confidence", "No Data"];
  const overall = confidenceSlices
    .filter((slice) => !EXCLUDED.includes(slice.label))
    .reduce((sum, slice) => sum + slice.value, 0);

  const coverage = [
    {
      label: "Pays couverts",
      value: STATIC_COUNTRIES.length,
      target: TARGET_COUNTRIES,
      suffix: "",
    },
    {
      label: "Indicateurs suivis",
      value: STATIC_INDICATORS.length,
      target: TARGET_INDICATORS,
      suffix: "",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ===== Alertes / signaux notables ===== */}
      <div className="card-surface flex flex-col p-5">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">{t("footer.alertsTitle")}</h2>
          <p className="text-xs text-muted-foreground">{t("footer.alertsSubtitle")}</p>
        </div>

        <ul className="flex-1 space-y-2.5">
          {signalAlerts.map((alert) => {
            const style = IMPACT_STYLE[alert.impact];
            return (
              <li key={alert.id} className="flex items-start gap-2.5">
                <style.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.cls}`} />
                <p className="flex-1 text-xs leading-relaxed text-foreground">
                  {alert.text}
                  <span className="ml-1.5 whitespace-nowrap text-[11px] text-muted-foreground">
                    {alert.date}
                  </span>
                </p>
              </li>
            );
          })}
        </ul>

        <a
          href="/alerts"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Voir toutes les alertes
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ===== Confiance et couverture ===== */}
      <div className="card-surface flex flex-col p-5">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          {t("footer.confidenceTitle")}
        </h2>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Confiance globale</span>
            <span className="text-sm font-bold tabular-nums text-foreground">{overall}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3">
          {coverage.map((item) => (
            <div key={item.label}>
              <dt className="text-[11px] leading-tight text-muted-foreground">{item.label}</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {item.value}
              </dd>
              <p className="text-[11px] text-muted-foreground">sur {item.target}</p>
            </div>
          ))}
          <div>
            <dt className="text-[11px] leading-tight text-muted-foreground">Fraîcheur</dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums text-foreground">95%</dd>
            <p className="text-[11px] text-muted-foreground">dans les délais</p>
          </div>
        </dl>

        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {t("footer.confidenceNote")}
        </p>

        <a
          href="#methodologie"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Méthodologie et sources
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ===== Mode d'emploi ===== */}
      <div className="card-surface flex flex-col p-5">
        <h2 className="mb-3 text-base font-semibold text-foreground">{t("footer.guideTitle")}</h2>

        <ul className="flex-1 space-y-3">
          {guideFeatures.map((feature) => {
            const Icon = GUIDE_ICON[feature.icon];
            return (
              <li key={feature.icon} className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {t(`footer.guide.${feature.icon}`)}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {feature.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <a
          href="#guide"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Guide utilisateur
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
