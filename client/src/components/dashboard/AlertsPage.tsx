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
import {
  markAlertRead,
  markAllAlertsRead,
  useAlerts,
  type AlertCategory,
  type Severity,
} from "@/data/alerts";

/* =========================================================================
 * Alerts — Centre de signaux & alertes économiques.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

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
  const alerts = useAlerts();

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
            onClick={markAllAlertsRead}
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
              onClick={() => markAlertRead(a.id)}
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
