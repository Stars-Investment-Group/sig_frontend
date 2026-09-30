import { useMemo } from "react";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import type { MacroObservation } from "@shared/schema";

// Enregistrement global des composants Chart.js (une seule fois pour toute l'app)
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

interface TimeSeriesChartProps {
  data: MacroObservation[];
  title?: string;
  indicatorType?: string;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "rgb(203, 213, 225)",
        font: { size: 12 },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      backgroundColor: "rgba(30, 41, 59, 0.9)",
      titleColor: "rgb(203, 213, 225)",
      bodyColor: "rgb(203, 213, 225)",
      borderColor: "rgb(71, 85, 105)",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "rgb(148, 163, 184)", font: { size: 11 } },
      grid: { color: "rgba(71, 85, 105, 0.3)" },
    },
    y: {
      ticks: {
        color: "rgb(148, 163, 184)",
        font: { size: 11 },
        callback: (tickValue: string | number) => `${Number(tickValue)}%`,
      },
      grid: { color: "rgba(71, 85, 105, 0.3)" },
    },
  },
};

/**
 * Graphique de sÃ©rie temporelle gÃ©nÃ©rique pour les indicateurs Ã©conomiques.
 * ConsommÃ© par la page "Analyse Quantitative" et rÃ©utilisable partout
 * oÃ¹ l'on souhaite visualiser l'Ã©volution d'un indicateur dans le temps.
 */
export default function TimeSeriesChart({
  data,
  title,
  indicatorType = "inflation",
}: TimeSeriesChartProps) {
  const { labels, values } = useMemo(() => {
    // Tri chronologique ascendant pour garantir un tracÃ© correct
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedData.map((item) =>
        new Date(item.date).toLocaleDateString("fr-FR", {
          month: "short",
          year: "2-digit",
        })
      ),
      values: sortedData.map((item) => item.value),
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>Aucune donnÃ©e disponible pour cet indicateur</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h4 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h4>
      )}
      <div className="h-64 relative">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: `${indicatorType.charAt(0).toUpperCase()}${indicatorType.slice(1)} (%)`,
                data: values,
                borderColor: "rgb(14, 165, 233)",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "rgb(14, 165, 233)",
                pointBorderColor: "rgb(14, 165, 233)",
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          }}
          options={chartOptions}
        />
      </div>
    </div>
  );
}

