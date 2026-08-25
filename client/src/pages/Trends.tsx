import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Zap, Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import TrendChart from "@/components/TrendChart";
import { STATIC_COUNTRIES, getStaticHistory } from "@/data/mockData";
import type { EconomicIndicator } from "@shared/schema";

/* =========================================================================
 * Prévisions économiques — modèles ARIMA / lissage exponentiel (simulés).
 * Données statiques cohérentes avec la maquette (frontend seul).
 * ========================================================================= */

const INDICATORS = [
  { value: "inflation", label: "Inflation", unit: "%" },
  { value: "unemployment", label: "Chômage", unit: "%" },
  { value: "gdpGrowth", label: "Croissance PIB", unit: "%" },
  { value: "interestRate", label: "Taux d'intérêt", unit: "%" },
];

const MODELS = [
  { value: "arima", label: "ARIMA (recommandé)" },
  { value: "exponential", label: "Lissage exponentiel" },
];

const PERIODS = [
  { value: "3", label: "3 mois" },
  { value: "6", label: "6 mois" },
  { value: "12", label: "12 mois" },
  { value: "24", label: "24 mois" },
];

interface ForecastPoint {
  period: number;
  value: number;
  confidence_lower: number;
  confidence_upper: number;
  date: Date;
}

interface CountryForecast {
  countryCode: string;
  country: string;
  modelUsed: string;
  periods: number;
  forecasts: Array<{
    indicatorType: string;
    lastHistoricalValue: number;
    trend: "increasing" | "decreasing" | "stable";
    summary: string;
    forecasts: ForecastPoint[];
    model: string;
  }>;
  generatedAt: string;
}

/** Génère une prévision statique réaliste à partir de l'historique réel (mock). */
function buildForecast(
  countryCode: string,
  indicatorType: string,
  model: string,
  periods: number
): {
  lastHistoricalValue: number;
  trend: "increasing" | "decreasing" | "stable";
  summary: string;
  forecasts: ForecastPoint[];
  model: string;
} {
  const history = getStaticHistory(countryCode, indicatorType);
  const last = history.length
    ? history[history.length - 1].value
    : 0;
  // pente du modèle réel (dérive) + volatilité faible
  const slope =
    history.length >= 2
      ? (history[history.length - 1].value - history[history.length - 2].value) / 2
      : 0.05;
  const base = last || 4;
  const sigma = model === "arima" ? 0.12 : 0.2; // ARIMA plus précis (bande plus étroite)

  const forecasts: ForecastPoint[] = [];
  for (let p = 1; p <= periods; p++) {
    const date = new Date(2026, 7, 1);
    date.setMonth(date.getMonth() + p);
    const value = Math.round((base + slope * p + Math.sin(p) * 0.08) * 100) / 100;
    forecasts.push({
      period: p,
      value,
      confidence_lower: Math.round((value - sigma * Math.sqrt(p)) * 100) / 100,
      confidence_upper: Math.round((value + sigma * Math.sqrt(p)) * 100) / 100,
      date,
    });
  }

  const trend: "increasing" | "decreasing" | "stable" =
    slope > 0.03 ? "increasing" : slope < -0.03 ? "decreasing" : "stable";

  return {
    lastHistoricalValue: base,
    trend,
    model,
    summary:
      trend === "increasing"
        ? "Tendance haussière attendue sur l'horizon de prévision, cohérente avec le régime actuel."
        : trend === "decreasing"
        ? "Tendance baissière attendue, reflétant une normalisation progressive de l'indicateur."
        : "Indicateur attendu stable sur l'horizon de prévision.",
    forecasts,
  };
}

