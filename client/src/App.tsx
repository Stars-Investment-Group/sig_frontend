import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import GlobalOverview from "@/pages/GlobalOverview";
import QuantitativeAnalysis from "@/pages/QuantitativeAnalysis";
import QualitativeAnalysis from "@/pages/QualitativeAnalysis";
import Rating from "@/pages/Rating";
import DataExplorer from "@/pages/DataExplorer";
import Trends from "@/pages/Trends";
import AppLayout from "@/components/layout/AppLayout";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={GlobalOverview} />
        <Route path="/quantitative" component={QuantitativeAnalysis} />
        <Route path="/qualitative" component={QualitativeAnalysis} />
        <Route path="/rating" component={Rating} />
        <Route path="/trends" component={Trends} />
        <Route path="/data" component={DataExplorer} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
