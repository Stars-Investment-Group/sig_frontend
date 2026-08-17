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
        return "bg-muted text-muted-foreground border-border";
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
        return "bg-muted text-muted-foreground border-border";
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
        return "bg-muted text-muted-foreground border-border";
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
        return "bg-muted text-muted-foreground border-border";
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Analyse Qualitative</h2>
          <p className="text-muted-foreground">Analyse des rÃ©gimes macroÃ©conomiques et Ã©valuation qualitative des Ã©conomies</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-surface rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-36"></div>
                <div className="h-4 bg-muted rounded w-28"></div>
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Analyse Qualitative</h2>
        <p className="text-muted-foreground">Analyse des rÃ©gimes macroÃ©conomiques et Ã©valuation qualitative des Ã©conomies majeures</p>
      </div>

      {/* Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              RÃ©gimes AnalysÃ©s
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {regimes?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risque Ã‰levÃ©
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {regimes?.filter(r => r.riskLevel === "high").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              En RÃ©cupÃ©ration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {regimes?.filter(r => r.regime === "recovery").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              En RÃ©cession
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
            <Card key={`${regime.countryCode}-${regime.regime}`} className="card-surface">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-foreground">{country?.name || regime.countryCode}</span>
                  <div className="flex items-center space-x-2">
                    {getRegimeIcon(regime.regime)}
                    <Badge className={getRegimeClass(regime.regime)}>
                      {regime.regime === "overheating" && "Surchauffe"}
                      {regime.regime === "recession" && "RÃ©cession"}
                      {regime.regime === "transition" && "Transition"}
                      {regime.regime === "recovery" && "RÃ©cupÃ©ration"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Niveau de Risque</span>
                    <div className="mt-1">
                      <Badge className={getRiskClass(regime.riskLevel)}>
                        {regime.riskLevel === "high" && "Ã‰levÃ©"}
                        {regime.riskLevel === "medium" && "Moyen"}
                        {regime.riskLevel === "low" && "Faible"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Inflation</span>
                    <div className="mt-1">
                      <Badge className={getInflationClass(regime.inflationLevel)}>
                        {regime.inflationLevel === "high" && "Ã‰levÃ©e"}
                        {regime.inflationLevel === "moderate" && "ModÃ©rÃ©e"}
                        {regime.inflationLevel === "low" && "Faible"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Croissance PIB</span>
                    <div className="mt-1">
                      <Badge className={getGdpClass(regime.gdpGrowthLevel)}>
                        {regime.gdpGrowthLevel === "strong" && "Forte"}
                        {regime.gdpGrowthLevel === "slow" && "Lente"}
                        {regime.gdpGrowthLevel === "negative" && "NÃ©gative"}
                        {regime.gdpGrowthLevel === "stable" && "Stable"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Mise Ã  jour</span>
                    <div className="mt-1 text-muted-foreground text-sm">
                      {new Date(regime.lastUpdated || new Date()).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    RÃ©gime: {regime.regime} | Risque: {regime.riskLevel} | Inflation: {regime.inflationLevel}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Economic Insights */}
      <div className="mt-8">
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Insights Ã‰conomiques Qualitatifs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Tendances Globales</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>â€¢ {regimes?.filter(r => r.regime === "recovery").length || 0} pays en phase de rÃ©cupÃ©ration</li>
                  <li>â€¢ {regimes?.filter(r => r.riskLevel === "high").length || 0} Ã©conomies Ã  risque Ã©levÃ©</li>
                  <li>â€¢ {regimes?.filter(r => r.inflationLevel === "high").length || 0} pays avec inflation Ã©levÃ©e</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Recommandations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>â€¢ Surveillance renforcÃ©e des pays en surchauffe</li>
                  <li>â€¢ OpportunitÃ©s dans les Ã©conomies en rÃ©cupÃ©ration</li>
                  <li>â€¢ Attention aux risques inflationnistes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

