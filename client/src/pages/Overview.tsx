import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, TrendingUp, AlertTriangle, Activity, Newspaper } from "lucide-react";
import { STATIC_COUNTRIES, STATIC_REGIMES, STATIC_ALERTS } from "@/data/mockData";

/* =========================================================================
 * Overview — Synthèse exécutive du tracker global (frontend statique).
 * Remplace l'implémentation API-dépendante par des données statiques,
 * le tout cohérent avec la maquette institutionnelle SIG.
 * ========================================================================= */

const regimeLabel: Record<string, string> = {
  overheating: "Surchauffe",
  recession: "Récession",
  transition: "Transition",
  recovery: "Récupération",
};

export default function Overview() {
  const countries = STATIC_COUNTRIES;
  const regimes = STATIC_REGIMES;

  const total = countries.length;
  const riskHigh = regimes.filter((r) => r.riskLevel === "high").length;
  const recovery = regimes.filter((r) => r.regime === "recovery").length;
  const recession = regimes.filter((r) => r.regime === "recession").length;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Aperçu économique mondial</h2>
        <p className="text-muted-foreground">
          Synthèse des régimes macroéconomiques et des principaux signaux par pays.
        </p>
      </div>

      {/* ===== Statistiques globales ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <Globe className="mr-2 h-4 w-4" /> Pays surveillés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{total}</div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <AlertTriangle className="mr-2 h-4 w-4" /> Risque élevé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{riskHigh}</div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <TrendingUp className="mr-2 h-4 w-4" /> En récupération
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{recovery}</div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
              <Activity className="mr-2 h-4 w-4" /> En récession
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{recession}</div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Résumé des régimes ===== */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center text-base font-semibold text-foreground">
            <Globe className="mr-2 h-5 w-5" /> Cartographie des régimes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regimes.map((r) => {
            const c = countries.find((x) => x.code === r.countryCode);
            return (
              <div
                key={r.countryCode}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{c?.name ?? r.countryCode}</span>
                <Badge
                  className={
                    r.regime === "recovery"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : r.regime === "recession"
                      ? "bg-red-600/20 text-red-300 border-red-600/30"
                      : r.regime === "overheating"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }
                >
                  {regimeLabel[r.regime] ?? r.regime}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ===== Alertes récentes ===== */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center text-base font-semibold text-foreground">
            <Newspaper className="mr-2 h-5 w-5" /> Dernières alertes économiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STATIC_ALERTS.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-md bg-muted p-3">
              <span
                className={
                  a.alertType === "positive"
                    ? "text-green-500"
                    : a.alertType === "warning"
                    ? "text-amber-500"
                    : "text-blue-500"
                }
              >
                {a.alertType === "positive" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : a.alertType === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}
