import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Country, EconomicIndicator } from "@shared/schema";

interface CountryCardProps {
  country: Country;
  indicators: EconomicIndicator[];
}

export default function CountryCard({ country, indicators }: CountryCardProps) {
  const getIndicatorValue = (type: string) => {
    return indicators.find(ind => ind.indicatorType === type);
  };

  const getChangeIcon = (direction: string | null) => {
    switch (direction) {
      case "up":
        return <ArrowUp className="w-3 h-3" />;
      case "down":
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeClass = (direction: string | null) => {
    switch (direction) {
      case "up":
        return "change-negative";
      case "down":
        return "change-positive";
      default:
        return "change-neutral";
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "stable":
        return `${baseClasses} bg-emerald-900 text-emerald-300`;
      case "watch":
        return `${baseClasses} bg-amber-900 text-amber-300`;
      case "recovery":
        return `${baseClasses} bg-emerald-900 text-emerald-300`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const formatValue = (value: number | undefined, unit: string) => {
    if (value === undefined) return "N/A";
    if (unit === "%") return `${value.toFixed(1)}%`;
    return `${value.toFixed(2)}${unit}`;
  };

  const inflation = getIndicatorValue("inflation");
  const unemployment = getIndicatorValue("unemployment");
  const interestRate = getIndicatorValue("interestRate");
  const gdpGrowth = getIndicatorValue("gdpGrowth");

  return (
    <div className="country-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {country.flagUrl && (
            <img 
              src={country.flagUrl} 
              alt={`${country.name} flag`} 
              className="w-16 h-12 rounded-lg object-cover shadow-md" 
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{country.name}</h3>
            <p className="text-sm text-muted-foreground">
              Last updated: {country.lastUpdated ? new Date(country.lastUpdated).toLocaleDateString() : "Unknown"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={getStatusBadge(country.status)}>
            {getChangeIcon("up")}
            {country.status.charAt(0).toUpperCase() + country.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Inflation Rate</span>
              {inflation && (
                <span className={`text-xs ${getChangeClass(inflation.changeDirection)}`}>
                  {getChangeIcon(inflation.changeDirection)}
                  {inflation.change ? `${inflation.change > 0 ? '+' : ''}${inflation.change.toFixed(1)}%` : "0.0%"}
                </span>
              )}
            </div>
            <div className="indicator-value">
              {formatValue(inflation?.value, inflation?.unit || "%")}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Unemployment</span>
              {unemployment && (
                <span className={`text-xs ${getChangeClass(unemployment.changeDirection)}`}>
                  {getChangeIcon(unemployment.changeDirection)}
                  {unemployment.change ? `${unemployment.change > 0 ? '+' : ''}${unemployment.change.toFixed(1)}%` : "0.0%"}
                </span>
              )}
            </div>
            <div className="indicator-value">
              {formatValue(unemployment?.value, unemployment?.unit || "%")}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Interest Rate</span>
              {interestRate && (
                <span className={`text-xs ${getChangeClass(interestRate.changeDirection)}`}>
                  {getChangeIcon(interestRate.changeDirection)}
                  {interestRate.change ? `${interestRate.change > 0 ? '+' : ''}${interestRate.change.toFixed(2)}%` : "0.00%"}
                </span>
              )}
            </div>
            <div className="indicator-value">
              {formatValue(interestRate?.value, interestRate?.unit || "%")}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">GDP Growth</span>
              {gdpGrowth && (
                <span className={`text-xs ${getChangeClass(gdpGrowth.changeDirection)}`}>
                  {getChangeIcon(gdpGrowth.changeDirection)}
                  {gdpGrowth.change ? `${gdpGrowth.change > 0 ? '+' : ''}${gdpGrowth.change.toFixed(1)}%` : "0.0%"}
                </span>
              )}
            </div>
            <div className="indicator-value">
              {formatValue(gdpGrowth?.value, gdpGrowth?.unit || "%")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


