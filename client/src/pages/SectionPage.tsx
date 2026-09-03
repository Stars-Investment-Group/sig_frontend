import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Map,
  Flag,
  Radar,
  Activity,
  LineChart,
  Landmark,
  Calendar,
  Bell,
  Star,
  FileText,
  SlidersHorizontal,
  Settings,
  Globe,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  STATIC_COUNTRIES,
  STATIC_REGIMES,
  STATIC_LATEST_INDICATORS,
  STATIC_ALERTS,
} from "@/data/mockData";

/**
 * Page de section générique — sert les routes de navigation de la sidebar
 * (Regions, Countries, Regimes, Indicators, Markets, Policy, Calendar, Alerts,
 * Watchlist, Reports, Screener, Settings) avec des données statiques cohérentes.
 *
 * Phase frontend : contenu illustratif remplacé par le backend gouverné.
 */

export type SectionId =
  | "regions"
  | "countries"
  | "regimes"
  | "indicators"
  | "markets"
  | "policy"
  | "calendar"
  | "alerts"
  | "watchlist"
  | "reports"
  | "screener"
  | "settings";

const SECTION_META: Record<SectionId, { title: string; description: string; icon: React.ReactNode }> = {
  regions: { title: "Regions", description: "Snapshot des régions économiques mondiales.", icon: <Map className="h-5 w-5" /> },
  countries: { title: "Countries", description: "Suivi des économies nationales suivies.", icon: <Flag className="h-5 w-5" /> },
  regimes: { title: "Regimes", description: "Classification des régimes macroéconomiques.", icon: <Radar className="h-5 w-5" /> },
  indicators: { title: "Indicators", description: "Valeur actuelle des indicateurs macro par pays.", icon: <Activity className="h-5 w-5" /> },
  markets: { title: "Markets", description: "Synthèse des conditions de marché et liquidité.", icon: <LineChart className="h-5 w-5" /> },
  policy: { title: "Policy Tracker", description: "Suivi des décisions de politique économique.", icon: <Landmark className="h-5 w-5" /> },
  calendar: { title: "Calendar", description: "Calendrier des publications et événements macroéconomiques.", icon: <Calendar className="h-5 w-5" /> },
  alerts: { title: "Alerts", description: "Alertes économiques et signaux d'attention.", icon: <Bell className="h-5 w-5" /> },
  watchlist: { title: "Watchlist", description: "Pays et indicateurs placés sous surveillance.", icon: <Star className="h-5 w-5" /> },
  reports: { title: "Reports", description: "Rapports d'analyse et publications de recherche SIG.", icon: <FileText className="h-5 w-5" /> },
  screener: { title: "Screener", description: "Filtre avancé sur les pays par régime et risque.", icon: <SlidersHorizontal className="h-5 w-5" /> },
  settings: { title: "Settings", description: "Préférences de l'espace de travail SIG.", icon: <Settings className="h-5 w-5" /> },
};

const regimeBadge: Record<string, string> = {
  overheating: "bg-red-500/20 text-red-400 border-red-500/30",
  recession: "bg-red-600/20 text-red-300 border-red-600/30",
  transition: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  recovery: "bg-green-500/20 text-green-400 border-green-500/30",
};

const regimeLabel: Record<string, string> = {
  overheating: "Surchauffe",
  recession: "Récession",
  transition: "Transition",
  recovery: "Récupération",
};

const countryName = (code: string) =>
  STATIC_COUNTRIES.find((c) => c.code === code)?.name ?? code;

