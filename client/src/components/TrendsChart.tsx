import { useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import type { EconomicIndicator } from "@shared/schema";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendsChartProps {
  data: EconomicIndicator[];
  title?: string;
  indicatorType?: string;
}

export default function TrendsChart({ data, title = "Economic Indicator Trends", indicatorType = "inflation" }: TrendsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare chart data
    const labels = sortedData.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    );
    const values = sortedData.map(item => item.value);

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${indicatorType.charAt(0).toUpperCase() + indicatorType.slice(1)} Rate (%)`,
          data: values,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#0ea5e9',
          pointBorderColor: '#0ea5e9',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f1f5f9',
              font: {
                family: 'Inter',
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: '#f1f5f9',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
          }
        },
        scales: {
          x: {
            ticks: { 
              color: '#94a3b8',
              font: {
                family: 'Inter',
              }
            },
            grid: { 
              color: '#334155',
              borderColor: '#334155'
            }
          },
          y: {
            ticks: { 
              color: '#94a3b8',
              font: {
                family: 'Inter',
              },
              callback: function(value) {
                return value + '%';
              }
            },
            grid: { 
              color: '#334155',
              borderColor: '#334155'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, indicatorType]);

  if (!data.length) {
    return (
      <div className="bg-terminal-700 rounded-lg p-8 flex items-center justify-center">
        <p className="text-terminal-400">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="bg-terminal-700 rounded-lg p-4">
      <canvas ref={chartRef} height="300"></canvas>
    </div>
  );
}
