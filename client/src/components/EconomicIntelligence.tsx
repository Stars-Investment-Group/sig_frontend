import { useQuery } from "@tanstack/react-query";
import { Info, AlertTriangle, TrendingUp } from "lucide-react";
import type { EconomicAlert } from "@shared/schema";

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case "info":
      return Info;
    case "warning":
      return AlertTriangle;
    case "positive":
      return TrendingUp;
    default:
      return Info;
  }
};

const getAlertClass = (alertType: string) => {
  switch (alertType) {
    case "info":
      return "alert-info";
    case "warning":
      return "alert-warning";
    case "positive":
      return "alert-positive";
    default:
      return "alert-info";
  }
};

export default function EconomicIntelligence() {
  const { data: alerts, isLoading, error } = useQuery<EconomicAlert[]>({
    queryKey: ["/api/alerts"],
  });

  if (isLoading) {
    return (
      <div className="card-surface rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Economic Intelligence</h3>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 p-4 bg-muted rounded-lg animate-pulse">
              <div className="w-5 h-5 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Economic Intelligence</h3>
          <span className="text-sm text-red-400">Error loading alerts</span>
        </div>
        <p className="text-muted-foreground">Unable to load economic intelligence alerts.</p>
      </div>
    );
  }

  return (
    <div className="card-surface rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Economic Intelligence</h3>
        <span className="text-sm text-muted-foreground">
          Last analysis: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      <div className="space-y-4">
        {alerts?.map((alert) => {
          const Icon = getAlertIcon(alert.alertType);
          return (
            <div key={alert.id} className={`flex items-start space-x-3 p-4 rounded-lg ${getAlertClass(alert.alertType)}`}>
              <Icon className="w-5 h-5 mt-1" />
              <div>
                <h4 className="font-medium mb-1">{alert.title}</h4>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


