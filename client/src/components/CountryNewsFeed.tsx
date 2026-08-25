import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Newspaper, 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Globe
} from "lucide-react";
import type { Country, EconomicIndicator, EconomicRegime } from "@shared/schema";

interface CountryNews {
  countryCode: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  keyPoints: string[];
  lastUpdated: string;
  isLoading?: boolean;
  error?: string;
}

export default function CountryNewsFeed() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: indicators } = useQuery<EconomicIndicator[]>({
    queryKey: ["/api/indicators/latest"],
  });

  const { data: regimes } = useQuery<EconomicRegime[]>({
    queryKey: ["/api/regimes"],
  });

  // Fonction pour gÃ©nÃ©rer un rÃ©sumÃ© IA basÃ© sur les donnÃ©es disponibles
  const generateAISummary = (countryCode: string): CountryNews => {
    const country = countries?.find(c => c.code === countryCode);
    const countryIndicators = indicators?.filter(ind => ind.countryCode === countryCode) || [];
    const regime = regimes?.find(r => r.countryCode === countryCode);

    if (!country) {
      return {
        countryCode,
        summary: "DonnÃ©es non disponibles pour ce pays.",
        sentiment: "neutral",
        keyPoints: [],
        lastUpdated: new Date().toISOString(),
        error: "Pays non trouvÃ©"
      };
    }

    // Analyse des indicateurs pour gÃ©nÃ©rer un rÃ©sumÃ© intelligent
    let summary = `Situation Ã©conomique actuelle de ${country.name}: `;
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    const keyPoints: string[] = [];

    // Analyse du rÃ©gime Ã©conomique
    if (regime) {
      switch (regime.regime) {
        case "recovery":
          summary += "L'Ã©conomie montre des signes encourageants de reprise. ";
          sentiment = "positive";
          keyPoints.push("Phase de rÃ©cupÃ©ration Ã©conomique en cours");
          break;
        case "recession":
          summary += "L'Ã©conomie traverse une pÃ©riode difficile avec des indicateurs prÃ©occupants. ";
          sentiment = "negative";
          keyPoints.push("Ã‰conomie en rÃ©cession, vigilance requise");
          break;
        case "overheating":
          summary += "L'Ã©conomie pourrait Ãªtre en surchauffe avec des risques de bulle. ";
          sentiment = "negative";
          keyPoints.push("Risque de surchauffe Ã©conomique dÃ©tectÃ©");
          break;
        case "transition":
          summary += "L'Ã©conomie est dans une phase de transition avec des signaux mixtes. ";
          sentiment = "neutral";
          keyPoints.push("Phase de transition Ã©conomique");
          break;
      }

      // Analyse du niveau de risque
      switch (regime.riskLevel) {
        case "high":
          keyPoints.push("Niveau de risque Ã©levÃ© - Surveillance renforcÃ©e");
          if (sentiment !== "negative") sentiment = "negative";
          break;
        case "medium":
          keyPoints.push("Niveau de risque modÃ©rÃ©");
          break;
        case "low":
          keyPoints.push("Faible niveau de risque dÃ©tectÃ©");
          if (sentiment === "neutral") sentiment = "positive";
          break;
      }

      // Analyse de l'inflation
      switch (regime.inflationLevel) {
        case "high":
          summary += "L'inflation Ã©levÃ©e constitue un dÃ©fi majeur. ";
          keyPoints.push("Inflation Ã©levÃ©e - Impact sur le pouvoir d'achat");
          break;
        case "moderate":
          summary += "L'inflation reste dans des niveaux acceptables. ";
          keyPoints.push("Inflation modÃ©rÃ©e et contrÃ´lÃ©e");
          break;
        case "low":
          summary += "L'inflation faible offre de la stabilitÃ©. ";
          keyPoints.push("Inflation faible - StabilitÃ© des prix");
          break;
      }

      // Analyse de la croissance PIB
      switch (regime.gdpGrowthLevel) {
        case "strong":
          summary += "La croissance du PIB est robuste et soutenue.";
          keyPoints.push("Croissance PIB forte et dynamique");
          if (sentiment === "neutral") sentiment = "positive";
          break;
        case "stable":
          summary += "La croissance du PIB reste stable.";
          keyPoints.push("Croissance PIB stable");
          break;
        case "slow":
          summary += "La croissance du PIB ralentit.";
          keyPoints.push("Ralentissement de la croissance PIB");
          break;
        case "negative":
          summary += "Le PIB est en contraction.";
          keyPoints.push("Contraction du PIB - Situation prÃ©occupante");
          sentiment = "negative";
          break;
      }
    }

    // Analyse des indicateurs spÃ©cifiques
    const inflationIndicator = countryIndicators.find(ind => ind.indicatorType === "inflation");
    const unemploymentIndicator = countryIndicators.find(ind => ind.indicatorType === "unemployment");
    const gdpIndicator = countryIndicators.find(ind => ind.indicatorType === "gdpGrowth");

    if (inflationIndicator) {
      keyPoints.push(`Inflation actuelle: ${inflationIndicator.value}%`);
    }
    if (unemploymentIndicator) {
      keyPoints.push(`Taux de chÃ´mage: ${unemploymentIndicator.value}%`);
    }
    if (gdpIndicator) {
      keyPoints.push(`Croissance PIB: ${gdpIndicator.value}%`);
    }

    // Si pas de donnÃ©es de rÃ©gime, gÃ©nÃ©rer un rÃ©sumÃ© basique
    if (!regime && countryIndicators.length > 0) {
      summary = `DonnÃ©es Ã©conomiques disponibles pour ${country.name}. `;
      keyPoints.push("Analyse basÃ©e sur les indicateurs disponibles");
    }

    return {
      countryCode,
      summary: summary || `Surveillance continue de la situation Ã©conomique de ${country.name}.`,
      sentiment,
      keyPoints: keyPoints.length > 0 ? keyPoints : ["DonnÃ©es en cours d'analyse"],
      lastUpdated: new Date().toISOString()
    };
  };

  const countryNews = countries?.map(country => generateAISummary(country.code)) || [];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "negative":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Ici, on peut ajouter la logique pour rafraÃ®chir avec l'API Perplexity
    // Pour l'instant, on simule juste un dÃ©lai
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-foreground">News Feed Ã‰conomique IA</h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Bot className="w-3 h-3 mr-1" />
            IA
          </Badge>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:bg-accent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {countryNews.map((news) => {
          const country = countries?.find(c => c.code === news.countryCode);
          return (
            <Card key={news.countryCode} className="card-surface">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{country?.name || news.countryCode}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(news.sentiment)}
                    <Badge className={getSentimentColor(news.sentiment)}>
                      {news.sentiment === "positive" && "Positif"}
                      {news.sentiment === "negative" && "NÃ©gatif"}
                      {news.sentiment === "neutral" && "Neutre"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {news.summary}
                </p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-slate-200">Points ClÃ©s:</h5>
                  <ul className="space-y-1">
                    {news.keyPoints.map((point, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start">
                        <span className="w-1 h-1 bg-slate-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Mis Ã  jour: {new Date(news.lastUpdated).toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    <Bot className="w-3 h-3 mr-1" />
                    Analyse IA
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {countryNews.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-surface">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


