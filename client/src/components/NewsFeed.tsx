/**
 * Composant NewsFeed - Flux de nouvelles professionnel pour investisseurs institutionnels
 * Affiche les actualités avec système de scoring et filtres avancés
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw,
  ExternalLink,
  Clock,
  Star,
  Shield,
  Building,
  Globe,
  Filter
} from 'lucide-react';

interface ProfessionalArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  type?: 'gnews' | 'official' | 'institutional';
  score?: number;
  scoreBreakdown?: {
    freshness: number;
    sourceQuality: number;
    relevance: number;
    total: number;
  };
}

interface NewsResponse {
  articles: ProfessionalArticle[];
  total: number;
  topic?: string;
  source: string;
  hasGNews?: boolean;
  hasRSS?: boolean;
  scoringApplied?: boolean;
  retrievedAt: string;
}

const topics = [
  { value: 'centralBank', label: 'Banques Centrales', icon: Building },
  { value: 'macro', label: 'Macroéconomie', icon: Globe },
  { value: 'geopolitics', label: 'Géopolitique', icon: Shield }
];

const sources = [
  { value: 'merged', label: 'Toutes Sources (GNews + RSS)' },
  { value: 'pro', label: 'GNews Professionnel' },
  { value: 'rss', label: 'RSS Officiels Uniquement' }
];

export function NewsFeed() {
  const [topic, setTopic] = useState('centralBank');
  const [sourceType, setSourceType] = useState('merged');
  const [refreshKey, setRefreshKey] = useState(0);

  // Construction de l'URL API selon le type de source
  const getApiUrl = () => {
    switch (sourceType) {
      case 'pro':
        return `/api/news/pro?topic=${topic}&limit=20`;
      case 'rss':
        return '/api/news/rss/all';
      case 'merged':
      default:
        return `/api/news/merged?topic=${topic}&limit=20`;
    }
  };

  const { 
    data: newsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<NewsResponse>({
    queryKey: [getApiUrl(), refreshKey],
    refetchInterval: 300000, // 5 minutes
    retry: 2
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date().getTime();
    const published = new Date(dateString).getTime();
    const diffInHours = (now - published) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Maintenant';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}j`;
    return new Date(dateString).toLocaleDateString();
  };

  const getSourceBadgeVariant = (type?: string) => {
    switch (type) {
      case 'official': return 'default';
      case 'institutional': return 'secondary';
      case 'gnews': return 'outline';
      default: return 'outline';
    }
  };

  const getSourceBadgeLabel = (type?: string, source?: string) => {
    switch (type) {
      case 'official': return 'Officiel';
      case 'institutional': return 'Institutionnel';
      case 'gnews': return 'GNews';
      default: return source || 'Autre';
    }
  };

  const isRecentArticle = (dateString: string): boolean => {
    const now = new Date().getTime();
    const published = new Date(dateString).getTime();
    return (now - published) < (24 * 60 * 60 * 1000); // 24 heures
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Actualités Professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Actualités Professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Erreur lors du chargement des actualités professionnelles. 
              Vérifiez votre connexion et réessayez.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Actualités Professionnelles
              </CardTitle>
              <CardDescription>
                {newsData?.total || 0} articles • {newsData?.source}
                {newsData?.scoringApplied && ' • Scoring appliqué'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sujet</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des articles */}
      <div className="space-y-4">
        {newsData?.articles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* En-tête article */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight mb-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  {article.score && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{(article.score * 100).toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Métadonnées */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={getSourceBadgeVariant(article.type)}>
                      {getSourceBadgeLabel(article.type, article.source)}
                    </Badge>
                    
                    {isRecentArticle(article.publishedAt) && (
                      <Badge variant="destructive" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Récent
                      </Badge>
                    )}
                    
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Lire
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                {/* Score breakdown pour debug (optionnel) */}
                {article.scoreBreakdown && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      Détails du score
                    </summary>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <span>Fraîcheur: {(article.scoreBreakdown.freshness * 100).toFixed(0)}%</span>
                      <span>Qualité: {(article.scoreBreakdown.sourceQuality * 100).toFixed(0)}%</span>
                      <span>Pertinence: {(article.scoreBreakdown.relevance * 100).toFixed(0)}%</span>
                    </div>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!newsData?.articles || newsData.articles.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Aucun article trouvé pour les critères sélectionnés.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}