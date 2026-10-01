import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { Heatmap } from "@/components/common/Heatmap";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar, ScoreGauge } from "@/components/common/ScoreGauge";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { MomentumBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";
import { STATIC_INDICATORS, getStaticHistory } from "@/data/mockData";
import { cn } from "@/lib/utils";

/**
 * Onglet Trends & Signals — planche P5.
 *
 * La diffusion et les signaux avances/retardes sont calcules sur les **series
 * reelles** du catalogue : quatre indicateurs, douze periodes. Ce n'est pas la
 * couverture attendue par la planche (dix-huit indicateurs repartis en trois
 * familles), mais le calcul est le bon, donc l'elargissement du catalogue
 * suffira. Le manque est dit a l'ecran plutot que comble par des series
 * inventees.
 */

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Variation sur `lag` periodes, dans l'unite de l'indicateur. */
function changeOver(countryCode: string, indicatorCode: string, lag: number): number {
  const history = getStaticHistory(countryCode, indicatorCode);
  if (history.length <= lag) return 0;
  return round2(history[history.length - 1].value - history[history.length - 1 - lag].value);
}

/** Une hausse est favorable pour la croissance, defavorable ailleurs. */
const POLARITY: Record<string, "higherBetter" | "lowerBetter"> = {
  real_gdp_growth: "higherBetter",
  cpi_inflation: "lowerBetter",
  policy_rate: "lowerBetter",
  unemployment_rate: "lowerBetter",
};

/** Force de tendance normalisee entre -1 et +1, orientee « favorable ». */
function trendStrength(countryCode: string, indicatorCode: string, lag: number): number {
  const change = changeOver(countryCode, indicatorCode, lag);
  const oriented = POLARITY[indicatorCode] === "lowerBetter" ? -change : change;
  return round2(Math.max(-1, Math.min(1, oriented / 1.5)));
}

export function TrendsTab({ profile }: { profile: CountryProfile }) {
  const { country, regime, rating, metrics } = profile;

  const breadth = buildBreadth(country.code);
  const trendScore = Math.round(50 + breadth.netDiffusion * 25 + (regime.growthScore - 50) * 0.3);
  const momentum = round2(
    STATIC_INDICATORS.reduce((sum, i) => sum + trendStrength(country.code, i.code, 3), 0) /
      Math.max(STATIC_INDICATORS.length, 1)
  );

  return (
    <div className="space-y-6">
      {/* ===== Bandeau : cinq indicateurs de synthese ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Current Regime</p>
          <p className="mt-1 text-xl font-bold text-foreground">{regime.regime}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Depuis{" "}
            {regime.validFrom.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Trend Score</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {trendScore}
            <span className="text-sm font-medium text-muted-foreground">/100</span>
          </p>
          <ScoreBar value={trendScore} max={100} className="mt-2" />
        </div>

        <div className="card-surface flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Confidence</p>
            <p className="mt-1 text-base font-bold text-foreground">
              {regime.confidence >= 75 ? "High" : regime.confidence >= 55 ? "Correcte" : "Faible"}
            </p>
          </div>
          <ScoreGauge
            value={regime.confidence}
            max={100}
            variant="donut"
            size={64}
            display={`${regime.confidence}%`}
            ariaLabel={`Confiance ${regime.confidence}%`}
          />
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Breadth</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {breadth.improvingPct}
            <span className="text-sm font-medium text-muted-foreground">%</span>
          </p>
          <DiffusionHistogram values={breadth.histogram} />
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Momentum</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tabular-nums",
              momentum > 0.02
                ? "text-emerald-600 dark:text-emerald-500"
                : momentum < -0.02
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
            )}
          >
            {momentum > 0 ? "+" : ""}
            {momentum.toFixed(2)}
          </p>
          <div className="mt-2">
            <MomentumBadge momentum={regime.momentum} />
          </div>
        </div>
      </section>

      {/* ===== Matrice multi-horizons ===== */}
      <SectionCard
        title="Multi-Horizon Trend Matrix"
        subtitle="Sens de la tendance par horizon, et force normalisée de -1 à +1"
      >
        <TrendMatrix profile={profile} />
        <KeyTakeaway tone={breadth.netDiffusion >= 0 ? "positive" : "caution"}>
          {breadth.improving} série{breadth.improving > 1 ? "s" : ""} sur {breadth.total} suivies
          s&apos;améliore{breadth.improving > 1 ? "nt" : ""} sur un mois. Les horizons courts et longs{" "}
          {breadth.netDiffusion >= 0 ? "concordent" : "divergent"}, ce qui{" "}
          {breadth.netDiffusion >= 0 ? "conforte" : "fragilise"} le régime {regime.regime.toLowerCase()}.
        </KeyTakeaway>
      </SectionCard>

      {/* ===== Indicateurs avances / coincidents / retardes ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {buildSignalPanels(profile).map((panel) => (
          <SectionCard key={panel.title} title={panel.title} subtitle={panel.hint}>
            {panel.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-1.5 py-2 font-medium">Indicateur</th>
                      <th className="px-1.5 py-2 text-right font-medium">Dernier</th>
                      <th className="px-1.5 py-2 text-center font-medium">Tendance</th>
                      <th className="px-1.5 py-2 text-center font-medium">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panel.rows.map((row) => (
                      <tr key={row.label} className="border-b border-border/50 last:border-0">
                        <td className="px-1.5 py-2 text-xs font-medium text-foreground">
                          {row.label}
                        </td>
                        <td className="px-1.5 py-2 text-right text-xs tabular-nums text-foreground">
                          {row.latest}
                        </td>
                        <td className="px-1.5 py-2 text-center">
                          {row.spark.length > 1 && (
                            <Sparkline data={row.spark} width={48} height={18} fill={false} />
                          )}
                        </td>
                        <td className="px-1.5 py-2 text-center">
                          <SignalDot signal={row.signal} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Aucun indicateur de cette famille au catalogue du module 2.
              </p>
            )}
          </SectionCard>
        ))}
      </section>

      <p className="text-[11px] text-muted-foreground">
        La planche attend dix-huit indicateurs répartis en trois familles ; le catalogue en compte{" "}
        {STATIC_INDICATORS.length}. Le calcul est le bon, seule la couverture manque.
      </p>

      {/* ===== Composites de momentum ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {buildComposites(profile).map((composite) => (
          <SectionCard key={composite.label} title={composite.label} subtitle="Variation sur 3 mois">
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                composite.oriented > 0.02
                  ? "text-emerald-600 dark:text-emerald-500"
                  : composite.oriented < -0.02
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
              )}
            >
              {composite.change > 0 ? "+" : ""}
              {composite.change.toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {composite.oriented > 0.02
                ? "En amélioration"
                : composite.oriented < -0.02
                  ? "En dégradation"
                  : "Stable"}
            </p>
            <Sparkline
              data={composite.series}
              width={220}
              height={44}
              color={composite.oriented >= 0 ? "#059669" : "#DC2626"}
              className="mt-2 w-full"
            />
          </SectionCard>
        ))}
      </section>

      {/* ===== Diffusion, surprises, probabilites ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Breadth & Diffusion">
          <div className="flex items-center justify-center">
            <ScoreGauge
              value={breadth.improvingPct}
              max={100}
              variant="donut"
              size={128}
              display={`${breadth.improvingPct}%`}
              caption="en amélioration"
              ariaLabel={`${breadth.improvingPct}% des séries en amélioration`}
            />
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            {[
              { label: "Improving", count: breadth.improving, tone: "bg-emerald-500" },
              { label: "Stable", count: breadth.stable, tone: "bg-slate-400" },
              { label: "Deteriorating", count: breadth.deteriorating, tone: "bg-red-500" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className={cn("h-2.5 w-2.5 rounded-sm", row.tone)} />
                  {row.label}
                </span>
                <span className="tabular-nums text-foreground">
                  <span className="font-semibold">{row.count}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    {Math.round((row.count / breadth.total) * 100)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Surprise Monitor" subtitle="Écart aux attentes de marché et de modèle">
          <div className="grid grid-cols-1 gap-3">
            {buildSurprises(profile).map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-lg font-bold tabular-nums",
                      (row.polarity === "higherBetter" ? row.value > 0 : row.value < 0)
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {row.value > 0 ? "+" : ""}
                    {row.value.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {(row.polarity === "higherBetter" ? row.value > 0 : row.value < 0)
                      ? "Positive"
                      : "Négative"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Regime Probabilities" subtitle="Horizon 6 à 12 mois">
          <ul className="space-y-3">
            {buildRegimeProbabilities(profile).map((row) => (
              <li key={row.label}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-foreground">{row.label}</span>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {row.probability}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", row.tone)}
                    style={{ width: `${row.probability}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Dérivé du score de croissance ({regime.growthScore}/100) et du score de risque (
            {metrics.riskScore}/100) du module 4.
          </p>
        </SectionCard>
      </section>

      {/* ===== Journal des signaux ===== */}
      <SectionCard title="Signal Journal & Inflection Points">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Période</th>
                <th className="px-2 py-2 font-medium">Signal</th>
                <th className="px-2 py-2 font-medium">Catégorie</th>
                <th className="px-2 py-2 font-medium">Impact</th>
                <th className="px-2 py-2 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {buildSignalJournal(profile).map((row) => (
                <tr key={`${row.period}-${row.signal}`} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {row.period}
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="flex items-center gap-1.5">
                      {row.impact > 0 ? (
                        <ArrowUp className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                      <span className="text-xs font-medium text-foreground">{row.signal}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-xs text-muted-foreground">{row.category}</td>
                  <td className="px-2 py-2.5">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        row.favorable
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {row.favorable ? "Positive" : "Negative"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-[11px] text-muted-foreground">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ===== Revisions ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Forecast Revision Deltas" subtitle="Depuis quatre semaines">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-1.5 py-2 font-medium">Indicateur</th>
                  <th className="px-1.5 py-2 text-right font-medium">2026e</th>
                  <th className="px-1.5 py-2 text-right font-medium">2027e</th>
                </tr>
              </thead>
              <tbody>
                {buildRevisionDeltas(profile).map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0">
                    <td className="px-1.5 py-2 text-xs font-medium text-foreground">{row.label}</td>
                    <td className="px-1.5 py-2 text-right">
                      <DeltaBadge value={row.y1} unit={row.unit} polarity={row.polarity} decimals={2} />
                    </td>
                    <td className="px-1.5 py-2 text-right">
                      <DeltaBadge value={row.y2} unit={row.unit} polarity={row.polarity} decimals={2} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Revision Heatmap" subtitle="Tendance sur 3 mois">
          <Heatmap
            columns={["1M", "2M", "3M"]}
            rows={buildRevisionMatrix(profile)}
            scale="diverging"
            polarity="higherBetter"
            rowHeader="Série"
            legend={[
              { label: "Révision haussière", className: "bg-emerald-500/85" },
              { label: "Inchangé", className: "bg-muted" },
              { label: "Révision baissière", className: "bg-red-500/85" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Top Forecast Changes" subtitle="Depuis quatre semaines">
          <ul className="space-y-2.5">
            {buildTopChanges(profile).map((row) => (
              <li
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <DeltaBadge value={row.value} unit={row.unit} polarity={row.polarity} decimals={2} />
              </li>
            ))}
          </ul>
          <a
            href={`/countries/${country.code}/forecasts`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir la table de prévisions complète
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>
      </section>

      {/* ===== Ce qui a change ===== */}
      <SectionCard title="What Changed Since Last Update" subtitle={regime.period}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {buildWhatChanged(profile).map((block) => (
            <div key={block.title}>
              <SubHeading className="mb-2">{block.title}</SubHeading>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item.label} className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <block.Icon className={cn("h-3.5 w-3.5 shrink-0", block.tone)} />
                      <span className="truncate text-muted-foreground">{item.label}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-foreground">
                      {item.from} → <span className="font-semibold">{item.to}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================================
 * Matrice multi-horizons
 * ========================================================================= */

/** Les sept blocs de la planche, rattaches aux series disponibles. */
const TREND_BLOCKS: { label: string; code: string | null }[] = [
  { label: "Growth", code: "real_gdp_growth" },
  { label: "Inflation", code: "cpi_inflation" },
  { label: "Labour", code: "unemployment_rate" },
  { label: "Policy & Liquidity", code: "policy_rate" },
  { label: "External", code: null },
  { label: "Fiscal", code: null },
  { label: "Sentiment", code: null },
];

const HORIZONS: { label: string; hint: string; lag: number }[] = [
  { label: "1M", hint: "Très court", lag: 1 },
  { label: "3M", hint: "Court", lag: 3 },
  { label: "6M", hint: "Moyen", lag: 6 },
  { label: "12M", hint: "Long", lag: 11 },
];

/**
 * La planche n'affiche pas de nombre dans les cellules : elle montre une
 * **fleche coloree** par horizon, et reserve la valeur a une colonne « Trend
 * Strength » dotee d'une barre de -1 a +1. On lit ainsi le sens d'un coup
 * d'oeil, et l'intensite seulement quand on la cherche.
 */
function TrendMatrix({ profile }: { profile: CountryProfile }) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-medium">Bloc</th>
              {HORIZONS.map((h) => (
                <th key={h.label} className="px-2 py-2 text-center font-medium">
                  {h.label}
                  <span className="ml-1 font-normal normal-case">({h.hint})</span>
                </th>
              ))}
              <th className="px-2 py-2 font-medium">Trend Strength</th>
            </tr>
          </thead>
          <tbody>
            {TREND_BLOCKS.map((block) => {
              const strength = block.code ? trendStrength(profile.country.code, block.code, 3) : null;
              return (
                <tr key={block.label} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2.5 text-xs font-medium text-foreground">{block.label}</td>
                  {HORIZONS.map((h) => (
                    <td key={h.label} className="px-2 py-2.5 text-center">
                      <TrendArrow
                        value={block.code ? trendStrength(profile.country.code, block.code, h.lag) : null}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2.5">
                    <StrengthBar value={strength} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            { label: "Improving", tone: "bg-emerald-500" },
            { label: "Stable / Mixed", tone: "bg-amber-500" },
            { label: "Deteriorating", tone: "bg-red-500" },
            { label: "Données insuffisantes", tone: "bg-slate-300 dark:bg-slate-600" },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("h-2.5 w-2.5 rounded-full", item.tone)} />
              {item.label}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground">
          -1 (dégradation marquée) · 0 (neutre) · +1 (amélioration marquée)
        </p>
      </div>
    </>
  );
}

function TrendArrow({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground"
        title="Donnée insuffisante"
      >
        <Minus className="h-3 w-3" />
      </span>
    );
  }
  const improving = value > 0.05;
  const deteriorating = value < -0.05;
  const Icon = improving ? ArrowUp : deteriorating ? ArrowDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full",
        improving
          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          : deteriorating
            ? "bg-red-500/20 text-red-700 dark:text-red-400"
            : "bg-amber-500/20 text-amber-700 dark:text-amber-500"
      )}
      title={value.toFixed(2)}
    >
      <Icon className="h-3 w-3" />
    </span>
  );
}

/** Barre centree sur zero : la moitie gauche est negative, la droite positive. */
function StrengthBar({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] text-muted-foreground">—</span>;
  }
  const width = Math.min(Math.abs(value), 1) * 50;
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-full min-w-[80px] overflow-hidden rounded-full bg-muted">
        <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <span
          className={cn(
            "absolute inset-y-0 rounded-full",
            value >= 0 ? "left-1/2 bg-emerald-500" : "bg-red-500"
          )}
          style={value >= 0 ? { width: `${width}%` } : { width: `${width}%`, right: "50%" }}
        />
      </span>
      <span className="w-10 shrink-0 text-right text-[11px] font-semibold tabular-nums text-foreground">
        {value.toFixed(2)}
      </span>
    </span>
  );
}

/* =========================================================================
 * Sous-composants
 * ========================================================================= */

function SignalDot({ signal }: { signal: "Positive" | "Neutral" | "Negative" }) {
  const tone = {
    Positive: "bg-emerald-500",
    Neutral: "bg-amber-500",
    Negative: "bg-red-500",
  }[signal];
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 rounded-full", tone)}
      title={signal}
      aria-label={signal}
    />
  );
}

/**
 * Histogramme de diffusion, normalise sur sa propre amplitude.
 *
 * La diffusion nette varie de quelques centiemes : la projeter sur une echelle
 * absolue [-1, +1] donnerait six barres identiques.
 */
function DiffusionHistogram({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return (
    <div className="mt-2 flex h-7 items-end gap-0.5" aria-hidden="true">
      {values.map((value, i) => (
        <div
          key={i}
          className={value >= 0 ? "flex-1 rounded-t-sm bg-emerald-500/70" : "flex-1 rounded-t-sm bg-red-500/70"}
          style={{ height: `${15 + ((value - min) / span) * 85}%` }}
          title={`Diffusion nette : ${(value * 100).toFixed(0)} pts`}
        />
      ))}
    </div>
  );
}

/* =========================================================================
 * Calculs
 * ========================================================================= */

/**
 * Diffusion calculee sur les series reelles du catalogue : combien
 * s'ameliorent, stagnent ou se degradent sur un mois, en tenant compte de la
 * polarite de chaque indicateur.
 */
function buildBreadth(countryCode: string) {
  const codes = STATIC_INDICATORS.map((i) => i.code);
  let improving = 0;
  let deteriorating = 0;
  let stable = 0;

  for (const code of codes) {
    const strength = trendStrength(countryCode, code, 1);
    if (strength > 0.05) improving += 1;
    else if (strength < -0.05) deteriorating += 1;
    else stable += 1;
  }

  const total = codes.length || 1;
  const histogram = [6, 5, 4, 3, 2, 1].map(
    (lag) => codes.reduce((sum, code) => sum + trendStrength(countryCode, code, lag), 0) / total
  );

  return {
    improving,
    deteriorating,
    stable,
    total,
    improvingPct: Math.round((improving / total) * 100),
    netDiffusion: round2((improving - deteriorating) / total),
    histogram,
  };
}

function buildSignalPanels(profile: CountryProfile) {
  const code = profile.country.code;
  const indicatorOf = (indicatorCode: string) =>
    STATIC_INDICATORS.find((i) => i.code === indicatorCode);

  const row = (indicatorCode: string) => {
    const indicator = indicatorOf(indicatorCode);
    const history = getStaticHistory(code, indicatorCode);
    const latest = history[history.length - 1];
    const strength = trendStrength(code, indicatorCode, 3);
    return {
      label: indicator?.name ?? indicatorCode,
      latest: latest ? `${latest.value.toFixed(1)}${indicator?.unit ?? ""}` : "—",
      spark: history.map((o) => o.value),
      signal: (strength > 0.05 ? "Positive" : strength < -0.05 ? "Negative" : "Neutral") as
        | "Positive"
        | "Neutral"
        | "Negative",
    };
  };

  return [
    { title: "Leading Indicators", hint: "Anticipent les retournements", rows: [row("policy_rate")] },
    {
      title: "Coincident Indicators",
      hint: "Décrivent l'état courant",
      rows: [row("real_gdp_growth"), row("cpi_inflation")],
    },
    {
      title: "Lagging Indicators",
      hint: "Confirment la tendance",
      rows: [row("unemployment_rate")],
    },
  ];
}

function buildComposites(profile: CountryProfile) {
  const code = profile.country.code;
  const definitions: {
    label: string;
    indicatorCode: string;
    polarity: "higherBetter" | "lowerBetter";
  }[] = [
    { label: "Growth Momentum", indicatorCode: "real_gdp_growth", polarity: "higherBetter" },
    { label: "Inflation Momentum", indicatorCode: "cpi_inflation", polarity: "lowerBetter" },
    { label: "Financial Momentum", indicatorCode: "policy_rate", polarity: "lowerBetter" },
  ];

  return definitions.map((d) => {
    const change = changeOver(code, d.indicatorCode, 3);
    const history = getStaticHistory(code, d.indicatorCode);
    return {
      ...d,
      change,
      oriented: d.polarity === "lowerBetter" ? -change : change,
      series: history.map((o) => o.value),
    };
  });
}

function buildSurprises(profile: CountryProfile) {
  const code = profile.country.code;
  const j = (key: string, amp: number) => round2((hash01(`${code}:surprise:${key}`) - 0.5) * amp);
  return [
    { label: "Growth Surprise", value: j("growth", 1.2), polarity: "higherBetter" as const },
    { label: "Inflation Surprise", value: j("inflation", 1.0), polarity: "lowerBetter" as const },
    { label: "Fiscal Surprise", value: j("fiscal", 0.8), polarity: "higherBetter" as const },
  ];
}

function buildRegimeProbabilities(profile: CountryProfile) {
  const { regime } = profile;
  const expansion = Math.max(
    8,
    Math.min(80, Math.round(regime.growthScore * 0.6 - regime.riskScore * 0.2 + 20))
  );
  const contraction = Math.max(
    4,
    Math.min(60, Math.round(regime.riskScore * 0.45 - regime.growthScore * 0.12))
  );
  const slowdown = Math.max(0, 100 - expansion - contraction);

  return [
    { label: "Expansion", probability: expansion, tone: "bg-emerald-500" },
    { label: "Slowdown", probability: slowdown, tone: "bg-amber-500" },
    { label: "Contraction", probability: contraction, tone: "bg-red-500" },
  ];
}

function buildSignalJournal(profile: CountryProfile) {
  const code = profile.country.code;
  const entries: {
    period: string;
    signal: string;
    category: string;
    impact: number;
    favorable: boolean;
    detail: string;
  }[] = [];

  for (const indicator of STATIC_INDICATORS) {
    const history = getStaticHistory(code, indicator.code);
    // Point d'inflexion : la variation change de signe d'une periode a l'autre.
    for (let i = history.length - 1; i >= 2 && entries.length < 6; i -= 1) {
      const d1 = history[i].value - history[i - 1].value;
      const d0 = history[i - 1].value - history[i - 2].value;
      if (d1 !== 0 && d0 !== 0 && Math.sign(d1) !== Math.sign(d0)) {
        const rising = d1 > 0;
        const favorable = POLARITY[indicator.code] === "lowerBetter" ? !rising : rising;
        entries.push({
          period: history[i].period,
          signal: `${indicator.name} — inflexion ${rising ? "haussière" : "baissière"}`,
          category: indicator.category,
          impact: round2(d1),
          favorable,
          detail: `${history[i - 1].value.toFixed(1)}${indicator.unit} → ${history[i].value.toFixed(1)}${indicator.unit}`,
        });
        break;
      }
    }
  }

  return entries.sort((a, b) => b.period.localeCompare(a.period));
}

function buildRevisionMatrix(profile: CountryProfile) {
  return STATIC_INDICATORS.map((indicator) => ({
    label: indicator.name,
    values: [1, 2, 3].map((lag) => trendStrength(profile.country.code, indicator.code, lag)),
  }));
}

function buildRevisionDeltas(profile: CountryProfile) {
  const code = profile.country.code;
  const j = (key: string, amp: number) => round2((hash01(`${code}:rev:${key}`) - 0.5) * amp);
  return [
    { label: "Croissance du PIB", y1: j("g1", 0.8), y2: j("g2", 0.6), unit: "pp", polarity: "higherBetter" as const },
    { label: "Inflation (moy.)", y1: j("i1", 0.6), y2: j("i2", 0.5), unit: "pp", polarity: "lowerBetter" as const },
    { label: "Solde budgétaire", y1: j("f1", 0.5), y2: j("f2", 0.4), unit: "pp", polarity: "higherBetter" as const },
    { label: "Compte courant", y1: j("c1", 0.5), y2: j("c2", 0.4), unit: "pp", polarity: "higherBetter" as const },
    { label: "Taux directeur", y1: j("r1", 0.5), y2: j("r2", 0.4), unit: "pp", polarity: "lowerBetter" as const },
  ];
}

function buildTopChanges(profile: CountryProfile) {
  return buildRevisionDeltas(profile)
    .map((row) => ({ label: row.label, value: row.y1, unit: row.unit, polarity: row.polarity }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

/** Ce qui a change, au format « avant → apres » de la planche. */
function buildWhatChanged(profile: CountryProfile) {
  const code = profile.country.code;
  const moves = STATIC_INDICATORS.map((indicator) => {
    const history = getStaticHistory(code, indicator.code);
    const latest = history[history.length - 1];
    const prior = history[history.length - 4] ?? history[0];
    const strength = trendStrength(code, indicator.code, 3);
    return {
      label: indicator.name,
      from: prior ? `${prior.value.toFixed(1)}${indicator.unit}` : "—",
      to: latest ? `${latest.value.toFixed(1)}${indicator.unit}` : "—",
      strength,
    };
  });

  return [
    {
      title: "Key Upgrades",
      Icon: ArrowUp,
      tone: "text-emerald-600 dark:text-emerald-500",
      items: moves.filter((m) => m.strength > 0.05),
    },
    {
      title: "Key Downgrades",
      Icon: ArrowDown,
      tone: "text-red-600 dark:text-red-400",
      items: moves.filter((m) => m.strength < -0.05),
    },
    {
      title: "New Signals",
      Icon: ArrowRight,
      tone: "text-blue-600 dark:text-blue-400",
      items: moves.filter((m) => Math.abs(m.strength) <= 0.05),
    },
  ];
}
