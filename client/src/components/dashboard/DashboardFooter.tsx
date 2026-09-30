import { TrendingUp, Minus, TrendingDown, SlidersHorizontal, Activity, Calendar, ShieldCheck } from "lucide-react";
import {
  signalAlerts,
  confidenceSlices,
  guideFeatures,
  type SignalAlert,
} from "@/data/mockDashboard";
import { useI18n } from "@/lib/i18n";
const impactMap: Record<SignalAlert["impact"], { icon: typeof TrendingUp; cls: string }> = {
  Positive: { icon: TrendingUp, cls: "text-green-600 dark:text-green-500" },
  Negative: { icon: TrendingDown, cls: "text-red-600 dark:text-red-400" },
  Neutral: { icon: Minus, cls: "text-blue-600 dark:text-blue-400" },
};

const guideIconMap = {
  screener: SlidersHorizontal,
  movers: Activity,
  events: Calendar,
  confidence: ShieldCheck,
};

/**
 * Pied de Dashboard — Alerts / Notable Signal Changes, Data Confidence & Coverage,
 * et How to Use This Page (spec §01B).
 * Rendu sur une grille : alerts (4) + confidence (3) à gauche, guide à droite.
 */
export function DashboardFooter() {
  const { t } = useI18n();

  // Donut : calcul des arcs SVG (segment circulaire). coverage = somme des valeurs (86%).
  const total = confidenceSlices.reduce((acc, s) => acc + s.value, 0);
  const circumference = 2 * Math.PI * 40;
  let offset = 0;

  return (
    <section className="space-y-6">
      {/* Ligne 1 : Alerts + Confidence (donut) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Alerts / Notable Signal Changes */}
        <div className="card-surface flex flex-col p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">
              {t("footer.alertsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("footer.alertsSubtitle")}
            </p>
          </div>

          <ul className="flex-1 space-y-2.5">
            {signalAlerts.map((a) => {
              const imp = impactMap[a.impact];
              const Icon = imp.icon;
              return (
                <li key={a.id} className="flex items-start gap-2.5">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${imp.cls}`} />
                  <p className="flex-1 text-sm text-foreground">
                    {a.text}{" "}
                    <span className="ml-1 whitespace-nowrap text-xs text-muted-foreground">
                      {a.date}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Data Confidence & Coverage */}
        <div className="card-surface flex flex-col p-5 lg:col-span-2">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-foreground">
              {t("footer.confidenceTitle")}
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Donut SVG */}
            <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="14" />
              {confidenceSlices.map((s) => {
                const frac = s.value / total;
                const dash = frac * circumference;
                const el = (
                  <circle
                    key={s.label}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="14"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    transform="rotate(-90 50 50)"
                  />
                );
                offset += dash;
                return el;
              })}
              <text x="50" y="47" textAnchor="middle" className="fill-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>
                86%
              </text>
              <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "8px" }}>
                {t("footer.coverage")}
              </text>
            </svg>

            {/* Légende */}
            <div className="flex-1 space-y-2">
              {confidenceSlices.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    {t(`footer.conf.${s.label.toLowerCase().replace(/\s+/g, "")}`)}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {t("footer.confidenceNote")}
          </p>
        </div>
      </div>

      {/* Ligne 2 : How to Use This Page */}
      <div className="card-surface p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">
            {t("footer.guideTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guideFeatures.map((f) => {
            const Icon = guideIconMap[f.icon];
            return (
              <div
                key={f.icon}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t(`footer.guide.${f.icon}`)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
