/**
 * Configuration des pays supportés
 * 
 * Ce fichier centralise la définition de tous les pays couverts
 * par le Global Macroeconomic Tracker.
 */

/**
 * Interface pour la définition d'un pays
 */
export interface CountryDefinition {
  code: string;
  name: string;
  fullName: string;
  region: 'North America' | 'Europe' | 'Asia' | 'South America' | 'Africa' | 'Oceania';
  group: 'G7' | 'BRICS' | 'EU' | 'Other';
  flagUrl: string;
  currency: string;
  defaultStatus: 'stable' | 'watch' | 'risk' | 'recovery';
}

/**
 * Pays du G7 (Group of Seven)
 */
export const G7_COUNTRIES: CountryDefinition[] = [
  {
    code: 'US',
    name: 'United States',
    fullName: 'United States of America',
    region: 'North America',
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'USD',
    defaultStatus: 'stable'
  },
  {
    code: 'CA',
    name: 'Canada',
    fullName: 'Canada',
    region: 'North America', 
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'CAD',
    defaultStatus: 'stable'
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    fullName: 'United Kingdom of Great Britain and Northern Ireland',
    region: 'Europe',
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'GBP',
    defaultStatus: 'watch'
  },
  {
    code: 'FR',
    name: 'France',
    fullName: 'French Republic',
    region: 'Europe',
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'EUR',
    defaultStatus: 'stable'
  },
  {
    code: 'DE',
    name: 'Germany',
    fullName: 'Federal Republic of Germany',
    region: 'Europe',
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'EUR',
    defaultStatus: 'stable'
  },
  {
    code: 'IT',
    name: 'Italy',
    fullName: 'Italian Republic',
    region: 'Europe',
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'EUR',
    defaultStatus: 'watch'
  },
  {
    code: 'JP',
    name: 'Japan',
    fullName: 'Japan',
    region: 'Asia',
    group: 'G7',
    flagUrl: 'https://images.unsplash.com/photo-1554797589-7241bb691973?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'JPY',
    defaultStatus: 'recovery'
  }
];

/**
 * Pays des BRICS (Brazil, Russia, India, China, South Africa)
 */
export const BRICS_COUNTRIES: CountryDefinition[] = [
  {
    code: 'BR',
    name: 'Brazil',
    fullName: 'Federative Republic of Brazil',
    region: 'South America',
    group: 'BRICS',
    flagUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'BRL',
    defaultStatus: 'watch'
  },
  {
    code: 'RU',
    name: 'Russia',
    fullName: 'Russian Federation',
    region: 'Europe',
    group: 'BRICS',
    flagUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'RUB',
    defaultStatus: 'risk'
  },
  {
    code: 'IN',
    name: 'India',
    fullName: 'Republic of India',
    region: 'Asia',
    group: 'BRICS',
    flagUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'INR',
    defaultStatus: 'stable'
  },
  {
    code: 'CN',
    name: 'China',
    fullName: 'People\'s Republic of China',
    region: 'Asia',
    group: 'BRICS',
    flagUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'CNY',
    defaultStatus: 'watch'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    fullName: 'Republic of South Africa',
    region: 'Africa',
    group: 'BRICS',
    flagUrl: 'https://images.unsplash.com/photo-1484318571209-661cf29a69ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'ZAR',
    defaultStatus: 'watch'
  }
];

/**
 * Zone Euro (représentée comme une entité unique)
 */
export const EUROZONE_COUNTRY: CountryDefinition[] = [
  {
    code: 'EU',
    name: 'Eurozone',
    fullName: 'European Monetary Union',
    region: 'Europe',
    group: 'EU',
    flagUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80',
    currency: 'EUR',
    defaultStatus: 'stable'
  }
];

/**
 * Tous les pays supportés
 */
export const ALL_COUNTRIES: CountryDefinition[] = [
  ...G7_COUNTRIES,
  ...BRICS_COUNTRIES,
  ...EUROZONE_COUNTRY
];

/**
 * Mapping des codes pays vers leurs définitions
 */
export const COUNTRIES_MAP = new Map<string, CountryDefinition>(
  ALL_COUNTRIES.map(country => [country.code, country])
);

/**
 * Pays par groupe
 */
export const COUNTRIES_BY_GROUP = {
  G7: G7_COUNTRIES,
  BRICS: BRICS_COUNTRIES,
  EU: EUROZONE_COUNTRY,
  ALL: ALL_COUNTRIES
};

/**
 * Codes de tous les pays
 */
export const ALL_COUNTRY_CODES = ALL_COUNTRIES.map(c => c.code);

/**
 * Vérifie si un code pays est supporté
 */
export function isValidCountryCode(code: string): boolean {
  return COUNTRIES_MAP.has(code.toUpperCase());
}

/**
 * Récupère la définition d'un pays par son code
 */
export function getCountryDefinition(code: string): CountryDefinition | undefined {
  return COUNTRIES_MAP.get(code.toUpperCase());
}

/**
 * Récupère tous les pays d'un groupe spécifique
 */
export function getCountriesByGroup(group: 'G7' | 'BRICS' | 'EU'): CountryDefinition[] {
  return COUNTRIES_BY_GROUP[group];
}

/**
 * Récupère tous les pays d'une région spécifique
 */
export function getCountriesByRegion(region: CountryDefinition['region']): CountryDefinition[] {
  return ALL_COUNTRIES.filter(country => country.region === region);
}