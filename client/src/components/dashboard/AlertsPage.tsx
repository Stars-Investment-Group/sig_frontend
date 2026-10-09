import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import {
  Bell, AlertTriangle, TrendingUp, TrendingDown, Info, CheckCircle2, BellRing,
  Filter, Clock, Shield, Activity, ChevronRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { getRating, getStaticHistory } from "@/data/mockData";

/* =========================================================================
 * Alerts — Centre de signaux & alertes économiques.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

type Severity = "critical" | "warning" | "info" | "positive";
type AlertCategory = "Regime" | "Rating" | "Market" | "Policy" | "Data";

interface EcoAlert {
  id: string;
  severity: Severity;
  category: AlertCategory;
  country: string;
  flag: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

/** Notation composite d'un pays, sur 100, telle que l'affichent les autres pages. */
const score = (code: string) => Math.round(getRating(code).compositeScore * 10);

/** Derniere valeur observee d'une serie, formatee. */
const level = (code: string, indicator: string, digits = 1) => {
  const history = getStaticHistory(code, indicator);
  const last = history[history.length - 1];
  return last ? last.value.toFixed(digits) : "n/d";
};

/** Valeur d'il y a `back` periodes, pour un « de X a Y ». */
const prior = (code: string, indicator: string, back = 3, digits = 1) => {
  const history = getStaticHistory(code, indicator);
  const point = history[history.length - 1 - back];
  return point ? point.value.toFixed(digits) : "n/d";
};

const ALERTS: EcoAlert[] = [
  { id: "a1", severity: "critical", category: "Rating", country: "Nigeria", flag: "NGA", title: `Notation abaissée à ${score("NGA")}/100`, description: "Risque de refinancement extérieur aggravé ; pression sur les réserves de change. Sous surveillance renforcée.", time: "il y a 2 h", read: false },
  { id: "a2", severity: "warning", category: "Regime", country: "Burkina Faso", flag: "BFA", title: "Changement de régime : Transition → Détérioration", description: "Dégradation du climat macroéconomique liée à la pression sécuritaire et fiscale.", time: "il y a 5 h", read: false },
  { id: "a3", severity: "positive", category: "Regime", country: "Côte d'Ivoire", flag: "CIV", title: "Révision haussière de la croissance 2026F", description: `Prévision PIB relevée de ${prior("CIV", "real_gdp_growth")}% à ${level("CIV", "real_gdp_growth")}% portée par la production de cacao et les infrastructures.`, time: "il y a 8 h", read: false },
  { id: "a4", severity: "info", category: "Policy", country: "UEMOA", flag: "CIV", title: "Décision BCEAO attendue le 03/08", description: `Consensus d'une baisse de 25 bps du taux directeur, actuellement à ${level("CIV", "policy_rate", 2)}%, au vu de l'inflation maîtrisée.`, time: "hier", read: true },
  { id: "a5", severity: "warning", category: "Market", country: "United States", flag: "USA", title: "Volatilité accrue sur le 10Y US", description: "Le rendement à 10 ans a bondi de +12 bps cette semaine en réaction aux données d'emploi.", time: "hier", read: true },
  { id: "a6", severity: "info", category: "Data", country: "Euro Area", flag: "EMU", title: `Inflation IPC révisée à ${level("EMU", "cpi_inflation")}%`, description: "Les données flash confirment la trajectoire de désinflation vers la cible BCE.", time: "il y a 2 j", read: true },
  { id: "a7", severity: "positive", category: "Rating", country: "Benin", flag: "BEN", title: "Déficit budgétaire sous surveillance", description: `Consolidation fiscale suivie au regard des critères de convergence UEMOA ; notation à ${score("BEN")}/100.`, time: "il y a 3 j", read: true },
  { id: "a8", severity: "critical", category: "Market", country: "Brazil", flag: "BRA", title: "Pression de refinancement accrue", description: "Les spreads EMBI brésiliens se sont élargis de 45 bps sur fond de hausse des taux réels.", time: "il y a 4 j", read: true },
];

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; icon: typeof Bell }> = {
  critical: { label: "Critique", color: "#EF4444", bg: "bg-red-500/10", icon: AlertTriangle },
  warning: { label: "Avertissement", color: "#F59E0B", bg: "bg-amber-500/10", icon: AlertTriangle },
  info: { label: "Information", color: "#3B82F6", bg: "bg-blue-500/10", icon: Info },
  positive: { label: "Positif", color: "#22C55E", bg: "bg-green-500/10", icon: TrendingUp },
};

