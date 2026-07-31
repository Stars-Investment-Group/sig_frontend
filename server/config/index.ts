/**
 * Configuration centrale de l'application
 * 
 * Ce fichier centralise toutes les configurations, constantes
 * et variables d'environnement utilisées dans l'application.
 */

/**
 * Configuration du serveur
 */
export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: '0.0.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
} as const;

/**
 * Configuration des APIs externes
 * 
 * Pour le moment, pas d'intégration d'APIs externes,
 * mais cette structure est prête pour l'avenir.
 */
export const API_CONFIG = {
  FRED_API_KEY: process.env.FRED_API_KEY,
  WORLD_BANK_BASE_URL: 'https://api.worldbank.org/v2',
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
} as const;

/**
 * Configuration des logs
 */
export const LOG_CONFIG = {
  MAX_LOG_LENGTH: 80,
  LOG_API_RESPONSES: true,
} as const;

/**
 * Constantes métier
 */
export const BUSINESS_CONSTANTS = {
  SUPPORTED_COUNTRIES: ['US', 'UK', 'EU', 'JP'] as const,
  INDICATOR_TYPES: ['inflation', 'unemployment', 'interestRate', 'gdpGrowth'] as const,
  REGIME_TYPES: ['overheating', 'recession', 'transition', 'recovery'] as const,
  RISK_LEVELS: ['high', 'medium', 'low'] as const,
  INFLATION_LEVELS: ['high', 'moderate', 'low'] as const,
  GDP_GROWTH_LEVELS: ['strong', 'slow', 'negative', 'stable'] as const,
} as const;

/**
 * Types dérivés des constantes pour la sécurité de type
 */
export type SupportedCountry = typeof BUSINESS_CONSTANTS.SUPPORTED_COUNTRIES[number];
export type IndicatorType = typeof BUSINESS_CONSTANTS.INDICATOR_TYPES[number];
export type RegimeType = typeof BUSINESS_CONSTANTS.REGIME_TYPES[number];
export type RiskLevel = typeof BUSINESS_CONSTANTS.RISK_LEVELS[number];