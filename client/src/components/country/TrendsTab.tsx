import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { Heatmap } from "@/components/common/Heatmap";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar, ScoreGauge } from "@/components/common/ScoreGauge";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { MomentumBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";
import { STATIC_INDICATORS, getStaticHistory } from "@/data/mockData";

/**
 * Onglet Trends & Signals — planche P5.
 *
 * La diffusion (« breadth ») et les signaux avancés/retardés sont calculés sur
 * les **séries réelles** du catalogue : quatre indicateurs, douze périodes. Ce
 * n'est pas la couverture attendue (156 indicateurs), mais le calcul est le
 * bon, donc l'élargissement du catalogue suffira.
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

/** Variation sur `lag` périodes, dans l'unité de l'indicateur. */
function changeOver(countryCode: string, indicatorCode: string, lag: number): number {
  const history = getStaticHistory(countryCode, indicatorCode);
  if (history.length <= lag) return 0;
  const last = history[history.length - 1].value;
  const prior = history[history.length - 1 - lag].value;
  return round2(last - prior);
}

/** Une hausse est favorable pour la croissance, défavorable ailleurs. */
const POLARITY: Record<string, "higherBetter" | "lowerBetter"> = {
  real_gdp_growth: "higherBetter",
  cpi_inflation: "lowerBetter",
  policy_rate: "lowerBetter",
  unemployment_rate: "lowerBetter",
};

/** Force de tendance normalisée entre -1 et +1, orientée « favorable ». */
function trendStrength(countryCode: string, indicatorCode: string, lag: number): number {
  const change = changeOver(countryCode, indicatorCode, lag);
  const oriented = POLARITY[indicatorCode] === "lowerBetter" ? -change : change;
  return round2(Math.max(-1, Math.min(1, oriented / 1.5)));
}

export function TrendsTab({ profile }: { profile: CountryProfile }) {
  const { country, regime, rating, metrics } = profile;

  const breadth = buildBreadth(country.code);
  const trendScore = Math.round(
    50 + breadth.netDiffusion * 25 + (regime.growthScore - 50) * 0.3
  );

  return (
    <div className="space-y-6">
      {/* ===== 1. Cinq KPI ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Current Regime</p>
          <p className="mt-1 text-lg font-bold text-foreground">{regime.regime}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            depuis {regime.validFrom.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
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
            <p className="mt-0.5 text-[11px] text-muted-foreground">modèle de régime</p>
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
          <div className="mt-2">
            <MomentumBadge momentum={regime.momentum} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            diffusion nette {breadth.netDiffusion >= 0 ? "+" : ""}
            {(breadth.netDiffusion * 100).toFixed(0)} pts
          </p>
        </div>
      </section>

      {/* ===== 2. Matrice multi-horizons ===== */}
      <SectionCard
        title="Multi-Horizon Trend Matrix"
        subtitle="Force de tendance, de -1 (défavorable) à +1 (favorable)"
      >
        <Heatmap
          columns={["1M", "3M", "6M", "12M"]}
          rows={buildTrendMatrix(profile)}
          scale="diverging"
          polarity="higherBetter"
          rowHeader="Bloc"
          legend={[
            { label: "Favorable", className: "bg-emerald-500/85" },
            { label: "Neutre", className: "bg-muted" },
            { label: "Défavorable", className: "bg-red-500/85" },
          ]}
        />
        <KeyTakeaway tone={breadth.netDiffusion >= 0 ? "positive" : "caution"}>
          {breadth.improving} série{breadth.improving > 1 ? "s" : ""} sur {breadth.total} suivies
          s&apos;améliore{breadth.improving > 1 ? "nt" : ""} sur un mois. Les
          horizons courts et longs {breadth.netDiffusion >= 0 ? "concordent" : "divergent"}, ce qui{" "}
          {breadth.netDiffusion >= 0 ? "conforte" : "fragilise"} le régime {regime.regime.toLowerCase()}.
        </KeyTakeaway>
      </SectionCard>

      {/* ===== 3. Indicateurs avancés / coïncidents / retardés ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {buildSignalPanels(profile).map((panel) => (
          <SectionCard key={panel.title} title={panel.title} subtitle={panel.hint}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-1.5 py-2 font-medium">Série</th>
                    <th className="px-1.5 py-2 text-right font-medium">Latest</th>
                    <th className="px-1.5 py-2 text-center font-medium">Trend</th>
                    <th className="px-1.5 py-2 text-right font-medium">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {panel.rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/50 last:border-0">
                      <td className="px-1.5 py-2 text-xs font-medium text-foreground">{row.label}</td>
                      <td className="px-1.5 py-2 text-right text-xs tabular-nums text-foreground">
                        {row.latest}
                      </td>
                      <td className="px-1.5 py-2 text-center">
                        {row.spark.length > 1 && (
                          <Sparkline data={row.spark} width={48} height={18} fill={false} />
                        )}
                      </td>
                      <td className="px-1.5 py-2 text-right">
                        <SignalChip signal={row.signal} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))}
      </section>

      {/* ===== 4 + 5. Composites et diffusion ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Momentum Composites" subtitle="Variation sur 3 mois" className="lg:col-span-2">
          <ul className="space-y-3">
            {buildComposites(profile).map((composite) => (
              <li key={composite.label}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">{composite.label}</span>
                  <DeltaBadge
                    value={composite.change}
                    unit="pp"
                    polarity={composite.polarity}
                    decimals={2}
                  />
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
                  <div
                    className={
                      composite.oriented >= 0
                        ? "absolute left-1/2 h-full rounded-full bg-emerald-500"
                        : "absolute h-full rounded-full bg-red-500"
                    }
                    style={
                      composite.oriented >= 0
                        ? { width: `${Math.min(Math.abs(composite.oriented) * 50, 50)}%` }
                        : {
                            width: `${Math.min(Math.abs(composite.oriented) * 50, 50)}%`,
                            right: "50%",
                          }
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

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
                  <span className={`h-2.5 w-2.5 rounded-sm ${row.tone}`} />
                  {row.label}
                </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {row.count} / {breadth.total}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      {/* ===== 6 + 7. Surprises et probabilités ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Surprise Monitor" subtitle="Écart aux attentes, en points">
          <ul className="space-y-2.5">
            {buildSurprises(profile).map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <DeltaBadge value={row.value} unit="pp" polarity={row.polarity} decimals={2} variant="pill" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Regime Probabilities" subtitle="Horizon 6 à 12 mois">
          <ul className="space-y-3">
            {buildRegimeProbabilities(profile).map((row) => (
              <li key={row.label}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-foreground">{row.label}</span>
                  <span className="text-sm font-bold tabular-nums text-foreground">{row.probability}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${row.probability}%` }} />
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

      {/* ===== 8. Journal des signaux ===== */}
      <SectionCard title="Signal Journal & Inflection Points">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Période</th>
                <th className="px-2 py-2 font-medium">Signal</th>
                <th className="px-2 py-2 font-medium">Catégorie</th>
                <th className="px-2 py-2 text-right font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {buildSignalJournal(profile).map((row) => (
                <tr key={`${row.period}-${row.signal}`} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 text-xs tabular-nums text-muted-foreground">{row.period}</td>
                  <td className="px-2 py-2 text-xs font-medium text-foreground">{row.signal}</td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{row.category}</td>
                  <td className="px-2 py-2 text-right">
                    <DeltaBadge value={row.impact} unit="pp" polarity={row.polarity} decimals={2} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ===== 9. Révisions ===== */}
      <SectionCard
        title="Revision Heatmap (3M)"
        subtitle="Révisions successives par série, exprimées en force normalisée"
      >
        <Heatmap
          columns={["1M", "2M", "3M"]}
          rows={buildRevisionMatrix(profile)}
          scale="diverging"
          polarity="higherBetter"
          rowHeader="Série"
        />
      </SectionCard>

      {/* ===== 10. Ce qui a changé ===== */}
      <SectionCard title="What Changed Since Last Update">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { title: "Key Upgrades", items: rating.upgradeTriggers.slice(0, 2), Icon: ArrowUpRight, tone: "text-emerald-600 dark:text-emerald-500" },
            { title: "Key Downgrades", items: rating.downgradeTriggers.slice(0, 2), Icon: ArrowDownRight, tone: "text-red-600 dark:text-red-400" },
            {
              title: "New Signals",
              items: [
                `Diffusion nette à ${(breadth.netDiffusion * 100).toFixed(0)} pts`,
                `Trend score à ${trendScore}/100`,
              ],
              Icon: ArrowRight,
              tone: "text-blue-600 dark:text-blue-400",
            },
          ].map((block) => (
            <div key={block.title}>
              <SubHeading className="mb-2">{block.title}</SubHeading>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                    <block.Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${block.tone}`} />
                    {item}
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
 * Sous-composants
 * ========================================================================= */

/**
 * Histogramme de diffusion, normalisé sur sa propre amplitude.
 *
 * La diffusion nette varie de quelques centièmes : la projeter sur une échelle
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

function SignalChip({ signal }: { signal: "Positive" | "Neutral" | "Negative" }) {
  const tone = {
    Positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Neutral: "bg-muted text-muted-foreground",
    Negative: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  }[signal];
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>{signal}</span>
  );
}

/* =========================================================================
 * Calculs
 * ========================================================================= */

/**
 * Diffusion calculée sur les séries réelles du catalogue : combien
 * s'améliorent, stagnent ou se dégradent sur un mois, en tenant compte de la
 * polarité de chaque indicateur.
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
  // Diffusion nette sur les 6 derniers décalages, en valeur brute.
  // Elle est normalisée à l'affichage : ramenée sur [0, 1] autour de zéro, la
  // série resterait coincée autour de 0,5 et l'histogramme serait plat.
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

/** Les 7 blocs de la maquette, rattachés aux séries disponibles. */
const TREND_BLOCKS: { label: string; code: string | null }[] = [
  { label: "Growth", code: "real_gdp_growth" },
  { label: "Inflation", code: "cpi_inflation" },
  { label: "Labour", code: "unemployment_rate" },
  { label: "Policy & Liquidity", code: "policy_rate" },
  { label: "External", code: null },
  { label: "Fiscal", code: null },
  { label: "Sentiment", code: null },
];

function buildTrendMatrix(profile: CountryProfile) {
  const lags = [1, 3, 6, 11];
  return TREND_BLOCKS.map((block) => ({
    label: block.label,
    values: lags.map((lag) => {
      if (block.code) return trendStrength(profile.country.code, block.code, lag);
      // Bloc sans série au catalogue : la case reste vide plutôt qu'inventée.
      return null;
    }),
  }));
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
    {
      title: "Leading",
      hint: "signaux avancés",
      rows: [row("policy_rate")],
    },
    {
      title: "Coincident",
      hint: "signaux coïncidents",
      rows: [row("real_gdp_growth"), row("cpi_inflation")],
    },
    {
      title: "Lagging",
      hint: "signaux retardés",
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
    { label: "Growth composite", indicatorCode: "real_gdp_growth", polarity: "higherBetter" },
    { label: "Inflation composite", indicatorCode: "cpi_inflation", polarity: "lowerBetter" },
    { label: "Financial conditions", indicatorCode: "policy_rate", polarity: "lowerBetter" },
    { label: "Labour composite", indicatorCode: "unemployment_rate", polarity: "lowerBetter" },
  ];

  return definitions.map((d) => {
    const change = changeOver(code, d.indicatorCode, 3);
    return {
      ...d,
      change,
      oriented: d.polarity === "lowerBetter" ? -change : change,
    };
  });
}

function buildSurprises(profile: CountryProfile) {
  const code = profile.country.code;
  const j = (key: string, amp: number) => round2((hash01(`${code}:surprise:${key}`) - 0.5) * amp);
  return [
    { label: "Growth surprise", value: j("growth", 1.2), polarity: "higherBetter" as const },
    { label: "Inflation surprise", value: j("inflation", 1.0), polarity: "lowerBetter" as const },
    { label: "Fiscal surprise", value: j("fiscal", 0.8), polarity: "higherBetter" as const },
    { label: "External surprise", value: j("external", 0.9), polarity: "higherBetter" as const },
  ];
}

function buildRegimeProbabilities(profile: CountryProfile) {
  const { regime } = profile;
  // Plus le score de croissance est haut et le risque bas, plus l'expansion domine.
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
    polarity: "higherBetter" | "lowerBetter";
  }[] = [];

  for (const indicator of STATIC_INDICATORS) {
    const history = getStaticHistory(code, indicator.code);
    // Point d'inflexion : la variation change de signe d'une période à l'autre.
    for (let i = history.length - 1; i >= 2 && entries.length < 6; i -= 1) {
      const d1 = history[i].value - history[i - 1].value;
      const d0 = history[i - 1].value - history[i - 2].value;
      if (d1 !== 0 && d0 !== 0 && Math.sign(d1) !== Math.sign(d0)) {
        entries.push({
          period: history[i].period,
          signal: `${indicator.name} — inflexion ${d1 > 0 ? "haussière" : "baissière"}`,
          category: indicator.category,
          impact: round2(d1),
          polarity: POLARITY[indicator.code] ?? "higherBetter",
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
