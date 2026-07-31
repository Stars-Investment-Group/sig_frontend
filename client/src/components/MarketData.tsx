/**
 * Composant pour afficher les données de marché Alpha Vantage
 * 
 * Ce composant récupère et affiche:
 * - Taux de change majeurs (USD/EUR, USD/GBP, etc.)
 * - Indices boursiers principaux (S&P 500, Dow Jones, NASDAQ)
 * - Indicateurs économiques par pays
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Globe, RefreshCw } from 'lucide-react';

interface CurrencyExchange {
  from: string;
  to: string;
  rate: number;
  lastUpdate: string;
}

interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}

interface MarketSummary {
  currencies: CurrencyExchange[];
  markets: MarketIndex[];
  indicators: any[];
  source: string;
  lastUpdate: string;
  totalDataPoints: number;
}

interface ServiceStatus {
  available: boolean;
  service: string;
  capabilities: {
    economicIndicators: boolean;
    currencyRates: boolean;
    marketIndices: boolean;
    globalSummary: boolean;
  };
  rateLimits: {
    callsPerMinute: number;
    callsPerDay: number;
  };
}

export function MarketData() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Vérification du statut du service Alpha Vantage
  const { data: serviceStatus, isLoading: statusLoading } = useQuery<ServiceStatus>({
    queryKey: ['/api/market/status'],
    refetchInterval: 30000 // Vérifier toutes les 30 secondes
  });

  // Récupération du résumé économique global
  const { 
    data: marketSummary, 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useQuery<MarketSummary>({
    queryKey: ['/api/market/summary'],
    enabled: serviceStatus?.available === true,
    refetchInterval: 60000, // Actualiser toutes les minutes
    retry: 2
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchSummary();
  };

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Données de Marché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serviceStatus?.available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Données de Marché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Service Alpha Vantage non disponible. Les données de marché en temps réel nécessitent une clé API Alpha Vantage configurée.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actualisation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Données de Marché Alpha Vantage
              </CardTitle>
              <CardDescription>
                Données financières authentiques en temps réel
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                {serviceStatus.service} Actif
              </Badge>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                disabled={summaryLoading}
              >
                <RefreshCw className={`h-4 w-4 ${summaryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        {serviceStatus && (
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>Limites: {serviceStatus.rateLimits.callsPerMinute} appels/min, {serviceStatus.rateLimits.callsPerDay} appels/jour</p>
              {marketSummary && (
                <p>Dernière actualisation: {new Date(marketSummary.lastUpdate).toLocaleString('fr-FR')}</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {summaryError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors de la récupération des données: {summaryError instanceof Error ? summaryError.message : 'Erreur inconnue'}
          </AlertDescription>
        </Alert>
      )}

      {summaryLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {marketSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Taux de Change */}
          {marketSummary.currencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Taux de Change
                </CardTitle>
                <CardDescription>
                  Devises majeures en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketSummary.currencies.map((currency) => (
                    <div key={`${currency.from}-${currency.to}`} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{currency.from}/{currency.to}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{currency.rate.toFixed(4)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(currency.lastUpdate).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Indices Boursiers */}
          {marketSummary.markets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Indices Boursiers
                </CardTitle>
                <CardDescription>
                  Principaux indices mondiaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketSummary.markets.map((market) => (
                    <div key={market.symbol} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{market.symbol}</Badge>
                        <span className="text-sm font-medium">{market.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{market.value?.toLocaleString('fr-FR') || 'N/A'}</div>
                        <div className={`flex items-center gap-1 text-xs ${
                          (market.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(market.change || 0) >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{market.change > 0 ? '+' : ''}{market.change?.toFixed(2) || '0.00'}</span>
                          <span>({market.changePercent > 0 ? '+' : ''}{market.changePercent?.toFixed(2) || '0.00'}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résumé des données */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Résumé des Données</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{marketSummary.currencies.length}</div>
                  <div className="text-sm text-gray-600">Paires de devises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{marketSummary.markets.length}</div>
                  <div className="text-sm text-gray-600">Indices boursiers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{marketSummary.indicators.length}</div>
                  <div className="text-sm text-gray-600">Indicateurs économiques</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{marketSummary.totalDataPoints}</div>
                  <div className="text-sm text-gray-600">Points de données</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}