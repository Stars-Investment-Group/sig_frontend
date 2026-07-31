import { useQuery } from "@tanstack/react-query";
import CountryNewsFeed from "@/components/CountryNewsFeed";
import AIInsights from "@/components/AIInsights";
import { MarketData } from "@/components/MarketData";
import { LiveNews } from "@/components/LiveNews";
import { NewsFeed } from "@/components/NewsFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Newspaper, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import type { Country, EconomicIndicator, EconomicRegime } from "@shared/schema";

export default function Overview() {
  const { data: countries, isLoading: countriesLoading } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: indicators, isLoading: indicatorsLoading } = useQuery<EconomicIndicator[]>({
    queryKey: ["/api/indicators/latest"],
  });

  const { data: regimes } = useQuery<EconomicRegime[]>({
    queryKey: ["/api/regimes"],
  });

  const isLoading = countriesLoading || indicatorsLoading;

  // Calculs pour les statistiques globales
  const totalCountries = countries?.length || 0;
  const riskCountries = regimes?.filter(r => r.riskLevel === "high").length || 0;
  const recoveryCountries = regimes?.filter(r => r.regime === "recovery").length || 0;
  const recessionCountries = regimes?.filter(r => r.regime === "recession").length || 0;

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Aperçu Économique Mondial</h2>
          <p className="text-slate-400">News feed intelligent avec résumés IA de la situation économique par pays</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-600 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CountryNewsFeed />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Aperçu Économique Mondial</h2>
        <p className="text-slate-400">News feed intelligent avec résumés IA de la situation économique par pays</p>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Pays Surveillés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{totalCountries}</div>
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
            <div className="text-2xl font-bold text-red-400">{riskCountries}</div>
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
            <div className="text-2xl font-bold text-green-400">{recoveryCountries}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              En Récession
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{recessionCountries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Section Alpha Vantage Market Data */}
      <div className="mb-8">
        <MarketData />
      </div>

      {/* Section Live News */}
      <div className="mb-8">
        <LiveNews />
        <NewsFeed />
      </div>

      {/* Layout principal avec news feed et IA insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Colonne principale avec les pays */}
        <div className="xl:col-span-2">
          <CountryNewsFeed />
        </div>

        {/* Sidebar avec intelligence IA */}
        <div className="space-y-6">
          <AIInsights 
            countryCode="US" 
            countryName="États-Unis"
            compact={true}
          />
          
          <AIInsights 
            countryCode="CN" 
            countryName="Chine"
            compact={true}
          />
          
          <AIInsights 
            countryCode="EU" 
            countryName="Union Européenne"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
