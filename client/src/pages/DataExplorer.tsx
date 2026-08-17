import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { EconomicIndicator, Country } from "@shared/schema";
import { exportCsv } from "@/utils/exportCsv";

export default function DataExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedIndicator, setSelectedIndicator] = useState("all");

  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: indicators, isLoading } = useQuery<EconomicIndicator[]>({
    queryKey: ["/api/indicators/latest"],
  });

  const filteredData = indicators?.filter((indicator) => {
    const matchesSearch = searchTerm === "" ||
      indicator.indicatorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.countryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = selectedCountry === "all" || indicator.countryCode === selectedCountry;
    const matchesIndicator = selectedIndicator === "all" || indicator.indicatorType === selectedIndicator;

    return matchesSearch && matchesCountry && matchesIndicator;
  }) || [];

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
        return "text-red-400";
      case "down":
        return "text-emerald-400";
      default:
        return "text-amber-400";
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit === "B") return `$${value.toFixed(1)}B`;
    if (unit === "K") return `${value.toFixed(1)}K`;
    return `${value.toFixed(2)}${unit}`;
  };

  const getCountryName = (code: string) => {
    return countries?.find(c => c.code === code)?.name || code;
  };

  const getIndicatorDisplayName = (type: string) => {
    const names = {
      inflation: "Inflation Rate",
      unemployment: "Unemployment Rate",
      interestRate: "Interest Rate",
      gdpGrowth: "GDP Growth",
      consumerSpending: "Consumer Spending",
      industrialProduction: "Industrial Production",
      tradeBalance: "Trade Balance",
      housingStarts: "Housing Starts",
      retailSales: "Retail Sales",
      businessConfidence: "Business Confidence"
    };
    return names[type as keyof typeof names] || type;
  };

  const handleExport = () => {
    if (!filteredData.length) return;

    const rows = filteredData.map((indicator) => ({
      country: getCountryName(indicator.countryCode),
      indicator: getIndicatorDisplayName(indicator.indicatorType),
      date: new Date(indicator.date).toISOString().split("T")[0],
      value: indicator.value,
      unit: indicator.unit,
      change: indicator.change ?? 0,
      changeDirection: indicator.changeDirection ?? "stable",
      source: indicator.source,
    }));

    const dateStamp = new Date().toISOString().split("T")[0];
    exportCsv(rows, `economic-data-${dateStamp}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Data Explorer</h2>
        <p className="text-muted-foreground">Search and filter macroeconomic data from various sources</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="card-surface rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label className="text-muted-foreground mb-2">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search indicators, countries, or sources..."
                className="pl-10 bg-popover border-border text-popover-foreground text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground mb-2">Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="bg-popover border-border text-popover-foreground text-foreground focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all" className="text-foreground focus:bg-muted">All Countries</SelectItem>
                {countries?.map((country) => (
                  <SelectItem key={country.code} value={country.code} className="text-foreground focus:bg-muted">
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground mb-2">Indicator</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger className="bg-popover border-border text-popover-foreground text-foreground focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all" className="text-foreground focus:bg-muted">All Indicators</SelectItem>
                <SelectItem value="inflation" className="text-foreground focus:bg-muted">Inflation Rate</SelectItem>
                <SelectItem value="unemployment" className="text-foreground focus:bg-muted">Unemployment Rate</SelectItem>
                <SelectItem value="interestRate" className="text-foreground focus:bg-muted">Interest Rate</SelectItem>
                <SelectItem value="gdpGrowth" className="text-foreground focus:bg-muted">GDP Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Date Range:</span>
            <Input
              type="date"
              className="px-3 py-1 bg-popover border-border text-popover-foreground text-foreground text-sm focus:ring-primary focus:border-transparent w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              className="px-3 py-1 bg-popover border-border text-popover-foreground text-foreground text-sm focus:ring-primary focus:border-transparent w-auto"
            />
          </div>
          <Button onClick={handleExport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export CSV/Excel
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="card-surface rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Economic Data</h3>
            <span className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {indicators?.length || 0} records
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground font-medium cursor-pointer hover:text-foreground">
                    Country
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium cursor-pointer hover:text-foreground">
                    Indicator
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium cursor-pointer hover:text-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium cursor-pointer hover:text-foreground">
                    Value
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium">
                    Change
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Source
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((indicator) => (
                  <TableRow key={indicator.id} className="border-border hover:bg-accent transition-colors duration-200">
                    <TableCell className="text-foreground">{getCountryName(indicator.countryCode)}</TableCell>
                    <TableCell className="text-muted-foreground">{getIndicatorDisplayName(indicator.indicatorType)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(indicator.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-mono">
                      {formatValue(indicator.value, indicator.unit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`flex items-center justify-end ${getChangeClass(indicator.changeDirection)}`}>
                        {getChangeIcon(indicator.changeDirection)}
                        {indicator.change ? `${indicator.change > 0 ? '+' : ''}${indicator.change.toFixed(1)}%` : "0.0%"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{indicator.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && filteredData.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No data found matching your criteria.</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing 1 to {filteredData.length} of {filteredData.length} entries
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


