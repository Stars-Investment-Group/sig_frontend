import { Suspense, lazy, useEffect, useMemo } from "react";
import { useLocation, useParams, useSearchParams } from "wouter";
import { ChevronDown, Download, GitCompare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";
import { COUNTRY_TABS, DEFAULT_TAB, isCountryTab } from "@/components/country/tabs";
import { getCountryProfile } from "@/data/countryProfile";
import { STATIC_COUNTRIES } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Fiche pays — conteneur à onglets.
 *
 * Le pays **et** l'onglet vivent dans l'URL (`/countries/:code/:tab`) : un lien
 * partagé rouvre exactement la même vue, et la recherche globale peut pointer
 * sur un onglet précis. Les anciens liens `?code=XXX` restent honorés puis
 * réécrits vers la forme canonique.
 */

/** Pays affiché par défaut — le pays vitrine des maquettes. */
const DEFAULT_COUNTRY = "CIV";

const SummaryTab = lazy(() =>
  import("@/components/country/SummaryTab").then((m) => ({ default: m.SummaryTab }))
);
const NotationRiskTab = lazy(() =>
  import("@/components/country/NotationRiskTab").then((m) => ({ default: m.NotationRiskTab }))
);
const QuantitativeTab = lazy(() =>
  import("@/components/country/QuantitativeTab").then((m) => ({ default: m.QuantitativeTab }))
);
const QualitativeTab = lazy(() =>
  import("@/components/country/QualitativeTab").then((m) => ({ default: m.QualitativeTab }))
);
const ForecastsTab = lazy(() =>
  import("@/components/country/ForecastsTab").then((m) => ({ default: m.ForecastsTab }))
);
const TrendsTab = lazy(() =>
  import("@/components/country/TrendsTab").then((m) => ({ default: m.TrendsTab }))
);

export function CountriesPage() {
  const params = useParams<{ code?: string; tab?: string }>();
  const [searchParams] = useSearchParams();
  const [location, navigate] = useLocation();
  const { t } = useI18n();

  // `?code=` est l'ancienne forme : on la lit encore, puis on la réécrit.
  const requested = (params.code ?? searchParams.get("code") ?? DEFAULT_COUNTRY).toUpperCase();
  const country =
    STATIC_COUNTRIES.find((c) => c.code === requested) ??
    STATIC_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY) ??
    STATIC_COUNTRIES[0];

  const tab = isCountryTab(params.tab) ? (params.tab as string) : DEFAULT_TAB;
  const canonical = `/countries/${country.code}/${tab}`;

  // Toute URL incomplète ou inconnue converge vers la forme canonique.
  useEffect(() => {
    const [path] = location.split("?");
    if (path !== canonical) navigate(canonical, { replace: true });
  }, [canonical, location, navigate]);

  const profile = useMemo(() => getCountryProfile(country.code), [country.code]);

  return (
    <div className="space-y-6">
      <CountryHeader
        code={country.code}
        name={country.name}
        region={country.region}
        subregion={country.subregion}
        incomeLevel={country.incomeLevel}
        lastUpdated={profile.lastUpdated}
        onSelect={(code) => navigate(`/countries/${code}/${tab}`)}
        onCompare={(code) => navigate(`/compare?codes=${comparisonCodes(code)}`)}
      />

      <CountryTabBar active={tab} countryCode={country.code} t={t} />

      <Suspense fallback={<TabLoader />}>
        {tab === "summary" && <SummaryTab profile={profile} />}
        {tab === "notation" && <NotationRiskTab profile={profile} />}
        {tab === "quantitative" && <QuantitativeTab profile={profile} />}
        {tab === "qualitative" && <QualitativeTab profile={profile} />}
        {tab === "forecasts" && <ForecastsTab profile={profile} />}
        {tab === "trends" && <TrendsTab profile={profile} />}
      </Suspense>
    </div>
  );
}

/**
 * Sélection de départ d'une comparaison lancée depuis la fiche pays : le pays
 * courant, puis ses pairs de même région. C'est la question qu'on se pose en
 * arrivant depuis une fiche — « comment se situe-t-il chez lui ? ».
 */
function comparisonCodes(code: string): string {
  const country = STATIC_COUNTRIES.find((c) => c.code === code);
  const peers = STATIC_COUNTRIES.filter(
    (c) => c.region === country?.region && c.code !== code
  ).slice(0, 3);
  return [code, ...peers.map((p) => p.code)].join(",");
}

/* =========================================================================
 * En-tête pays
 * ========================================================================= */

function CountryHeader({
  code,
  name,
  region,
  subregion,
  incomeLevel,
  lastUpdated,
  onSelect,
  onCompare,
}: {
  code: string;
  name: string;
  region: string;
  subregion: string | null;
  incomeLevel: string | null;
  lastUpdated: Date;
  onSelect: (code: string) => void;
  onCompare: (code: string) => void;
}) {
  const tags = [region, subregion, incomeLevel ? `${incomeLevel} income` : null].filter(
    Boolean
  ) as string[];

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {/* Surtitre de la planche P2 : la page se nomme avant le pays. */}
        <p className="text-sm font-medium text-muted-foreground">Country Overview</p>
        <div className="mt-1 flex min-w-0 items-center gap-3">
          <Flag code={code} size={36} />
          <h1 className="truncate text-2xl font-bold text-foreground">{name}</h1>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          {tags.map((tag, i) => (
            <span key={tag} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">·</span>}
              {tag}
            </span>
          ))}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* La maquette pose la date comme un bloc libelle, pas comme une phrase. */}
        <div className="leading-tight">
          <p className="text-[11px] text-muted-foreground">Latest Update</p>
          <p className="text-sm font-medium text-foreground">
            {lastUpdated.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="relative">
          <select
            value={code}
            onChange={(e) => onSelect(e.target.value)}
            aria-label="Choisir un pays"
            className="appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {STATIC_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onCompare(code)}
          title="Comparer ce pays à ses pairs"
        >
          <GitCompare className="h-4 w-4" /> Comparer
        </Button>
        <Button size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </div>
  );
}

/* =========================================================================
 * Barre d'onglets
 * ========================================================================= */

function CountryTabBar({
  active,
  countryCode,
  t,
}: {
  active: string;
  countryCode: string;
  t: (key: string) => string;
}) {
  const [, navigate] = useLocation();

  return (
    <div
      role="tablist"
      aria-label="Sections de la fiche pays"
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1"
    >
      {COUNTRY_TABS.map((item) => {
        const selected = item.slug === active;
        const Icon = item.icon;
        const label = t(item.i18nKey);
        return (
          <button
            key={item.slug}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => navigate(`/countries/${countryCode}/${item.slug}`)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
              selected
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label === item.i18nKey ? item.label : label}
          </button>
        );
      })}
    </div>
  );
}

function TabLoader() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement de l'onglet">
      <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
