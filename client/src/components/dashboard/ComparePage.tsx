import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "wouter";
import { Download, Plus, RotateCcw, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { Heatmap } from "@/components/common/Heatmap";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { OutlookBadge } from "@/components/country/shared";
import {
  COMPARABLE_INDICATORS,
  METRIC_GROUPS,
  METRIC_SETS,
  buildComparison,
  buildNormalizedSeries,
  buildSectorScores,
  type MetricGroup,
} from "@/data/comparison";
import { STATIC_COUNTRIES } from "@/data/mockData";
import { exportCsv } from "@/utils/exportCsv";

/**
 * Compare Countries — planche P3.
 *
 * La sélection vit dans l'URL (`/compare?codes=CIV,SEN,USA`) : c'est ce qui
 * rend « Save Comparison » et « Share » réalisables sans backend — le lien
 * *est* la comparaison sauvegardée.
 *
 * Toutes les valeurs proviennent des profils pays déjà dérivés ; cette page
 * n'invente aucune donnée, elle normalise. Les z-scores sont calculés sur la
 * sélection courante, donc retirer un pays repositionne les autres : c'est le
 * comportement attendu d'une comparaison entre pairs.
 */

const MIN_COUNTRIES = 2;
const MAX_COUNTRIES = 8;
const DEFAULT_CODES = ["CIV", "SEN", "NGA", "ZAF"].filter((code) =>
  STATIC_COUNTRIES.some((c) => c.code === code)
);

/** Groupes de pairs proposés par le sélecteur « Peer Group ». */
const PEER_GROUPS: { key: string; label: string; codes: string[] }[] = [
  { key: "uemoa", label: "UEMOA", codes: ["CIV", "SEN"] },
  { key: "africa", label: "Afrique", codes: ["CIV", "SEN", "NGA", "ZAF"] },
  { key: "g7", label: "Économies avancées", codes: ["USA", "GBR", "DEU", "FRA", "JPN"] },
  { key: "emerging", label: "Émergents", codes: ["BRA", "IND", "CHN", "ZAF"] },
];

const TIMEFRAMES = [
  { key: "12m", label: "12 mois" },
  { key: "6m", label: "6 mois" },
  { key: "3m", label: "3 mois" },
];

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [metricSet, setMetricSet] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("12m");
  const [trendIndicator, setTrendIndicator] = useState<string>(
    COMPARABLE_INDICATORS[0]?.code ?? "real_gdp_growth"
  );

  const codes = useMemo(() => {
    const raw = (searchParams.get("codes") ?? "").split(",").filter(Boolean);
    const valid = raw
      .map((c) => c.toUpperCase())
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .filter((c) => STATIC_COUNTRIES.some((country) => country.code === c));
    return (valid.length >= MIN_COUNTRIES ? valid : DEFAULT_CODES).slice(0, MAX_COUNTRIES);
  }, [searchParams]);

  const setCodes = (next: string[]) =>
    setSearchParams({ codes: next.join(",") }, { replace: true });

  const groups: MetricGroup[] = METRIC_SETS[metricSet]?.groups ?? METRIC_GROUPS;
  const comparison = useMemo(() => buildComparison(codes, groups), [codes, groups]);
  const sectors = useMemo(() => buildSectorScores(codes), [codes]);
  const trendSeries = useMemo(
    () => buildNormalizedSeries(codes, trendIndicator),
    [codes, trendIndicator]
  );

  const available = STATIC_COUNTRIES.filter((c) => !codes.includes(c.code));
  const leader = [...comparison.scorecards].sort((a, b) => b.score100 - a.score100)[0];
  const laggard = [...comparison.scorecards].sort((a, b) => a.score100 - b.score100)[0];

  const handleExport = () => {
    const rows = comparison.rows.flatMap((row) =>
      row.cells.map((cell, i) => ({
        Metrique: row.metric.label,
        Famille: row.metric.group,
        Pays: comparison.profiles[i].country.name,
        Code: comparison.profiles[i].country.code,
        Valeur: cell.raw,
        Unite: row.metric.unit,
        ZScore: cell.z,
        Rang: cell.rank,
      }))
    );
    exportCsv(rows, `sig-comparaison-${codes.join("-").toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparer des pays</h1>
          <p className="text-xs text-muted-foreground">
            {codes.length} pays comparés · scores normalisés sur la sélection courante
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            title="Copie le lien de cette comparaison"
          >
            <Share2 className="h-4 w-4" /> Partager
          </Button>
        </div>
      </div>

      {/* ===== 1 + 2. Sélection et paramètres ===== */}
      <SectionCard
        title="Sélection"
        subtitle={`${MIN_COUNTRIES} à ${MAX_COUNTRIES} pays · le lien de la page est la comparaison sauvegardée`}
        action={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setCodes(DEFAULT_CODES)}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {codes.map((code) => {
            const country = STATIC_COUNTRIES.find((c) => c.code === code);
            const removable = codes.length > MIN_COUNTRIES;
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 py-1 pl-2 pr-1 text-xs font-medium text-foreground"
              >
                <Flag code={code} size={16} />
                {country?.name ?? code}
                <button
                  type="button"
                  disabled={!removable}
                  onClick={() => setCodes(codes.filter((c) => c !== code))}
                  aria-label={`Retirer ${country?.name ?? code}`}
                  title={removable ? "Retirer" : `Minimum ${MIN_COUNTRIES} pays`}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          {codes.length < MAX_COUNTRIES && available.length > 0 && (
            <label className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">Ajouter un pays</span>
              <select
                value=""
                onChange={(e) => e.target.value && setCodes([...codes, e.target.value])}
                aria-label="Ajouter un pays à la comparaison"
                className="bg-transparent text-xs text-foreground focus:outline-none"
              >
                <option value="">Ajouter…</option>
                {available.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-xs text-muted-foreground">
            Jeu de métriques
            <select
              value={metricSet}
              onChange={(e) => setMetricSet(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {Object.entries(METRIC_SETS).map(([key, set]) => (
                <option key={key} value={key}>
                  {set.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-muted-foreground">
            Groupe de pairs
            <select
              value=""
              onChange={(e) => {
                const group = PEER_GROUPS.find((g) => g.key === e.target.value);
                if (group) setCodes(group.codes.slice(0, MAX_COUNTRIES));
              }}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Choisir un groupe…</option>
              {PEER_GROUPS.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-muted-foreground">
            Fenêtre
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {TIMEFRAMES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SectionCard>

      {/* ===== 3. Scorecards ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {comparison.scorecards.map((card) => (
          <div key={card.code} className="card-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <Flag code={card.code} size={20} />
                <span className="truncate text-sm font-semibold text-foreground">{card.name}</span>
              </span>
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {card.rank}/{comparison.scorecards.length}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
              {card.score100}
              <span className="text-sm font-medium text-muted-foreground">/100</span>
            </p>
            <ScoreBar value={card.score100} max={100} className="mt-1.5" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <OutlookBadge outlook={card.outlook} />
              <DeltaBadge value={card.changeSincePrior} decimals={2} />
            </div>
            {card.spark.length > 1 && (
              <Sparkline data={card.spark} width={120} height={26} className="mt-2" />
            )}
          </div>
        ))}
      </section>

      {/* ===== 4. Heatmap de comparaison ===== */}
      <SectionCard
        title="Comparison Heatmap"
        subtitle="Z-scores orientés : positif = meilleur que la moyenne du groupe, quelle que soit la polarité de la métrique"
      >
        <Heatmap
          columns={comparison.profiles.map((p) => p.country.code)}
          rows={comparison.rows.map((row) => ({
            label: row.metric.label,
            group: row.metric.group,
            values: row.cells.map((cell) => cell.z),
          }))}
          scale="diverging"
          min={-1.6}
          max={1.6}
          polarity="higherBetter"
          rowHeader="Métrique"
          legend={[
            { label: "Meilleur du groupe", className: "bg-emerald-500/85" },
            { label: "À la moyenne", className: "bg-muted" },
            { label: "Moins bon du groupe", className: "bg-red-500/85" },
          ]}
        />
        <KeyTakeaway tone={leader ? "positive" : "neutral"}>
          {leader?.name} mène la sélection avec {leader?.score100}/100 ; {laggard?.name} ferme la
          marche à {laggard?.score100}/100. L&apos;écart se lit surtout sur{" "}
          {dominantMetric(comparison)}.
        </KeyTakeaway>
      </SectionCard>

      {/* ===== 5 + 6. Nuage et trajectoires ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Croissance vs risque"
          subtitle="Quatre quadrants, en écarts-types sur la sélection"
        >
          <GrowthRiskScatter comparison={comparison} />
        </SectionCard>

        <SectionCard
          title="Normalized Trend Comparison"
          subtitle="Chaque pays centré sur sa propre moyenne : 0 = son régime habituel"
          action={
            <select
              value={trendIndicator}
              onChange={(e) => setTrendIndicator(e.target.value)}
              aria-label="Indicateur comparé"
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {COMPARABLE_INDICATORS.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.name}
                </option>
              ))}
            </select>
          }
        >
          <NormalizedTrendChart series={trendSeries} timeframe={timeframe} />
        </SectionCard>
      </section>

      {/* ===== 7. Comparaison des prévisions ===== */}
      <SectionCard title="Forecast Comparison" subtitle="Trajectoires projetées par métrique">
        <ForecastComparison comparison={comparison} />
      </SectionCard>

      {/* ===== 8. Secteurs stratégiques ===== */}
      <SectionCard
        title="Strategic Sectors Comparison"
        subtitle="Scores 0-100, ancrés sur le pilier d'opportunité structurelle — en attente d'un module sectoriel"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sectors.map((sector) => {
            const best = Math.max(...sector.scores);
            return (
              <div key={sector.sector} className="rounded-lg border border-border bg-muted/40 p-3">
                <SubHeading className="mb-2">{sector.sector}</SubHeading>
                <ul className="space-y-2">
                  {sector.scores.map((score, i) => (
                    <li key={comparison.profiles[i].country.code}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Flag code={comparison.profiles[i].country.code} size={14} />
                          <span className="truncate text-muted-foreground">
                            {comparison.profiles[i].country.name}
                          </span>
                        </span>
                        <span
                          className={
                            score === best
                              ? "shrink-0 font-bold tabular-nums text-foreground"
                              : "shrink-0 tabular-nums text-muted-foreground"
                          }
                        >
                          {score}
                        </span>
                      </div>
                      <ScoreBar value={score} max={100} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ===== 9. Table de synthèse ===== */}
      <SectionCard
        title="Peer Comparison Table"
        subtitle="Valeurs brutes, z-score et rang dans la sélection"
        action={
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Métrique</th>
                {comparison.profiles.map((p) => (
                  <th key={p.country.code} className="px-2 py-2 text-right font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Flag code={p.country.code} size={14} />
                      {p.country.code}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.metric.key} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 text-xs font-medium text-foreground">
                    {row.metric.label}
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({row.metric.unit})
                    </span>
                  </td>
                  {row.cells.map((cell, i) => (
                    <td
                      key={comparison.profiles[i].country.code}
                      className="px-2 py-2 text-right tabular-nums"
                    >
                      <span
                        className={
                          cell.rank === 1
                            ? "font-bold text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {cell.raw.toFixed(1)}
                      </span>
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        ({cell.z >= 0 ? "+" : ""}
                        {cell.z.toFixed(2)})
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-2 py-2 text-xs font-semibold text-foreground">Score composite</td>
                {comparison.scorecards.map((card) => (
                  <td
                    key={card.code}
                    className="px-2 py-2 text-right text-sm font-bold tabular-nums text-foreground"
                  >
                    {card.score100}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/** Métrique où l'écart entre le meilleur et le moins bon est le plus large. */
function dominantMetric(comparison: ReturnType<typeof buildComparison>): string {
  let best = { label: "l'ensemble des métriques", spread: -1 };
  for (const row of comparison.rows) {
    const zs = row.cells.map((c) => c.z);
    const spread = Math.max(...zs) - Math.min(...zs);
    if (spread > best.spread) best = { label: row.metric.label.toLowerCase(), spread };
  }
  return best.label;
}

/* =========================================================================
 * Nuage croissance / risque
 * ========================================================================= */

const SERIES_COLORS = [
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#65A30D",
];

function GrowthRiskScatter({ comparison }: { comparison: ReturnType<typeof buildComparison> }) {
  const width = 360;
  const height = 300;
  const pad = 34;

  // Axes en écarts-types : la croissance en abscisse, la sécurité en ordonnée.
  const growth = zOf(comparison.profiles.map((p) => p.metrics.growth));
  const safety = zOf(comparison.profiles.map((p) => -p.metrics.riskScore));

  const bound = 2.2;
  const x = (z: number) => pad + ((z + bound) / (2 * bound)) * (width - 2 * pad);
  const y = (z: number) => height - pad - ((z + bound) / (2 * bound)) * (height - 2 * pad);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Croissance contre risque">
        <rect x={pad} y={pad} width={width - 2 * pad} height={height - 2 * pad} className="fill-muted/30" />
        <line x1={x(0)} x2={x(0)} y1={pad} y2={height - pad} className="stroke-border" strokeDasharray="4 3" />
        <line x1={pad} x2={width - pad} y1={y(0)} y2={y(0)} className="stroke-border" strokeDasharray="4 3" />

        <text x={width - pad - 4} y={y(0) + 14} textAnchor="end" fontSize="8.5" className="fill-muted-foreground">
          Croissance +
        </text>
        <text x={x(0) + 5} y={pad + 10} fontSize="8.5" className="fill-muted-foreground">
          Risque faible
        </text>
        <text x={x(0) + 5} y={height - pad - 4} fontSize="8.5" className="fill-muted-foreground">
          Risque élevé
        </text>

        {comparison.profiles.map((profile, i) => (
          <g key={profile.country.code}>
            <circle
              cx={x(clamp(growth[i], bound))}
              cy={y(clamp(safety[i], bound))}
              r={7}
              fill={SERIES_COLORS[i % SERIES_COLORS.length]}
              fillOpacity={0.85}
            />
            <text
              x={x(clamp(growth[i], bound))}
              y={y(clamp(safety[i], bound)) - 11}
              textAnchor="middle"
              fontSize="9"
              className="fill-foreground font-semibold"
            >
              {profile.country.code}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Quadrant supérieur droit : croissance au-dessus de la moyenne du groupe et risque en dessous.
      </p>
    </>
  );
}

function zOf(values: number[]): number[] {
  const n = values.length || 1;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
  return values.map((v) => (sd === 0 ? 0 : (v - mean) / sd));
}

const clamp = (v: number, bound: number) => Math.max(-bound, Math.min(bound, v));

/* =========================================================================
 * Trajectoires normalisées
 * ========================================================================= */

function NormalizedTrendChart({
  series,
  timeframe,
}: {
  series: ReturnType<typeof buildNormalizedSeries>;
  timeframe: string;
}) {
  const keep = timeframe === "3m" ? 3 : timeframe === "6m" ? 6 : 12;
  const trimmed = series.map((s) => ({
    ...s,
    points: s.points.slice(-keep),
    periods: s.periods.slice(-keep),
  }));

  const width = 360;
  const height = 250;
  const pad = { top: 16, right: 12, bottom: 34, left: 30 };
  const length = Math.max(...trimmed.map((s) => s.points.length), 2);
  const all = trimmed.flatMap((s) => s.points);
  const bound = Math.max(1.6, Math.ceil(Math.max(...all.map(Math.abs), 1) * 10) / 10);

  const x = (i: number) => pad.left + (i / (length - 1)) * (width - pad.left - pad.right);
  const y = (v: number) =>
    pad.top + ((bound - v) / (2 * bound)) * (height - pad.top - pad.bottom);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Trajectoires normalisées">
        {[bound, bound / 2, 0, -bound / 2, -bound].map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border"
              strokeDasharray={tick === 0 ? undefined : "3 3"}
            />
            <text x={pad.left - 5} y={y(tick) + 3} textAnchor="end" fontSize="8.5" className="fill-muted-foreground">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {trimmed.map((s, i) => (
          <polyline
            key={s.code}
            points={s.points.map((v, j) => `${x(j)},${y(v)}`).join(" ")}
            fill="none"
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}

        {trimmed[0]?.periods.map((period, i) =>
          i % 3 === 0 || i === length - 1 ? (
            <text key={period} x={x(i)} y={height - 20} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
              {period.slice(2)}
            </text>
          ) : null
        )}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {trimmed.map((s, i) => (
          <li key={s.code} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            {s.name}
          </li>
        ))}
      </ul>
    </>
  );
}

/* =========================================================================
 * Comparaison des prévisions
 * ========================================================================= */

function ForecastComparison({ comparison }: { comparison: ReturnType<typeof buildComparison> }) {
  const indicators = comparison.profiles[0]?.forecastRows.map((r) => r.indicator) ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">Pays</th>
            <th className="px-2 py-2 text-right font-medium">2024 (A)</th>
            <th className="px-2 py-2 text-right font-medium">2025F</th>
            <th className="px-2 py-2 text-right font-medium">2026F</th>
            <th className="px-2 py-2 text-center font-medium">Tendance</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator) => (
            <Fragment key={indicator}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="px-2 pb-0.5 pt-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {indicator}
                </th>
              </tr>
              {comparison.profiles.map((profile) => {
                const row = profile.forecastRows.find((r) => r.indicator === indicator);
                if (!row) return null;
                return (
                  <tr
                    key={`${indicator}-${profile.country.code}`}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-2 py-2">
                      <span className="flex items-center gap-1.5">
                        <Flag code={profile.country.code} size={14} />
                        <span className="text-xs text-foreground">{profile.country.name}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                      {row.a2024.toFixed(1)}
                    </td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">
                      {row.f2025.toFixed(1)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-foreground">
                      {row.f2026.toFixed(1)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Sparkline data={row.spark} width={60} height={20} fill={false} />
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
