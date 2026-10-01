import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import AppLayout from "@/components/layout/AppLayout";

/* ===== Code-splitting : chaque page est chargée à la demande
   (améliore nettement le temps de chargement initial et le bundle) ===== */
const GlobalOverview = lazy(() => import("@/pages/GlobalOverview"));
const Overview = lazy(() => import("@/pages/Overview"));
const SectionPage = lazy(() => import("@/pages/SectionPage"));
const RegionsPage = lazy(() =>
  import("@/components/dashboard/RegionsPage").then((m) => ({ default: m.RegionsPage }))
);
const CountriesPage = lazy(() =>
  import("@/components/dashboard/CountriesPage").then((m) => ({ default: m.CountriesPage }))
);
const ThemesPage = lazy(() =>
  import("@/components/dashboard/ThemesPage").then((m) => ({ default: m.ThemesPage }))
);
const ComparePage = lazy(() =>
  import("@/components/dashboard/ComparePage").then((m) => ({ default: m.ComparePage }))
);
const DataExplorerPage = lazy(() =>
  import("@/components/dashboard/DataExplorerPage").then((m) => ({ default: m.DataExplorerPage }))
);
const IndicatorsPage = lazy(() =>
  import("@/components/dashboard/IndicatorsPage").then((m) => ({ default: m.IndicatorsPage }))
);
const MarketsPage = lazy(() =>
  import("@/components/dashboard/MarketsPage").then((m) => ({ default: m.MarketsPage }))
);
const PolicyTrackerPage = lazy(() =>
  import("@/components/dashboard/PolicyTrackerPage").then((m) => ({ default: m.PolicyTrackerPage }))
);
const CalendarPage = lazy(() =>
  import("@/components/dashboard/CalendarPage").then((m) => ({ default: m.CalendarPage }))
);
const AlertsPage = lazy(() =>
  import("@/components/dashboard/AlertsPage").then((m) => ({ default: m.AlertsPage }))
);
const WatchlistPage = lazy(() =>
  import("@/components/dashboard/WatchlistPage").then((m) => ({ default: m.WatchlistPage }))
);
const ReportsPage = lazy(() =>
  import("@/components/dashboard/ReportsPage").then((m) => ({ default: m.ReportsPage }))
);
const ScreenerPage = lazy(() =>
  import("@/components/dashboard/ScreenerPage").then((m) => ({ default: m.ScreenerPage }))
);
const SettingsPage = lazy(() =>
  import("@/components/dashboard/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const NotFound = lazy(() => import("@/pages/not-found"));

/** Fallback de chargement léger affiché pendant le lazy-load d'une page. */
function PageLoader() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de la page">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}

/** Pays d'atterrissage des anciennes routes sans code pays. */
const LEGACY_COUNTRY = "CIV";

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={GlobalOverview} />
          <Route path="/overview" component={Overview} />
          {/* Anciennes pages autonomes, remplacees par les onglets de la fiche
              pays. Elles restent adressables et redirigent vers l'onglet reel. */}
          <Route path="/quantitative">
            <Redirect to={`/countries/${LEGACY_COUNTRY}/quantitative`} replace />
          </Route>
          <Route path="/qualitative">
            <Redirect to={`/countries/${LEGACY_COUNTRY}/qualitative`} replace />
          </Route>
          <Route path="/rating">
            <Redirect to={`/countries/${LEGACY_COUNTRY}/notation`} replace />
          </Route>
          <Route path="/trends">
            <Redirect to={`/countries/${LEGACY_COUNTRY}/trends`} replace />
          </Route>
          <Route path="/data" component={DataExplorerPage} />

          {/* Sections de navigation (sidebar) — data statiques */}
          <Route path="/regions">
            <RegionsPage />
          </Route>
          {/* Fiche pays : le pays et l'onglet vivent dans l'URL. Les trois
              formes convergent vers /countries/:code/:tab dans le composant. */}
          <Route path="/countries">
            <CountriesPage />
          </Route>
          <Route path="/countries/:code">
            <CountriesPage />
          </Route>
          <Route path="/countries/:code/:tab">
            <CountriesPage />
          </Route>
          {/* Comparaison multi-pays : la selection vit dans `?codes=`.
              Aucune entree de sidebar — la nav du Menu Bar PDF fait foi ; la
              page s'atteint depuis la fiche pays et le screener. */}
          <Route path="/compare">
            <ComparePage />
          </Route>
          <Route path="/regimes">
            <SectionPage section="regimes" />
          </Route>
          <Route path="/indicators">
            <IndicatorsPage />
          </Route>
          {/* Themes Explorer (module 11). Le theme ouvert vit dans `?code=`,
              donc le drill-down est partageable. */}
          <Route path="/themes">
            <ThemesPage />
          </Route>
          <Route path="/markets">
            <MarketsPage />
          </Route>
          <Route path="/policy">
            <PolicyTrackerPage />
          </Route>
          <Route path="/calendar">
            <CalendarPage />
          </Route>
          <Route path="/alerts">
            <AlertsPage />
          </Route>
          <Route path="/watchlist">
            <WatchlistPage />
          </Route>
          <Route path="/reports">
            <ReportsPage />
          </Route>
          <Route path="/screener">
            <ScreenerPage />
          </Route>
          <Route path="/settings">
            <SettingsPage />
          </Route>

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;

