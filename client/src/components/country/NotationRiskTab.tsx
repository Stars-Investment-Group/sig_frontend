import { Flag } from "@/components/Flag";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar, ScoreGauge } from "@/components/common/ScoreGauge";
import { Waterfall, type WaterfallStep } from "@/components/common/Waterfall";
import { MODEL_DISCLAIMER, OutlookBadge, WatchBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";
import { PILLAR_WEIGHTS, STATIC_RATINGS, STATIC_COUNTRIES } from "@/data/mockData";
import type { CountryRating, PillarKey } from "@shared/schema";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Info, XCircle } from "lucide-react";

/**
 * Onglet Notation & Risk — planche P6, module 5.
 *
 * C'est l'onglet dont le contrat est le plus complet : les 7 piliers, leurs
 * pondérations et le score composite sont typés dans `shared/schema.ts`, donc
 * tout ce qui est affiché ici se branchera tel quel. Les seules dérivations
 * locales sont les scénarios et le pont de notation, que le backend fournira
 * comme sorties de modèle.
 */

/* =========================================================================
 * Dérivations en attente du backend
 * ========================================================================= */

interface Scenario {
  name: string;
  score: number;
  probability: number;
  note: string;
}

/** Probabilités inclinées par l'orientation : la somme reste à 100. */
const PROBABILITIES: Record<CountryRating["outlook"], [number, number, number, number]> = {
  Positive: [26, 52, 16, 6],
  Stable: [20, 55, 18, 7],
  Negative: [13, 50, 26, 11],
};

function buildScenarios(rating: CountryRating): Scenario[] {
  const [up, base, down, stress] = PROBABILITIES[rating.outlook];
  const s = rating.compositeScore;
  return [
    {
      name: "Upside",
      score: Math.min(10, Math.round((s + 0.6) * 10) / 10),
      probability: up,
      note: "Déclencheurs de révision haussière atteints sur deux piliers.",
    },
    { name: "Base", score: s, probability: base, note: "Trajectoire centrale du modèle." },
    {
      name: "Downside",
      score: Math.max(0, Math.round((s - 0.7) * 10) / 10),
      probability: down,
      note: "Dégradation du momentum sans rupture du cadre macro.",
    },
    {
      name: "Stress",
      score: Math.max(0, Math.round((s - 1.6) * 10) / 10),
      probability: stress,
      note: "Choc externe combiné à une perte d'accès au financement.",
    },
  ];
}

/**
 * Pont de notation, regroupé en 4 blocs.
 *
 * Les contributions sont les `vsPrior` des piliers pondérés : leur somme vaut
 * exactement `changeSincePrior`, donc le pont se referme sur le score courant.
 */
const BRIDGE_GROUPS: { label: string; keys: PillarKey[] }[] = [
  { label: "Macro", keys: ["macroStrength", "macroResilience"] },
  { label: "Budgétaire & externe", keys: ["fiscalCapacity", "externalResilience"] },
  { label: "Politique & structurel", keys: ["politicalInstitutionalQuality", "structuralOpportunity"] },
  { label: "Marché", keys: ["marketAttractiveness"] },
];

function buildBridge(rating: CountryRating): WaterfallStep[] {
  return BRIDGE_GROUPS.map((group) => ({
    label: group.label,
    value:
      Math.round(
        rating.pillars
          .filter((p) => group.keys.includes(p.key))
          .reduce((sum, p) => sum + p.vsPrior * PILLAR_WEIGHTS[p.key], 0) * 100
      ) / 100,
  }));
}

/* =========================================================================
 * Onglet
 * ========================================================================= */

