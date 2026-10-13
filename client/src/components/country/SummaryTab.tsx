import { useState } from "react";
import { ArrowRight, Calendar, CheckSquare, Database, FileText, Gauge, Layers } from "lucide-react";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { countryTimeline, marketSnapshot, strategicSectors } from "@/data/mockDashboard";
import { STATIC_COUNTRIES, STATIC_INDICATORS } from "@/data/mockData";
import type { CountryProfile } from "@/data/countryProfile";
import { OutlookBadge } from "@/components/country/shared";
import { cn } from "@/lib/utils";

/**
 * Onglet Summary — planche P2.
 *
 * La planche organise la page en six rangees : House View et 6 KPI, puis
 * regime / trajectoire / revisions, previsions et pairs, secteurs et risques,
 * frise et marches, enfin le triptyque de bas de page. L'ordre et les
 * proportions suivent la maquette.
 *
 * Toutes les valeurs chiffrees viennent du profil pays, donc changent avec le
 * selecteur. Les blocs encore adosses aux fixtures Cote d'Ivoire (secteurs,
 * frise, marches) sont signales comme tels : ils dependent du module 9 et du
 * produit marches/portefeuille.
 */

/** Cible de couverture de la beta, arretee avec l'equipe produit. */
const TARGET_COUNTRIES = 208;
const TARGET_INDICATORS = 156;

