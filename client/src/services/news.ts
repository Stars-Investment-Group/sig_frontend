import { httpGet, buildUrl } from "./http";

/**
 * Types liés au flux d'actualités professionnel.
 * Centralisés ici pour être partagés entre les composants.
 */
export interface ProfessionalArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  type?: "gnews" | "official" | "institutional";
  score?: number;
  scoreBreakdown?: {
    freshness: number;
    sourceQuality: number;
    relevance: number;
    total: number;
  };
}

export interface NewsResponse {
  articles: ProfessionalArticle[];
  total: number;
  topic?: string;
  source: string;
  hasGNews?: boolean;
  hasRSS?: boolean;
  scoringApplied?: boolean;
  retrievedAt: string;
}

const NEWS_BASE = "/api/news";

/**
 * Récupère les actualités professionnelles GNews pour un sujet donné.
 * @throws Si GNews n'est pas configuré (clé API manquante).
 */
export async function getProfessionalNews(
  topic: string,
  limit = 20
): Promise<NewsResponse> {
  const url = buildUrl(`${NEWS_BASE}/pro`, { topic, limit });
  return httpGet<NewsResponse>(url);
}

/** Récupère les actualités des flux RSS officiels. */
export async function getOfficialRssNews(): Promise<NewsResponse> {
  return httpGet<NewsResponse>(`${NEWS_BASE}/rss/all`);
}

/** Récupère un flux fusionné (GNews + RSS). */
export async function getMergedNews(
  topic: string,
  limit = 20
): Promise<NewsResponse> {
  const url = buildUrl(`${NEWS_BASE}/merged`, { topic, limit });
  return httpGet<NewsResponse>(url);
}
