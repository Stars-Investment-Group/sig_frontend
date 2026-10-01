import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Info,
  ShieldCheck,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { Flag } from "@/components/Flag";
import { Button } from "@/components/ui/button";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar, ScoreGauge } from "@/components/common/ScoreGauge";
import { Waterfall, type WaterfallStep } from "@/components/common/Waterfall";
import { MODEL_DISCLAIMER, OutlookBadge, WatchBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";
import { PILLAR_WEIGHTS, STATIC_RATINGS, STATIC_COUNTRIES } from "@/data/mockData";
import type { CountryRating, PillarKey } from "@shared/schema";
import { cn } from "@/lib/utils";

/**
 * Onglet Notation & Risk — planche P6, module 5.
 *
 * La planche numerote ses dix sections et ouvre sur un bandeau de **cinq
 * cartes** distinctes plutot qu'un bloc unique. L'ordre et la numerotation sont
 * repris tels quels : c'est ainsi qu'un analyste cite une section en reunion.
 *
 * C'est l'onglet dont le contrat est le plus complet : les 7 piliers, leurs
 * ponderations et le score composite sont types dans `shared/schema.ts`, donc
 * tout ce qui est affiche ici se branchera tel quel.
 */

/* =========================================================================
 * Derivations en attente du backend
 * ========================================================================= */

interface Scenario {
  name: string;
  score: number;
  probability: number;
  note: string;
  tone: string;
}

/** Probabilites inclinees par l'orientation : la somme reste a 100. */
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
      name: "Downside",
      score: Math.max(0, Math.round((s - 0.7) * 10) / 10),
      probability: down,
      note: "Dégradation du momentum sans rupture du cadre macro.",
      tone: "border-red-500/30 bg-red-500/5",
    },
    {
      name: "Base Case",
      score: s,
      probability: base,
      note: "Trajectoire centrale du modèle, politiques inchangées.",
      tone: "border-blue-500/30 bg-blue-500/5",
    },
    {
      name: "Upside",
      score: Math.min(10, Math.round((s + 0.6) * 10) / 10),
      probability: up,
      note: "Déclencheurs de révision haussière atteints sur deux piliers.",
      tone: "border-emerald-500/30 bg-emerald-500/5",
    },
    {
      name: "Stress",
      score: Math.max(0, Math.round((s - 1.6) * 10) / 10),
      probability: stress,
      note: "Choc externe combiné à une perte d'accès au financement.",
      tone: "border-border bg-muted/50",
    },
  ];
}