export function SummaryTab({ profile }: { profile: CountryProfile }) {
  const { houseView, kpis, regimeLines, rating, regime, metrics } = profile;

  return (
    <div className="space-y-6">
      {/* ===== 1. House View + 6 KPI ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="SIG House View"
          badge={<OutlookBadge outlook={houseView.stance} />}
          className="lg:col-span-1"
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            {houseView.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
          <a
            href="#house-view"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Lire la vue complète
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>

        {/* La maquette range les 6 KPI en 3 x 2 a cote de la House View,
            pas en une ligne de six : les valeurs restent lisibles. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="card-surface p-4">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">
                {kpi.label}
              </p>

              {kpi.id === "risk" ? (
                <p className="mt-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      metrics.riskScore >= 60
                        ? "bg-red-500"
                        : metrics.riskScore >= 40
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    )}
                  />
                  <span className="text-xl font-bold text-foreground">
                    {metrics.riskScore >= 60 ? "High" : metrics.riskScore >= 40 ? "Medium" : "Low"}
                  </span>
                </p>
              ) : (
                <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{kpi.value}</p>
              )}

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                <DeltaBadge value={kpi.delta} unit="pp" polarity={kpi.polarity} />
                <span className="text-muted-foreground">{kpi.deltaLabel}</span>
              </div>

              <Sparkline
                data={kpi.spark}
                width={180}
                height={34}
                color={kpi.polarity === "lowerBetter" ? "#D97706" : "#2563EB"}
                className="mt-2 w-full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. Régime + trajectoire + révisions ===== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <SectionCard title="Macro Regime Snapshot" className="xl:col-span-1">
          <dl className="space-y-2.5">
            {regimeLines.map((line) => (
              <div key={line.label} className="border-b border-border/60 pb-2 last:border-0 last:pb-0">
                <dt className="text-[11px] text-muted-foreground">{line.label}</dt>
                <dd className="text-sm font-medium text-foreground">{line.value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard
          title="Real GDP Growth (%)"
          subtitle="2021 - 2027F"
          className="xl:col-span-2"
        >
          <GdpChart profile={profile} />
          <p className="mt-2 text-[10px] text-muted-foreground">Source : SIG, FMI</p>
        </SectionCard>

        <SectionCard
          title="What Changed Since Last Review"
          subtitle={rating.reviewDate.toLocaleDateString("fr-FR")}
          className="xl:col-span-1"
        >
          <ul className="space-y-3">
            {kpis
              .filter((k) => k.id !== "risk")
              .slice(0, 4)
              .map((kpi) => (
                <li key={kpi.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{kpi.label}</p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      Précédent : {kpi.previous}
                    </p>
                  </div>
                  <DeltaBadge
                    value={kpi.delta}
                    unit="pp"
                    polarity={kpi.polarity}
                    className="shrink-0"
                  />
                </li>
              ))}
          </ul>
          <a
            href="#reviews"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir les revues précédentes
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>
      </section>

      {/* ===== 3. Prévisions + positionnement ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Forecast Summary" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Indicator</th>
                  <th className="px-2 py-2 text-right font-medium">2023</th>
                  <th className="px-2 py-2 text-right font-medium">2024</th>
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
          <p className="mt-2 text-[10px] text-muted-foreground">Source : prévisions SIG</p>
          <KeyTakeaway>
            La trajectoire 2025F-2027F suppose un régime {regime.regime.toLowerCase()} maintenu et
            une politique {regime.policyStance.toLowerCase()} inchangée. Un décrochage de la
            croissance sous {(metrics.growth - 1.5).toFixed(1)}% invaliderait ce profil.
          </KeyTakeaway>
        </SectionCard>

        <PeerPositioning profile={profile} />
      </section>

      {/* ===== 4. Secteurs + risques ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Strategic Sectors & Value Chains"
          subtitle="Fixture Côte d'Ivoire — en attente du module sectoriel"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {strategicSectors.map((sector) => (
              <div key={sector.name} className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </span>
                    <SubHeading>{sector.name}</SubHeading>
                  </span>
                  <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    {sector.impact} Impact
                  </span>
                </div>

                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  {sector.summary}
                </p>

                <dl className="mb-3 grid grid-cols-3 gap-2">
                  {sector.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[10px] leading-tight text-muted-foreground">
                        {stat.label}
                      </dt>
                      <dd className="text-sm font-bold tabular-nums text-foreground">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mb-2 text-[11px] text-muted-foreground">
                  Orientation :{" "}
                  <span className="font-semibold text-foreground">{sector.outlook}</span>
                </p>

                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Key Priorities
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
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
          subtitle="Dérivé des 7 piliers du module 5"
          className="lg:col-span-1"
        >
          <RiskTable profile={profile} />
          <a
            href={`/countries/${profile.country.code}/notation`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir le tableau de bord des risques
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>
      </section>

      {/* ===== 5. Frise + marchés ===== */}
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
          <a
            href="/calendar"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir le calendrier complet
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>

        <SectionCard
          title="Market Snapshot"
          subtitle="Fixture — alimenté par le produit marchés/portefeuille"
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Indicateur</th>
                  <th className="px-2 py-2 text-right font-medium">Dernier</th>
                  <th className="px-2 py-2 text-right font-medium">1 mois</th>
                  <th className="px-2 py-2 text-right font-medium">Depuis janvier</th>
                  <th className="px-2 py-2 text-center font-medium">Tendance 12M</th>
                </tr>
              </thead>
              <tbody>
                {marketSnapshot.map((metric) => (
                  <tr key={metric.label} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2.5 text-xs font-medium text-foreground">{metric.label}</td>
                    <td className="px-2 py-2.5 text-right text-xs font-semibold tabular-nums text-foreground">
                      {metric.value}
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {metric.change}
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {metric.ytd}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <Sparkline
                        data={metric.spark}
                        width={72}
                        height={22}
                        fill={false}
                        color={metric.polarity === "lowerBetter" ? "#059669" : "#2563EB"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href="/markets"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir le tableau de bord marchés
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>
      </section>

      {/* ===== 6. Priorités, confiance, notes de couverture ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="What Matters Now">
          <ul className="space-y-3">
            {buildWhatMatters(profile).map((item) => (
              <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Sources & Data Confidence">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Confiance globale</span>
              <span className="text-sm font-bold text-foreground">
                {rating.confidence >= 75 ? "Élevée" : rating.confidence >= 55 ? "Correcte" : "Faible"}
              </span>
            </div>
            <ScoreBar value={rating.confidence} max={100} />
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <dt className="text-[11px] leading-tight text-muted-foreground">Pays couverts</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {STATIC_COUNTRIES.length}
              </dd>
              <p className="text-[11px] text-muted-foreground">sur {TARGET_COUNTRIES}</p>
            </div>
            <div>
              <dt className="text-[11px] leading-tight text-muted-foreground">Indicateurs</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {STATIC_INDICATORS.length}
              </dd>
              <p className="text-[11px] text-muted-foreground">sur {TARGET_INDICATORS}</p>
            </div>
            <div>
              <dt className="text-[11px] leading-tight text-muted-foreground">Fraîcheur</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {regime.period}
              </dd>
              <p className="text-[11px] text-muted-foreground">dernier arrêté</p>
            </div>
          </dl>

          <a
            href="#methodologie"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Méthodologie et sources
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>

        <SectionCard title="Coverage Notes">
          <ul className="space-y-3">
            {[
              { Icon: FileText, text: `Prévisions mises à jour au ${rating.reviewDate.toLocaleDateString("fr-FR")}.` },
              { Icon: Database, text: "La fréquence des données varie selon l'indicateur." },
              { Icon: Gauge, text: "Les scores sont une sortie de modèle ; l'orientation relève du jugement analyste." },
              { Icon: Layers, text: "Utilisez le screener pour comparer les pays et construire une liste de suivi." },
            ].map((note) => (
              <li key={note.text} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <note.Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {note.text}
              </li>
            ))}
          </ul>
          <a
            href="#guide"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir le guide
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>
      </section>
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
    `Point de vigilance : ${rating.downgradeTriggers[0] ?? "à définir"}.`,
  ];
}

/* =========================================================================
 * Trajectoire de croissance
 * ========================================================================= */

function GdpChart({ profile }: { profile: CountryProfile }) {
  const data = profile.gdpPath;
  const width = 360;
  const height = 180;
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
          stroke="#2563EB"
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

      {data.map((d, i) => {
        const value = d.actual ?? d.forecast;
        return value === null || value === undefined ? null : (
          <circle key={`pt-${d.year}`} cx={x(i)} cy={y(value)} r={2.6} fill="#2563EB" />
        );
      })}
    </svg>
  );
}

/* =========================================================================
 * Positionnement relatif
 * ========================================================================= */

type PeerMetric = "growth" | "inflation" | "fiscal" | "score";

const PEER_METRICS: { key: PeerMetric; label: string; unit: string }[] = [
  { key: "growth", label: "Croissance du PIB", unit: "%" },
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

  // Barres et ligne de moyenne partagent la meme echelle, sinon la reference
  // ne voudrait rien dire.
  const toPct = (value: number) => ((value - min) / span) * 100;

  const selectClass =
    "rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <SectionCard
      title="Peer Positioning"
      className="lg:col-span-1"
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={profile.peerGroup}
            disabled
            aria-label="Groupe de comparaison"
            title="Le groupe se replie sur la tranche de revenu quand la région compte moins de deux pairs. Il deviendra sélectionnable avec le module 1."
            className={cn(selectClass, "opacity-70")}
          >
            <option>{profile.peerGroup}</option>
          </select>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as PeerMetric)}
            aria-label="Métrique de comparaison"
            className={selectClass}
          >
            {PEER_METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="relative">
        {/* Ligne de moyenne du groupe, comme la maquette. */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 border-l border-dashed border-foreground/40"
          style={{ left: `${toPct(average)}%` }}
          aria-hidden="true"
        />

        <ul className="space-y-2.5">
          {peers.map((peer) => {
            const value = peer[metric];
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
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={isSelf ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-slate-400 dark:bg-slate-500"}
                    style={{ width: `${Math.max(toPct(value), 2)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="inline-block h-3 border-l border-dashed border-foreground/40" />
        Moyenne {profile.peerGroup} : {average.toFixed(1)}
        {active.unit}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">Source : FMI, SIG</p>
    </SectionCard>
  );
}

/* =========================================================================
 * Risques, dérivés des piliers de notation
 * ========================================================================= */

const RISK_LABEL: Record<string, string> = {
  macroStrength: "Demande et croissance",
  macroResilience: "Résilience macro",
  fiscalCapacity: "Budgétaire",
  externalResilience: "Externe",
  politicalInstitutionalQuality: "Politique & gouvernance",
  structuralOpportunity: "Structurel",
  marketAttractiveness: "Marché",
};

/** Point de surveillance associé à chaque pilier. */
const RISK_MONITOR: Record<string, string> = {
  macroStrength: "Croissance mondiale, demande externe",
  macroResilience: "Amortisseurs et marges de manœuvre",
  fiscalCapacity: "Recettes, charge de la dette",
  externalResilience: "Réserves, termes de l'échange",
  politicalInstitutionalQuality: "Élections, réformes",
  structuralOpportunity: "Exécution des investissements",
  marketAttractiveness: "Spread souverain, liquidité",
};

function RiskTable({ profile }: { profile: CountryProfile }) {
  const levelOf = (score: number) => (score >= 6.5 ? "Low" : score >= 4.5 ? "Medium" : "High");
  const tone = {
    Low: "text-green-600 dark:text-green-500",
    Medium: "text-amber-600 dark:text-amber-500",
    High: "text-red-600 dark:text-red-400",
  };
  const dot = { Low: "bg-green-500", Medium: "bg-amber-500", High: "bg-red-500" };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-1 py-2 font-medium">Risque</th>
            <th className="px-1 py-2 font-medium">Niveau</th>
            <th className="px-1 py-2 text-center font-medium">Tend.</th>
            <th className="px-1 py-2 font-medium">Suivi</th>
          </tr>
        </thead>
        <tbody>
          {profile.rating.pillars.map((pillar) => {
            const level = levelOf(pillar.score);
            const trend = pillar.vsPrior > 0.03 ? "↑" : pillar.vsPrior < -0.03 ? "↓" : "→";
            return (
              <tr key={pillar.key} className="border-b border-border/50 last:border-0">
                <td className="px-1 py-2 text-xs font-medium text-foreground">
                  {RISK_LABEL[pillar.key] ?? pillar.label}
                </td>
                <td className="px-1 py-2">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", tone[level])}>
                    <span className={cn("h-2 w-2 rounded-full", dot[level])} />
                    {level}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-1 py-2 text-center text-xs font-bold",
                    pillar.vsPrior > 0.03
                      ? "text-emerald-600 dark:text-emerald-500"
                      : pillar.vsPrior < -0.03
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                  )}
                >
                  {trend}
                </td>
                <td className="px-1 py-2 text-[11px] leading-tight text-muted-foreground">
                  {RISK_MONITOR[pillar.key] ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
