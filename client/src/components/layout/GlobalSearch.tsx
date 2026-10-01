import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Search, CornerDownLeft } from "lucide-react";
import { Flag } from "@/components/Flag";
import { STATIC_COUNTRIES } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Recherche globale de l'en-tête : pays, indicateurs et pages.
 * S'appuie sur le jeu statique ; la même interface acceptera les résultats
 * du backend (modules Countries / Macro Indicators) sans changer l'UI.
 */

interface Result {
  id: string;
  label: string;
  group: string;
  href: string;
  countryCode?: string;
}

const INDICATORS: { key: string; label: string }[] = [
  { key: "cpi_inflation", label: "Inflation (CPI)" },
  { key: "unemployment_rate", label: "Chômage" },
  { key: "policy_rate", label: "Taux directeur" },
  { key: "real_gdp_growth", label: "Croissance du PIB" },
];

const PAGES: { label: string; href: string }[] = [
  { label: "Global Overview", href: "/" },
  { label: "Regions", href: "/regions" },
  { label: "Countries", href: "/countries" },
  { label: "Compare Countries", href: "/compare" },
  { label: "Regimes", href: "/regimes" },
  { label: "Indicators", href: "/indicators" },
  { label: "Markets", href: "/markets" },
  { label: "Themes Explorer", href: "/themes" },
  { label: "Policy Tracker", href: "/policy" },
  { label: "Calendar", href: "/calendar" },
  { label: "Alerts", href: "/alerts" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Reports", href: "/reports" },
  { label: "Data Explorer", href: "/data" },
  { label: "Screener", href: "/screener" },
  { label: "Settings", href: "/settings" },
];

/** Minuscule sans accents, pour une comparaison tolérante. */
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const MAX_RESULTS = 8;

export function GlobalSearch() {
  const [, navigate] = useLocation();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const index = useMemo<Result[]>(
    () => [
      ...STATIC_COUNTRIES.map((c) => ({
        id: `country-${c.code}`,
        label: c.name,
        group: "Pays",
        href: `/countries/${c.code}/summary`,
        countryCode: c.code,
      })),
      ...INDICATORS.map((i) => ({
        id: `indicator-${i.key}`,
        label: i.label,
        group: "Indicateurs",
        href: `/indicators?type=${i.key}`,
      })),
      ...PAGES.map((p) => ({
        id: `page-${p.href}`,
        label: p.label,
        group: "Pages",
        href: p.href,
      })),
    ],
    []
  );

  const results = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return [];
    return index.filter((r) => fold(r.label).includes(needle)).slice(0, MAX_RESULTS);
  }, [index, query]);

  useEffect(() => setHighlight(0), [query]);

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const select = (result: Result) => {
    navigate(result.href);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      event.currentTarget.blur();
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(results[highlight]);
    }
  };

  const showPanel = open && query.trim().length > 0;
  let lastGroup = "";

  return (
    <div ref={containerRef} className="relative mx-2 w-full max-w-md md:mx-4">
      <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={t("header.search")}
        className="w-full rounded-full border border-input bg-slate-50 py-2 pl-4 pr-9 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:border-slate-700 dark:bg-slate-800"
      />

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              Aucun résultat pour « {query} »
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result, i) => {
                const newGroup = result.group !== lastGroup;
                lastGroup = result.group;
                return (
                  <li key={result.id}>
                    {newGroup && (
                      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {result.group}
                      </p>
                    )}
                    <button
                      role="option"
                      aria-selected={i === highlight}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => select(result)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground",
                        i === highlight ? "bg-accent" : "hover:bg-accent/60"
                      )}
                    >
                      {result.countryCode && <Flag code={result.countryCode} size={16} />}
                      <span className="flex-1 truncate">{result.label}</span>
                      {i === highlight && (
                        <CornerDownLeft className="h-3 w-3 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
