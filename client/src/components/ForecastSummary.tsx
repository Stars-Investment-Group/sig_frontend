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
      'unemployment': 'Chômage',
      'gdpGrowth': 'Croissance PIB',
      'interestRate': 'Taux d\'intérêt'
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
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center">
          {getIndicatorIcon(indicatorType)}
          <span className="ml-2">{getIndicatorName(indicatorType)} - {country}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Résumé des valeurs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Valeur Actuelle</div>
            <div className="text-2xl font-bold text-slate-100">{currentValue.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Prévision {forecast.periods}M</div>
            <div className="text-2xl font-bold text-slate-100">{forecastedValue.toFixed(1)}%</div>
          </div>
        </div>

        {/* Changement et tendance */}
        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-sm text-slate-400">Changement prévu</div>
            <div className={`text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)} pts ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
            </div>
          </div>
          <Badge className={`${getTrendColor(forecast.trend)} border`}>
            {getTrendIcon(forecast.trend)}
            <span className="ml-1 capitalize">{forecast.trend}</span>
          </Badge>
        </div>

        {/* Résumé textuel */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center mb-2">
            <Brain className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-400">Analyse IA</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{forecast.summary}</p>
        </div>

        {/* Métriques du modèle */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-slate-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Métriques du modèle {forecast.model}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-slate-700/30 rounded">
              <div className="text-xs text-slate-400">Précision</div>
              <div className={`text-sm font-bold ${accuracy.color}`}>{accuracy.level}</div>
              <div className="text-xs text-slate-500">MAPE: {forecast.accuracy.mape.toFixed(1)}%</div>
            </div>
            <div className="text-center p-2 bg-slate-700/30 rounded">
              <div className="text-xs text-slate-400">Erreur MAE</div>
              <div className="text-sm font-bold text-slate-100">{forecast.accuracy.mae.toFixed(2)}</div>
              <div className="text-xs text-slate-500">RMSE: {forecast.accuracy.rmse.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Généré: {new Date(forecast.generatedAt).toLocaleDateString('fr-FR', {
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