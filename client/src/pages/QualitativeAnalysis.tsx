import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { Country, EconomicRegime } from "@shared/schema";

export default function QualitativeAnalysis() {
  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: regimes, isLoading } = useQuery<EconomicRegime[]>({
    queryKey: ["/api/regimes"],
  });

  const getRegimeClass = (regime: string) => {
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
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const getRiskClass = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const getInflationClass = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const getGdpClass = (gdpGrowthLevel: string) => {
    switch (gdpGrowthLevel) {
      case "strong":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "slow":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "stable":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const getRegimeIcon = (regime: string) => {
    switch (regime) {
      case "overheating":
        return <AlertTriangle className="w-4 h-4" />;
      case "recession":
        return <TrendingDown className="w-4 h-4" />;
      case "recovery":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Analyse Qualitative</h2>
          <p className="text-slate-400">Analyse des régimes macroéconomiques et évaluation qualitative des économies</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-slate-600 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-600 rounded w-24"></div>
                <div className="h-4 bg-slate-600 rounded w-36"></div>
                <div className="h-4 bg-slate-600 rounded w-28"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Analyse Qualitative</h2>
        <p className="text-slate-400">Analyse des régimes macroéconomiques et évaluation qualitative des économies majeures</p>
      </div>

      {/* Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Régimes Analysés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              {regimes?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risque Élevé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {regimes?.filter(r => r.riskLevel === "high").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              En Récupération
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {regimes?.filter(r => r.regime === "recovery").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              En Récession
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {regimes?.filter(r => r.regime === "recession").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regimes Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regimes?.map((regime) => {
          const country = countries?.find(c => c.code === regime.countryCode);
          return (
            <Card key={`${regime.countryCode}-${regime.regime}`} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-slate-100">{country?.name || regime.countryCode}</span>
                  <div className="flex items-center space-x-2">
                    {getRegimeIcon(regime.regime)}
                    <Badge className={getRegimeClass(regime.regime)}>
                      {regime.regime === "overheating" && "Surchauffe"}
                      {regime.regime === "recession" && "Récession"}
                      {regime.regime === "transition" && "Transition"}
                      {regime.regime === "recovery" && "Récupération"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-400">Niveau de Risque</span>
                    <div className="mt-1">
                      <Badge className={getRiskClass(regime.riskLevel)}>
                        {regime.riskLevel === "high" && "Élevé"}
                        {regime.riskLevel === "medium" && "Moyen"}
                        {regime.riskLevel === "low" && "Faible"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Inflation</span>
                    <div className="mt-1">
                      <Badge className={getInflationClass(regime.inflationLevel)}>
                        {regime.inflationLevel === "high" && "Élevée"}
                        {regime.inflationLevel === "moderate" && "Modérée"}
                        {regime.inflationLevel === "low" && "Faible"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-400">Croissance PIB</span>
                    <div className="mt-1">
                      <Badge className={getGdpClass(regime.gdpGrowthLevel)}>
                        {regime.gdpGrowthLevel === "strong" && "Forte"}
                        {regime.gdpGrowthLevel === "slow" && "Lente"}
                        {regime.gdpGrowthLevel === "negative" && "Négative"}
                        {regime.gdpGrowthLevel === "stable" && "Stable"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Mise à jour</span>
                    <div className="mt-1 text-slate-300 text-sm">
                      {new Date(regime.lastUpdated || new Date()).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-300">
                    Régime: {regime.regime} | Risque: {regime.riskLevel} | Inflation: {regime.inflationLevel}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Economic Insights */}
      <div className="mt-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Insights Économiques Qualitatifs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-100 mb-2">Tendances Globales</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• {regimes?.filter(r => r.regime === "recovery").length || 0} pays en phase de récupération</li>
                  <li>• {regimes?.filter(r => r.riskLevel === "high").length || 0} économies à risque élevé</li>
                  <li>• {regimes?.filter(r => r.inflationLevel === "high").length || 0} pays avec inflation élevée</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 mb-2">Recommandations</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Surveillance renforcée des pays en surchauffe</li>
                  <li>• Opportunités dans les économies en récupération</li>
                  <li>• Attention aux risques inflationnistes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}