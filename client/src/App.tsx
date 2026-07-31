import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/Overview";
import QuantitativeAnalysis from "./pages/QuantitativeAnalysis";
import QualitativeAnalysis from "./pages/QualitativeAnalysis";
import Rating from "./pages/Rating";
import DataExplorer from "@/pages/DataExplorer";
import Trends from "@/pages/Trends";
import NavTabs from "@/components/NavTabs";

function Router() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <NavTabs />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/" component={Overview} />
          <Route path="/quantitative" component={QuantitativeAnalysis} />
          <Route path="/qualitative" component={QualitativeAnalysis} />
          <Route path="/rating" component={Rating} />
          <Route path="/trends" component={Trends} />
          <Route path="/data" component={DataExplorer} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
