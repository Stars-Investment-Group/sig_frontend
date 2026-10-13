import { ArrowRight } from "lucide-react";
import {
  QuantitativeAnalysisView,
  TopKpi,
} from "@/components/dashboard/QuantitativeAnalysisView";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard } from "@/components/common/SectionCard";
import { OutlookBadge } from "@/components/country/shared";
import type { CountryProfile } from "@/data/countryProfile";

/**
 * Onglet Quantitative Analysis — planche P8.
 *
 * La planche ouvre sur une rangee unique : la House View a gauche, cinq KPI a
 * sa droite. Les sept sections numerotees suivent, toutes visibles.
 *
 * Les KPI viennent du profil pays, donc suivent le selecteur. Les sept sections
 * restent adossees aux fixtures Cote d'Ivoire tant que le module 3 ne sert pas
 * cette profondeur d'historique par pays — c'est dit a l'ecran.
 */

export function QuantitativeTab({ profile }: { profile: CountryProfile }) {
  const { houseView, regime, country } = profile;
  const kpis = profile.kpis.filter((k) => k.id !== "risk").slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ===== House View + 5 KPI, sur une rangee ===== */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-6">
        <SectionCard
          title="SIG House View"
          badge={<OutlookBadge outlook={houseView.stance} />}
          className="xl:col-span-2"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {houseView.bullets[0]} {houseView.bullets[1]}
          </p>
          <a
            href={`/countries/${country.code}/qualitative`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Lire la vue complète
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </SectionCard>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:col-span-4">
          {kpis.map((kpi) => (
            <TopKpi
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta.toFixed(1)}
              spark={kpi.spark}
              good={kpi.polarity === "higherBetter" ? kpi.delta >= 0 : kpi.delta <= 0}
              warn={kpi.polarity === "higherBetter" ? kpi.delta < 0 : kpi.delta > 0}
            />
          ))}
        </div>
      </section>

      <KeyTakeaway tone="caution">
        Les sept sections ci-dessous (prévisions vs consensus, courbe souveraine, secteur
        stratégique, qualité de données) restent adossées aux fixtures Côte d&apos;Ivoire. Elles se
        brancheront pays par pays dès que le module 3 exposera cette profondeur d&apos;historique.
        Les repères ci-dessus, eux, suivent déjà {country.name} — régime{" "}
        {regime.regime.toLowerCase()}.
      </KeyTakeaway>

      <QuantitativeAnalysisView />
    </div>
  );
}
