// Utility functions for fetching economic data from various APIs

const FRED_API_KEY = process.env.VITE_FRED_API_KEY || import.meta.env.VITE_FRED_API_KEY || 'demo_key';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export interface FredDataPoint {
  date: string;
  value: string;
}

export interface FredResponse {
  observations: FredDataPoint[];
}

/**
 * Fetch data from FRED API
 * @param seriesId FRED series ID (e.g., 'CPIAUCSL' for CPI)
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 */
export async function fetchFredData(
  seriesId: string, 
  startDate?: string, 
  endDate?: string
): Promise<FredDataPoint[]> {
  try {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: FRED_API_KEY,
      file_type: 'json',
      observation_start: startDate || '2020-01-01',
      observation_end: endDate || new Date().toISOString().split('T')[0]
    });

    const response = await fetch(`${FRED_BASE_URL}/series/observations?${params}`);
    
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
    }

    const data: FredResponse = await response.json();
    return data.observations.filter(obs => obs.value !== '.');
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    throw error;
  }
}

/**
 * Common FRED series IDs for different economic indicators
 */
export const FRED_SERIES = {
  US: {
    inflation: 'CPIAUCSL', // Consumer Price Index
    unemployment: 'UNRATE', // Unemployment Rate
    interestRate: 'FEDFUNDS', // Federal Funds Rate
    gdpGrowth: 'GDPC1' // Real GDP
  },
  UK: {
    inflation: 'GBRCPIALLMINMEI', // UK CPI
    unemployment: 'LRHUTTTTGBQ156S', // UK Unemployment Rate
    interestRate: 'INTGSTGBM193N', // UK Interest Rate
    gdpGrowth: 'NAEXKP01GBQ652S' // UK GDP Growth
  }
} as const;

/**
 * Fetch multiple indicators for a country
 */
export async function fetchCountryIndicators(
  countryCode: 'US' | 'UK',
  startDate?: string,
  endDate?: string
) {
  const series = FRED_SERIES[countryCode];
  
  const results = await Promise.allSettled([
    fetchFredData(series.inflation, startDate, endDate),
    fetchFredData(series.unemployment, startDate, endDate),
    fetchFredData(series.interestRate, startDate, endDate),
    fetchFredData(series.gdpGrowth, startDate, endDate)
  ]);

  return {
    inflation: results[0].status === 'fulfilled' ? results[0].value : [],
    unemployment: results[1].status === 'fulfilled' ? results[1].value : [],
    interestRate: results[2].status === 'fulfilled' ? results[2].value : [],
    gdpGrowth: results[3].status === 'fulfilled' ? results[3].value : []
  };
}

/**
 * Calculate year-over-year change
 */
export function calculateYoYChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(values: number[], periods: number): number[] {
  const result: number[] = [];
  
  for (let i = periods - 1; i < values.length; i++) {
    const sum = values.slice(i - periods + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / periods);
  }
  
  return result;
}

/**
 * Mock data generator for demo purposes when API keys are not available
 */
export function generateMockData(
  indicatorType: string,
  countryCode: string,
  months: number = 12
): FredDataPoint[] {
  const baseValues = {
    inflation: { US: 3.5, UK: 4.2, EU: 2.8, JP: 3.1 },
    unemployment: { US: 3.8, UK: 4.1, EU: 6.2, JP: 2.6 },
    interestRate: { US: 5.25, UK: 5.25, EU: 4.5, JP: -0.1 },
    gdpGrowth: { US: 2.3, UK: 0.5, EU: 0.3, JP: 1.1 }
  };

  const baseValue = baseValues[indicatorType as keyof typeof baseValues]?.[countryCode as keyof typeof baseValues.inflation] || 2.0;
  const data: FredDataPoint[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Add some random variation
    const variation = (Math.random() - 0.5) * 0.8;
    const value = Math.max(0, baseValue + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: value.toFixed(2)
    });
  }
  
  return data;
}
