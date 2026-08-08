import { httpGet, buildUrl } from "./http";

/**
 * Types liés aux prévisions économiques.
 * Centralisés ici pour être partagés entre les pages et les composants.
 */
export interface ForecastPoint {
  period: number;
  value: number;
  confidence_lower: number;
  confidence_upper: number;
  date: Date;
}

export interface Forecast {
  countryCode: string;
  indicatorType: string;
  periods: number;
  forecasts: ForecastPoint[];
  model: string;
  accuracy: {
    mae: number;
    mape: number;
    rmse: number;
  };
  trend: "increasing" | "decreasing" | "stable";
  summary: string;
  country: string;
  lastHistoricalValue: number;
  generatedAt: string;
}

export interface CountryForecast {
  countryCode: string;
  country: string;
  modelUsed: string;
  periods: number;
  forecasts: Forecast[];
  summary: string;
  generatedAt: string;
}

export interface ComparisonForecast {
  countryCode: string;
  countryName: string;
  currentValue: number;
  forecastedValue: number;
  trend: "increasing" | "decreasing" | "stable";
  confidence: {
    lower: number;
    upper: number;
  };
}

export interface ComparativeForecast {
  indicatorType: string;
  periods: number;
  comparisons: ComparisonForecast[];
}

/** Pays comparés par défaut lors des prévisions comparatives. */
export const DEFAULT_COMPARE_COUNTRIES = "US,UK,EU,JP,CN,IN";

/** Récupère les prévisions détaillées d'un pays pour un modèle donné. */
export async function getCountryForecast(
  countryCode: string,
  model: string,
  periods: number
): Promise<CountryForecast> {
  const url = buildUrl(`/api/forecasts/country/${countryCode}`, {
    model,
    periods,
  });
  return httpGet<CountryForecast>(url);
}

/** Récupère les prévisions comparatives entre plusieurs pays. */
export async function getComparativeForecasts(
  indicatorType: string,
  periods: number,
  countries: string = DEFAULT_COMPARE_COUNTRIES
): Promise<ComparativeForecast> {
  const url = buildUrl(`/api/forecasts/compare/${indicatorType}`, {
    countries,
    periods,
  });
  return httpGet<ComparativeForecast>(url);
}
