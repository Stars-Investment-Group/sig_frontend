import { httpGet } from "./http";

/**
 * Types liés aux données de marché (Alpha Vantage).
 * Centralisés ici pour être partagés entre les composants.
 */
export interface CurrencyExchange {
  from: string;
  to: string;
  rate: number;
  lastUpdate: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}

export interface MarketSummary {
  currencies: CurrencyExchange[];
  markets: MarketIndex[];
  indicators: unknown[];
  source: string;
  lastUpdate: string;
  totalDataPoints: number;
}

export interface MarketServiceStatus {
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

/** Vérifie la disponibilité du service de données de marché. */
export async function getMarketStatus(): Promise<MarketServiceStatus> {
  return httpGet<MarketServiceStatus>("/api/market/status");
}

/** Récupère le résumé économique global (taux de change, indices, etc.). */
export async function getMarketSummary(): Promise<MarketSummary> {
  return httpGet<MarketSummary>("/api/market/summary");
}
