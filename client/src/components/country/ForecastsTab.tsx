import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { Waterfall } from "@/components/common/Waterfall";
import type { CountryProfile } from "@/data/countryProfile";
import { getStaticHistory, getVintages } from "@/data/mockData";

/**
 * Onglet Forecasts & Scenarios — planche P9.
 *
 * C'est l'onglet qui exploite le plus directement la dimension millésime
 * ajoutée en phase 2 : le sélecteur « Forecast Vintage » et la colonne
 * « Change vs » lisent les vraies dates de publication des observations, pas
 * une liste codée en dur. Sans `vintageDate`, cette planche était infaisable.
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

export function ForecastsTab({ profile }: { profile: CountryProfile }) {
  const { country, regime, rating, metrics } = profile;

  // Millésimes réellement disponibles dans les observations du module 3.
  const vintages = useMemo(() => {
    const history = getStaticHistory(country.code, "real_gdp_growth");
    const latestPeriod = history[history.length - 1]?.period;
    if (!latestPeriod) return [] as string[];
    return getVintages(country.code, "real_gdp_growth", latestPeriod).map((o) => o.vintageDate);
  }, [country.code]);

  const [current, setCurrent] = useState(vintages[0] ?? "");
  const [compare, setCompare] = useState(vintages[1] ?? vintages[0] ?? "");

  const conviction = Math.round(rating.confidence * 0.9);
  const stance =
    regime.momentum === "Improving"
      ? "Constructif"
      : regime.momentum === "Stable"
        ? "Neutre"
        : "Prudent";

  const forecastKpis = [
    { id: "growth", label: "Croissance 2026F", value: metrics.growth + 0.3, unit: "%", polarity: "higherBetter" as const },
    { id: "inflation", label: "Inflation 2026F", value: metrics.inflation - 0.2, unit: "%", polarity: "lowerBetter" as const },
    { id: "fiscal", label: "Solde budgétaire 2026F", value: metrics.fiscalBalance + 0.2, unit: "% PIB", polarity: "higherBetter" as const },
    { id: "rate", label: "Taux directeur fin 2026F", value: metrics.policyRate - 0.25, unit: "%", polarity: "lowerBetter" as const },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Contrôles de millésime ===== */}
      <SectionCard
        title="Forecast Vintage"
        subtitle={
          vintages.length
            ? `${vintages.length} millésimes disponibles pour la dernière période`
            : "Aucun millésime disponible pour ce pays"
        }
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Millésime courant
            <select
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {vintages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Comparer avec
            <select
              value={compare}
              onChange={(e) => setCompare(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {vintages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SectionCard>

      {/* ===== 1. Headline ===== */}
      <SectionCard
        title="SIG Forecast Headline"
        badge={
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {stance}
          </span>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          La trajectoire centrale retient une croissance de{" "}
          <strong className="text-foreground">{round1(metrics.growth + 0.3).toFixed(1)}%</strong> en
          2026, une inflation ramenée à{" "}
          <strong className="text-foreground">{round1(metrics.inflation - 0.2).toFixed(1)}%</strong> et
          une politique monétaire {regime.policyStance.toLowerCase()}. Le régime{" "}
          {regime.regime.toLowerCase()} constitue l&apos;hypothèse structurante de ce millésime.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">SIG Stance</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">{stance}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conviction</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{conviction}%</p>
            <ScoreBar value={conviction} max={100} className="mt-1" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Millésime</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{current || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Horizon</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">2025F - 2027F</p>
          </div>
        </div>
      </SectionCard>

      {/* ===== 2. KPI de prévision ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {forecastKpis.map((kpi) => {
          const delta = round2((hash01(`${country.code}:${kpi.id}:rev`) - 0.48) * 0.8);
          return (
            <div key={kpi.id} className="card-surface p-4">
              <p className="text-xs font-medium leading-tight text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {round1(kpi.value).toFixed(1)}
                <span className="text-sm font-medium text-muted-foreground">{kpi.unit}</span>
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">vs millésime précédent</span>
                <DeltaBadge value={delta} unit="pp" polarity={kpi.polarity} decimals={2} />
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== Hypotheses + enseignements, cote a cote comme la planche ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <SectionCard
        title="Key Assumptions"
        subtitle={`Millésime ${current || "courant"}`}
        className="lg:col-span-2"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Hypothèse</th>
                <th className="px-2 py-2 text-right font-medium">2026F</th>
                <th className="px-2 py-2 text-right font-medium">2027F</th>
                <th className="px-2 py-2 text-right font-medium">vs {compare || "précédent"}</th>
              </tr>
            </thead>
            <tbody>
              {buildAssumptions(profile).map((row) => (
                <tr key={row.label} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 text-xs font-medium text-foreground">{row.label}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-foreground">{row.y2026}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.y2027}</td>
                  <td className="px-2 py-2 text-right">
                    <DeltaBadge value={row.change} decimals={2} polarity={row.polarity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

        <SectionCard title="Key Takeaways">
          <ul className="space-y-3">
            {buildTakeaways(profile).map((item) => (
              <li key={item.title}>
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-semibold text-foreground">Pourquoi cela compte</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              L&apos;espace de politique économique s&apos;améliore graduellement, mais les risques
              baissiers — demande externe, prix des matières premières — justifient la prudence.
            </p>
          </div>
        </SectionCard>
      </section>

      {/* ===== 4. Forecast Summary ===== */}
      <ForecastSummary profile={profile} compareVintage={compare} />

      {/* ===== 5. Scénarios ===== */}
      <SectionCard title="2. Scenario Analysis" subtitle="Sensibilités exprimées en points de croissance">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {buildScenarioCards(profile).map((scenario) => (
            <div key={scenario.name} className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-baseline justify-between">
                <SubHeading>{scenario.name}</SubHeading>
                <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {scenario.probability}%
                </span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {scenario.growth.toFixed(1)}
                <span className="text-xs font-medium text-muted-foreground">%</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                inflation {scenario.inflation.toFixed(1)}%
              </p>
              <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{scenario.narrative}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <SubHeading className="mb-2">Scenario Drivers</SubHeading>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Facteur</th>
                  <th className="px-2 py-2 text-right font-medium">Downside</th>
                  <th className="px-2 py-2 text-right font-medium">Base</th>
                  <th className="px-2 py-2 text-right font-medium">Upside</th>
                </tr>
              </thead>
              <tbody>
                {buildScenarioDrivers(profile).map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2 text-xs font-medium text-foreground">{row.label}</td>
                    <td className="px-2 py-2 text-right">
                      <DeltaBadge value={row.down} unit="pp" decimals={2} />
                    </td>
                    <td className="px-2 py-2 text-right text-xs tabular-nums text-muted-foreground">0.00 pp</td>
                    <td className="px-2 py-2 text-right">
                      <DeltaBadge value={row.up} unit="pp" decimals={2} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      {/* ===== 6. Cascade de révision ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="3. Forecast Revision Waterfall"
          subtitle={`Décomposition de la révision entre ${compare || "millésime précédent"} et ${current || "courant"}`}
        >
          <RevisionWaterfall profile={profile} />
        </SectionCard>

        <SectionCard title="Revision Summary">
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            {buildRevisionSummary(profile).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <KeyTakeaway tone="neutral">
            La révision nette reste inférieure à l&apos;erreur moyenne historique du modèle
            ({buildPerformance(profile).mae.toFixed(2)} pp) : elle ne change pas l&apos;orientation.
          </KeyTakeaway>
        </SectionCard>
      </section>

      {/* ===== 4 + 5. Entrees du modele et contributions ===== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="4. Key Model Inputs"
          subtitle="Hypothèses exogènes et leur révision"
          className="xl:col-span-1"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-1 py-2 font-medium">Entrée</th>
                  <th className="px-1 py-2 text-right font-medium">2026F</th>
                  <th className="px-1 py-2 text-right font-medium">2027F</th>
                  <th className="px-1 py-2 text-right font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {buildAssumptions(profile).map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0">
                    <td className="px-1 py-2 text-xs font-medium text-foreground">{row.label}</td>
                    <td className="px-1 py-2 text-right text-xs tabular-nums text-foreground">
                      {row.y2026}
                    </td>
                    <td className="px-1 py-2 text-right text-xs tabular-nums text-muted-foreground">
                      {row.y2027}
                    </td>
                    <td className="px-1 py-2 text-right">
                      <DeltaBadge value={row.change} decimals={2} polarity={row.polarity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="5. Driver Contributions"
          subtitle={`Croissance ${round1(metrics.growth + 0.3).toFixed(1)}% — contributions en points`}
          className="xl:col-span-1"
        >
          <DriverContributions profile={profile} />
        </SectionCard>

        <SectionCard title="Model Notes" className="xl:col-span-1">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Le modèle relie conditions externes, politiques domestiques et moteurs structurels pour
            projeter les résultats. Les contributions ci-contre somment à la croissance centrale ;
            les écarts de millésime se lisent dans la cascade de révision.
          </p>
          <ul className="mt-3 space-y-2 text-[11px] text-muted-foreground">
            <li className="flex gap-1.5">
              <span className="text-primary">•</span>
              Couverture des prévisions : 2023 à 2027F.
            </li>
            <li className="flex gap-1.5">
              <span className="text-primary">•</span>
              Données macro jusqu&apos;à {regime.period}.
            </li>
            <li className="flex gap-1.5">
              <span className="text-primary">•</span>
              {vintages.length} millésime{vintages.length > 1 ? "s" : ""} conservé
              {vintages.length > 1 ? "s" : ""} pour la dernière période.
            </li>
          </ul>
        </SectionCard>
      </section>

      {/* ===== 6 + 7. Previsions budgetaires et externes ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="6. Fiscal Forecasts" subtitle="En points de PIB">
          <ForecastGrid rows={buildFiscalForecasts(profile)} />
          <p className="mt-2 text-[10px] text-muted-foreground">Source : prévisions SIG</p>
        </SectionCard>

        <SectionCard title="7. External Forecasts" subtitle="En points de PIB">
          <ForecastGrid rows={buildExternalForecasts(profile)} />
          <p className="mt-2 text-[10px] text-muted-foreground">Source : prévisions SIG</p>
        </SectionCard>
      </section>

      {/* ===== 8 + 9. Incertitude ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="8. Confidence Bands" subtitle="Éventail 40 / 60 / 80% autour du scénario central">
          <ConfidenceFan profile={profile} />
        </SectionCard>

        <SectionCard title="9. Forecast Distribution" subtitle="10 000 tirages, croissance 2026F">
          <Distribution profile={profile} />
        </SectionCard>
      </section>

      {/* ===== 13 + 14. Performance et méthodologie ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="10. Model Performance Snapshot">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Métrique</th>
                  <th className="px-2 py-2 text-right font-medium">Backtest</th>
                  <th className="px-2 py-2 text-right font-medium">Hors échantillon</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const p = buildPerformance(profile);
                  return [
                    ["RMSE (pp)", p.rmse.toFixed(2), (p.rmse * 1.18).toFixed(2)],
                    ["MAE (pp)", p.mae.toFixed(2), (p.mae * 1.15).toFixed(2)],
                    ["Direction Accuracy", `${p.direction}%`, `${Math.round(p.direction * 0.94)}%`],
                    ["Biais (pp)", p.bias.toFixed(2), (p.bias * 1.3).toFixed(2)],
                  ].map(([label, backtest, out]) => (
                    <tr key={label} className="border-b border-border/50 last:border-0">
                      <td className="px-2 py-2 text-xs font-medium text-foreground">{label}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-foreground">{backtest}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{out}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="11. Methodology Notes">
          <dl className="space-y-2.5 text-sm">
            {[
              ["Type de modèle", "Nowcast + projection à facteurs, révisé par millésime"],
              ["Couverture", `${profile.country.name} — 4 séries au catalogue`],
              ["Fréquence de révision", "mensuelle, alignée sur les publications source"],
              ["Horizon", "3 ans (2025F - 2027F)"],
              ["Millésimes conservés", `${vintages.length} pour la dernière période`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </section>
    </div>
  );
}

/* =========================================================================
 * Forecast Summary — graphe + table par métrique
 * ========================================================================= */

function ForecastSummary({
  profile,
  compareVintage,
}: {
  profile: CountryProfile;
  compareVintage: string;
}) {
  const [metric, setMetric] = useState(profile.forecastRows[0]?.indicator ?? "");
  const row = profile.forecastRows.find((r) => r.indicator === metric) ?? profile.forecastRows[0];

  const years = ["2023", "2024", "2025F", "2026F", "2027F"];
  const sig = [row.a2023, row.a2024, row.f2025, row.f2026, row.f2027];
  // Le consensus est décalé du SIG de façon déterministe, par métrique.
  const consensus = sig.map((v, i) =>
    round1(v + (hash01(`${profile.country.code}:${row.indicator}:cons:${i}`) - 0.5) * 0.9)
  );

  return (
    <SectionCard
      title="1. Forecast Summary"
      subtitle="SIG vs consensus, avec l'écart au millésime comparé"
      action={
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          aria-label="Métrique projetée"
          className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {profile.forecastRows.map((r) => (
            <option key={r.indicator} value={r.indicator}>
              {r.indicator}
            </option>
          ))}
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LineChart years={years} sig={sig} consensus={consensus} label={row.indicator} />
        </div>

        <div className="overflow-x-auto lg:col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Année</th>
                <th className="px-2 py-2 text-right font-medium">SIG</th>
                <th className="px-2 py-2 text-right font-medium">Consensus</th>
                <th className="px-2 py-2 text-right font-medium">vs {compareVintage || "préc."}</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year, i) => (
                <tr key={year} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 text-xs font-medium text-foreground">{year}</td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">
                    {sig[i].toFixed(1)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                    {consensus[i].toFixed(1)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <DeltaBadge
                      value={round2(sig[i] - consensus[i])}
                      decimals={2}
                      polarity={row.polarity}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

function LineChart({
  years,
  sig,
  consensus,
  label,
}: {
  years: string[];
  sig: number[];
  consensus: number[];
  label: string;
}) {
  const width = 380;
  const height = 190;
  const pad = { top: 18, right: 12, bottom: 26, left: 34 };
  const all = [...sig, ...consensus];
  const min = Math.min(...all) - 0.8;
  const max = Math.max(...all) + 0.8;
  const range = max - min || 1;

  const x = (i: number) => pad.left + (i / (years.length - 1)) * (width - pad.left - pad.right);
  const y = (v: number) => pad.top + ((max - v) / range) * (height - pad.top - pad.bottom);
  const toPoints = (series: number[]) => series.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  // Les deux dernières années sont des prévisions : zone grisée, comme la maquette.
  const forecastStart = x(years.findIndex((yr) => yr.endsWith("F")));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`${label} : SIG vs consensus`}>
      <rect
        x={forecastStart}
        y={pad.top}
        width={width - pad.right - forecastStart}
        height={height - pad.top - pad.bottom}
        className="fill-muted/50"
      />
      {[0, 1, 2, 3].map((g) => {
        const gy = pad.top + (g / 3) * (height - pad.top - pad.bottom);
        return (
          <g key={g}>
            <line x1={pad.left} x2={width - pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={gy + 3} textAnchor="end" fontSize="9" className="fill-muted-foreground">
              {(max - (g / 3) * range).toFixed(1)}
            </text>
          </g>
        );
      })}

      <polyline points={toPoints(consensus)} fill="none" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 3" />
      <polyline points={toPoints(sig)} fill="none" stroke="#2563EB" strokeWidth={2.2} strokeLinejoin="round" />
      {sig.map((v, i) => (
        <circle key={years[i]} cx={x(i)} cy={y(v)} r={2.8} fill="#2563EB" />
      ))}

      {years.map((year, i) => (
        <text key={year} x={x(i)} y={height - 8} textAnchor="middle" fontSize="8.5" className="fill-muted-foreground">
          {year}
        </text>
      ))}

      <g transform={`translate(${pad.left}, ${pad.top - 7})`}>
        <circle cx={4} cy={0} r={3} fill="#2563EB" />
        <text x={12} y={3} fontSize="9" className="fill-muted-foreground">SIG</text>
        <line x1={38} y1={0} x2={52} y2={0} stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 3" />
        <text x={58} y={3} fontSize="9" className="fill-muted-foreground">Consensus</text>
      </g>
    </svg>
  );
}

/* =========================================================================
 * Incertitude
 * ========================================================================= */

function ConfidenceFan({ profile }: { profile: CountryProfile }) {
  const width = 360;
  const height = 180;
  const pad = { top: 14, right: 12, bottom: 24, left: 32 };
  const years = ["2025F", "2026F", "2027F"];
  const central = years.map((yr, i) =>
    round1(profile.metrics.growth + 0.2 * i + (hash01(`${profile.country.code}:fan:${yr}`) - 0.5) * 0.4)
  );

  // L'incertitude s'élargit avec l'horizon : 0,6 / 1,2 / 1,8 point à 80%.
  const bands = [
    { level: "80%", spread: [0.6, 1.2, 1.8], opacity: 0.12 },
    { level: "60%", spread: [0.4, 0.8, 1.2], opacity: 0.18 },
    { level: "40%", spread: [0.22, 0.45, 0.7], opacity: 0.26 },
  ];

  const min = Math.min(...central.map((v, i) => v - bands[0].spread[i])) - 0.4;
  const max = Math.max(...central.map((v, i) => v + bands[0].spread[i])) + 0.4;
  const range = max - min || 1;
  const x = (i: number) => pad.left + (i / (years.length - 1)) * (width - pad.left - pad.right);
  const y = (v: number) => pad.top + ((max - v) / range) * (height - pad.top - pad.bottom);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Éventail de confiance des prévisions">
        {bands.map((band) => {
          const upper = central.map((v, i) => `${x(i)},${y(v + band.spread[i])}`);
          const lower = central
            .map((v, i) => `${x(i)},${y(v - band.spread[i])}`)
            .reverse();
          return (
            <polygon
              key={band.level}
              points={[...upper, ...lower].join(" ")}
              fill="#2563EB"
              opacity={band.opacity}
            />
          );
        })}
        <polyline points={central.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth={2.2} />
        {central.map((v, i) => (
          <circle key={years[i]} cx={x(i)} cy={y(v)} r={3} fill="#2563EB" />
        ))}
        {years.map((year, i) => (
          <text key={year} x={x(i)} y={height - 8} textAnchor="middle" fontSize="9" className="fill-muted-foreground">
            {year}
          </text>
        ))}
        {[0, 1, 2].map((g) => {
          const gy = pad.top + (g / 2) * (height - pad.top - pad.bottom);
          return (
            <text key={g} x={pad.left - 6} y={gy + 3} textAnchor="end" fontSize="9" className="fill-muted-foreground">
              {(max - (g / 2) * range).toFixed(1)}
            </text>
          );
        })}
      </svg>
      <ul className="mt-2 flex gap-4">
        {bands.map((band) => (
          <li key={band.level} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-3 w-3 rounded-sm bg-primary" style={{ opacity: band.opacity * 3 }} />
            {band.level}
          </li>
        ))}
      </ul>
    </>
  );
}

function Distribution({ profile }: { profile: CountryProfile }) {
  const center = profile.metrics.growth + 0.3;
  // Cloche discrète centrée sur la prévision, avec un léger biais déterministe.
  const skew = (hash01(`${profile.country.code}:skew`) - 0.5) * 0.6;
  const bins = Array.from({ length: 11 }, (_, i) => {
    const offset = (i - 5) * 0.4;
    const value = round1(center + offset + skew);
    const weight = Math.exp(-((offset - skew) ** 2) / 0.9);
    return { value, count: Math.round(weight * 2400) };
  });
  const maxCount = Math.max(...bins.map((b) => b.count));

  const p10 = round1(center - 1.3);
  const p50 = round1(center);
  const p90 = round1(center + 1.4);

  return (
    <>
      <div className="flex h-40 items-end gap-1">
        {bins.map((bin) => (
          <div key={bin.value} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className="rounded-t-sm bg-primary/70"
              style={{ height: `${(bin.count / maxCount) * 100}%` }}
              title={`${bin.value}% — ${bin.count} tirages`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{bins[0].value.toFixed(1)}%</span>
        <span>{bins[bins.length - 1].value.toFixed(1)}%</span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
        {[
          ["P10", p10],
          ["P50", p50],
          ["P90", p90],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-border bg-muted/40 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="text-sm font-bold tabular-nums text-foreground">
              {(value as number).toFixed(1)}%
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/* =========================================================================
 * Contenus dérivés
 * ========================================================================= */

function buildAssumptions(profile: CountryProfile) {
  const { country, metrics } = profile;
  const j = (key: string, amp: number) => round2((hash01(`${country.code}:${key}`) - 0.5) * amp);

  return [
    {
      label: "Brent (USD/bbl)",
      y2026: `${(78 + j("brent", 8)).toFixed(0)}`,
      y2027: `${(80 + j("brent27", 8)).toFixed(0)}`,
      change: j("brentrev", 3),
      polarity: "higherBetter" as const,
    },
    {
      label: "Croissance mondiale (%)",
      y2026: `${(3.1 + j("world", 0.5)).toFixed(1)}`,
      y2027: `${(3.2 + j("world27", 0.5)).toFixed(1)}`,
      change: j("worldrev", 0.4),
      polarity: "higherBetter" as const,
    },
    {
      label: "Taux directeur (%)",
      y2026: `${round1(metrics.policyRate - 0.25).toFixed(2)}`,
      y2027: `${round1(metrics.policyRate - 0.5).toFixed(2)}`,
      change: j("raterev", 0.5),
      polarity: "lowerBetter" as const,
    },
    {
      label: `Taux de change (${country.currency ?? "n/a"})`,
      y2026: country.currency === "XOF" ? "655.96 (fixe)" : `${(1 + j("fx", 0.3)).toFixed(2)} idx`,
      y2027: country.currency === "XOF" ? "655.96 (fixe)" : `${(1 + j("fx27", 0.3)).toFixed(2)} idx`,
      change: country.currency === "XOF" ? 0 : j("fxrev", 0.6),
      polarity: "higherBetter" as const,
    },
    {
      label: "Prix de la matière première clé",
      y2026: `${(100 + j("commo", 22)).toFixed(0)} idx`,
      y2027: `${(103 + j("commo27", 22)).toFixed(0)} idx`,
      change: j("commorev", 4),
      polarity: "higherBetter" as const,
    },
  ];
}

function buildScenarioCards(profile: CountryProfile) {
  const { metrics, rating } = profile;
  const base = round1(metrics.growth + 0.3);
  const infl = round1(metrics.inflation - 0.2);
  const tilt = rating.outlook === "Positive" ? 1 : rating.outlook === "Negative" ? -1 : 0;

  return [
    {
      name: "Upside",
      growth: round1(base + 1.1),
      inflation: round1(infl + 0.3),
      probability: 20 + tilt * 5,
      narrative: "Demande externe soutenue et investissements avancés plus vite que prévu.",
    },
    {
      name: "Base",
      growth: base,
      inflation: infl,
      probability: 54,
      narrative: "Poursuite du régime courant, politique économique inchangée.",
    },
    {
      name: "Downside",
      growth: round1(base - 1.3),
      inflation: round1(infl + 0.9),
      probability: 19 - tilt * 3,
      narrative: "Resserrement des conditions financières et repli des termes de l'échange.",
    },
    {
      name: "Stress",
      growth: round1(base - 2.8),
      inflation: round1(infl + 2.2),
      probability: 7 - tilt * 2,
      narrative: "Choc combiné : perte d'accès au marché et choc d'offre.",
    },
  ];
}

function buildScenarioDrivers(profile: CountryProfile) {
  const j = (key: string, amp: number) => round2((hash01(`${profile.country.code}:${key}`) - 0.5) * amp);
  return [
    { label: "Demande externe", down: -0.6 + j("d1", 0.3), up: 0.5 + j("u1", 0.3) },
    { label: "Termes de l'échange", down: -0.45 + j("d2", 0.3), up: 0.4 + j("u2", 0.3) },
    { label: "Conditions financières", down: -0.5 + j("d3", 0.3), up: 0.3 + j("u3", 0.2) },
    { label: "Investissement public", down: -0.3 + j("d4", 0.2), up: 0.45 + j("u4", 0.3) },
    { label: "Récoltes / production sectorielle", down: -0.4 + j("d5", 0.3), up: 0.35 + j("u5", 0.3) },
  ];
}

function RevisionWaterfall({ profile }: { profile: CountryProfile }) {
  const j = (key: string, amp: number) => round2((hash01(`${profile.country.code}:rev:${key}`) - 0.5) * amp);
  const steps = [
    { label: "Données révisées", value: j("data", 0.4) },
    { label: "Hypothèses externes", value: j("assump", 0.5) },
    { label: "Politique économique", value: j("policy", 0.3) },
    { label: "Changement de modèle", value: j("model", 0.2) },
  ];
  const start = round2(profile.metrics.growth + 0.3 - steps.reduce((s, x) => s + x.value, 0));

  return (
    <Waterfall
      start={{ label: "Millésime précédent", value: start }}
      steps={steps}
      end={{ label: "Millésime courant", value: round2(profile.metrics.growth + 0.3) }}
      unit=" pp"
      height={190}
    />
  );
}

function buildRevisionSummary(profile: CountryProfile): string[] {
  const { regime, rating, metrics } = profile;
  return [
    `Croissance 2026F portée à ${round1(metrics.growth + 0.3).toFixed(1)}% : la révision vient d'abord des données publiées depuis le millésime précédent.`,
    `Inflation ramenée à ${round1(metrics.inflation - 0.2).toFixed(1)}%, cohérente avec une politique ${regime.policyStance.toLowerCase()}.`,
    `Orientation de notation inchangée (${rating.outlook.toLowerCase()}) : la révision reste dans la marge d'erreur du modèle.`,
  ];
}

/**
 * Contributions a la croissance, en points.
 *
 * Elles **somment a la croissance centrale** : une decomposition dont le total
 * ne retombe pas sur le chiffre affiche juste au-dessus ne serait pas lisible.
 */
function DriverContributions({ profile }: { profile: CountryProfile }) {
  const total = round1(profile.metrics.growth + 0.3);
  const shares = [
    { label: "Consommation", share: 0.5, color: "#2563EB" },
    { label: "Investissement", share: 0.22, color: "#059669" },
    { label: "Dépense publique", share: 0.07, color: "#7C3AED" },
    { label: "Exportations nettes", share: 0.17, color: "#D97706" },
    { label: "Stocks et autres", share: 0.04, color: "#94A3B8" },
  ];
  const values = shares.map((item) => ({
    ...item,
    value: Math.round(item.share * total * 10) / 10,
  }));
  const max = Math.max(...values.map((v) => Math.abs(v.value)), 0.1);

  return (
    <>
      <ul className="space-y-2">
        {values.map((item) => (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold tabular-nums text-foreground">
                +{item.value.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${(Math.abs(item.value) / max) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-baseline justify-between border-t border-border pt-2 text-xs">
        <span className="font-semibold text-foreground">Total</span>
        <span className="text-lg font-bold tabular-nums text-foreground">{total.toFixed(1)}%</span>
      </p>
    </>
  );
}

interface ForecastGridRow {
  label: string;
  values: number[];
}

/** Table annuelle 2024 a 2027F, partagee par les sections 6 et 7. */
function ForecastGrid({ rows }: { rows: ForecastGridRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">Poste</th>
            <th className="px-2 py-2 text-right font-medium">2024</th>
            <th className="px-2 py-2 text-right font-medium">2025F</th>
            <th className="px-2 py-2 text-right font-medium">2026F</th>
            <th className="px-2 py-2 text-right font-medium">2027F</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50 last:border-0">
              <td className="px-2 py-2 text-xs font-medium text-foreground">{row.label}</td>
              {row.values.map((value, i) => (
                <td
                  key={i}
                  className={`px-2 py-2 text-right text-xs tabular-nums ${
                    i === 1 ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {value.toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildFiscalForecasts(profile: CountryProfile): ForecastGridRow[] {
  const balance = profile.metrics.fiscalBalance;
  const j = (key: string, amp: number) => round1((hash01(`${profile.country.code}:fis:${key}`) - 0.5) * amp);
  const revenue = round1(16 + j("rev", 4));
  const spending = round1(revenue - balance);
  return [
    { label: "Recettes", values: [revenue, revenue + 0.4, revenue + 0.6, revenue + 0.9] },
    { label: "Dépenses", values: [spending, spending + 0.2, spending + 0.3, spending + 0.4] },
    {
      label: "Solde primaire",
      values: [balance + 1.2, balance + 1.4, balance + 1.5, balance + 1.7],
    },
    { label: "Solde global", values: [balance, balance + 0.2, balance + 0.3, balance + 0.5] },
    {
      label: "Dette publique",
      values: [round1(55 + j("debt", 20)), round1(56 + j("debt", 20)), round1(56 + j("debt", 20)), round1(55 + j("debt", 20))],
    },
  ];
}

function buildExternalForecasts(profile: CountryProfile): ForecastGridRow[] {
  const current = profile.metrics.currentAccount;
  const j = (key: string, amp: number) => round1((hash01(`${profile.country.code}:ext:${key}`) - 0.5) * amp);
  const exports = round1(30 + j("exp", 12));
  const imports = round1(exports - current - 2);
  return [
    { label: "Compte courant", values: [current, current + 0.3, current + 0.5, current + 0.6] },
    {
      label: "Balance commerciale",
      values: [current + 2, current + 2.2, current + 2.4, current + 2.5],
    },
    { label: "Exportations", values: [exports, exports + 0.8, exports + 1.2, exports + 1.6] },
    { label: "Importations", values: [imports, imports + 0.6, imports + 0.9, imports + 1.2] },
    {
      label: "Réserves (mois d'import.)",
      values: [round1(3.5 + j("res", 2)), round1(3.6 + j("res", 2)), round1(3.8 + j("res", 2)), round1(4 + j("res", 2))],
    },
  ];
}

/** Quatre enseignements, deduits des metriques et de la notation. */
function buildTakeaways(profile: CountryProfile) {
  const { metrics, rating, regime } = profile;
  return [
    {
      title: "Perspective de croissance",
      text: `Croissance projetee a ${round1(metrics.growth + 0.3).toFixed(1)}% — regime ${regime.regime.toLowerCase()}, momentum ${regime.momentum.toLowerCase()}.`,
    },
    {
      title: "Convergence de l'inflation",
      text: `Inflation ramenee a ${round1(metrics.inflation - 0.2).toFixed(1)}%, politique ${regime.policyStance.toLowerCase()}.`,
    },
    {
      title: "Consolidation budgetaire",
      text: `Solde a ${metrics.fiscalBalance.toFixed(1)}% du PIB ; ${rating.upgradeTriggers[0] ?? "trajectoire a confirmer"}.`,
    },
    {
      title: "Position exterieure",
      text: `Compte courant a ${metrics.currentAccount.toFixed(1)}% du PIB — ${rating.outlook.toLowerCase()}.`,
    },
  ];
}

function buildPerformance(profile: CountryProfile) {
  const { country, regime } = profile;
  // Un régime instable se prévoit moins bien : l'erreur suit le score de risque.
  const noise = regime.riskScore / 100;
  return {
    rmse: round2(0.55 + noise * 0.9 + (hash01(`${country.code}:rmse`) - 0.5) * 0.2),
    mae: round2(0.4 + noise * 0.7 + (hash01(`${country.code}:mae`) - 0.5) * 0.15),
    direction: Math.round(82 - noise * 22),
    bias: round2((hash01(`${country.code}:bias`) - 0.5) * 0.5),
  };
}
