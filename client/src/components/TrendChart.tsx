import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastData {
  period: number;
  value: number;
  confidence_lower: number;
  confidence_upper: number;
  date: Date;
}

interface TrendChartProps {
  forecast: {
    forecasts: ForecastData[];
    lastHistoricalValue: number;
    model: string;
  };
  indicatorType: string;
  unit: string;
}

export default function TrendChart({ forecast, indicatorType, unit }: TrendChartProps) {
  const chartData = useMemo(() => {
    if (!forecast?.forecasts?.length) return null;

    // Données historiques (point de départ)
    const historicalPoint = {
      date: new Date().toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value: forecast.lastHistoricalValue
    };

    // Données de prévision
    const forecastData = forecast.forecasts.map(f => ({
      date: new Date(f.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value: f.value,
      lower: f.confidence_lower,
      upper: f.confidence_upper
    }));

    const allLabels = [historicalPoint.date, ...forecastData.map(d => d.date)];
    const allValues = [forecast.lastHistoricalValue, ...forecastData.map(d => d.value)];
    const lowerBounds = [forecast.lastHistoricalValue, ...forecastData.map(d => d.lower)];
    const upperBounds = [forecast.lastHistoricalValue, ...forecastData.map(d => d.upper)];

    return {
      labels: allLabels,
      datasets: [
        {
          label: `${indicatorType} - Prévision`,
          data: allValues,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: (ctx: any) => {
            return ctx.dataIndex === 0 ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)';
          },
          pointBorderColor: (ctx: any) => {
            return ctx.dataIndex === 0 ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)';
          },
          pointRadius: (ctx: any) => {
            return ctx.dataIndex === 0 ? 6 : 4;
          },
          pointHoverRadius: 8,
          segment: {
            borderDash: (ctx: any) => {
              return ctx.p0DataIndex === 0 ? [] : [5, 5]; // Ligne pointillée pour les prévisions
            }
          }
        },
        {
          label: 'Intervalle de confiance (95%)',
          data: upperBounds,
          borderColor: 'rgba(59, 130, 246, 0.3)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 1,
          fill: '+1',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderDash: [2, 2]
        },
        {
          label: '',
          data: lowerBounds,
          borderColor: 'rgba(59, 130, 246, 0.3)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 1,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderDash: [2, 2]
        }
      ]
    };
  }, [forecast, indicatorType]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          filter: (legendItem: any) => legendItem.text !== '', // Masquer les labels vides
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: 'rgb(203, 213, 225)',
        bodyColor: 'rgb(203, 213, 225)',
        borderColor: 'rgb(71, 85, 105)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Intervalle') || label === '') {
              return `${label}: ${value.toFixed(2)}${unit}`;
            }
            return `${label}: ${value.toFixed(2)}${unit}`;
          },
          afterBody: (tooltipItems: any[]) => {
            const dataIndex = tooltipItems[0]?.dataIndex;
            if (dataIndex === 0) {
              return ['', '📊 Valeur historique actuelle'];
            } else if (dataIndex > 0) {
              return ['', '🔮 Prévision automatisée'];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Période',
          color: 'rgb(148, 163, 184)',
          font: {
            size: 12
          }
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `${indicatorType} (${unit})`,
          color: 'rgb(148, 163, 184)',
          font: {
            size: 12
          }
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            size: 11
          },
          callback: (value: any) => `${value}${unit}`
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }), [indicatorType, unit]);

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>Aucune donnée de prévision disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}