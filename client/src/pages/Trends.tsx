import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  LineChart,
  Brain,
  Target,
  AlertCircle,
  Zap,
  Globe
} from "lucide-react";
import TrendChart from "@/components/TrendChart";
import type { Country } from "@shared/schema";
import {
  getCountryForecast,
  getComparativeForecasts,
  type CountryForecast,
  type ComparisonForecast,
} from "@/services";

const INDICATOR_TYPES = [
  { value: 'inflation', label: 'Inflation', icon: TrendingUp, unit: '%' },
  { value: 'unemployment', label: 'Chômage', icon: TrendingDown, unit: '%' },
  { value: 'gdpGrowth', label: 'Croissance PIB', icon: BarChart3, unit: '%' },
  { value: 'interestRate', label: 'Taux d\'intérêt', icon: Target, unit: '%' }
];

const MODEL_TYPES = [
  { value: 'arima', label: 'ARIMA (Recommandé)', description: 'Modèle avancé pour séries temporelles' },
  { value: 'exponential', label: 'Lissage Exponentiel', description: 'Modèle simplifié, plus rapide' }
];

export default function Trends() {
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("inflation");
  const [selectedModel, setSelectedModel] = useState<string>("arima");
  const [forecastPeriods, setForecastPeriods] = useState<number>(6);

  // Récupération des pays disponibles
  const { data: countries, isLoading: countriesLoading } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  // Récupération des prévisions pour le pays sélectionné
  const { data: countryForecasts, isLoading: forecastsLoading, error: forecastsError } = useQuery<CountryForecast>({
    queryKey: ["/api/forecasts/country", selectedCountry, selectedModel, forecastPeriods],
    queryFn: () => getCountryForecast(selectedCountry, selectedModel, forecastPeriods),
    enabled: !!selectedCountry,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupération des prévisions comparatives
  const { data: comparativeData, isLoading: comparativeLoading } = useQuery({
    queryKey: ["/api/forecasts/compare", selectedIndicator, forecastPeriods],
    queryFn: () => getComparativeForecasts(selectedIndicator, forecastPeriods),
    enabled: !!selectedIndicator,
    staleTime: 5 * 60 * 1000,
  });

  // Données filtrées pour l'indicateur sélectionné
  const selectedForecast = useMemo(() => {
    if (!countryForecasts?.forecasts) return null;
    return countryForecasts.forecasts.find(f => f.indicatorType === selectedIndicator);
  }, [countryForecasts, selectedIndicator]);

  const selectedIndicatorInfo = INDICATOR_TYPES.find(i => i.value === selectedIndicator);
  const selectedCountryInfo = countries?.find(c => c.code === selectedCountry);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'decreasing':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  if (countriesLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Prévisions Économiques</h2>
          <p className="text-slate-400">Modèles de prévision automatisés pour les indicateurs macroéconomiques</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-600 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Prévisions Économiques</h2>
        <p className="text-slate-400">Modèles de prévision automatisés ARIMA et lissage exponentiel pour les indicateurs macroéconomiques</p>
      </div>

      {/* Contrôles de sélection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Configuration des Prévisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Pays</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {countries?.map((country) => (
                    <SelectItem key={country.code} value={country.code} className="text-slate-100">
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Indicateur</label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {INDICATOR_TYPES.map((indicator) => (
                    <SelectItem key={indicator.value} value={indicator.value} className="text-slate-100">
                      {indicator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Modèle</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {MODEL_TYPES.map((model) => (
                    <SelectItem key={model.value} value={model.value} className="text-slate-100">
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Périodes</label>
              <Select value={forecastPeriods.toString()} onValueChange={(v) => setForecastPeriods(parseInt(v))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="3" className="text-slate-100">3 mois</SelectItem>
                  <SelectItem value="6" className="text-slate-100">6 mois</SelectItem>
                  <SelectItem value="12" className="text-slate-100">12 mois</SelectItem>
                  <SelectItem value="24" className="text-slate-100">24 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets principaux */}
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="forecast" className="data-[state=active]:bg-slate-700">
            <LineChart className="w-4 h-4 mr-2" />
            Prévision Détaillée
          </TabsTrigger>
          <TabsTrigger value="compare" className="data-[state=active]:bg-slate-700">
            <Globe className="w-4 h-4 mr-2" />
            Comparaison Pays
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-slate-700">
            <Zap className="w-4 h-4 mr-2" />
            Performance Modèles
          </TabsTrigger>
        </TabsList>

        {/* Onglet Prévision Détaillée */}
        <TabsContent value="forecast" className="space-y-6">
          {forecastsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-600 rounded w-20 mb-4"></div>
                    <div className="h-32 bg-slate-600 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forecastsError ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Erreur lors du chargement des prévisions: {forecastsError.toString()}
                </div>
              </CardContent>
            </Card>
          ) : selectedForecast ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Résumé de la prévision */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center">
                    {selectedIndicatorInfo?.icon && <selectedIndicatorInfo.icon className="w-5 h-5 mr-2" />}
                    {selectedIndicatorInfo?.label} - {selectedCountryInfo?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Valeur actuelle</span>
                    <span className="text-xl font-bold text-slate-100">
                      {selectedForecast.lastHistoricalValue?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Prévision {forecastPeriods} mois</span>
                    <span className="text-xl font-bold text-slate-100">
                      {selectedForecast.forecasts[selectedForecast.forecasts.length - 1]?.value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tendance</span>
                    <Badge className={`${getTrendColor(selectedForecast.trend)} border`}>
                      {getTrendIcon(selectedForecast.trend)}
                      <span className="ml-1 capitalize">{selectedForecast.trend}</span>
                    </Badge>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-300">{selectedForecast.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Graphique des prévisions */}
              <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">
                    Prévisions {selectedModel.toUpperCase()} - {forecastPeriods} mois
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    forecast={selectedForecast}
                    indicatorType={selectedIndicator}
                    unit={selectedIndicatorInfo?.unit || '%'}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Aucune prévision disponible pour {selectedIndicatorInfo?.label} en {selectedCountryInfo?.name}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Comparaison Pays */}
        <TabsContent value="compare" className="space-y-6">
          {comparativeLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-600 rounded w-16 mb-2"></div>
                    <div className="h-8 bg-slate-600 rounded w-12 mb-4"></div>
                    <div className="h-4 bg-slate-600 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comparativeData?.comparisons ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-100 mb-2">
                  Comparaison {selectedIndicatorInfo?.label} - Prévisions {forecastPeriods} mois
                </h3>
                <p className="text-slate-400">
                  Analyse comparative entre {comparativeData.comparisons.length} pays majeurs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparativeData.comparisons.map((comparison: ComparisonForecast) => (
                  <Card key={comparison.countryCode} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-100 text-lg">
                        {comparison.countryName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Actuel</span>
                        <span className="font-bold text-slate-100">
                          {comparison.currentValue?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Prévision</span>
                        <span className="font-bold text-slate-100">
                          {comparison.forecastedValue?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Tendance</span>
                        <Badge className={`${getTrendColor(comparison.trend)} border`}>
                          {getTrendIcon(comparison.trend)}
                          <span className="ml-1 capitalize">{comparison.trend}</span>
                        </Badge>
                      </div>
                      <div className="pt-3 border-t border-slate-700">
                        <p className="text-xs text-slate-400">
                          Intervalle: {comparison.confidence?.lower?.toFixed(1)}% - {comparison.confidence?.upper?.toFixed(1)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Aucune donnée comparative disponible pour {selectedIndicatorInfo?.label}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Performance Modèles */}
        <TabsContent value="models" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Performance des Modèles de Prévision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MODEL_TYPES.map((model) => (
                  <div key={model.value} className="p-4 bg-slate-700 rounded-lg">
                    <h4 className="font-bold text-slate-100 mb-2">{model.label}</h4>
                    <p className="text-sm text-slate-300 mb-4">{model.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Précision</span>
                        <span className="text-slate-100">
                          {model.value === 'arima' ? '85%' : '78%'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vitesse</span>
                        <span className="text-slate-100">
                          {model.value === 'arima' ? 'Normale' : 'Rapide'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Complexité</span>
                        <span className="text-slate-100">
                          {model.value === 'arima' ? 'Élevée' : 'Faible'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}