export default function SectionPage({ section }: { section: SectionId }) {
  const meta = SECTION_META[section];

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {meta.icon}
            <h1 className="text-2xl font-bold text-foreground">{meta.title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Badge variant="outline" className="border-border text-muted-foreground">
          <Globe className="mr-1 h-3 w-3" />
          Global Macro
        </Badge>
      </div>

      {/* ===== Pays ===== */}
      {(section === "countries" || section === "regions" || section === "watchlist" || section === "screener") && (
        <Card className="card-surface overflow-hidden">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Pays surveillés ({STATIC_COUNTRIES.length})
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pays</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Régime</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STATIC_COUNTRIES.map((c) => {
                  const regime = STATIC_REGIMES.find((r) => r.countryCode === c.code);
                  return (
                    <TableRow key={c.code} className="hover:bg-accent">
                      <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.code}</TableCell>
                      <TableCell className="text-muted-foreground">{regionOf(c.code)}</TableCell>
                      <TableCell>
                        <Badge className={regime ? regimeBadge[regime.regime] ?? "" : ""}>
                          {regime ? (regimeLabel[regime.regime] ?? regime.regime) : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{riskCell(regime?.riskLevel)}</TableCell>
                      <TableCell>{statusCell(c.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ===== Indicateurs ===== */}
      {section === "indicators" && (
        <Card className="card-surface overflow-hidden">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Indicateurs actuels
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pays</TableHead>
                  <TableHead>Indicateur</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead className="text-right">Variation</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STATIC_LATEST_INDICATORS.slice(0, 30).map((ind) => (
                  <TableRow key={`${ind.countryCode}-${ind.indicatorType}`} className="hover:bg-accent">
                    <TableCell className="font-medium text-foreground">{countryName(ind.countryCode)}</TableCell>
                    <TableCell className="text-muted-foreground">{indicatorLabel(ind.indicatorType)}</TableCell>
                    <TableCell className="text-right font-mono text-foreground tabular-nums">
                      {ind.value.toFixed(1)}{ind.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {changeCell(ind.changeDirection ?? "stable", ind.change ?? 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ind.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ===== Régimes ===== */}
      {section === "regimes" && (
        <Card className="card-surface overflow-hidden">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Régimes par pays ({STATIC_REGIMES.length})
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pays</TableHead>
                  <TableHead>Régime</TableHead>
                  <TableHead>Inflation</TableHead>
                  <TableHead>PIB</TableHead>
                  <TableHead>Risque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STATIC_REGIMES.map((r) => (
                  <TableRow key={r.countryCode} className="hover:bg-accent">
                    <TableCell className="font-medium text-foreground">{countryName(r.countryCode)}</TableCell>
                    <TableCell>
                      <Badge className={regimeBadge[r.regime] ?? ""}>
                        {regimeLabel[r.regime] ?? r.regime}
                      </Badge>
                    </TableCell>
                    <TableCell>{levelCell(r.inflationLevel)}</TableCell>
                    <TableCell>{levelCell(r.gdpGrowthLevel)}</TableCell>
                    <TableCell>{riskCell(r.riskLevel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ===== Alertes ===== */}
      {section === "alerts" && (
        <div className="space-y-3">
          {STATIC_ALERTS.map((a) => (
            <Card key={a.id} className="card-surface">
              <CardContent className="flex items-start gap-3 p-4">
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
                    <TrendingUp className="h-5 w-5" />
                  ) : a.alertType === "warning" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ===== Marchés ===== */}
      {section === "markets" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Point de marché</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Conditions financières — assouplissement progressif attendu avec la normalisation monétaire mondiale.
              </p>
              <div className="space-y-2">
                <MarketRow label="Zone euro (EA)" value="Euro 1.08" />
                <MarketRow label="Taux directeurs US" value="4.25%" />
                <MarketRow label="Rendement 10Y US" value="4.10%" />
                <MarketRow label="Croissance mondiale" value="3.1%" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Conditions de financement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Liquidité soutenue, primes de risque modérées sauf sur les marchés émergents (EM) à forte dette.
              </p>
              <div className="space-y-2">
                <MarketRow label="Risque EM" value="Élevé" tone="negative" />
                <MarketRow label="Liquidité mondiale" value="Normale" tone="positive" />
                <MarketRow label="Norme de financement" value="Assouplissement" tone="positive" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Policy ===== */}
      {section === "policy" && (
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Tracker de politique économique</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              La normalisation monétaire mondiale est en cours, avec des banques centrales qui assouplissent progressivement les conditions financières.
            </p>
            <div className="space-y-2 text-sm">
              <PolicyRow org="Réserve fédérale (US)" stance="Assouplissement graduel" tone="positive" />
              <PolicyRow org="BCE (UE)" stance="Direction neutre" tone="neutral" />
              <PolicyRow org="BCEAO (UEMOA)" stance="Stabilité des prix" tone="neutral" />
              <PolicyRow org="Banque d'Angleterre" stance="Modération" tone="warning" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Calendrier ===== */}
      {section === "calendar" && (
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Prochaines publications économiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <CalendarRow date="2026-08-03" label="ISM Manufacturing (US)" />
            <CalendarRow date="2026-08-07" label="PIB trimestriel (Zone euro)" />
            <CalendarRow date="2026-08-14" label="Inflation (US, CPI)" />
            <CalendarRow date="2026-08-21" label="Décision de taux (BCEAO)" />
            <CalendarRow date="2026-08-28" label="Croissance PIB (Inde)" />
          </CardContent>
        </Card>
      )}

      {/* ===== Reports ===== */}
      {section === "reports" && (
        <div className="space-y-4">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Rapports disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ReportRow title="Hausse vue — Analyse macroéconomique globale" meta="Publié · 01/08/2026" />
              <ReportRow title="Rapport inflation & taux directeurs" meta="Mensuel · Juillet 2026" />
              <ReportRow title="Perspectives marchés émergents (EM & UEMOA)" meta="Trimestriel · Q3 2026" />
              <ReportRow title="Analyse des régimes par région" meta="Généré automatiquement" />
            </CardContent>
          </Card>
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Génération de rapports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Configurez la période et les indicateurs à inclure dans le rapport.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">Période : 12 mois</Button>
                <Button variant="outline" size="sm">Indicateurs : Tous</Button>
                <Button variant="outline" size="sm">Format : PDF</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Screener ===== */}
      {section === "screener" && (
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Screener de pays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Filtre les pays selon leur régime et leur niveau de risque.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Récupération ({STATIC_REGIMES.filter((r) => r.regime === "recovery").length})</Button>
              <Button variant="outline" size="sm">Risque élevé ({STATIC_REGIMES.filter((r) => r.riskLevel === "high").length})</Button>
              <Button variant="outline" size="sm">Récession ({STATIC_REGIMES.filter((r) => r.regime === "recession").length})</Button>
              <Button variant="outline" size="sm">Risque faible ({STATIC_REGIMES.filter((r) => r.riskLevel === "low").length})</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Settings ===== */}
      {section === "settings" && (
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Paramètres de l'espace de travail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Langue principale : français</p>
              <p>• Thème : automatique (clair/sombre)</p>
              <p>• Région par défaut : Global</p>
              <p>• Notifications : activées</p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline ({meta.title}).
      </p>
    </div>
  );
}

/* ===== Helpers ===== */

function regionOf(code: string): string {
  const emea = ["UK", "EU", "FR", "DE", "IT", "ES", "ZA", "CI", "SN", "NG"];
  const americas = ["US", "CA", "BR"];
  if (emea.includes(code)) return "EMEA";
  if (americas.includes(code)) return "Amériques";
  return "APAC";
}

function indicatorLabel(type: string): string {
  const map: Record<string, string> = {
    inflation: "Inflation",
    unemployment: "Chômage",
    interestRate: "Taux intérêt",
    gdpGrowth: "Croissance PIB",
  };
  return map[type] ?? type;
}

function riskCell(risk?: string) {
  if (risk === "high") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Élevé</Badge>;
  if (risk === "medium") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Moyen</Badge>;
  if (risk === "low") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Faible</Badge>;
  return <span className="text-muted-foreground">—</span>;
}

function levelCell(level?: string) {
  if (level === "high") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Élevé</Badge>;
  if (level === "strong") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Forte</Badge>;
  if (level === "slow") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Lente</Badge>;
  if (level === "negative") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Négative</Badge>;
  if (level === "moderate") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Modérée</Badge>;
  if (level === "low") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Faible</Badge>;
  if (level === "stable") return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Stable</Badge>;
  return <span className="text-muted-foreground">—</span>;
}

function statusCell(status: string) {
  if (status === "risk") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Risque</Badge>;
  if (status === "watch") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Surveillé</Badge>;
  return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Stable</Badge>;
}

function changeCell(dir: string, val: number) {
  const cls =
    dir === "up"
      ? "text-green-600 dark:text-green-500"
      : dir === "down"
      ? "text-red-600 dark:text-red-500"
      : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${cls}`}>
      {dir === "up" ? <TrendingUp className="h-3 w-3" /> : dir === "down" ? <TrendingDown className="h-3 w-3" /> : null}
      {val > 0 ? "+" : ""}
      {val.toFixed(2)}
    </span>
  );
}

function ReportRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-muted px-3 py-2">
      <span className="font-medium text-foreground">{title}</span>
      <span className="shrink-0 text-muted-foreground">{meta}</span>
    </div>
  );
}

function MarketRow({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "positive" | "negative" | "warning" }) {
  const cls =
    tone === "positive"
      ? "text-green-600 dark:text-green-500"
      : tone === "negative"
      ? "text-red-600 dark:text-red-500"
      : tone === "warning"
      ? "text-amber-500"
      : "text-foreground";
  return (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${cls}`}>{value}</span>
    </div>
  );
}

function PolicyRow({ org, stance, tone }: { org: string; stance: string; tone: "positive" | "neutral" | "warning" }) {
  const cls =
    tone === "positive"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : tone === "warning"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
      <span className="text-foreground">{org}</span>
      <Badge className={cls}>{stance}</Badge>
    </div>
  );
}

function CalendarRow({ date, label }: { date: string; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">{date}</span>
    </div>
  );
}