export function NotationRiskTab({ profile }: { profile: CountryProfile }) {
  const { rating, country, regime } = profile;
  const scenarios = buildScenarios(rating);
  const bridge = buildBridge(rating);
  const priorScore = Math.round((rating.compositeScore - rating.changeSincePrior) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* ===== 1. Bandeau de notation ===== */}
      <section className="card-surface p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex flex-col items-center justify-center">
            <ScoreGauge value={rating.compositeScore} max={10} size={148} />
            <p className="mt-1 text-xs font-medium text-muted-foreground">SIG Composite Score</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-center sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Rank vs Universe</dt>
              <dd className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                {rating.rank}
                <span className="text-sm font-medium text-muted-foreground">/{rating.universe}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Outlook</dt>
              <dd className="mt-1">
                <OutlookBadge outlook={rating.outlook} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Watch Status</dt>
              <dd className="mt-1">
                <WatchBadge status={rating.watchStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Change Since Prior Review</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <DeltaBadge value={rating.changeSincePrior} decimals={2} variant="pill" />
                <span className="text-xs text-muted-foreground">depuis {priorScore.toFixed(2)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Dernière revue</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {rating.reviewDate.toLocaleDateString("fr-FR")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Régime associé</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {regime.regime} · {regime.momentum}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col items-center justify-center">
            <ScoreGauge
              value={rating.confidence}
              max={100}
              variant="donut"
              size={104}
              display={`${rating.confidence}%`}
              caption="Confidence"
              ariaLabel={`Confiance du modèle : ${rating.confidence}%`}
            />
          </div>
        </div>

        <p className="mt-4 flex items-start gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {MODEL_DISCLAIMER}
        </p>
      </section>

      {/* ===== 2 + 3. Piliers et décomposition ===== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Pillar Scores" subtitle="7 piliers, notés sur 10" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Pilier</th>
                  <th className="px-2 py-2 text-right font-medium">Score</th>
                  <th className="px-2 py-2 font-medium">Niveau</th>
                  <th className="px-2 py-2 text-right font-medium">vs Prior</th>
                  <th className="px-2 py-2 text-right font-medium">Percentile</th>
                </tr>
              </thead>
              <tbody>
                {rating.pillars.map((pillar) => (
                  <tr key={pillar.key} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2.5 text-xs font-medium text-foreground">{pillar.label}</td>
                    <td className="px-2 py-2.5 text-right text-sm font-bold tabular-nums text-foreground">
                      {pillar.score.toFixed(1)}
                    </td>
                    <td className="w-28 px-2 py-2.5">
                      <ScoreBar value={pillar.score} max={10} />
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <DeltaBadge value={pillar.vsPrior} decimals={2} />
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {pillar.percentile}e
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Score Decomposition" subtitle="Contribution pondérée au composite">
          <ul className="space-y-2">
            {rating.pillars.map((pillar) => {
              const weight = PILLAR_WEIGHTS[pillar.key];
              const contribution = pillar.score * weight;
              return (
                <li key={pillar.key}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-muted-foreground">{pillar.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {(weight * 100).toFixed(0)}% ·{" "}
                      <span className="font-semibold text-foreground">{contribution.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(contribution / rating.compositeScore) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <SubHeading>Score composite</SubHeading>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {rating.compositeScore.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Aucun ajustement analyste appliqué : le score affiché est la sortie brute du modèle.
          </p>
        </SectionCard>
      </section>

      {/* ===== 4 + 5. Drivers ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Positive Drivers">
          <DriverList drivers={rating.positiveDrivers} />
        </SectionCard>
        <SectionCard title="Negative Drivers">
          <DriverList drivers={rating.negativeDrivers} />
        </SectionCard>
      </section>

      {/* ===== 6. Déclencheurs ===== */}
      <SectionCard title="Upgrade & Downgrade Triggers" subtitle="Seuils suivis d'une revue à l'autre">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <SubHeading className="mb-2 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" /> Révision haussière
            </SubHeading>
            <ul className="space-y-2">
              {rating.upgradeTriggers.map((trigger) => (
                <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                  {trigger}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubHeading className="mb-2 flex items-center gap-1.5 text-red-700 dark:text-red-400">
              <ArrowDownRight className="h-4 w-4" /> Révision baissière
            </SubHeading>
            <ul className="space-y-2">
              {rating.downgradeTriggers.map((trigger) => (
                <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                  {trigger}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* ===== 7 + 8. Scénarios et pont ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Scenario-Implied Scores">
          <div className="grid grid-cols-2 gap-3">
            {scenarios.map((scenario) => (
              <div key={scenario.name} className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-baseline justify-between">
                  <SubHeading>{scenario.name}</SubHeading>
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {scenario.probability}%
                  </span>
                </div>
                <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                  {scenario.score.toFixed(1)}
                  <span className="text-xs font-medium text-muted-foreground">/10</span>
                </p>
                <ScoreBar value={scenario.score} max={10} className="mt-1.5" />
                <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{scenario.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Somme des probabilités : {scenarios.reduce((s, x) => s + x.probability, 0)}%
          </p>
        </SectionCard>

        <SectionCard
          title="Rating Bridge"
          subtitle={`Du score précédent (${priorScore.toFixed(2)}) au score courant (${rating.compositeScore.toFixed(1)})`}
        >
          <Waterfall
            start={{ label: "Revue précédente", value: priorScore }}
            steps={bridge}
            end={{ label: "Score courant", value: rating.compositeScore }}
            height={190}
          />
          <KeyTakeaway tone={rating.changeSincePrior >= 0 ? "positive" : "caution"}>
            La variation nette de {rating.changeSincePrior >= 0 ? "+" : ""}
            {rating.changeSincePrior.toFixed(2)} point vient principalement du bloc{" "}
            {[...bridge].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0]?.label.toLowerCase()}.
          </KeyTakeaway>
        </SectionCard>
      </section>

      {/* ===== 9. Positionnement relatif ===== */}
      <SectionCard
        title="Peer Positioning"
        subtitle={`Classement du score composite dans les ${STATIC_RATINGS.length} pays couverts`}
      >
        <PeerRatingTable currentCode={country.code} />
      </SectionCard>

      {/* ===== 10 + 11. Fondations et gouvernance ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Data Foundations & Model Inputs">
          <dl className="space-y-2.5 text-sm">
            {[
              ["Couverture des indicateurs", "4 / 156 au catalogue"],
              ["Fraîcheur des données", regime.period],
              ["Version du modèle", "notation v0 (dérivée du module 4)"],
              ["Dernière mise à jour", rating.reviewDate.toLocaleDateString("fr-FR")],
              ["Prochain rafraîchissement", "à la livraison du module 5"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Methodology & Governance">
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Méthodologie — </span>
              moyenne pondérée des 7 piliers, chacun noté sur 10. Les pondérations sont fixes et
              publiées ({Object.values(PILLAR_WEIGHTS).map((w) => `${(w * 100).toFixed(0)}%`).join(" · ")}).
            </li>
            <li>
              <span className="font-semibold text-foreground">Cadence de revue — </span>
              trimestrielle, avec revue exceptionnelle sur franchissement d&apos;un déclencheur.
            </li>
            <li>
              <span className="font-semibold text-foreground">Gouvernance — </span>
              le modèle produit le score ; le comité d&apos;investissement arrête l&apos;orientation
              et le statut de surveillance.
            </li>
            <li>
              <span className="font-semibold text-foreground">Propriétaire du modèle — </span>
              SIG Research, équipe macro.
            </li>
          </ul>
        </SectionCard>
      </section>
    </div>
  );
}

/* =========================================================================
 * Sous-composants
 * ========================================================================= */

/** L'impact porte deja son signe : la polarite par defaut suffit. */
function DriverList({ drivers }: { drivers: CountryRating["positiveDrivers"] }) {
  return (
    <ul className="space-y-3">
      {drivers.map((driver) => (
        <li key={driver.label} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-2">
            <SubHeading>{driver.label}</SubHeading>
            <DeltaBadge value={driver.impact} decimals={2} variant="pill" />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{driver.rationale}</p>
        </li>
      ))}
    </ul>
  );
}

function PeerRatingTable({ currentCode }: { currentCode: string }) {
  const rows = [...STATIC_RATINGS]
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((rating) => ({
      rating,
      name: STATIC_COUNTRIES.find((c) => c.code === rating.countryCode)?.name ?? rating.countryCode,
    }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">Rang</th>
            <th className="px-2 py-2 font-medium">Pays</th>
            <th className="px-2 py-2 text-right font-medium">Score</th>
            <th className="px-2 py-2 font-medium">Niveau</th>
            <th className="px-2 py-2 text-right font-medium">Percentile</th>
            <th className="px-2 py-2 text-right font-medium">vs Prior</th>
            <th className="px-2 py-2 font-medium">Outlook</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ rating, name }, index) => {
            const isSelf = rating.countryCode === currentCode;
            return (
              <tr
                key={rating.countryCode}
                className={
                  isSelf
                    ? "border-b border-border/50 bg-primary/5 last:border-0"
                    : "border-b border-border/50 last:border-0"
                }
              >
                <td className="px-2 py-2 text-xs tabular-nums text-muted-foreground">{index + 1}</td>
                <td className="px-2 py-2">
                  <span className="flex items-center gap-1.5">
                    <Flag code={rating.countryCode} size={16} />
                    <span className={isSelf ? "text-xs font-semibold text-foreground" : "text-xs text-foreground"}>
                      {name}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-2 text-right text-xs font-bold tabular-nums text-foreground">
                  {rating.compositeScore.toFixed(1)}
                </td>
                <td className="w-28 px-2 py-2">
                  <ScoreBar value={rating.compositeScore} max={10} />
                </td>
                <td className="px-2 py-2 text-right text-xs tabular-nums text-muted-foreground">
                  {Math.max(1, Math.round(100 - (rating.rank / rating.universe) * 100))}e
                </td>
                <td className="px-2 py-2 text-right">
                  <DeltaBadge value={rating.changeSincePrior} decimals={2} />
                </td>
                <td className="px-2 py-2">
                  <OutlookBadge outlook={rating.outlook} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
