import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import AppLayout from "@/components/layout/AppLayout";

/* ===== Code-splitting : chaque page est chargée à la demande
   (améliore nettement le temps de chargement initial et le bundle) ===== */
const GlobalOverview = lazy(() => import("@/pages/GlobalOverview"));
const QuantitativeAnalysis = lazy(() => import("@/pages/QuantitativeAnalysis"));
const QualitativeAnalysis = lazy(() => import("@/pages/QualitativeAnalysis"));
const Rating = lazy(() => import("@/pages/Rating"));
const DataExplorer = lazy(() => import("@/pages/DataExplorer"));
const Trends = lazy(() => import("@/pages/Trends"));
const Overview = lazy(() => import("@/pages/Overview"));
const SectionPage = lazy(() => import("@/pages/SectionPage"));
const RegionsPage = lazy(() =>
  import("@/components/dashboard/RegionsPage").then((m) => ({ default: m.RegionsPage }))
);
const CountriesPage = lazy(() =>
  import("@/components/dashboard/CountriesPage").then((m) => ({ default: m.CountriesPage }))
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

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={GlobalOverview} />
          <Route path="/overview" component={Overview} />
          <Route path="/quantitative" component={QuantitativeAnalysis} />
          <Route path="/qualitative" component={QualitativeAnalysis} />
          <Route path="/rating" component={Rating} />
          <Route path="/trends" component={Trends} />
          <Route path="/data" component={DataExplorerPage} />

          {/* Sections de navigation (sidebar) — data statiques */}
          <Route path="/regions">
            <RegionsPage />
          </Route>
          <Route path="/countries">
            <CountriesPage />
          </Route>
          <Route path="/regimes">
            <SectionPage section="regimes" />
          </Route>
          <Route path="/indicators">
            <IndicatorsPage />
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

