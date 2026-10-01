import { Heatmap } from "@/components/common/Heatmap";
import { useI18n } from "@/lib/i18n";
import { regimeMatrixRows } from "@/data/mockDashboard";

/**
 * Regional Regime Matrix (Risk Score) — planche P1.
 *
 * La maquette affiche des **scores chiffres** dans des cellules colorees, pas
 * des pastilles : l'ecart entre 42 et 55 se lit, ce qu'une pastille orange
 * contre une rouge ne donnait pas. Six colonnes, contre trois auparavant.
 *
 * L'echelle est un risque : `polarity="lowerBetter"`, sans quoi la region la
 * plus risquee ressortirait en vert.
 */

const COLUMNS = [
  { key: "overall", label: "Overall" },
  { key: "growth", label: "Growth Momentum" },
  { key: "inflation", label: "Inflation Outlook" },
  { key: "external", label: "External Balance" },
  { key: "fiscal", label: "Fiscal Sustainability" },
  { key: "policy", label: "Monetary Stance" },
] as const;

/** Les cinq paliers de la legende, du moins risque au plus risque. */
const LEGEND = [
  { label: "0-20 Very Low", className: "bg-emerald-500/80" },
  { label: "21-40 Low", className: "bg-emerald-400/40" },
  { label: "41-60 Moderate", className: "bg-amber-400/45" },
  { label: "61-80 High", className: "bg-orange-500/55" },
  { label: "81-100 Very High", className: "bg-red-500/85" },
];

export function RegionalRegimeMatrix() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-3">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{t("matrix.title")}</h2>
        <p className="text-xs text-muted-foreground">
          Score de risque 0-100 par région — une valeur basse est favorable
        </p>
      </div>

      <Heatmap
        columns={COLUMNS.map((c) => c.label)}
        rows={regimeMatrixRows.map((row) => ({
          label: row.region,
          values: COLUMNS.map((c) => row[c.key]),
        }))}
        scale="sequential"
        min={0}
        max={100}
        polarity="lowerBetter"
        palette="risk"
        rowHeader="Région"
        format={(v) => String(Math.round(v))}
        legend={LEGEND}
      />
    </div>
  );
}
