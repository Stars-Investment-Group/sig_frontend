import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Award, Shield, AlertTriangle } from "lucide-react";
import type { EconomicRegime } from "@shared/schema";
import { STATIC_COUNTRIES, STATIC_REGIMES } from "@/data/mockData";

/* =========================================================================
 * Notation économique — rating par pays (SIG Rating).
 * Données statiques cohérentes avec la maquette (frontend seul).
 * ========================================================================= */

interface RatingResult {
  score: number;
  grade: string;
  color: "green" | "yellow" | "orange" | "red";
}

function calculateCountryRating(regime?: EconomicRegime): RatingResult {
  if (!regime) return { score: 0, grade: "N/A", color: "orange" };

  let score = 50;

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

  score = Math.max(0, Math.min(100, score));

  if (score >= 85) return { score, grade: "AAA", color: "green" };
  if (score >= 75) return { score, grade: "AA", color: "green" };
  if (score >= 65) return { score, grade: "A", color: "green" };
  if (score >= 55) return { score, grade: "BBB", color: "yellow" };
  if (score >= 45) return { score, grade: "BB", color: "yellow" };
  if (score >= 35) return { score, grade: "B", color: "orange" };
  if (score >= 25) return { score, grade: "CCC", color: "red" };
  return { score, grade: "D", color: "red" };
}

function getRatingIcon(grade: string) {
  if (grade.startsWith("AAA") || grade.startsWith("AA")) return <Award className="h-5 w-5" />;
  if (grade.startsWith("A") || grade.startsWith("BBB")) return <Shield className="h-5 w-5" />;
  return <AlertTriangle className="h-5 w-5" />;
}

function getRatingColor(color: string): string {
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
}

const regimeFr: Record<string, string> = {
  overheating: "Surchauffe",
  recession: "Récession",
  transition: "Transition",
  recovery: "Récupération",
};
const riskFr: Record<string, string> = {
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};
const inflFr: Record<string, string> = {
  high: "Élevée",
  moderate: "Modérée",
  low: "Faible",
};
const gdpFr: Record<string, string> = {
  strong: "Forte",
  stable: "Stable",
  slow: "Lente",
  negative: "Négative",
};

const PROGRESS_COLOR: Record<string, string> = {
  green: "#4ADE80",
  yellow: "#FACC15",
  orange: "#FB923C",
  red: "#F87171",
};

export default function Rating() {
  const countries = STATIC_COUNTRIES;
  const regimes = STATIC_REGIMES;

  const sortedCountries = countries
    .map((country) => ({
      ...country,
      rating: calculateCountryRating(
        regimes.find((r) => r.countryCode === country.code)
      ),
    }))
    .sort((a, b) => b.rating.score - a.rating.score);

  const countBy = (pred: (r: RatingResult) => boolean) =>
    sortedCountries.filter((c) => pred(c.rating)).length;

  const avgScore =
    sortedCountries.length > 0
      ? Math.round(
          sortedCountries.reduce((sum, c) => sum + c.rating.score, 0) /
            sortedCountries.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Notation économique</h2>
        <p className="text-muted-foreground">
          Évaluation et notation des économies nationales à partir des régimes macroéconomiques.
        </p>
      </div>

      {/* ===== Aperçu des ratings ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <Award className="mr-2 h-4 w-4" /> AAA/AA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {countBy((r) => r.grade.startsWith("AAA") || r.grade.startsWith("AA"))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <Shield className="mr-2 h-4 w-4" /> A/BBB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {countBy((r) => r.grade.startsWith("A") || r.grade.startsWith("BBB"))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <AlertTriangle className="mr-2 h-4 w-4" /> Speculative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {countBy(
                (r) =>
                  !r.grade.startsWith("AAA") &&
                  !r.grade.startsWith("AA") &&
                  !r.grade.startsWith("A") &&
                  !r.grade.startsWith("BBB")
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <Star className="mr-2 h-4 w-4" /> Score moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Classement des pays ===== */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Classement des pays</h3>

        {sortedCountries.map((country, index) => {
          const regime = regimes.find((r) => r.countryCode === country.code);
          return (
            <Card key={country.code} className="card-surface">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">{country.name}</h4>
                      <p className="text-xs text-muted-foreground">{country.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRatingIcon(country.rating.grade)}
                    <Badge className={getRatingColor(country.rating.color)}>
                      {country.rating.grade}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score de notation</span>
                  <span className="font-medium text-muted-foreground">{country.rating.score}/100</span>
                </div>
                <Progress
                  value={country.rating.score}
                  className="h-2 bg-muted"
                  style={
                    {
                      "--progress-foreground": PROGRESS_COLOR[country.rating.color],
                    } as React.CSSProperties
                  }
                />

                {regime && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Régime</span>
                      <div className="font-medium capitalize text-foreground">
                        {regimeFr[regime.regime] ?? regime.regime}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risque</span>
                      <div
                        className={`font-medium ${
                          regime.riskLevel === "low"
                            ? "text-green-400"
                            : regime.riskLevel === "medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {riskFr[regime.riskLevel] ?? regime.riskLevel}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inflation</span>
                      <div
                        className={`font-medium ${
                          regime.inflationLevel === "low"
                            ? "text-green-400"
                            : regime.inflationLevel === "moderate"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {inflFr[regime.inflationLevel] ?? regime.inflationLevel}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Croissance PIB</span>
                      <div
                        className={`font-medium ${
                          regime.gdpGrowthLevel === "strong"
                            ? "text-green-400"
                            : regime.gdpGrowthLevel === "stable"
                            ? "text-blue-400"
                            : regime.gdpGrowthLevel === "slow"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {gdpFr[regime.gdpGrowthLevel] ?? regime.gdpGrowthLevel}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ===== Méthodologie ===== */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-foreground">Méthodologie de notation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Échelle de notation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-400">AAA/AA (85-100)</span>
                <span className="text-muted-foreground">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">A/BBB (55-84)</span>
                <span className="text-muted-foreground">Bon à satisfaisant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">BB/B (35-54)</span>
                <span className="text-muted-foreground">Spéculatif</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">CCC/D (0-34)</span>
                <span className="text-muted-foreground">Très risqué</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Facteurs de notation</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Régime économique actuel (+/-30 points)</li>
              <li>• Niveau de risque pays (+/-25 points)</li>
              <li>• Niveau d'inflation (+/-20 points)</li>
              <li>• Croissance du PIB (+/-25 points)</li>
              <li>• Score de base : 50 points</li>
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
