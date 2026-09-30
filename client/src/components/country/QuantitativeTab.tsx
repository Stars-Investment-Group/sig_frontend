import { QuantitativeAnalysisView } from "@/components/dashboard/QuantitativeAnalysisView";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard } from "@/components/common/SectionCard";
import type { CountryProfile } from "@/data/countryProfile";

/**
 * Onglet Quantitative Analysis — planche P8.
 *
 * Le corps de la planche existe deja (`QuantitativeAnalysisView`, 7 modules).
 * Cet onglet lui ajoute le cadrage chiffre du pays selectionne, qui manquait :
 * la vue interne reste adossee aux fixtures Cote d'Ivoire tant que le module 3
 * ne sert pas de series par pays sur cette profondeur.
 */

export function QuantitativeTab({ profile }: { profile: CountryProfile }) {
  const { metrics, regime, country } = profile;

  const cards = [
    { label: "Croissance observee", value: `${metrics.growth.toFixed(1)}%`, hint: "dernier point du module 3" },
    { label: "Inflation observee", value: `${metrics.inflation.toFixed(1)}%`, hint: "dernier point du module 3" },
    { label: "Taux directeur", value: `${metrics.policyRate.toFixed(2)}%`, hint: regime.policyStance },
    { label: "Chomage", value: `${metrics.unemployment.toFixed(1)}%`, hint: "dernier point du module 3" },
    { label: "Score de risque", value: `${metrics.riskScore}/100`, hint: `momentum ${regime.momentum.toLowerCase()}` },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Reperes observes"
        subtitle={`${country.name} — series du catalogue, dernier millesime connu`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[11px] leading-tight text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{card.value}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{card.hint}</p>
            </div>
          ))}
        </div>
        <KeyTakeaway tone="caution">
          Les sept modules ci-dessous (previsions vs consensus, courbe souveraine, secteur
          strategique, qualite de donnees) restent adosses aux fixtures Cote d&apos;Ivoire. Ils se
          brancheront pays par pays des que le module 3 exposera cette profondeur d&apos;historique.
        </KeyTakeaway>
      </SectionCard>

      <QuantitativeAnalysisView />
    </div>
  );
}
