import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import {
  Search,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import type { EconomicIndicator } from "@shared/schema";
import { STATIC_COUNTRIES, getStaticHistory } from "@/data/mockData";

/* =========================================================================
 * Analyse Quantitative — séries temporelles d'indicateurs macro.
 * Données statiques cohérentes avec la maquette (frontend seul).
 * ========================================================================= */

const INDICATORS = [
  { value: "inflation", label: "Inflation" },
  { value: "unemployment", label: "Chômage" },
  { value: "interestRate", label: "Taux d'intérêt" },
  { value: "gdpGrowth", label: "Croissance PIB" },
];

const COUNTRIES = STATIC_COUNTRIES.map((c) => ({ code: c.code, name: c.name }));

function number(value: number | undefined | null): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
}

export default function QuantitativeAnalysis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedIndicator, setSelectedIndicator] = useState("inflation");

  const history = getStaticHistory(selectedCountry, selectedIndicator);
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const change = current && previous ? number(current.value) - number(previous.value) : 0;
  const changeDirection =
    change > 0.05 ? "up" : change < -0.05 ? "down" : "stable";

  const filteredCountries = COUNTRIES.filter(
    (c) => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendDesc = (() => {
    if (history.length < 3) return "Mixte";
    const last3 = history.slice(-3);
    const up = last3.every((d, i) => i === 0 || number(d.value) >= number(last3[i - 1].value));
    const down = last3.every((d, i) => i === 0 || number(d.value) <= number(last3[i - 1].value));
    if (up) return "Hausse";
    if (down) return "Baisse";
    return "Mixte";
  })();

  const indicatorLabel =
    INDICATORS.find((i) => i.value === selectedIndicator)?.label ?? selectedIndicator;
  const countryName =
    COUNTRIES.find((c) => c.code === selectedCountry)?.name ?? selectedCountry;

  const TrendIcon =
    trendDesc === "Hausse" ? TrendingUp : trendDesc === "Baisse" ? TrendingDown : BarChart3;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Analyse quantitative</h2>
        <p className="text-muted-foreground">
          Évolution temporelle des métriques macroéconomiques avec des données chiffrées précises.
        </p>
      </div>

      {/* ===== Filtres ===== */}
      <Card className="card-surface p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label className="text-foreground">Recherche</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un pays..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-foreground">Pays</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Indicateur</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDICATORS.map((i) => (
                  <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ===== Synthèse des métriques ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="card-surface rounded-xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Valeur actuelle</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {current ? `${number(current.value).toFixed(1)}%` : "—"}
          </div>
        </div>

        <div className="card-surface rounded-xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Variation</h3>
            {changeDirection === "up" ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : changeDirection === "down" ? (
              <ArrowDown className="h-4 w-4 text-red-500" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div
            className={`text-2xl font-bold ${
              changeDirection === "up"
                ? "text-green-600 dark:text-green-500"
                : changeDirection === "down"
                ? "text-red-600 dark:text-red-500"
                : "text-foreground"
            }`}
          >
            {change !== 0 ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "—"}
          </div>
        </div>

        <div className="card-surface rounded-xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Tendance</h3>
            <TrendIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            className={`text-2xl font-bold ${
              trendDesc === "Hausse"
                ? "text-green-600 dark:text-green-500"
                : trendDesc === "Baisse"
                ? "text-red-600 dark:text-red-500"
                : "text-foreground"
            }`}
          >
            {trendDesc}
          </div>
        </div>

        <div className="card-surface rounded-xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Points de données</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">{history.length}</div>
        </div>
      </div>

      {/* ===== Graphique ===== */}
      <Card className="card-surface p-5">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Évolution temporelle — {indicatorLabel} ({countryName})
        </h3>
        <TimeSeriesChart
          data={history as EconomicIndicator[]}
          indicatorType={selectedIndicator}
        />
      </Card>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}