export default function Trends() {
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedIndicator, setSelectedIndicator] = useState("inflation");
  const [selectedModel, setSelectedModel] = useState("arima");
  const [forecastPeriods, setForecastPeriods] = useState(6);

  const countries = STATIC_COUNTRIES.map((c) => ({ code: c.code, name: c.name }));

  const countryForecast: CountryForecast | null = useMemo(() => {
    const fc = buildForecast(
      selectedCountry,
      selectedIndicator,
      selectedModel,
      forecastPeriods
    );
    const countryName = countries.find((c) => c.code === selectedCountry)?.name ?? selectedCountry;
    return {
      countryCode: selectedCountry,
      country: countryName,
      modelUsed: selectedModel,
      periods: forecastPeriods,
      generatedAt: new Date().toISOString(),
      forecasts: [
        {
          indicatorType: selectedIndicator,
          lastHistoricalValue: fc.lastHistoricalValue,
          trend: fc.trend,
          summary: fc.summary,
          model: fc.model,
          forecasts: fc.forecasts,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedIndicator, selectedModel, forecastPeriods]);

  const selectedInfo =
    INDICATORS.find((i) => i.value === selectedIndicator) ?? INDICATORS[0];
  const countryName = countries.find((c) => c.code === selectedCountry)?.name ?? selectedCountry;

  const currentForecast = countryForecast?.forecasts[0];
  const lastPoint = currentForecast?.forecasts[currentForecast.forecasts.length - 1];
  const trend = currentForecast?.trend ?? "stable";

  const getTrendBadge = (t: string) => {
    if (t === "increasing")
      return {
        cls: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <TrendingUp className="h-4 w-4" />,
        label: "Hausse",
      };
    if (t === "decreasing")
      return {
        cls: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <TrendingDown className="h-4 w-4" />,
        label: "Baisse",
      };
    return {
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: <Minus className="h-4 w-4" />,
      label: "Stable",
    };
  };

  // Comparaison entre pays (données statiques provenant du même modèle)
  const comparison = useMemo(() => {
    const sample = ["US", "UK", "EU", "JP", "IN", "CI"];
    return sample.map((code) => {
      const fc = buildForecast(code, selectedIndicator, "arima", forecastPeriods);
      const last = fc.forecasts[fc.forecasts.length - 1];
      const name = countries.find((c) => c.code === code)?.name ?? code;
      return {
        countryCode: code,
        countryName: name,
        currentValue: fc.lastHistoricalValue,
        forecastedValue: last?.value ?? fc.lastHistoricalValue,
        trend: fc.trend,
        lower: last?.confidence_lower ?? 0,
        upper: last?.confidence_upper ?? 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndicator, forecastPeriods]);

  const trendBadge = getTrendBadge(trend);

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Prévisions économiques</h2>
        <p className="text-muted-foreground">
          Modèles de prévision ARIMA et lissage exponentiel pour les indicateurs macroéconomiques.
        </p>
      </div>

      {/* ===== Configuration ===== */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Brain className="mr-2 h-5 w-5" /> Configuration des prévisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Pays</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Indicateur</label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDICATORS.map((i) => (
                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Modèle</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Périodes</label>
              <Select value={String(forecastPeriods)} onValueChange={(v) => setForecastPeriods(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Onglets ===== */}
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="card-surface">
          <TabsTrigger value="forecast" className="data-[state=active]:bg-accent">
            Prévision détaillée
          </TabsTrigger>
          <TabsTrigger value="compare" className="data-[state=active]:bg-accent">
            <Globe className="mr-2 h-4 w-4" /> Comparaison pays
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-accent">
            <Zap className="mr-2 h-4 w-4" /> Performance modèles
          </TabsTrigger>
        </TabsList>

        {/* ===== Prévision détaillée ===== */}
        <TabsContent value="forecast" className="space-y-6">
          {countryForecast && currentForecast ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="card-surface">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Target className="mr-2 h-5 w-5" />
                    {selectedInfo.label} — {countryName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Valeur actuelle</span>
                    <span className="text-xl font-bold text-foreground tabular-nums">
                      {currentForecast.lastHistoricalValue.toFixed(1)}{selectedInfo.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Prévision {forecastPeriods} mois</span>
                    <span className="text-xl font-bold text-foreground tabular-nums">
                      {lastPoint?.value.toFixed(1)}{selectedInfo.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tendance</span>
                    <Badge className={`${trendBadge.cls} border`}>
                      {trendBadge.icon}
                      <span className="ml-1 capitalize">{trendBadge.label}</span>
                    </Badge>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">{currentForecast.summary}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-surface lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Prévisions {MODELS.find((m) => m.value === selectedModel)?.label} — {forecastPeriods} mois
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    forecast={{
                      forecasts: currentForecast.forecasts,
                      lastHistoricalValue: currentForecast.lastHistoricalValue,
                      model: currentForecast.model,
                    }}
                    indicatorType={selectedIndicator}
                    unit={selectedInfo.unit}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="card-surface">
              <CardContent className="p-6 text-muted-foreground">
                Aucune prévision disponible pour cette configuration.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Comparaison pays ===== */}
        <TabsContent value="compare" className="space-y-6">
          <div>
            <h3 className="mb-1 text-lg font-bold text-foreground">
              Comparaison {selectedInfo.label} — {forecastPeriods} mois
            </h3>
            <p className="mb-4 text-muted-foreground">
              Analyse comparative entre {comparison.length} économies majeures.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {comparison.map((c) => {
              const b = getTrendBadge(c.trend);
              return (
                <Card key={c.countryCode} className="card-surface">
                  <CardHeader>
                    <CardTitle className="text-foreground">{c.countryName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Actuel</span>
                      <span className="font-bold text-foreground tabular-nums">
                        {c.currentValue.toFixed(1)}{selectedInfo.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Prévision</span>
                      <span className="font-bold text-foreground tabular-nums">
                        {c.forecastedValue.toFixed(1)}{selectedInfo.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tendance</span>
                      <Badge className={`${b.cls} border`}>
                        {b.icon}
                        <span className="ml-1 capitalize">{b.label}</span>
                      </Badge>
                    </div>
                    <div className="border-t border-border pt-2">
                      <p className="text-xs text-muted-foreground">
                        Intervalle : {c.lower.toFixed(1)} – {c.upper.toFixed(1)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== Performance des modèles ===== */}
        <TabsContent value="models" className="space-y-6">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Zap className="mr-2 h-5 w-5" /> Performance des modèles de prévision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="mb-2 font-bold text-foreground">ARIMA</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Modèle avancé pour séries temporelles
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Précision</span>
                      <span className="text-foreground">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vitesse</span>
                      <span className="text-foreground">Normale</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexité</span>
                      <span className="text-foreground">Élevée</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="mb-2 font-bold text-foreground">Lissage exponentiel</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Modèle simplifié, plus rapide
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Précision</span>
                      <span className="text-foreground">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vitesse</span>
                      <span className="text-foreground">Rapide</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexité</span>
                      <span className="text-foreground">Faible</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            ⚠️ Prévisions simulées sur données illustratives — remplacées par le pipeline backend (spec §H).
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
