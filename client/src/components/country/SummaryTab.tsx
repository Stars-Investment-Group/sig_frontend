import { useState } from "react";
import { Building2, Calendar } from "lucide-react";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { countryTimeline, marketSnapshot, strategicSectors } from "@/data/mockDashboard";
import type { CountryProfile } from "@/data/countryProfile";
import { OutlookBadge } from "@/components/country/shared";

/**
 * Onglet Summary — planche P2 des maquettes.
 *
 * Toutes les valeurs chiffrées proviennent du profil pays, donc changent avec
 * le sélecteur. Les blocs encore adossés aux fixtures Côte d'Ivoire (secteurs
 * stratégiques, frise d'événements, snapshot de marché) sont signalés comme
 * tels : ils dépendent du produit marchés/portefeuille à venir.
 */

export function SummaryTab({ profile }: { profile: CountryProfile }) {
  const { houseView, kpis, regimeLines, rating, regime, metrics } = profile;

  return (
    <div className="space-y-6">
      {/* ===== SIG House View ===== */}
      <SectionCard title="SIG House View" badge={<OutlookBadge outlook={houseView.stance} />}>
        <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {houseView.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {bullet}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* ===== 6 KPI ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="card-surface p-4">
            <p className="text-xs font-medium leading-tight text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{kpi.value}</p>
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <DeltaBadge value={kpi.delta} unit="pp" polarity={kpi.polarity} />
              <Sparkline
                data={kpi.spark}
                width={54}
                height={20}
                fill={false}
                color={kpi.polarity === "lowerBetter" ? "#D97706" : "#2563EB"}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Précédent : {kpi.previous}
              {kpi.derived && <span title="Valeur dérivée, en attente du catalogue"> ·&nbsp;dérivé</span>}
            </p>
          </div>
        ))}
      </section>

      {/* ===== Macro Regime Snapshot + trajectoire de croissance ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Macro Regime Snapshot"
          subtitle={`Confiance du modèle : ${regime.confidence}%`}
          className="lg:col-span-1"
        >
          <dl className="space-y-2.5">
            {regimeLines.map((line) => (
              <div
                key={line.label}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-sm last:border-0 last:pb-0"
              >
                <dt className="shrink-0 text-muted-foreground">{line.label}</dt>
                <dd className="text-right font-medium text-foreground">{line.value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Real GDP Growth" subtitle="2021 - 2027F" className="lg:col-span-2">
          <GdpChart profile={profile} />
        </SectionCard>
      </section>

      {/* ===== Forecast Summary + Peer Positioning ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Forecast Summary" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Indicator</th>
                  <th className="px-2 py-2 text-right font-medium">2023 (A)</th>
                  <th className="px-2 py-2 text-right font-medium">2024 (A)</th>
                  <th className="px-2 py-2 text-right font-medium">2025F</th>
                  <th className="px-2 py-2 text-right font-medium">2026F</th>
                  <th className="px-2 py-2 text-right font-medium">2027F</th>
                  <th className="px-2 py-2 text-center font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {profile.forecastRows.map((row) => (
                  <tr key={row.indicator} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2 text-xs font-medium text-foreground">{row.indicator}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.a2023.toFixed(1)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.a2024.toFixed(1)}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">{row.f2025.toFixed(1)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-foreground">{row.f2026.toFixed(1)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-foreground">{row.f2027.toFixed(1)}</td>
                    <td className="px-2 py-2 text-center">
                      <Sparkline data={row.spark} color="#2563EB" width={64} height={22} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <KeyTakeaway>
            La trajectoire 2025F-2027F suppose un régime {regime.regime.toLowerCase()} maintenu et
            une politique {regime.policyStance.toLowerCase()} inchangée. Un décrochage de la
            croissance sous {(metrics.growth - 1.5).toFixed(1)}% invaliderait ce profil.
          </KeyTakeaway>
        </SectionCard>

        <PeerPositioning profile={profile} />
      </section>

      {/* ===== Secteurs + Risques ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Strategic Sectors"
          subtitle="Fixture Côte d'Ivoire — en attente du module sectoriel"
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {strategicSectors.map((sector) => (
              <div key={sector.name} className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <SubHeading>{sector.name}</SubHeading>
                  <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                    {sector.impact} Impact
                  </span>
                </div>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {sector.drivers.map((driver) => (
                    <li key={driver} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Risk Snapshot"
          subtitle="Dérivé des 7 piliers de notation du module 5"
          className="lg:col-span-2"
        >
          <RiskTable profile={profile} />
        </SectionCard>
      </section>

      {/* ===== Frise + Marchés ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Policy & Events Timeline"
          subtitle="Fixture — en attente du module 9"
          className="lg:col-span-1"
        >
          <ol className="relative space-y-4 border-l border-border pl-4">
            {countryTimeline.map((event) => (
              <li key={event.title} className="relative">
                <span className="absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary" />
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {event.date}
                </p>
                <p className="text-xs text-muted-foreground">{event.title}</p>
                <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {event.tag}
                </span>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="Market Snapshot"
          subtitle="Fixture — alimenté par le produit marchés/portefeuille"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {marketSnapshot.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
              >
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">{metric.change}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <SubHeading className="mb-2">What Matters Now</SubHeading>
            <ul className="space-y-2">
              {buildWhatMatters(profile).map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </section>

      {/* ===== Sources & confiance ===== */}
      <SectionCard title="Sources & Data Confidence">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Confiance du régime", value: `${regime.confidence}%`, score: regime.confidence, max: 100 },
            { label: "Confiance de la notation", value: `${rating.confidence}%`, score: rating.confidence, max: 100 },
            { label: "Score composite", value: `${rating.compositeScore.toFixed(1)}/10`, score: rating.compositeScore, max: 10 },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{item.value}</span>
              </div>
              <ScoreBar value={item.score} max={item.max} />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sources : {regime.period} · notation revue le{" "}
          {rating.reviewDate.toLocaleDateString("fr-FR")} · les scores sont une sortie de modèle,
          l&apos;orientation et le statut de surveillance relèvent du jugement analyste.
        </p>
      </SectionCard>
    </div>
  );
}