const CATEGORY_ICON: Record<AlertCategory, typeof Bell> = {
  Regime: Activity,
  Rating: Shield,
  Market: TrendingDown,
  Policy: BellRing,
  Data: Info,
};

export function AlertsPage() {
  const { t } = useI18n();
  const [sevFilter, setSevFilter] = useState<Severity | "all">("all");
  const [catFilter, setCatFilter] = useState<AlertCategory | "all">("all");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [alerts, setAlerts] = useState(ALERTS);

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const markRead = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));

  const filtered = useMemo(
    () =>
      alerts
        .filter((a) => (sevFilter === "all" ? true : a.severity === sevFilter))
        .filter((a) => (catFilter === "all" ? true : a.category === catFilter))
        .filter((a) => (onlyUnread ? !a.read : true)),
    [alerts, sevFilter, catFilter, onlyUnread]
  );

  const counts = useMemo(
    () => ({
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
      positive: alerts.filter((a) => a.severity === "positive").length,
      unread: alerts.filter((a) => !a.read).length,
    }),
    [alerts]
  );

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Bell className="h-6 w-6 text-primary" /> {t("page.alerts.title")}
            </h1>
            {counts.unread > 0 && (
              <span
                aria-label={`${counts.unread} alertes non lues`}
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white"
              >
                {counts.unread}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.alerts.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyUnread((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              onlyUnread ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-accent"
            }`}
          >
            <BellRing className="h-3.5 w-3.5" /> Non lues ({counts.unread})
          </button>
          <button
            onClick={markAllRead}
            disabled={counts.unread === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-40"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Tout marquer lu
          </button>
        </div>
      </div>

      {/* ===== Compteurs par sévérité ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["critical", "warning", "info", "positive"] as Severity[]).map((s) => {
          const m = SEVERITY_META[s];
          const active = sevFilter === s;
          return (
            <button
              key={s}
              onClick={() => setSevFilter(active ? "all" : s)}
              className={`card-surface flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                active ? "border-transparent ring-2 ring-offset-0" : ""
              }`}
              style={active ? { boxShadow: `0 0 0 2px ${m.color}` } : undefined}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${m.color}1a`, color: m.color }}>
                <m.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold tabular-nums text-foreground">{counts[s]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ===== Filtres ===== */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Catégorie
        </span>
        <div className="flex flex-wrap gap-1.5">
          <ChipButton active={catFilter === "all"} onClick={() => setCatFilter("all")}>Toutes</ChipButton>
          {(Object.keys(CATEGORY_ICON) as AlertCategory[]).map((c) => (
            <ChipButton key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{c}</ChipButton>
          ))}
        </div>
      </div>

      {/* ===== Liste d'alertes ===== */}
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Flux d&apos;alertes
        <span className="ml-2 font-normal normal-case">
          ({filtered.length} sur {alerts.length})
        </span>
      </h2>

      <div className="space-y-2.5">
        {filtered.map((a) => {
          const m = SEVERITY_META[a.severity];
          const CatIcon = CATEGORY_ICON[a.category];
          return (
            <Link
              key={a.id}
              href={`/countries/${a.flag}`}
              onClick={() => markRead(a.id)}
              className={`card-surface group relative flex items-start gap-4 overflow-hidden p-4 text-left transition-all hover:shadow-md ${!a.read ? "" : "opacity-80"}`}
            >
              <span className="absolute inset-y-0 left-0 w-1" style={{ background: m.color }} />
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${m.color}1a`, color: m.color }}>
                <m.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!a.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  <p className="font-semibold text-foreground">{a.title}</p>
                  <Badge className="border-border text-muted-foreground" variant="outline">
                    <CatIcon className="mr-1 h-3 w-3" /> {a.category}
                  </Badge>
                  <Badge style={{ background: `${m.color}1a`, color: m.color, borderColor: `${m.color}40` }} className="border">{m.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Flag code={a.flag} size={13} /> {a.country}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time}</span>
                </div>
              </div>
              <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <Card className="card-surface">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Aucune alerte ne correspond aux filtres.
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
