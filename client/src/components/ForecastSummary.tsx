import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Target,
  Clock,
  BarChart3
} from "lucide-react";

interface ForecastSummaryProps {
  forecast: {
    model: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    summary: string;
    accuracy: {
      mae: number;
      mape: number;
      rmse: number;
    };
    periods: number;
    generatedAt: string;
  };
  country: string;
  indicatorType: string;
  currentValue: number;
  forecastedValue: number;
}

export default function ForecastSummary({ 
  forecast, 
  country, 
  indicatorType, 
  currentValue, 
  forecastedValue 
}: ForecastSummaryProps) {
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'decreasing':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'inflation':
        return <TrendingUp className="w-5 h-5" />;
      case 'unemployment':
        return <TrendingDown className="w-5 h-5" />;
      case 'gdpGrowth':
        return <BarChart3 className="w-5 h-5" />;
      case 'interestRate':
        return <Target className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getIndicatorName = (type: string) => {
    const names: Record<string, string> = {
      'inflation': 'Inflation',
      'unemployment': 'ChÃ´mage',
      'gdpGrowth': 'Croissance PIB',
      'interestRate': 'Taux d\'intÃ©rÃªt'
    };
    return names[type] || type;
  };

  const getAccuracyLevel = (mape: number) => {
    if (mape < 5) return { level: 'Excellent', color: 'text-green-400' };
    if (mape < 10) return { level: 'Bon', color: 'text-blue-400' };
    if (mape < 20) return { level: 'Acceptable', color: 'text-yellow-400' };
    return { level: 'Faible', color: 'text-red-400' };
  };

  const change = forecastedValue - currentValue;
  const changePercent = ((change / currentValue) * 100);
  const accuracy = getAccuracyLevel(forecast.accuracy.mape);

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          {getIndicatorIcon(indicatorType)}
          <span className="ml-2">{getIndicatorName(indicatorType)} - {country}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* RÃ©sumÃ© des valeurs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Valeur Actuelle</div>
            <div className="text-2xl font-bold text-foreground">{currentValue.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">PrÃ©vision {forecast.periods}M</div>
            <div className="text-2xl font-bold text-foreground">{forecastedValue.toFixed(1)}%</div>
          </div>
        </div>

        {/* Changement et tendance */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Changement prÃ©vu</div>
            <div className={`text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)} pts ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
            </div>
          </div>
          <Badge className={`${getTrendColor(forecast.trend)} border`}>
            {getTrendIcon(forecast.trend)}
            <span className="ml-1 capitalize">{forecast.trend}</span>
          </Badge>
        </div>

        {/* RÃ©sumÃ© textuel */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center mb-2">
            <Brain className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-400">Analyse IA</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{forecast.summary}</p>
        </div>

        {/* MÃ©triques du modÃ¨le */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            MÃ©triques du modÃ¨le {forecast.model}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">PrÃ©cision</div>
              <div className={`text-sm font-bold ${accuracy.color}`}>{accuracy.level}</div>
              <div className="text-xs text-muted-foreground">MAPE: {forecast.accuracy.mape.toFixed(1)}%</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Erreur MAE</div>
              <div className="text-sm font-bold text-foreground">{forecast.accuracy.mae.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">RMSE: {forecast.accuracy.rmse.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* MÃ©tadonnÃ©es */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              GÃ©nÃ©rÃ©: {new Date(forecast.generatedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Horizon: {forecast.periods} mois
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}


