import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { exportCsv } from "@/utils/exportCsv";
import {
  filterMacro,
  sortMacro,
  getCountries,
  getLatestIndicators,
  INDICATOR_LABELS,
  type MacroRecord,
  type MacroSortKey,
} from "@/services/macro";

/* =========================================================================
 * Page Macro — Explorateur de données (filtres + tri + pagination).
 * Conforme à la maquette : contrôleurs de filtres en haut, table paginée,
 * nombre d'entrées par page, navigation préc./suiv., export CSV.
 * ========================================================================= */

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

type Direction = "asc" | "desc" | null;

export default function DataExplorer() {
  // ---- Filtres ----
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedIndicator, setSelectedIndicator] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ---- Pagination & tri ----
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<MacroSortKey | null>(null);
  const [sortDir, setSortDir] = useState<Direction>(null);

  // ---- Data (statique) ----
  const [records, setRecords] = useState<MacroRecord[]>([]);
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simule un micro-latence réseau pour un affichage réaliste de chargement
    const timer = setTimeout(() => {
      setRecords(getLatestIndicators());
      setCountries(getCountries());
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ---- Filtrage & tri (mémoïsés) ----
  const filtered = useMemo(
    () =>
      filterMacro(records, {
        search: searchTerm,
        countryCode: selectedCountry,
        indicatorType: selectedIndicator,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    [records, searchTerm, selectedCountry, selectedIndicator, dateFrom, dateTo]
  );

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return sortMacro(filtered, sortKey, sortDir);
  }, [filtered, sortKey, sortDir]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset de la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCountry, selectedIndicator, dateFrom, dateTo, pageSize]);

  /** Bascule le tri d'une colonne (asc → desc → off). */
  const toggleSort = (key: MacroSortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const SortIcon = ({ column }: { column: MacroSortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />
    );
  };

  const handleExport = () => {
    if (!sorted.length) return;
    const rows = sorted.map((r) => ({
      country: r.countryName,
      indicator: r.indicatorLabel,
      date: r.date,
      value: r.value,
      unit: r.unit,
      change: r.change,
      source: r.source,
    }));
    const dateStamp = new Date().toISOString().slice(0, 10);
    exportCsv(rows, `macroeconomics-${dateStamp}`);
  };

  // Fenêtre de pagination compacte (avec ellipses)
  const pageWindow = useMemo(() => {
    const pages: Array<number | string> = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, safePage]);

  const firstEntry = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastEntry = Math.min(safePage * pageSize, sorted.length);
  const isFiltered =
    searchTerm !== "" ||
    selectedCountry !== "all" ||
    selectedIndicator !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="space-y-6">
      {/* ===== En-tête de page ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Macro Data Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, sort and export macroeconomic indicators across countries and sources.
          </p>
        </div>
        <Button onClick={handleExport} disabled={!sorted.length}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV/Excel
        </Button>
      </div>

      {/* ===== Contrôleurs de filtres ===== */}
      <Card className="card-surface p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Recherche */}
          <div className="lg:col-span-1">
            <Label className="text-muted-foreground" htmlFor="macro-search">Search</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="macro-search"
                placeholder="Country or indicator..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Pays */}
          <div>
            <Label className="text-muted-foreground">Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Indicateur */}
          <div>
            <Label className="text-muted-foreground">Indicator</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="All indicators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All indicators</SelectItem>
                {Object.entries(INDICATOR_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plage de dates */}
          <div>
            <Label className="text-muted-foreground">Date range</Label>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From" className="text-xs" />
              <span className="text-muted-foreground">→</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To" className="text-xs" />
            </div>
          </div>
        </div>
      </Card>

      {/* ===== Table + pagination ===== */}
      <Card className="card-surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Economic Data</h3>
          <span className="text-sm text-muted-foreground">
            {sorted.length} record{sorted.length !== 1 ? "s" : ""}
            {isFiltered ? ` (filtered from ${records.length})` : ""}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading macro data…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {(
                    [
                      { key: "countryName", label: "Country" },
                      { key: "indicatorLabel", label: "Indicator" },
                      { key: "date", label: "Date" },
                      { key: "value", label: "Value", right: true },
                      { key: "change", label: "Change", right: true },
                      { key: "source", label: "Source" },
                    ] as Array<{ key: MacroSortKey; label: string; right?: boolean }>
                  ).map(({ key, label, right }) => (
                    <TableHead
                      key={key}
                      className={`cursor-pointer select-none font-medium hover:text-foreground ${right ? "text-right" : ""}`}
                      onClick={() => toggleSort(key)}
                      aria-sort={
                        sortKey === key
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      {label}
                      <SortIcon column={key} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((r) => {
                  const dir = r.changeDirection;
                  return (
                    <TableRow key={r.id} className="transition-colors hover:bg-accent">
                      <TableCell className="font-medium text-foreground">{r.countryName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.indicatorLabel}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{r.date}</TableCell>
                      <TableCell className="text-right font-mono text-foreground tabular-nums">
                        {formatValue(r.value, r.unit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 tabular-nums ${
                            dir === "up"
                              ? "text-green-600 dark:text-green-500"
                              : dir === "down"
                              ? "text-red-600 dark:text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {dir === "up" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : dir === "down" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : null}
                          {r.change > 0 ? "+" : ""}
                          {r.change.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.source}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <p>No data matching your filters. Try adjusting the criteria.</p>
          </div>
        )}

        {/* ==== Pagination fonctionnelle ==== */}
        {!loading && sorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>
                {firstEntry}-{lastEntry} of {sorted.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={safePage <= 1}
                onClick={() => setPage(1)}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageWindow.map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safePage ? "default" : "outline"}
                    size="sm"
                    className={p === safePage ? "" : "text-muted-foreground"}
                    onClick={() => setPage(Number(p))}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function formatValue(value: number, unit: string): string {
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "$B") return `$${value.toFixed(1)}B`;
  if (unit === "K") return `${value.toFixed(1)}K`;
  return `${value.toFixed(2)}${unit}`;
}
