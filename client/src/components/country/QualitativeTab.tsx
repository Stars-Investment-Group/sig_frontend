import {
  ArrowRight,
  Building2,
  Factory,
  Globe2,
  Landmark,
  Layers,
  Lightbulb,
  ShieldAlert,
  Sprout,
  Zap,
} from "lucide-react";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { MomentumBadge, OutlookBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";
import type { PillarKey } from "@shared/schema";

/**
 * Onglet Qualitative Analysis — planche P7.
 *
 * Contenu éditorial par nature : la maquette attend des narratifs (House View,
 * avantages stratégiques, implications investisseurs) qu'aucun module backend
 * ne produit. Tout est donc **dérivé des scores** pour rester cohérent avec la
 * notation affichée dans l'onglet voisin, et le point ouvert 3 du plan
 * (rédaction analyste ou champ backend ?) reste à trancher.
 *
 * La carte infranationale du bloc « Strategic Sector Focus » est absente :
 * elle dépend du fond de carte, point ouvert 4 du plan.
 */

const pillarScore = (profile: CountryProfile, key: PillarKey): number =>
  profile.rating.pillars.find((p) => p.key === key)?.score ?? 5;

/** Qualificatif à trois paliers, pour transformer un score en phrase. */
const grade = (score: number, scale: [string, string, string]): string =>
  score >= 6.5 ? scale[0] : score >= 4.5 ? scale[1] : scale[2];

export function QualitativeTab({ profile }: { profile: CountryProfile }) {
  const { country, regime, rating, metrics } = profile;

  const tiles = [
    {
      label: "Growth Outlook",
      value: grade(pillarScore(profile, "macroStrength"), ["Solide", "Modéré", "Fragile"]),
      score: pillarScore(profile, "macroStrength"),
      detail: `Croissance à ${metrics.growth.toFixed(1)}%, régime ${regime.regime.toLowerCase()}.`,
    },
    {
      label: "Policy Credibility",
      value: grade(pillarScore(profile, "politicalInstitutionalQuality"), [
        "Élevée",
        "Correcte",
        "Sous surveillance",
      ]),
      score: pillarScore(profile, "politicalInstitutionalQuality"),
      detail: `Politique monétaire ${regime.policyStance.toLowerCase()}, taux directeur ${metrics.policyRate.toFixed(2)}%.`,
    },
    {
      label: "External Resilience",
      value: grade(pillarScore(profile, "externalResilience"), [
        "Confortable",
        "Adéquate",
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
        title="Executive House View"
        badge={<OutlookBadge outlook={rating.outlook} />}
        action={<MomentumBadge momentum={regime.momentum} />}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {country.name} se situe en régime <strong className="text-foreground">{regime.regime}</strong>{" "}
          avec un momentum {regime.momentum.toLowerCase()}. Le score composite de{" "}
          <strong className="text-foreground">{rating.compositeScore.toFixed(1)}/10</strong> place le
          pays au {rating.rank}
          <sup>e</sup> rang de l&apos;univers suivi. La trajectoire dépend d&apos;abord de{" "}
          {rating.positiveDrivers[0]?.label.toLowerCase() ?? "la croissance"}, tandis que{" "}
          {rating.negativeDrivers[0]?.label.toLowerCase() ?? "le profil de risque"} constitue la
          principale réserve.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{tile.label}</p>
              <p className="mt-0.5 text-base font-semibold text-foreground">{tile.value}</p>
              <ScoreBar value={tile.score} max={10} className="mt-1.5" />
              <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{tile.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <SubHeading className="mb-2">House View Highlights</SubHeading>
          <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {profile.houseView.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {/* ===== 2. Macro Regime & Policy ===== */}
      <SectionCard title="Macro Regime & Policy">
        <RegimePhases profile={profile} />

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <SubHeading className="mb-2">Policy Mix</SubHeading>
            <dl className="space-y-2.5 text-sm">
              {[
                {
                  label: "Fiscal",
                  value: grade(pillarScore(profile, "fiscalCapacity"), [
                    "Marge de manœuvre préservée",
                    "Consolidation graduelle",
                    "Consolidation contrainte",
                  ]),
                  Icon: Landmark,
                },
                { label: "Monetary", value: regime.policyStance, Icon: Building2 },
                {
                  label: "FX Regime",
                  value: country.currency === "XOF" ? "Parité fixe (ancrage euro)" : "Flottement géré",
                  Icon: Globe2,
                },
                {
                  label: "Structural",
                  value: grade(pillarScore(profile, "structuralOpportunity"), [
                    "Agenda de réformes actif",
                    "Réformes progressives",
                    "Réformes à l'arrêt",
                  ]),
                  Icon: Layers,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                >
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <row.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {row.label}
                  </dt>
                  <dd className="text-right font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <SubHeading className="mb-2">Key Policy Priorities</SubHeading>
            <ul className="space-y-2">
              {rating.upgradeTriggers.map((trigger) => (
                <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {trigger}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* ===== 3. Country Architecture ===== */}
      <SectionCard
        title="Country Architecture"
        subtitle="Des dotations aux résultats économiques, avec la boucle de réinvestissement"
      >
        <CountryArchitecture profile={profile} />
        <KeyTakeaway>
          La chaîne tient par les {rating.positiveDrivers[0]?.label.toLowerCase() ?? "moteurs de croissance"} ;
          la boucle de réinvestissement reste conditionnée par{" "}
          {rating.negativeDrivers[0]?.label.toLowerCase() ?? "la capacité budgétaire"}.
        </KeyTakeaway>
      </SectionCard>

      {/* ===== 4 + 5. Avantages et expositions ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Strategic Advantages">
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

        <SectionCard title="Strategic Exposures">
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
      </section>

      {/* ===== 7. Dépendances et vulnérabilités ===== */}
      <SectionCard title="Dependencies & Vulnerabilities">
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
                  <td className="px-2 py-2 text-xs font-medium text-foreground">{row.label}</td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{row.impact}</td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{row.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ===== 9. Canaux de transmission ===== */}
      <SectionCard
        title="Market Transmission Channels"
        subtitle="Des facteurs globaux aux résultats domestiques"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            {
              title: "Global Factors",
              Icon: Globe2,
              items: ["Taux directeurs des économies avancées", "Prix des matières premières", "Appétit pour le risque"],
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
      </SectionCard>

      {/* ===== 10. Risques et catalyseurs ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Key Risks">
          <ul className="space-y-2">
            {rating.downgradeTriggers.map((trigger) => (
              <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                {trigger}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Key Catalysts">
          <ul className="space-y-2">
            {rating.upgradeTriggers.map((trigger) => (
              <li key={trigger} className="flex gap-2 text-xs text-muted-foreground">
                <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                {trigger}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      {/* ===== 11. Implications investisseurs ===== */}
      <SectionCard
        title="Investor Implications"
        subtitle="Cinq profils, une lecture par profil"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {buildInvestorImplications(profile).map((row) => (
            <div key={row.profile} className="rounded-lg border border-border bg-muted/40 p-3">
              <SubHeading>{row.profile}</SubHeading>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.implication}</p>
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
 * Les phases antérieures ne sont pas historisées : `MacroRegime` ne porte
 * qu'un `validFrom`/`validTo`. La frise montre donc la phase courante et deux
 * phases amont plausibles, remplacées dès que le module 4 servira l'historique.
 */
function RegimePhases({ profile }: { profile: CountryProfile }) {
  const { regime } = profile;
  const priorPhase = regime.momentum === "Improving" ? "Recovery" : "Transition";
  const phases = [
    { label: "Recession", span: 1, tone: PHASE_TONE.Recession },
    { label: priorPhase, span: 2, tone: PHASE_TONE[priorPhase] },
    { label: regime.regime, span: 3, tone: PHASE_TONE[regime.regime] ?? "bg-slate-400" },
  ];
  const total = phases.reduce((s, p) => s + p.span, 0);

  return (
    <div>
      <div className="flex h-7 w-full overflow-hidden rounded-md">
        {phases.map((phase, i) => (
          <div
            key={`${phase.label}-${i}`}
            className={`flex items-center justify-center ${phase.tone}`}
            style={{ width: `${(phase.span / total) * 100}%` }}
            title={phase.label}
          >
            <span className="truncate px-1 text-[10px] font-semibold text-white">{phase.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>Phases antérieures (estimées)</span>
        <span>
          Phase courante depuis{" "}
          {regime.validFrom.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </span>
      </div>
    </div>
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
        ? ["Capital humain qualifié", "Base industrielle installée", "Marchés de capitaux profonds"]
        : ["Ressources agricoles et minières", "Démographie jeune", "Position géographique"],
    },
    {
      title: "Growth Engines",
      Icon: Factory,
      items: advanced
        ? ["Services à forte valeur", "Industrie exportatrice", "Innovation et technologie"]
        : ["Agro-industrie", "Infrastructures et BTP", "Énergie et logistique"],
    },
    {
      title: "Economic Outcomes",
      Icon: Building2,
      items: [
        `Croissance : ${metrics.growth.toFixed(1)}%`,
        `Inflation : ${metrics.inflation.toFixed(1)}%`,
        `Chômage : ${metrics.unemployment.toFixed(1)}%`,
      ],
    },
    {
      title: "Enablers",
      Icon: Layers,
      items: ["Cadre institutionnel", "Accès au financement", "Intégration régionale"],
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
        Boucle de réinvestissement : les résultats économiques financent les moteurs via
        l&apos;investissement public et privé.
      </p>
    </>
  );
}

/* =========================================================================
 * Contenus dérivés
 * ========================================================================= */

function buildDependencies(profile: CountryProfile) {
  const { country, rating, metrics } = profile;
  const external = pillarScore(profile, "externalResilience");
  const fiscal = pillarScore(profile, "fiscalCapacity");

  return [
    {
      label: country.currency === "XOF" ? "Ancrage monétaire à l'euro" : "Conditions financières globales",
      impact:
        country.currency === "XOF"
          ? "Pas de canal de change, mais la politique monétaire est importée."
          : "Le coût du financement externe suit les taux des économies avancées.",
      mitigation: grade(external, [
        "Réserves confortables",
        "Réserves adéquates",
        "Réserves à reconstituer",
      ]),
    },
    {
      label: "Financement du déficit",
      impact: `Solde budgétaire à ${metrics.fiscalBalance.toFixed(1)}% du PIB.`,
      mitigation: grade(fiscal, [
        "Accès au marché préservé",
        "Recours accru au marché régional",
        "Dépendance aux bailleurs",
      ]),
    },
    {
      label: "Concentration des exportations",
      impact: grade(pillarScore(profile, "structuralOpportunity"), [
        "Diversification en cours.",
        "Diversification partielle.",
        "Forte concentration sectorielle.",
      ]),
      mitigation: rating.upgradeTriggers[0] ?? "Agenda de diversification à préciser",
    },
    {
      label: "Stabilité institutionnelle",
      impact: grade(pillarScore(profile, "politicalInstitutionalQuality"), [
        "Cadre prévisible.",
        "Quelques incertitudes d'exécution.",
        "Risque d'exécution élevé.",
      ]),
      mitigation: rating.watchStatus ?? "Aucune surveillance active",
    },
  ];
}

function buildInvestorImplications(profile: CountryProfile) {
  const { rating, regime, metrics } = profile;
  const market = pillarScore(profile, "marketAttractiveness");

  return [
    {
      profile: "Investisseur obligataire souverain",
      implication: `Score ${rating.compositeScore.toFixed(1)}/10 et orientation ${rating.outlook.toLowerCase()} : ${grade(
        market,
        [
          "portage attractif au regard du risque.",
          "portage correct, à surveiller sur la duration.",
          "prime de risque élevée, exposition à limiter.",
        ]
      )}`,
    },
    {
      profile: "Investisseur actions",
      implication: `Croissance à ${metrics.growth.toFixed(1)}% et régime ${regime.regime.toLowerCase()} : ${grade(
        pillarScore(profile, "macroStrength"),
        [
          "environnement porteur pour les bénéfices.",
          "sélectivité requise par secteur.",
          "visibilité insuffisante sur les bénéfices.",
        ]
      )}`,
    },
    {
      profile: "Investisseur direct (IDE)",
      implication: grade(pillarScore(profile, "structuralOpportunity"), [
        "Opportunités structurelles claires sur les chaînes de valeur prioritaires.",
        "Opportunités ciblées, à adosser à des garanties.",
        "Horizon d'investissement à rallonger.",
      ]),
    },
    {
      profile: "Trésorier d'entreprise",
      implication: `Taux directeur à ${metrics.policyRate.toFixed(2)}% et politique ${regime.policyStance.toLowerCase()} : ${
        regime.policyStance === "Tight"
          ? "couvrir le coût de financement à court terme."
          : "fenêtre favorable pour allonger la maturité de la dette."
      }`,
    },
    {
      profile: "Allocataire multi-actifs",
      implication: `Contribution au risque du portefeuille : score de risque ${metrics.riskScore}/100, momentum ${regime.momentum.toLowerCase()}.`,
    },
  ];
}
