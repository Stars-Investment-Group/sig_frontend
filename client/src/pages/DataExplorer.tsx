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
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Data Explorer</h2>
        <p className="text-slate-400">Search and filter macroeconomic data from various sources</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label className="text-slate-300 mb-2">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search indicators, countries, or sources..."
                className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-300 mb-2">Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all" className="text-slate-100 focus:bg-slate-600">All Countries</SelectItem>
                {countries?.map((country) => (
                  <SelectItem key={country.code} value={country.code} className="text-slate-100 focus:bg-slate-600">
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 mb-2">Indicator</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all" className="text-slate-100 focus:bg-slate-600">All Indicators</SelectItem>
                <SelectItem value="inflation" className="text-slate-100 focus:bg-slate-600">Inflation Rate</SelectItem>
                <SelectItem value="unemployment" className="text-slate-100 focus:bg-slate-600">Unemployment Rate</SelectItem>
                <SelectItem value="interestRate" className="text-slate-100 focus:bg-slate-600">Interest Rate</SelectItem>
                <SelectItem value="gdpGrowth" className="text-slate-100 focus:bg-slate-600">GDP Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">Date Range:</span>
            <Input
              type="date"
              className="px-3 py-1 bg-slate-700 border-slate-600 text-slate-100 text-sm focus:ring-primary focus:border-transparent w-auto"
            />
            <span className="text-slate-400">to</span>
            <Input
              type="date"
              className="px-3 py-1 bg-slate-700 border-slate-600 text-slate-100 text-sm focus:ring-primary focus:border-transparent w-auto"
            />
          </div>
          <Button onClick={handleExport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export CSV/Excel
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Economic Data</h3>
            <span className="text-sm text-slate-400">
              Showing {filteredData.length} of {indicators?.length || 0} records
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300 font-medium cursor-pointer hover:text-slate-100">
                    Country
                  </TableHead>
                  <TableHead className="text-slate-300 font-medium cursor-pointer hover:text-slate-100">
                    Indicator
                  </TableHead>
                  <TableHead className="text-slate-300 font-medium cursor-pointer hover:text-slate-100">
                    Date
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-medium cursor-pointer hover:text-slate-100">
                    Value
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-medium">
                    Change
                  </TableHead>
                  <TableHead className="text-slate-300 font-medium">
                    Source
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((indicator) => (
                  <TableRow key={indicator.id} className="border-slate-700 hover:bg-slate-700 transition-colors duration-200">
                    <TableCell className="text-slate-100">{getCountryName(indicator.countryCode)}</TableCell>
                    <TableCell className="text-slate-300">{getIndicatorDisplayName(indicator.indicatorType)}</TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(indicator.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-100 text-right font-mono">
                      {formatValue(indicator.value, indicator.unit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`flex items-center justify-end ${getChangeClass(indicator.changeDirection)}`}>
                        {getChangeIcon(indicator.changeDirection)}
                        {indicator.change ? `${indicator.change > 0 ? '+' : ''}${indicator.change.toFixed(1)}%` : "0.0%"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{indicator.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && filteredData.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-400">No data found matching your criteria.</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Showing 1 to {filteredData.length} of {filteredData.length} entries
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled className="text-slate-400">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled className="text-slate-400">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
