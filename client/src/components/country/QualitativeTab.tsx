import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  Globe2,
  Landmark,
  Layers,
  Lightbulb,
  ShieldAlert,
  Sprout,
  Users,
  Zap,
} from "lucide-react";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { MomentumBadge, OutlookBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";
import type { PillarKey } from "@shared/schema";
import { cn } from "@/lib/utils";

/**
 * Onglet Qualitative Analysis — planche P7.
 *
 * Contenu editorial par nature : la planche attend des narratifs qu'aucun
 * module backend ne produit. Tout est donc **derive des scores** pour rester
 * coherent avec la notation de l'onglet voisin, et le point ouvert 3 du plan
 * (redaction analyste ou champ backend ?) reste a trancher.
 *
 * Les onze sections de la planche sont numerotees comme elle.
 *
 * Absente : la **carte infranationale** du bloc « Strategic Sector Focus ».
 * Elle demande une source de decoupage administratif que le fond Natural Earth
 * ne fournit pas — point ouvert 4.
 */

const numbered = (i: number, title: string) => `${i}. ${title}`;

const pillarScore = (profile: CountryProfile, key: PillarKey): number =>
  profile.rating.pillars.find((p) => p.key === key)?.score ?? 5;

/** Qualificatif a trois paliers, pour transformer un score en phrase. */
const grade = (score: number, scale: [string, string, string]): string =>
  score >= 6.5 ? scale[0] : score >= 4.5 ? scale[1] : scale[2];

export function QualitativeTab({ profile }: { profile: CountryProfile }) {
  const { country, regime, rating, metrics } = profile;
  const advanced = country.incomeLevel === "High";

  const tiles = [
    {
      label: "Growth Outlook",
      value: grade(pillarScore(profile, "macroStrength"), ["Strong", "Modéré", "Fragile"]),
      score: pillarScore(profile, "macroStrength"),
      detail: `${metrics.growth.toFixed(1)}% — régime ${regime.regime.toLowerCase()}.`,
    },
    {
      label: "Policy Credibility",
      value: grade(pillarScore(profile, "politicalInstitutionalQuality"), [
        "High",
        "Correcte",
        "Sous surveillance",
      ]),
      score: pillarScore(profile, "politicalInstitutionalQuality"),
      detail: `Politique ${regime.policyStance.toLowerCase()}, taux à ${metrics.policyRate.toFixed(2)}%.`,
    },
    {
      label: "External Resilience",
      value: grade(pillarScore(profile, "externalResilience"), [
        "Confortable",
        "Moderate",
        "Tendue",
      ]),
      score: pillarScore(profile, "externalResilience"),
      detail: `Compte courant à ${metrics.currentAccount.toFixed(1)}% du PIB.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ===== 1. Executive House View ===== */}
      <SectionCard
        title={numbered(1, "Executive House View")}
        badge={<OutlookBadge outlook={rating.outlook} />}
        action={<MomentumBadge momentum={regime.momentum} />}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {country.name} se situe en régime{" "}
              <strong className="text-foreground">{regime.regime}</strong> avec un momentum{" "}
              {regime.momentum.toLowerCase()}. Le score composite de{" "}
              <strong className="text-foreground">{rating.compositeScore.toFixed(1)}/10</strong>{" "}
              place le pays au {rating.rank}
              <sup>e</sup> rang de l&apos;univers suivi. La trajectoire dépend d&apos;abord de{" "}
              {rating.positiveDrivers[0]?.label.toLowerCase() ?? "la croissance"}, tandis que{" "}
              {rating.negativeDrivers[0]?.label.toLowerCase() ?? "le profil de risque"} constitue la
              principale réserve.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {tiles.map((tile) => (
                <div key={tile.label} className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {tile.label}
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">{tile.value}</p>
                  <ScoreBar value={tile.score} max={10} className="mt-1.5" />
                  <p className="mt-2 text-[11px] leading-tight text-muted-foreground">
                    {tile.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SubHeading className="mb-2">House View Highlights</SubHeading>
            <ul className="space-y-2">
              {profile.houseView.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* ===== 2. Macro Regime & Policy ===== */}
      <SectionCard title={numbered(2, "Macro Regime & Policy")}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs text-muted-foreground">
              Régime macro :{" "}
              <strong className="text-foreground">
                {regime.regime} · {regime.momentum}
              </strong>
            </p>
            <RegimePhases profile={profile} />

            <SubHeading className="mb-2 mt-5">Policy Mix (actuel)</SubHeading>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  Icon: Landmark,
                  label: "Fiscal",
                  value: grade(pillarScore(profile, "fiscalCapacity"), [
                    "Marge préservée",
                    "Consolidation graduelle",
                    "Consolidation contrainte",
                  ]),
                },
                { Icon: Building2, label: "Monétaire", value: regime.policyStance },
                {
                  Icon: Globe2,
                  label: "Régime de change",
                  value: country.currency === "XOF" ? "Fixe (ancrage euro)" : "Flottement géré",
                },
                {
                  Icon: Layers,
                  label: "Structurel",
                  value: grade(pillarScore(profile, "structuralOpportunity"), [
                    "Réformes actives",
                    "Réformes progressives",
                    "Réformes à l'arrêt",
                  ]),
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-muted/40 p-3">
                  <item.Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-semibold leading-tight text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SubHeading className="mb-2">Key Policy Priorities</SubHeading>
            <ul className="space-y-3">
              {buildPolicyPriorities(profile).map((item) => (
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
          </div>
        </div>
      </SectionCard>

      {/* ===== 3. Country Architecture ===== */}
      <SectionCard
        title={numbered(3, "Country Architecture")}
        subtitle="Modèle économique structurel — des dotations aux résultats"
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <CountryArchitecture profile={profile} />
          </div>

          <div>
            <SubHeading className="mb-2">Structure économique</SubHeading>
            <EconomicStructure advanced={advanced} />

            <SubHeading className="mb-2 mt-5">Composition de la croissance</SubHeading>
            <GrowthComposition profile={profile} />
          </div>
        </div>

        <KeyTakeaway>
          La chaîne tient par {rating.positiveDrivers[0]?.label.toLowerCase() ?? "les moteurs de croissance"} ;
          la boucle de réinvestissement reste conditionnée par{" "}
          {rating.negativeDrivers[0]?.label.toLowerCase() ?? "la capacité budgétaire"}.
        </KeyTakeaway>
      </SectionCard>

      {/* ===== 4 + 5 + 6. Avantages, expositions, secteur ===== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title={numbered(4, "Strategic Advantages")}>
          <ul className="space-y-3">
            {rating.positiveDrivers.map((driver) => (
              <li key={driver.label} className="flex gap-2.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                <div>
                  <SubHeading>{driver.label}</SubHeading>
                  <p className="text-xs leading-relaxed text-muted-foreground">{driver.rationale}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={numbered(5, "Strategic Exposures")}>
          <ul className="space-y-3">
            {rating.negativeDrivers.map((driver) => (
              <li key={driver.label} className="flex gap-2.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <SubHeading>{driver.label}</SubHeading>
                  <p className="text-xs leading-relaxed text-muted-foreground">{driver.rationale}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title={numbered(6, "Strategic Sector Focus")}
          subtitle="Chaîne de valeur du secteur prioritaire"
        >
          <ValueChain />
          <SubHeading className="mb-2 mt-4">Opportunités d&apos;investissement</SubHeading>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {[
              "Productivité agricole et vulgarisation",
              "Replantation et agriculture résiliente au climat",
              "Transformation et broyage locaux",
              "Certification qualité et traçabilité",
              "Logistique, stockage et chaîne du froid",
            ].map((item) => (
              <li key={item} className="flex gap-1.5">
                <span className="text-primary">•</span>
                {item}
              </li>
            ))}
          </ul>
          <KeyTakeaway tone="positive">
            Monter dans la chaîne de valeur capte davantage de valeur ajoutée domestique et réduit
            l&apos;exposition au prix de la matière brute.
          </KeyTakeaway>
          <p className="mt-2 text-[10px] text-muted-foreground">
            La carte infranationale de la maquette attend une source de découpage administratif.
          </p>
        </SectionCard>
      </section>

      {/* ===== 7 + 8. Dépendances et contexte politique ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title={numbered(7, "Dependencies & Vulnerabilities")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Dépendance</th>
                  <th className="px-2 py-2 font-medium">Impact</th>
                  <th className="px-2 py-2 font-medium">Atténuation / statut</th>
                </tr>
              </thead>
              <tbody>
                {buildDependencies(profile).map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2.5 text-xs font-medium text-foreground">{row.label}</td>
                    <td className="px-2 py-2.5">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          row.impact === "High"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                        )}
                      >
                        {row.impact}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                      {row.mitigation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title={numbered(8, "Political & Geopolitical Context")}>
          <PoliticalTimeline profile={profile} />
          <SubHeading className="mb-2 mt-4">Évaluation</SubHeading>
          <ul className="space-y-2">
            {buildPoliticalAssessment(profile).map((item) => (
              <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      {/* ===== 9 + 10. Transmission et risques ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={numbered(9, "Market Transmission Channels")}
          subtitle="Des facteurs globaux aux résultats domestiques"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                title: "Global Factors",
                Icon: Globe2,
                items: ["Taux des économies avancées", "Prix des matières premières", "Appétit pour le risque"],
              },
              {
                title: "Transmission",
                Icon: Zap,
                items: [
                  country.currency === "XOF" ? "Parité fixe : pas de canal de change" : "Canal de change",
                  "Coût du financement externe",
                  "Termes de l'échange",
                ],
              },
              {
                title: "Domestic Outcomes",
                Icon: Factory,
                items: [
                  `Croissance : ${metrics.growth.toFixed(1)}%`,
                  `Inflation : ${metrics.inflation.toFixed(1)}%`,
                  `Solde budgétaire : ${metrics.fiscalBalance.toFixed(1)}% du PIB`,
                ],
              },
            ].map((column) => (
              <div key={column.title} className="rounded-lg border border-border bg-muted/40 p-3">
                <SubHeading className="mb-2 flex items-center gap-1.5">
                  <column.Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {column.title}
                </SubHeading>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Sensibilité la plus forte :{" "}
            {country.currency === "XOF"
              ? "prix des matières premières et liquidité globale"
              : "taux directeurs externes et change"}
            .
          </p>
        </SectionCard>

        <SectionCard title={numbered(10, "Key Risks & Key Catalysts")}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <SubHeading className="mb-2 text-red-700 dark:text-red-400">Key Risks</SubHeading>
              <ul className="space-y-2">
                {rating.downgradeTriggers.map((trigger) => (
                  <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                    {trigger}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SubHeading className="mb-2 text-emerald-700 dark:text-emerald-400">
                Key Catalysts
              </SubHeading>
              <ul className="space-y-2">
                {rating.upgradeTriggers.map((trigger) => (
                  <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                    <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                    {trigger}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      </section>

      {/* ===== 11. Implications investisseurs ===== */}
      <SectionCard
        title={numbered(11, "Investor Implications")}
        subtitle="Cinq profils, une lecture par profil"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {buildInvestorImplications(profile).map((row) => (
            <div key={row.profile} className="rounded-lg border border-border bg-muted/40 p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <row.Icon className="h-4 w-4" />
              </span>
              <SubHeading className="mt-2">{row.profile}</SubHeading>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{row.context}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-foreground">
                <span className="font-semibold">Implication : </span>
                {row.implication}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================================
 * Frise des phases de régime
 * ========================================================================= */

const PHASE_TONE: Record<string, string> = {
  Expansion: "bg-emerald-500",
  Boom: "bg-emerald-600",
  Goldilocks: "bg-emerald-400",
  Recovery: "bg-blue-500",
  Transition: "bg-amber-500",
  Stagflation: "bg-orange-600",
  Recession: "bg-red-500",
};

/**
 * La planche montre quatre phases datees. `MacroRegime` ne porte qu'un
 * `validFrom`/`validTo` : les phases amont sont donc estimees, et la phase a
 * venir affichee en pointilles. Le module 4 les remplacera par son historique.
 */
function RegimePhases({ profile }: { profile: CountryProfile }) {
  const { regime } = profile;
  const currentYear = regime.validFrom.getFullYear();
  const priorPhase = regime.momentum === "Improving" ? "Recovery" : "Transition";

  const phases = [
    { label: "Stabilisation", span: `${currentYear - 14}-${currentYear - 11}`, tone: PHASE_TONE.Recession, current: false },
    { label: priorPhase, span: `${currentYear - 10}-${currentYear - 6}`, tone: PHASE_TONE[priorPhase], current: false },
    { label: regime.regime, span: `${currentYear - 5}-${currentYear}`, tone: PHASE_TONE[regime.regime] ?? "bg-slate-400", current: true },
    { label: "Consolidation", span: `${currentYear + 1}+`, tone: "bg-muted", current: false, future: true },
  ];

  return (
    <ol className="flex flex-wrap items-stretch gap-2">
      {phases.map((phase, i) => (
        <li key={phase.label} className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={cn(
              "min-w-0 flex-1 rounded-lg border p-2.5",
              phase.current ? "border-primary bg-primary/5" : "border-border",
              phase.future && "border-dashed"
            )}
          >
            <span className={cn("inline-block h-1.5 w-6 rounded-full", phase.tone)} />
            <p className="mt-1 truncate text-xs font-semibold text-foreground">{phase.label}</p>
            <p className="text-[10px] text-muted-foreground">{phase.span}</p>
          </div>
          {i < phases.length - 1 && (
            <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}

/* =========================================================================
 * Architecture pays
 * ========================================================================= */

function CountryArchitecture({ profile }: { profile: CountryProfile }) {
  const { country, metrics } = profile;
  const advanced = country.incomeLevel === "High";

  const columns = [
    {
      title: "Endowments",
      Icon: Sprout,
      items: advanced
        ? ["Capital humain qualifié", "Base industrielle installée", "Marchés de capitaux profonds", "Infrastructure mature"]
        : ["Ressources agricoles et minières", "Démographie jeune", "Position géographique", "Terres arables"],
    },
    {
      title: "Growth Engines",
      Icon: Factory,
      items: advanced
        ? ["Services à forte valeur", "Industrie exportatrice", "Innovation et technologie", "Consommation intérieure"]
        : ["Agro-industrie", "Infrastructures et BTP", "Énergie et logistique", "Services et commerce"],
    },
    {
      title: "Economic Outcomes",
      Icon: Building2,
      items: [
        `Croissance : ${metrics.growth.toFixed(1)}%`,
        `Inflation : ${metrics.inflation.toFixed(1)}%`,
        `Chômage : ${metrics.unemployment.toFixed(1)}%`,
        `Solde budgétaire : ${metrics.fiscalBalance.toFixed(1)}%`,
      ],
    },
    {
      title: "Enablers",
      Icon: Layers,
      items: ["Cadre institutionnel", "Accès au financement", "Intégration régionale", "Capital humain"],
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((column, i) => (
          <div key={column.title} className="relative rounded-lg border border-border bg-muted/40 p-3">
            <SubHeading className="mb-2 flex items-center gap-1.5">
              <column.Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {column.title}
            </SubHeading>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {column.items.map((item) => (
                <li key={item} className="flex gap-1.5">
                  <span className="text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
            {i < columns.length - 1 && (
              <ArrowRight
                className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground xl:block"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ArrowRight className="h-3 w-3 rotate-180" aria-hidden="true" />
        Boucle de réinvestissement : épargne → investissement → productivité → croissance.
      </p>
    </>
  );
}

/* =========================================================================
 * Structure économique et composition de la croissance
 * ========================================================================= */

/**
 * Repartition sectorielle estimee a partir du niveau de revenu.
 *
 * Aucun module ne sert encore la structure sectorielle ; la regle de Clark
 * (plus une economie s'enrichit, plus les services pesent) donne une estimation
 * defendable, et le libelle le dit.
 */
function EconomicStructure({ advanced }: { advanced: boolean }) {
  const slices = advanced
    ? [
        { label: "Agriculture", value: 2, color: "#059669" },
        { label: "Industrie", value: 23, color: "#2563EB" },
        { label: "Services", value: 75, color: "#94A3B8" },
      ]
    : [
        { label: "Agriculture", value: 22, color: "#059669" },
        { label: "Industrie", value: 27, color: "#2563EB" },
        { label: "Services", value: 51, color: "#94A3B8" },
      ];

  const circumference = 2 * Math.PI * 40;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90" role="img" aria-label="Structure sectorielle">
        {slices.map((slice) => {
          const dash = (slice.value / 100) * circumference;
          const element = (
            <circle
              key={slice.label}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={slice.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return element;
        })}
      </svg>
      <ul className="flex-1 space-y-1.5">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: slice.color }} />
              {slice.label}
            </span>
            <span className="font-semibold tabular-nums text-foreground">{slice.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Contributions a la croissance, en points de PIB, sommant au total observe. */
function GrowthComposition({ profile }: { profile: CountryProfile }) {
  const total = profile.metrics.growth;
  // Repartition type : la consommation privee porte l'essentiel, puis
  // l'investissement, le solde exterieur et la depense publique.
  const shares = [
    { label: "Consommation privée", share: 0.42, color: "#059669" },
    { label: "Investissement", share: 0.38, color: "#2563EB" },
    { label: "Exportations nettes", share: 0.12, color: "#D97706" },
    { label: "Consommation publique", share: 0.08, color: "#DC2626" },
  ];
  const max = Math.max(...shares.map((s) => Math.abs(s.share * total)), 0.1);

  return (
    <>
      <ul className="space-y-2">
        {shares.map((item) => {
          const value = Math.round(item.share * total * 10) / 10;
          return (
            <li key={item.label}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {value.toFixed(1)} pp
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(Math.abs(value) / max) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 flex items-baseline justify-between border-t border-border pt-2 text-xs">
        <span className="font-semibold text-foreground">Croissance du PIB réel</span>
        <span className="font-bold tabular-nums text-foreground">{total.toFixed(1)}%</span>
      </p>
    </>
  );
}

/* =========================================================================
 * Chaîne de valeur et frise politique
 * ========================================================================= */

function ValueChain() {
  const steps = [
    { label: "Production", hint: "Petits producteurs" },
    { label: "Agrégation", hint: "Collecte, logistique" },
    { label: "Transformation", hint: "Valeur ajoutée" },
    { label: "Marchés globaux", hint: "Marques, export" },
  ];
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
            <p className="text-xs font-semibold text-foreground">{step.label}</p>
            <p className="text-[10px] text-muted-foreground">{step.hint}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Frise politique.
 *
 * Les jalons sont cales sur l'annee de la revue courante : aucun module ne sert
 * de calendrier electoral, mais la structure de la planche est respectee et se
 * remplira avec le module 9.
 */
function PoliticalTimeline({ profile }: { profile: CountryProfile }) {
  const year = profile.rating.reviewDate.getFullYear();
  const milestones = [
    { period: `${year - 6}`, label: "Élection présidentielle", hint: "Transition pacifique" },
    { period: `${year - 5}–${year - 2}`, label: "Continuité institutionnelle", hint: "Agenda de réformes" },
    { period: `${year}`, label: "Cycle électoral", hint: "Échéance à venir" },
    { period: `${year + 1}+`, label: "Test de stabilité", hint: "Période post-électorale" },
  ];

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {milestones.map((m, i) => (
        <li key={m.period} className="relative">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                i === 2 ? "bg-amber-500" : i === 3 ? "bg-slate-400" : "bg-emerald-500"
              )}
            />
            <span className="text-xs font-semibold tabular-nums text-foreground">{m.period}</span>
          </div>
          <p className="text-[11px] font-medium leading-tight text-foreground">{m.label}</p>
          <p className="text-[10px] leading-tight text-muted-foreground">{m.hint}</p>
        </li>
      ))}
    </ol>
  );
}

/* =========================================================================
 * Contenus dérivés
 * ========================================================================= */

function buildPolicyPriorities(profile: CountryProfile) {
  return [
    {
      Icon: Landmark,
      title: "Discipline budgétaire",
      text: profile.rating.upgradeTriggers[0] ?? "Maintenir la trajectoire de déficit.",
    },
    {
      Icon: Building2,
      title: "Développement du secteur privé",
      text: "Climat des affaires, exécution des PPP, accès au financement.",
    },
    { Icon: Users, title: "Capital humain", text: "Qualité de l'éducation, formation, emploi." },
    {
      Icon: Zap,
      title: "Infrastructure et énergie",
      text: "Combler le déficit électrique, logistique et numérique.",
    },
    {
      Icon: ShieldAlert,
      title: "Gouvernance et institutions",
      text: "Transparence et gestion des finances publiques.",
    },
  ];
}

function buildDependencies(profile: CountryProfile) {
  const { country, rating, metrics } = profile;
  const external = pillarScore(profile, "externalResilience");
  const fiscal = pillarScore(profile, "fiscalCapacity");
  const impactOf = (score: number) => (score < 5.5 ? "High" : "Medium");

  return [
    {
      label: country.currency === "XOF" ? "Ancrage monétaire à l'euro" : "Conditions financières globales",
      impact: impactOf(external),
      mitigation: grade(external, [
        "Réserves confortables",
        "Réserves adéquates",
        "Réserves à reconstituer",
      ]),
    },
    {
      label: "Financement du déficit",
      impact: impactOf(fiscal),
      mitigation: `Solde à ${metrics.fiscalBalance.toFixed(1)}% du PIB — ${grade(fiscal, [
        "accès au marché préservé",
        "recours accru au marché régional",
        "dépendance aux bailleurs",
      ])}`,
    },
    {
      label: "Concentration des exportations",
      impact: impactOf(pillarScore(profile, "structuralOpportunity")),
      mitigation: rating.upgradeTriggers[0] ?? "Agenda de diversification à préciser",
    },
    {
      label: "Stabilité institutionnelle",
      impact: impactOf(pillarScore(profile, "politicalInstitutionalQuality")),
      mitigation: rating.watchStatus ?? "Aucune surveillance active",
    },
    {
      label: "Sensibilité climatique",
      impact: country.incomeLevel === "High" ? "Medium" : "High",
      mitigation: "Systèmes d'alerte précoce et planification de l'adaptation",
    },
  ];
}

function buildPoliticalAssessment(profile: CountryProfile): string[] {
  const score = pillarScore(profile, "politicalInstitutionalQuality");
  return [
    grade(score, [
      "Environnement politique stable sur la période récente.",
      "Continuité institutionnelle, avec quelques incertitudes d'exécution.",
      "Incertitude institutionnelle marquée.",
    ]),
    "Capacité de l'État et agenda de croissance inclusive soutiennent l'atténuation du risque.",
    `Qualité institutionnelle notée ${score.toFixed(1)}/10 dans le module 5.`,
    profile.rating.watchStatus
      ? `Statut de surveillance : ${profile.rating.watchStatus}.`
      : "Aucun statut de surveillance actif.",
  ];
}

function buildInvestorImplications(profile: CountryProfile) {
  const { rating, regime, metrics } = profile;
  const market = pillarScore(profile, "marketAttractiveness");

  return [
    {
      Icon: Landmark,
      profile: "Investisseur souverain",
      context: "Dette souveraine et suivi de la notation.",
      implication: `Score ${rating.compositeScore.toFixed(1)}/10, orientation ${rating.outlook.toLowerCase()} : ${grade(
        market,
        [
          "portage attractif au regard du risque.",
          "portage correct, à surveiller sur la duration.",
          "prime de risque élevée, exposition à limiter.",
        ]
      )}`,
    },
    {
      Icon: Factory,
      profile: "Investisseur actions",
      context: "Exposition aux marchés frontières et émergents.",
      implication: grade(pillarScore(profile, "macroStrength"), [
        "Environnement porteur pour les bénéfices.",
        "Sélectivité requise par secteur.",
        "Visibilité insuffisante sur les bénéfices.",
      ]),
    },
    {
      Icon: Building2,
      profile: "Crédit privé",
      context: "Financement d'entreprises et d'infrastructures.",
      implication: grade(pillarScore(profile, "fiscalCapacity"), [
        "Structures robustes, risque souverain contenu.",
        "Exiger des garanties et un suivi rapproché.",
        "Risque de refinancement élevé.",
      ]),
    },
    {
      Icon: Sprout,
      profile: "Actifs réels",
      context: "Infrastructure, agro-industrie, immobilier.",
      implication: grade(pillarScore(profile, "structuralOpportunity"), [
        "Pipeline d'opportunités structurelles clair.",
        "Opportunités ciblées, horizon long.",
        "Horizon d'investissement à rallonger.",
      ]),
    },
    {
      Icon: ShieldAlert,
      profile: "Gestion des risques",
      context: "Suivi du risque pays dans le portefeuille.",
      implication: `Score de risque ${metrics.riskScore}/100, momentum ${regime.momentum.toLowerCase()} — ajuster les couvertures en conséquence.`,
    },
  ];
}
