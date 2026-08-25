import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle, TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import type { EconomicRegime } from "@shared/schema";
import { STATIC_COUNTRIES, STATIC_REGIMES } from "@/data/mockData";

/* =========================================================================
 * Analyse Qualitative — régimes macroéconomiques par pays.
 * Données statiques cohérentes avec la maquette (frontend seul).
 * ========================================================================= */

const regimeLabel: Record<string, string> = {
  overheating: "Surchauffe",
  recession: "Récession",
  transition: "Transition",
  recovery: "Récupération",
};

const riskLabel: Record<string, string> = {
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

const inflationLabel: Record<string, string> = {
  high: "Élevée",
  moderate: "Modérée",
  low: "Faible",
};

const gdpLabel: Record<string, string> = {
  strong: "Forte",
  stable: "Stable",
  slow: "Lente",
  negative: "Négative",
};

function getRegimeClass(regime: string): string {
  switch (regime) {
    case "overheating":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "recession":
      return "bg-red-600/20 text-red-300 border-red-600/30";
    case "transition":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "recovery":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getRiskClass(risk: string): string {
  switch (risk) {
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getRegimeIcon(regime: string) {
  switch (regime) {
    case "overheating":
      return <AlertTriangle className="h-4 w-4" />;
    case "recession":
      return <TrendingDown className="h-4 w-4" />;
    case "recovery":
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getCountryName(code: string): string {
  return STATIC_COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

export default function QualitativeAnalysis() {
  const regimes: EconomicRegime[] = STATIC_REGIMES;

  const countBy = (fn: (r: EconomicRegime) => boolean) =>
    regimes.filter(fn).length;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Analyse Qualitative</h2>
        <p className="text-muted-foreground">
          Régimes macroéconomiques et évaluation qualitative des économies majeures.
        </p>
      </div>

      {/* ===== Résumé global ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <Brain className="mr-2 h-4 w-4" /> Régimes analysés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{regimes.length}</div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <AlertTriangle className="mr-2 h-4 w-4" /> Risque élevé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {countBy((r) => r.riskLevel === "high")}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <TrendingUp className="mr-2 h-4 w-4" /> En récupération
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {countBy((r) => r.regime === "recovery")}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <TrendingDown className="mr-2 h-4 w-4" /> En récession
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {countBy((r) => r.regime === "recession")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Grille des régimes ===== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {regimes.map((regime) => (
          <Card key={regime.countryCode} className="card-surface">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-foreground">{getCountryName(regime.countryCode)}</span>
                <div className="flex items-center gap-2">
                  {getRegimeIcon(regime.regime)}
                  <Badge className={getRegimeClass(regime.regime)}>
                    {regimeLabel[regime.regime] ?? regime.regime}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Niveau de risque</span>
                  <div className="mt-1">
                    <Badge className={getRiskClass(regime.riskLevel)}>
                      {riskLabel[regime.riskLevel] ?? regime.riskLevel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Inflation</span>
                  <div className="mt-1">
                    <Badge className={getRiskClass(regime.inflationLevel)}>
                      {inflationLabel[regime.inflationLevel] ?? regime.inflationLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Croissance PIB</span>
                  <div className="mt-1">
                    <Badge
                      className={
                        regime.gdpGrowthLevel === "strong"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : regime.gdpGrowthLevel === "stable"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {gdpLabel[regime.gdpGrowthLevel] ?? regime.gdpGrowthLevel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Niveau de risque</span>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {regime.lastUpdated.toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== Insights qualitatifs ===== */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Brain className="mr-2 h-5 w-5" /> Insights économiques qualitatifs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Tendances globales</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {countBy((r) => r.regime === "recovery")} économies en phase de récupération
              </li>
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {countBy((r) => r.riskLevel === "high")} économies à risque élevé
              </li>
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {countBy((r) => r.inflationLevel === "high")} pays avec inflation élevée
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Recommandations</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                Surveillance renforcée des économies en surchauffe et en récession
              </li>
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                Opportunités dans les économies en récupération (UEMOA, US, India)
              </li>
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                Attention aux risques inflationnistes sur les marchés émergents
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}
