import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, TrendingDown, Award, Shield, AlertTriangle } from "lucide-react";
import type { Country, EconomicRegime, EconomicIndicator } from "@shared/schema";

export default function Rating() {
  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: regimes } = useQuery<EconomicRegime[]>({
    queryKey: ["/api/regimes"],
  });

  // Calcul des ratings basÃ©s sur les donnÃ©es Ã©conomiques
  const calculateCountryRating = (countryCode: string) => {
    const regime = regimes?.find(r => r.countryCode === countryCode);
    if (!regime) return { score: 0, grade: "N/A", color: "slate" };

    let score = 50; // Score de base

    // Ajustement basÃ© sur le rÃ©gime Ã©conomique
    switch (regime.regime) {
      case "recovery":
        score += 25;
        break;
      case "transition":
        score += 10;
        break;
      case "overheating":
        score -= 15;
        break;
      case "recession":
        score -= 30;
        break;
    }

    // Ajustement basÃ© sur le niveau de risque
    switch (regime.riskLevel) {
      case "low":
        score += 20;
        break;
      case "medium":
        score += 5;
        break;
      case "high":
        score -= 25;
        break;
    }

    // Ajustement basÃ© sur l'inflation
    switch (regime.inflationLevel) {
      case "low":
        score += 15;
        break;
      case "moderate":
        score += 5;
        break;
      case "high":
        score -= 20;
        break;
    }

    // Ajustement basÃ© sur la croissance PIB
    switch (regime.gdpGrowthLevel) {
      case "strong":
        score += 20;
        break;
      case "stable":
        score += 10;
        break;
      case "slow":
        score -= 10;
        break;
      case "negative":
        score -= 25;
        break;
    }

    // Normalisation du score entre 0 et 100
    score = Math.max(0, Math.min(100, score));

    let grade = "D";
    let color = "red";

    if (score >= 85) {
      grade = "AAA";
      color = "green";
    } else if (score >= 75) {
      grade = "AA";
      color = "green";
    } else if (score >= 65) {
      grade = "A";
      color = "green";
    } else if (score >= 55) {
      grade = "BBB";
      color = "yellow";
    } else if (score >= 45) {
      grade = "BB";
      color = "yellow";
    } else if (score >= 35) {
      grade = "B";
      color = "orange";
    } else if (score >= 25) {
      grade = "CCC";
      color = "red";
    } else {
      grade = "D";
      color = "red";
    }

    return { score, grade, color };
  };

  const getRatingIcon = (grade: string) => {
    if (grade.startsWith("AAA") || grade.startsWith("AA")) {
      return <Award className="w-5 h-5" />;
    } else if (grade.startsWith("A") || grade.startsWith("BBB")) {
      return <Shield className="w-5 h-5" />;
    } else {
      return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getRatingColor = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "yellow":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "orange":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      case "red":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-muted-foreground bg-slate-500/20 border-slate-500/30";
    }
  };

  const sortedCountries = countries?.map(country => ({
    ...country,
    rating: calculateCountryRating(country.code)
  })).sort((a, b) => b.rating.score - a.rating.score) || [];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Notation Ã‰conomique</h2>
        <p className="text-muted-foreground">Ã‰valuation et notation des Ã©conomies nationales basÃ©es sur les indicateurs macroÃ©conomiques</p>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Award className="w-4 h-4 mr-2" />
              AAA/AA Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {sortedCountries.filter(c => c.rating.grade.startsWith("AAA") || c.rating.grade.startsWith("AA")).length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              A/BBB Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {sortedCountries.filter(c => c.rating.grade.startsWith("A") || c.rating.grade.startsWith("BBB")).length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Speculative Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {sortedCountries.filter(c => !c.rating.grade.startsWith("AAA") && !c.rating.grade.startsWith("AA") && !c.rating.grade.startsWith("A") && !c.rating.grade.startsWith("BBB")).length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Score Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sortedCountries.length > 0 ? Math.round(sortedCountries.reduce((sum, c) => sum + c.rating.score, 0) / sortedCountries.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Ratings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground mb-4">Classement des Pays</h3>
        
        {sortedCountries.map((country, index) => {
          const regime = regimes?.find(r => r.countryCode === country.code);
          return (
            <Card key={country.code} className="card-surface">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{country.name}</h4>
                        <p className="text-sm text-muted-foreground">{country.code}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getRatingIcon(country.rating.grade)}
                        <Badge className={getRatingColor(country.rating.color)}>
                          {country.rating.grade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Score: {country.rating.score}/100</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Score de Notation</span>
                    <span className="text-sm font-medium text-muted-foreground">{country.rating.score}/100</span>
                  </div>
                  <Progress 
                    value={country.rating.score} 
                    className="h-2 bg-muted"
                    style={{
                      "--progress-foreground": country.rating.color === "green" ? "rgb(74 222 128)" :
                                              country.rating.color === "yellow" ? "rgb(250 204 21)" :
                                              country.rating.color === "orange" ? "rgb(251 146 60)" :
                                              "rgb(248 113 113)"
                    } as any}
                  />
                </div>

                {regime && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">RÃ©gime</span>
                      <div className="font-medium text-foreground capitalize">
                        {regime.regime === "overheating" && "Surchauffe"}
                        {regime.regime === "recession" && "RÃ©cession"}
                        {regime.regime === "transition" && "Transition"}
                        {regime.regime === "recovery" && "RÃ©cupÃ©ration"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risque</span>
                      <div className={`font-medium ${
                        regime.riskLevel === "low" ? "text-green-400" :
                        regime.riskLevel === "medium" ? "text-yellow-400" :
                        "text-red-400"
                      }`}>
                        {regime.riskLevel === "high" && "Ã‰levÃ©"}
                        {regime.riskLevel === "medium" && "Moyen"}
                        {regime.riskLevel === "low" && "Faible"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inflation</span>
                      <div className={`font-medium ${
                        regime.inflationLevel === "low" ? "text-green-400" :
                        regime.inflationLevel === "moderate" ? "text-yellow-400" :
                        "text-red-400"
                      }`}>
                        {regime.inflationLevel === "high" && "Ã‰levÃ©e"}
                        {regime.inflationLevel === "moderate" && "ModÃ©rÃ©e"}
                        {regime.inflationLevel === "low" && "Faible"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Croissance PIB</span>
                      <div className={`font-medium ${
                        regime.gdpGrowthLevel === "strong" ? "text-green-400" :
                        regime.gdpGrowthLevel === "stable" ? "text-blue-400" :
                        regime.gdpGrowthLevel === "slow" ? "text-yellow-400" :
                        "text-red-400"
                      }`}>
                        {regime.gdpGrowthLevel === "strong" && "Forte"}
                        {regime.gdpGrowthLevel === "slow" && "Lente"}
                        {regime.gdpGrowthLevel === "negative" && "NÃ©gative"}
                        {regime.gdpGrowthLevel === "stable" && "Stable"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rating Methodology */}
      <div className="mt-8">
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-foreground">MÃ©thodologie de Notation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Ã‰chelle de Notation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-400">AAA/AA (85-100)</span>
                    <span className="text-muted-foreground">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">A/BBB (55-84)</span>
                    <span className="text-muted-foreground">Bon Ã  Satisfaisant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">BB/B (35-54)</span>
                    <span className="text-muted-foreground">SpÃ©culatif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">CCC/D (0-34)</span>
                    <span className="text-muted-foreground">TrÃ¨s RisquÃ©</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Facteurs de Notation</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>â€¢ RÃ©gime Ã©conomique actuel (+/-30 points)</li>
                  <li>â€¢ Niveau de risque pays (+/-25 points)</li>
                  <li>â€¢ Niveau d'inflation (+/-20 points)</li>
                  <li>â€¢ Croissance du PIB (+/-25 points)</li>
                  <li>â€¢ Score de base : 50 points</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

