import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";
import { getCountryIntelligence, type AIInsightResponse } from "@/services";

interface AIInsightsProps {
  countryCode: string;
  countryName: string;
  compact?: boolean;
}

export default function AIInsights({ countryCode, countryName, compact = false }: AIInsightsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // RÃ©cupÃ©ration des insights IA
  const {
    data: aiInsights,
    isLoading,
    error,
    refetch
  } = useQuery<AIInsightResponse>({
    queryKey: ["/api/intelligence/country", countryCode],
    queryFn: () => getCountryIntelligence(countryCode),
    enabled: !!countryCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-400" />
              <CardTitle className="text-foreground">Intelligence Ã‰conomique IA</CardTitle>
            </div>
            <Skeleton className="h-6 w-16 bg-muted" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-muted" />
            <Skeleton className="h-3 w-full bg-muted" />
            <Skeleton className="h-3 w-1/2 bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const isServiceUnavailable = error.message.includes('503') || error.message.includes('indisponible');

    return (
      <Card className="card-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-400" />
              <CardTitle className="text-foreground">Intelligence Ã‰conomique IA</CardTitle>
            </div>
            <Badge variant="outline" className="text-red-400 border-red-500">
              {isServiceUnavailable ? 'Configuration requise' : 'Erreur'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-red-300 font-medium">
                {isServiceUnavailable
                  ? 'Service d\'IA temporairement indisponible'
                  : 'Erreur lors du chargement'}
              </p>
              <p className="text-xs text-red-400">
                {isServiceUnavailable
                  ? 'Configuration API requise pour les analyses intelligentes'
                  : error.message}
              </p>
              {!isServiceUnavailable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2 text-red-400 border-red-500 hover:bg-red-500/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  RÃ©essayer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiInsights) {
    return null;
  }

  const { aiAnalysis, indicators, generatedAt } = aiInsights;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Analyse IA</span>
            </div>
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-500">
              Mise Ã  jour
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {aiAnalysis?.summary || "Analyse en cours..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            <CardTitle className="text-foreground">Intelligence Ã‰conomique IA</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-400 border-blue-500">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Perplexity
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-blue-400 hover:bg-blue-500/10"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* RÃ©sumÃ© principal */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Analyse de Situation</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiAnalysis?.summary || "Analyse Ã©conomique en cours..."}
          </p>
        </div>

        {/* Points clÃ©s */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
            Points ClÃ©s
          </h4>
          <div className="space-y-2">
            {(aiAnalysis?.keyPoints || []).map((point: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Perspectives */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingDown className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Perspectives</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiAnalysis?.outlook || "Perspectives Ã  analyser..."}
          </p>
        </div>

        {/* Indicateurs contexte */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Inflation</div>
            <div className="text-sm font-bold text-foreground">{indicators?.inflation || 0}%</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">ChÃ´mage</div>
            <div className="text-sm font-bold text-foreground">{indicators?.unemployment || 0}%</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">PIB</div>
            <div className="text-sm font-bold text-foreground">{indicators?.gdpGrowth || 0}%</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Taux</div>
            <div className="text-sm font-bold text-foreground">{indicators?.interestRate || 0}%</div>
          </div>
        </div>

        {/* Sources et mÃ©tadonnÃ©es */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              GÃ©nÃ©rÃ©: {new Date(generatedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {(aiAnalysis?.sources?.length || 0) > 0 && (
              <div className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                {aiAnalysis?.sources?.length || 0} source{(aiAnalysis?.sources?.length || 0) > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {(aiAnalysis?.sources?.length || 0) > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">Sources:</div>
              {(aiAnalysis?.sources || []).slice(0, 3).map((source: string, index: number) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-400 hover:text-blue-300 truncate"
                >
                  â€¢ {source}
                </a>
              ))}
              {(aiAnalysis?.sources?.length || 0) > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{(aiAnalysis?.sources?.length || 0) - 3} autres sources
                </div>
              )}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}


