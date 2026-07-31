/**
 * Composant pour afficher les actualités économiques GNews en temps réel
 * 
 * Ce composant récupère et affiche:
 * - Actualités économiques générales
 * - Actualités financières et boursières
 * - Actualités par pays
 * - Actualités de politique économique
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Newspaper, 
  TrendingUp, 
  Globe, 
  Building, 
  ExternalLink, 
  RefreshCw,
  Clock,
  Star
} from 'lucide-react';

interface ProcessedArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  category: 'economic' | 'financial' | 'market' | 'policy';
  relevanceScore: number;
  country?: string;
}

interface NewsResponse {
  articles: ProcessedArticle[];
  total: number;
  category: string;
  source: string;
  retrievedAt: string;
}

interface NewsSummary {
  economic: ProcessedArticle[];
  financial: ProcessedArticle[];
  policy: ProcessedArticle[];
  byCountry: Record<string, ProcessedArticle[]>;
  totalArticles: number;
  lastUpdate: string;
}

interface ServiceStatus {
  available: boolean;
  service: string;
  capabilities: {
    economicNews: boolean;
    financialNews: boolean;
    countryNews: boolean;
    policyNews: boolean;
    newsSummary: boolean;
  };
  rateLimits: {
    callsPerSecond: number;
    callsPerDay: number;
  };
}

export function LiveNews() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('summary');

  // Vérification du statut du service GNews
  const { data: serviceStatus, isLoading: statusLoading } = useQuery<ServiceStatus>({
    queryKey: ['/api/news/status'],
    refetchInterval: 60000 // Vérifier toutes les minutes
  });

  // Récupération du résumé complet des actualités
  const { 
    data: newsSummary, 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useQuery<NewsSummary>({
    queryKey: ['/api/news/summary'],
    enabled: serviceStatus?.available === true && activeTab === 'summary',
    refetchInterval: 300000, // Actualiser toutes les 5 minutes
    retry: 2
  });

  // Récupération des actualités économiques
  const { 
    data: economicNews, 
    isLoading: economicLoading,
    refetch: refetchEconomic 
  } = useQuery<NewsResponse>({
    queryKey: ['/api/news/economic?limit=15'],
    enabled: serviceStatus?.available === true && activeTab === 'economic',
    refetchInterval: 300000,
    retry: 2
  });

  // Récupération des actualités financières
  const { 
    data: financialNews, 
    isLoading: financialLoading,
    refetch: refetchFinancial 
  } = useQuery<NewsResponse>({
    queryKey: ['/api/news/financial?limit=15'],
    enabled: serviceStatus?.available === true && activeTab === 'financial',
    refetchInterval: 300000,
    retry: 2
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    if (activeTab === 'summary') {
      refetchSummary();
    } else if (activeTab === 'economic') {
      refetchEconomic();
    } else if (activeTab === 'financial') {
      refetchFinancial();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffMs = now.getTime() - publishedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours}h`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Il y a ${diffMinutes}min`;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'economic': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'financial': return 'bg-green-100 text-green-800 border-green-300';
      case 'policy': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const ArticleCard = ({ article }: { article: ProcessedArticle }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {article.imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-gray-100">
                {article.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                <span>{(article.relevanceScore * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getCategoryBadgeColor(article.category)}>
                  {article.category === 'economic' && 'Économie'}
                  {article.category === 'financial' && 'Finance'}
                  {article.category === 'policy' && 'Politique'}
                  {article.category === 'market' && 'Marchés'}
                </Badge>
                <span className="text-xs text-gray-500">{article.source}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(article.publishedAt)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Actualités Économiques
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
            <Newspaper className="h-5 w-5" />
            Actualités Économiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Service GNews non disponible. Les actualités en temps réel nécessitent une clé API GNews configurée.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Actualités Économiques GNews
              </CardTitle>
              <CardDescription>
                Actualités économiques authentiques en temps réel
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                {serviceStatus.service} Actif
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={summaryLoading || economicLoading || financialLoading}
              >
                <RefreshCw className={`h-4 w-4 ${(summaryLoading || economicLoading || financialLoading) ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>Limites: {serviceStatus.rateLimits.callsPerSecond} appel/sec, {serviceStatus.rateLimits.callsPerDay} appels/jour</p>
          </div>
        </CardContent>
      </Card>

      {/* Onglets pour différents types d'actualités */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Résumé
          </TabsTrigger>
          <TabsTrigger value="economic" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Économie
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Finance
          </TabsTrigger>
        </TabsList>

        {/* Résumé complet */}
        <TabsContent value="summary">
          {summaryError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Erreur: {summaryError instanceof Error ? summaryError.message : 'Erreur inconnue'}
              </AlertDescription>
            </Alert>
          )}

          {summaryLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : newsSummary && (
            <div className="space-y-6">
              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé des Actualités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{newsSummary.economic.length}</div>
                      <div className="text-sm text-gray-600">Économie</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{newsSummary.financial.length}</div>
                      <div className="text-sm text-gray-600">Finance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{newsSummary.policy.length}</div>
                      <div className="text-sm text-gray-600">Politique</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{newsSummary.totalArticles}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Dernière actualisation: {new Date(newsSummary.lastUpdate).toLocaleString('fr-FR')}
                  </p>
                </CardContent>
              </Card>

              {/* Actualités top */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Actualités Principales</h3>
                {[...newsSummary.economic.slice(0, 3), ...newsSummary.financial.slice(0, 2)]
                  .sort((a, b) => b.relevanceScore - a.relevanceScore)
                  .map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Actualités économiques */}
        <TabsContent value="economic">
          {economicLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : economicNews && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Actualités Économiques</h3>
                <Badge variant="outline">{economicNews.total} articles</Badge>
              </div>
              {economicNews.articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Actualités financières */}
        <TabsContent value="financial">
          {financialLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : financialNews && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Actualités Financières</h3>
                <Badge variant="outline">{financialNews.total} articles</Badge>
              </div>
              {financialNews.articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}