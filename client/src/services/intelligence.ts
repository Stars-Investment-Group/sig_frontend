import { httpGet } from "./http";

/**
 * Types liés à l'intelligence économique (analyses IA Perplexity).
 * Centralisés ici pour être partagés entre les pages et les composants.
 */
export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  outlook: string;
  sources: string[];
}

export interface CountryIndicators {
  inflation: number;
  unemployment: number;
  gdpGrowth: number;
  interestRate: number;
}

export interface AIInsightResponse {
  country: {
    code: string;
    name: string;
  };
  indicators: CountryIndicators;
  aiAnalysis: AIAnalysis;
  generatedAt: string;
  powered_by: string;
}

/** Récupère l'analyse IA (Perplexity) pour un pays donné. */
export async function getCountryIntelligence(
  countryCode: string
): Promise<AIInsightResponse> {
  return httpGet<AIInsightResponse>(
    `/api/intelligence/country/${countryCode}`
  );
}
