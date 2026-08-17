import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import { Search, ArrowUp, ArrowDown, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { EconomicIndicator, Country } from "@shared/schema";

export default function QuantitativeAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedIndicator, setSelectedIndicator] = useState("inflation");
  const [timePeriod, setTimePeriod] = useState("12");

  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: indicators, isLoading } = useQuery<EconomicIndicator[]>({
    queryKey: ["/api/indicators/history", selectedCountry, selectedIndicator, timePeriod],
  });

  const currentValue = indicators?.[0]?.value || 0;
  const previousValue = indicators?.[0]?.previousValue || 0;
  const change = indicators?.[0]?.change || 0;
  const changeDirection = indicators?.[0]?.changeDirection || "stable";

  const getTrendDescription = () => {
    if (!indicators?.length) return "Aucune donnÃ©e";

    const recentTrend = indicators.slice(0, 3);
    const isIncreasing = recentTrend.every((ind, i) =>
      i === 0 || ind.value >= (recentTrend[i - 1]?.value || 0)
    );
    const isDecreasing = recentTrend.every((ind, i) =>
      i === 0 || ind.value <= (recentTrend[i - 1]?.value || 0)
    );

    if (isIncreasing) return "Hausse";
    if (isDecreasing) return "Baisse";
    return "Mixte";
  };

  const getIndicatorLabel = (type: string) => {
    const labels: Record<string, string> = {
      inflation: "Inflation",
      unemployment: "ChÃ´mage",
      interestRate: "Taux d'intÃ©rÃªt",
      gdpGrowth: "Croissance PIB",
    };
    return labels[type] || type;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Analyse Quantitative</h2>
        <p className="text-muted-foreground">Explorez les tendances des mÃ©triques macroÃ©conomiques avec des donnÃ©es chiffrÃ©es prÃ©cises</p>
      </div>

      {/* Filters Section */}
      <div className="card-surface rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-foreground mb-2">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher indicateurs..."
                className="pl-10 bg-popover border-border text-popover-foreground text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <Label className="text-foreground mb-2">Pays</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="bg-popover border-border text-popover-foreground text-foreground focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {countries?.map((country) => (
                  <SelectItem key={country.code} value={country.code} className="text-foreground focus:bg-muted">
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground mb-2">Indicateur</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger className="bg-popover border-border text-popover-foreground text-foreground focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="inflation" className="text-foreground focus:bg-muted">Inflation</SelectItem>
                <SelectItem value="unemployment" className="text-foreground focus:bg-muted">ChÃ´mage</SelectItem>
                <SelectItem value="interestRate" className="text-foreground focus:bg-muted">Taux d'intÃ©rÃªt</SelectItem>
                <SelectItem value="gdpGrowth" className="text-foreground focus:bg-muted">Croissance PIB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground mb-2">PÃ©riode</Label>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="bg-popover border-border text-popover-foreground text-foreground focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="6" className="text-foreground focus:bg-muted">6 mois</SelectItem>
                <SelectItem value="12" className="text-foreground focus:bg-muted">12 mois</SelectItem>
                <SelectItem value="24" className="text-foreground focus:bg-muted">24 mois</SelectItem>
                <SelectItem value="36" className="text-foreground focus:bg-muted">36 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Valeur Actuelle</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {currentValue ? `${currentValue}%` : "â€”"}
          </div>
        </div>

        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Variation</h3>
            {changeDirection === "up" ? (
              <ArrowUp className="w-4 h-4 text-green-400" />
            ) : changeDirection === "down" ? (
              <ArrowDown className="w-4 h-4 text-red-400" />
            ) : (
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            changeDirection === "up" ? "text-green-400" :
            changeDirection === "down" ? "text-red-400" : "text-foreground"
          }`}>
            {change ? `${change > 0 ? "+" : ""}${change}%` : "â€”"}
          </div>
        </div>

        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Tendance</h3>
            {getTrendDescription() === "Hausse" ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : getTrendDescription() === "Baisse" ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : (
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            getTrendDescription() === "Hausse" ? "text-green-400" :
            getTrendDescription() === "Baisse" ? "text-red-400" : "text-foreground"
          }`}>
            {getTrendDescription()}
          </div>
        </div>

        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Points de DonnÃ©es</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {indicators?.length || 0}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card-surface rounded-xl p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Ã‰volution Temporelle - {getIndicatorLabel(selectedIndicator)} ({selectedCountry})
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TimeSeriesChart
            data={indicators || []}
            indicatorType={selectedIndicator}
          />
        )}
      </div>
    </div>
  );
}