/** Priorités de suivi, déduites des points faibles de la notation. */
function buildWhatMatters(profile: CountryProfile): string[] {
  const { rating, regime, metrics } = profile;
  return [
    `Trajectoire de politique monétaire : orientation ${regime.policyStance.toLowerCase()}, taux directeur à ${metrics.policyRate.toFixed(2)}%.`,
    `${rating.negativeDrivers[0]?.label ?? "Profil de risque"} — ${rating.negativeDrivers[0]?.rationale ?? "principal frein à la notation."}`,
    `Déclencheur de révision haussière : ${rating.upgradeTriggers[0] ?? "à définir"}.`,
  ];
}

/* =========================================================================
 * Trajectoire de croissance
 * ========================================================================= */

function GdpChart({ profile }: { profile: CountryProfile }) {
  const data = profile.gdpPath;
  const width = 360;
  const height = 170;
  const pad = { top: 16, right: 12, bottom: 26, left: 32 };

  const values = data.map((d) => d.actual ?? d.forecast ?? 0);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min || 1;

  const x = (i: number) => pad.left + (i / (data.length - 1)) * (width - pad.left - pad.right);
  const y = (v: number) => pad.top + ((max - v) / range) * (height - pad.top - pad.bottom);

  const actualPoints = data
    .map((d, i) => (d.actual === null ? null : `${x(i)},${y(d.actual)}`))
    .filter(Boolean)
    .join(" ");

  // La prévision reprend au dernier point réalisé, sinon la courbe est coupée.
  const lastActualIndex = data.reduce((acc, d, i) => (d.actual !== null ? i : acc), -1);
  const forecastPoints = data
    .map((d, i) => {
      if (i === lastActualIndex && d.actual !== null) return `${x(i)},${y(d.actual)}`;
      return d.forecast === null ? null : `${x(i)},${y(d.forecast)}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Croissance du PIB réel de ${profile.country.name}, 2021 à 2027F`}
    >
      {[0, 1, 2, 3].map((g) => {
        const gy = pad.top + (g / 3) * (height - pad.top - pad.bottom);
        return (
          <g key={g}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={gy}
              y2={gy}
              className="stroke-border"
              strokeDasharray="3 3"
            />
            <text x={pad.left - 6} y={gy + 3} textAnchor="end" fontSize="9" className="fill-muted-foreground">
              {(max - (g / 3) * range).toFixed(1)}
            </text>
          </g>
        );
      })}

      {actualPoints && (
        <polyline
          points={actualPoints}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {forecastPoints && (
        <polyline
          points={forecastPoints}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
      )}

      {data.map((d, i) => (
        <text key={d.year} x={x(i)} y={height - 8} textAnchor="middle" fontSize="8.5" className="fill-muted-foreground">
          {d.year}
        </text>
      ))}

      {data.map((d, i) =>
        d.forecast === null ? null : (
          <circle key={`fc-${d.year}`} cx={x(i)} cy={y(d.forecast)} r={3} fill="#F59E0B" />
        )
      )}

      <g transform={`translate(${pad.left}, ${pad.top - 6})`}>
        <circle cx={4} cy={0} r={3} fill="#2563EB" />
        <text x={12} y={3} fontSize="9" className="fill-muted-foreground">Actual</text>
        <line x1={46} y1={0} x2={60} y2={0} stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3" />
        <text x={66} y={3} fontSize="9" className="fill-muted-foreground">Forecast</text>
      </g>
    </svg>
  );
}

/* =========================================================================
 * Positionnement relatif
 * ========================================================================= */

type PeerMetric = "growth" | "inflation" | "fiscal" | "score";

const PEER_METRICS: { key: PeerMetric; label: string; unit: string }[] = [
  { key: "growth", label: "Croissance", unit: "%" },
  { key: "inflation", label: "Inflation", unit: "%" },
  { key: "fiscal", label: "Solde budgétaire", unit: "% PIB" },
  { key: "score", label: "Score SIG", unit: "/10" },
];

function PeerPositioning({ profile }: { profile: CountryProfile }) {
  const [metric, setMetric] = useState<PeerMetric>("growth");
  const active = PEER_METRICS.find((m) => m.key === metric)!;
  const peers = profile.peers;

  const values = peers.map((p) => p[metric]);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = max - min || 1;
  const average = values.reduce((s, v) => s + v, 0) / values.length;

  return (
    <SectionCard
      title="Peer Positioning"
      subtitle={`${profile.country.region} — ${peers.length} pays`}
      className="lg:col-span-1"
      action={
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as PeerMetric)}
          aria-label="Métrique de comparaison"
          className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {PEER_METRICS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      }
    >
      <ul className="space-y-2.5">
        {peers.map((peer) => {
          const value = peer[metric];
          const width = ((value - min) / span) * 100;
          const isSelf = peer.code === profile.country.code;
          return (
            <li key={peer.code}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Flag code={peer.code} size={14} />
                  <span className={isSelf ? "truncate font-semibold text-foreground" : "truncate text-muted-foreground"}>
                    {peer.name}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {value.toFixed(1)}
                  {active.unit}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={isSelf ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-slate-400 dark:bg-slate-500"}
                  style={{ width: `${Math.max(width, 2)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Moyenne du groupe : {average.toFixed(1)}
        {active.unit}
      </p>
    </SectionCard>
  );
}

/* =========================================================================
 * Risques, dérivés des piliers de notation
 * ========================================================================= */

const RISK_LABEL: Record<string, string> = {
  macroStrength: "Croissance",
  macroResilience: "Résilience macro",
  fiscalCapacity: "Budgétaire",
  externalResilience: "Externe",
  politicalInstitutionalQuality: "Politique & institutionnel",
  structuralOpportunity: "Structurel",
  marketAttractiveness: "Marché",
};

function RiskTable({ profile }: { profile: CountryProfile }) {
  const levelOf = (score: number) => (score >= 6.5 ? "Low" : score >= 4.5 ? "Medium" : "High");
  const tone = {
    Low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">Risque</th>
            <th className="px-2 py-2 font-medium">Niveau</th>
            <th className="px-2 py-2 text-right font-medium">Score</th>
            <th className="px-2 py-2 text-right font-medium">vs revue</th>
            <th className="px-2 py-2 font-medium">Percentile</th>
          </tr>
        </thead>
        <tbody>
          {profile.rating.pillars.map((pillar) => {
            const level = levelOf(pillar.score);
            return (
              <tr key={pillar.key} className="border-b border-border/50 last:border-0">
                <td className="px-2 py-2 text-xs font-medium text-foreground">
                  {RISK_LABEL[pillar.key] ?? pillar.label}
                </td>
                <td className="px-2 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${tone[level]}`}>
                    {level}
                  </span>
                </td>
                <td className="px-2 py-2 text-right text-xs font-semibold tabular-nums text-foreground">
                  {pillar.score.toFixed(1)}
                </td>
                <td className="px-2 py-2 text-right">
                  <DeltaBadge value={pillar.vsPrior} decimals={2} />
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <ScoreBar value={pillar.percentile} max={100} className="w-16" />
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {pillar.percentile}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