/**
 * Pont de notation, regroupe en 4 blocs.
 *
 * Les contributions sont les `vsPrior` des piliers ponderes : leur somme vaut
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

/** Titre numerote, comme les dix sections de la planche. */
function numbered(index: number, title: string): string {
  return `${index}. ${title}`;
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
      {/* ===== Bandeau : cinq cartes ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">SIG Composite Score</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {rating.compositeScore.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
            <OutlookBadge outlook={rating.outlook} />
          </p>
          <CompositeScale score={rating.compositeScore} />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Rank vs Universe{" "}
            <span className="font-semibold text-foreground">
              {rating.rank} / {rating.universe}
            </span>
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Outlook</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold",
              rating.outlook === "Positive"
                ? "text-emerald-600 dark:text-emerald-500"
                : rating.outlook === "Negative"
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
            )}
          >
            {rating.outlook}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{regime.momentum}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Prochaine revue :{" "}
            {new Date(
              rating.reviewDate.getFullYear(),
              rating.reviewDate.getMonth() + 3,
              rating.reviewDate.getDate()
            ).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Watch Status</p>
          <div className="mt-2">
            <WatchBadge status={rating.watchStatus} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Depuis le {rating.reviewDate.toLocaleDateString("fr-FR")}
          </p>
          <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
            Voir la justification
          </Button>
        </div>

        <div className="card-surface flex flex-col items-center justify-center p-4">
          <p className="self-start text-xs font-medium text-muted-foreground">Confidence</p>
          <ScoreGauge
            value={rating.confidence}
            max={100}
            variant="donut"
            size={96}
            display={`${rating.confidence}%`}
            ariaLabel={`Confiance du modèle : ${rating.confidence}%`}
            className="mt-1"
          />
          <p className="text-[11px] font-medium text-foreground">
            {rating.confidence >= 75 ? "Élevée" : rating.confidence >= 55 ? "Correcte" : "Faible"}
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-medium text-muted-foreground">Change Since Prior Review</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tabular-nums",
              rating.changeSincePrior >= 0
                ? "text-emerald-600 dark:text-emerald-500"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {rating.changeSincePrior >= 0 ? "+" : ""}
            {rating.changeSincePrior.toFixed(2)} pts
          </p>
          <p className="mt-3 text-xs text-muted-foreground">(depuis {priorScore.toFixed(2)})</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {rating.reviewDate.toLocaleDateString("fr-FR")}
          </p>
        </div>
      </section>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {MODEL_DISCLAIMER}
      </p>

      {/* ===== 1 + 2. Piliers et decomposition ===== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title={numbered(1, "Pillar Scores")} subtitle="7 piliers, notés sur 10">
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
                      {pillar.percentile}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Les pondérations reflètent le cadre de modèle.
          </p>
        </SectionCard>

        <SectionCard
          title={numbered(2, "Score Decomposition")}
          subtitle="Contribution pondérée de chaque pilier au composite"
        >
          <ScoreTree rating={rating} />
        </SectionCard>
      </section>

      {/* ===== 3 + 4. Drivers ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title={numbered(3, "Positive Drivers")}>
          <DriverTable drivers={rating.positiveDrivers} tone="positive" />
        </SectionCard>
        <SectionCard title={numbered(4, "Negative Drivers")}>
          <DriverTable drivers={rating.negativeDrivers} tone="negative" />
        </SectionCard>
      </section>

      {/* ===== 5 + 6. Declencheurs et scenarios ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={numbered(5, "Upgrade & Downgrade Triggers")}
          subtitle="Seuils susceptibles de faire bouger l'orientation ou le score"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <SectionCard title={numbered(6, "Scenario-Implied Scores")}>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {scenarios.map((scenario) => (
              <div key={scenario.name} className={cn("rounded-lg border p-3", scenario.tone)}>
                <SubHeading>{scenario.name}</SubHeading>
                <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                  {scenario.score.toFixed(1)}
                  <span className="text-xs font-medium text-muted-foreground">/10</span>
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">Probabilité</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {scenario.probability}%
                </p>
                <p className="mt-2 text-[11px] leading-tight text-muted-foreground">
                  {scenario.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Somme des probabilités : {scenarios.reduce((s, x) => s + x.probability, 0)}%
          </p>
        </SectionCard>
      </section>

      {/* ===== 7 + 8. Pont et pairs ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={numbered(7, "Rating Bridge")}
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

        <SectionCard
          title={numbered(8, "Peer Positioning")}
          subtitle={`Score composite des ${STATIC_RATINGS.length} pays couverts`}
        >
          <PeerRatingTable currentCode={country.code} />
        </SectionCard>
      </section>

      {/* ===== 9 + 10. Fondations et gouvernance ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title={numbered(9, "Data Foundations & Model Inputs")}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Couverture", value: `${STATIC_COUNTRIES.length}`, hint: `sur ${rating.universe} pays` },
              { label: "Fraîcheur", value: regime.period, hint: "dernier arrêté" },
              { label: "Version du modèle", value: "notation v0", hint: "dérivée du module 4" },
              {
                label: "Dernière mise à jour",
                value: rating.reviewDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
                hint: "module 5 attendu",
              },
            ].map((tile) => (
              <div key={tile.label} className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-[11px] leading-tight text-muted-foreground">{tile.label}</p>
                <p className="mt-1 text-base font-bold tabular-nums text-foreground">{tile.value}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{tile.hint}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Voir « Sources & Data Confidence » de l&apos;onglet Synthèse pour le détail.
          </p>
        </SectionCard>

        <SectionCard title={numbered(10, "Methodology & Governance")}>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                Icon: BookOpen,
                title: "Méthodologie",
                text: `Moyenne pondérée des 7 piliers (${Object.values(PILLAR_WEIGHTS)
                  .map((w) => `${(w * 100).toFixed(0)}%`)
                  .join(" · ")}).`,
              },
              {
                Icon: CalendarClock,
                title: "Cadence de revue",
                text: "Trimestrielle, avec revue exceptionnelle sur franchissement d'un déclencheur.",
              },
              {
                Icon: ShieldCheck,
                title: "Gouvernance",
                text: "Le modèle produit le score ; le comité d'investissement arrête l'orientation.",
              },
              {
                Icon: UserCircle2,
                title: "Propriétaire du modèle",
                text: "SIG Research, équipe macro.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </div>
  );
}

/* =========================================================================
 * Sous-composants
 * ========================================================================= */

/**
 * Echelle du score composite : 0 - Neutre 5 - 10, comme la planche.
 *
 * Le repere median compte : sans lui, 6,3 sur une barre nue ne dit pas si le
 * pays est au-dessus ou en dessous de la moyenne de l'univers.
 */
function CompositeScale({ score }: { score: number }) {
  return (
    <div className="mt-3">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(score / 10) * 100}%` }}
        />
        <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/30" aria-hidden="true" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>Neutre 5</span>
        <span>10</span>
      </div>
    </div>
  );
}

/**
 * Arbre de decomposition.
 *
 * La planche montre trois colonnes : contribution ponderee, ajustement
 * analyste, score ajuste. Notre modele n'applique **aucun ajustement** — les
 * contributions somment exactement au composite. On l'affiche a zero plutot que
 * de le masquer : la colonne existera telle quelle quand le module 5 la servira.
 */
function ScoreTree({ rating }: { rating: CountryRating }) {
  const contributions = rating.pillars.map((pillar) => ({
    label: pillar.label,
    weight: PILLAR_WEIGHTS[pillar.key],
    value: Math.round(pillar.score * PILLAR_WEIGHTS[pillar.key] * 100) / 100,
  }));
  const total = Math.round(contributions.reduce((s, c) => s + c.value, 0) * 100) / 100;
  const adjustment = Math.round((rating.compositeScore - total) * 100) / 100;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-medium">Pilier</th>
              <th className="px-2 py-2 text-right font-medium">Poids</th>
              <th className="px-2 py-2 text-right font-medium">Contribution</th>
              <th className="px-2 py-2 font-medium">Part</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c.label} className="border-b border-border/50 last:border-0">
                <td className="px-2 py-2 text-xs text-foreground">{c.label}</td>
                <td className="px-2 py-2 text-right text-xs tabular-nums text-muted-foreground">
                  {(c.weight * 100).toFixed(0)}%
                </td>
                <td className="px-2 py-2 text-right text-xs font-semibold tabular-nums text-foreground">
                  +{c.value.toFixed(2)}
                </td>
                <td className="w-24 px-2 py-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.value / rating.compositeScore) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Somme des contributions</dt>
          <dd className="font-semibold tabular-nums text-foreground">{total.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          {/* Notre modele n'applique aucun ajustement : le residu n'est que
              l'arrondi du composite. L'appeler « ajustement analyste »
              contredirait la note juste en dessous. */}
          <dt className="text-muted-foreground">Écart d&apos;arrondi</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {adjustment >= 0 ? "+" : ""}
            {adjustment.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5">
          <dt className="font-semibold text-foreground">Score ajusté</dt>
          <dd className="text-lg font-bold tabular-nums text-foreground">
            {rating.compositeScore.toFixed(1)}
            <span className="text-xs font-medium text-muted-foreground">/10</span>
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Les contributions sont pondérées. Le modèle n&apos;applique <strong>aucun ajustement
        analyste</strong> : le score affiché est sa sortie brute, et l&apos;écart ci-dessus n&apos;est
        que l&apos;arrondi. La colonne d&apos;ajustement de la maquette apparaîtra avec le module 5.
      </p>
    </>
  );
}

/** L'impact porte deja son signe : la polarite par defaut suffit. */
function DriverTable({
  drivers,
  tone,
}: {
  drivers: CountryRating["positiveDrivers"];
  tone: "positive" | "negative";
}) {
  const Icon = tone === "positive" ? CheckCircle2 : XCircle;
  const iconTone =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-500"
      : "text-red-600 dark:text-red-400";

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-medium">Driver</th>
              <th className="px-2 py-2 text-right font-medium">Impact</th>
              <th className="px-2 py-2 font-medium">Justification</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.label} className="border-b border-border/50 last:border-0">
                <td className="px-2 py-2.5">
                  <span className="flex items-start gap-1.5">
                    <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", iconTone)} />
                    <span className="text-xs font-medium text-foreground">{driver.label}</span>
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right">
                  <DeltaBadge value={driver.impact} decimals={2} />
                </td>
                <td className="px-2 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  {driver.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Drivers retenus par l&apos;analyste selon la force du signal.
      </p>
    </>
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
            <th className="px-2 py-2 font-medium">Pays</th>
            <th className="px-2 py-2 text-right font-medium">Score</th>
            <th className="px-2 py-2 font-medium">Niveau</th>
            <th className="px-2 py-2 text-right font-medium">Percentile</th>
            <th className="px-2 py-2 text-right font-medium">vs Prior</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ rating, name }) => {
            const isSelf = rating.countryCode === currentCode;
            return (
              <tr
                key={rating.countryCode}
                className={cn(
                  "border-b border-border/50 last:border-0",
                  // La planche surligne la ligne du pays courant.
                  isSelf && "bg-amber-50 dark:bg-amber-900/20"
                )}
              >
                <td className="px-2 py-2">
                  <span className="flex items-center gap-1.5">
                    <Flag code={rating.countryCode} size={16} />
                    <span
                      className={cn(
                        "text-xs",
                        isSelf ? "font-semibold text-foreground" : "text-foreground"
                      )}
                    >
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
                  {Math.max(1, Math.round(100 - (rating.rank / rating.universe) * 100))}
                </td>
                <td className="px-2 py-2 text-right">
                  <DeltaBadge value={rating.changeSincePrior} decimals={2} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
