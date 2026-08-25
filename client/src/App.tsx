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
          <Route path="/data" component={DataExplorer} />

          {/* Sections de navigation (sidebar) — data statiques */}
          <Route path="/regions">
            <SectionPage section="regions" />
          </Route>
          <Route path="/countries">
            <SectionPage section="countries" />
          </Route>
          <Route path="/regimes">
            <SectionPage section="regimes" />
          </Route>
          <Route path="/indicators">
            <SectionPage section="indicators" />
          </Route>
          <Route path="/markets">
            <SectionPage section="markets" />
          </Route>
          <Route path="/policy">
            <SectionPage section="policy" />
          </Route>
          <Route path="/calendar">
            <SectionPage section="calendar" />
          </Route>
          <Route path="/alerts">
            <SectionPage section="alerts" />
          </Route>
          <Route path="/watchlist">
            <SectionPage section="watchlist" />
          </Route>
          <Route path="/screener">
            <SectionPage section="screener" />
          </Route>
          <Route path="/settings">
            <SectionPage section="settings" />
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

