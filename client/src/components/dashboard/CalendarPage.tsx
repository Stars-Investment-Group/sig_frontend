import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Filter, Download,
  Landmark, BarChart3, TrendingUp, AlertTriangle, List, LayoutGrid,
} from "lucide-react";
import { exportCsv } from "@/utils/exportCsv";
import { useI18n } from "@/lib/i18n";

/* =========================================================================
 * Calendar — Calendrier des publications & événements macroéconomiques.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

type Importance = "High" | "Medium" | "Low";
type Category = "Monetary" | "Inflation" | "Growth" | "Employment" | "Fiscal" | "Trade";

interface EcoEvent {
  date: string;        // YYYY-MM-DD
  time: string;
  title: string;
  country: string;
  flag: string;
  category: Category;
  importance: Importance;
  previous?: string;
  forecast?: string;
}

const EVENTS: EcoEvent[] = [
  { date: "2026-08-03", time: "14:00", title: "Décision de taux BCEAO", country: "UEMOA", flag: "CIV", category: "Monetary", importance: "High", previous: "3.25%", forecast: "3.00%" },
  { date: "2026-08-05", time: "09:30", title: "PIB trimestriel Q2", country: "Côte d'Ivoire", flag: "CIV", category: "Growth", importance: "Medium", previous: "+1.4%", forecast: "+1.6%" },
  { date: "2026-08-05", time: "14:30", title: "Inflation IPC zone euro (flash)", country: "Zone euro", flag: "EMU", category: "Inflation", importance: "High", previous: "2.4%", forecast: "2.3%" },
  { date: "2026-08-07", time: "14:30", title: "Rapport emploi US (NFP)", country: "États-Unis", flag: "USA", category: "Employment", importance: "High", previous: "206K", forecast: "180K" },
  { date: "2026-08-11", time: "12:00", title: "Décision Banque d'Angleterre", country: "Royaume-Uni", flag: "GBR", category: "Monetary", importance: "High", previous: "4.75%", forecast: "4.75%" },
  { date: "2026-08-12", time: "10:00", title: "Inflation IPC Nigeria", country: "Nigeria", flag: "NGA", category: "Inflation", importance: "High", previous: "9.2%", forecast: "9.0%" },
  { date: "2026-08-14", time: "14:30", title: "Inflation IPC US", country: "États-Unis", flag: "USA", category: "Inflation", importance: "Medium", previous: "2.9%", forecast: "2.8%" },
  { date: "2026-08-18", time: "03:00", title: "PIB T2 Japon", country: "Japon", flag: "JPN", category: "Growth", importance: "Medium", previous: "+0.5%", forecast: "+0.6%" },
  { date: "2026-08-21", time: "16:00", title: "Balance courante UEMOA", country: "UEMOA", flag: "CIV", category: "Trade", importance: "Low", previous: "-1.9%", forecast: "-1.8%" },
  { date: "2026-08-26", time: "13:00", title: "Budget fédéral (déficit)", country: "États-Unis", flag: "USA", category: "Fiscal", importance: "Medium", previous: "-6.2%", forecast: "-6.0%" },
  { date: "2026-08-28", time: "05:30", title: "Décision RBI (Inde)", country: "Inde", flag: "IND", category: "Monetary", importance: "High", previous: "6.50%", forecast: "6.50%" },
  { date: "2026-09-02", time: "14:00", title: "Réunion FOMC", country: "États-Unis", flag: "USA", category: "Monetary", importance: "High", previous: "4.25%", forecast: "4.00%" },
];

const CATEGORY_META: Record<Category, { label: string; color: string; icon: typeof Landmark }> = {
  Monetary: { label: "Monétaire", color: "#3B82F6", icon: Landmark },
  Inflation: { label: "Inflation", color: "#EF4444", icon: TrendingUp },
  Growth: { label: "Croissance", color: "#22C55E", icon: BarChart3 },
  Employment: { label: "Emploi", color: "#8B5CF6", icon: BarChart3 },
  Fiscal: { label: "Fiscal", color: "#F59E0B", icon: Landmark },
  Trade: { label: "Commerce", color: "#14B8A6", icon: BarChart3 },
};

const IMPORTANCE_STYLE: Record<Importance, string> = {
  High: "bg-red-500/15 text-red-300 border-red-500/30",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Low: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const IMPORTANCE_LABEL: Record<Importance, string> = { High: "Élevée", Medium: "Moyenne", Low: "Faible" };

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function CalendarPage() {
  const { t } = useI18n();
  const [view, setView] = useState<"list" | "month">("list");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [impFilter, setImpFilter] = useState<Importance | "all">("all");

  const [cursor, setCursor] = useState<Date>(new Date(2026, 7, 1)); // Août 2026

  const filtered = useMemo(
    () =>
      EVENTS.filter((e) => (catFilter === "all" ? true : e.category === catFilter))
        .filter((e) => (impFilter === "all" ? true : e.importance === impFilter))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [catFilter, impFilter]
  );

  const highCount = filtered.filter((e) => e.importance === "High").length;

  const handleExport = () => {
    exportCsv(
      filtered.map(({ flag, ...event }) => event),
      `sig-calendrier-${new Date().toISOString().slice(0, 10)}`
    );
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = (startOfMonth(year, month).getDay() + 6) % 7; // lundi=0
  const total = daysInMonth(year, month);
  const monthLabel = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const eventsByDay = useMemo(() => {
    const map: Record<number, EcoEvent[]> = {};
    for (const e of filtered) {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        (map[d.getDate()] ??= []).push(e);
      }
    }
    return map;
  }, [filtered, year, month]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <CalendarIcon className="h-6 w-6 text-primary" /> {t("page.calendar.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.calendar.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <List className="h-3.5 w-3.5" /> Liste
            </button>
            <button
              onClick={() => setView("month")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "month" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Mois
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={!filtered.length}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Exporter
          </button>
        </div>
      </div>

      {/* ===== Bandeau ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Événements à venir" value={String(filtered.length)} icon={CalendarIcon} color="#3B82F6" />
        <SummaryCard label="Haute importance" value={String(highCount)} icon={AlertTriangle} color="#EF4444" />
        <SummaryCard label="Décisions monétaires" value={String(filtered.filter((e) => e.category === "Monetary").length)} icon={Landmark} color="#8B5CF6" />
        <SummaryCard label="Horizon" value="30 jours" icon={Clock} color="#22C55E" />
      </div>

      {/* ===== Filtres ===== */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filtres
        </span>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as Category | "all")}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORY_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={impFilter}
          onChange={(e) => setImpFilter(e.target.value as Importance | "all")}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none"
        >
          <option value="all">Toutes importances</option>
          <option value="High">Élevée</option>
          <option value="Medium">Moyenne</option>
          <option value="Low">Faible</option>
        </select>
      </div>

      {/* ===== Vue Mois ===== */}
      {view === "month" && (
        <Card className="card-surface overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
            <CardTitle className="text-base font-semibold capitalize text-foreground">{monthLabel}</CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCursor(new Date(2026, 7, 1))}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {DAYS.map((d) => (
              <div key={d} className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayEvents = day ? eventsByDay[day] ?? [] : [];
              return (
                <div
                  key={i}
                  className={`min-h-[96px] border-b border-r border-border/60 p-2 ${day ? "hover:bg-accent/30" : "bg-muted/20"}`}
                >
                  {day && (
                    <>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{day}</span>
                        {dayEvents.length > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e, j) => (
                          <div
                            key={j}
                            className="truncate rounded border-l-2 bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            style={{ borderColor: CATEGORY_META[e.category].color }}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} autres</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ===== Vue Liste ===== */}
      {view === "list" && (
        <div className="space-y-3">
          {Object.entries(
            filtered.reduce<Record<string, EcoEvent[]>>((acc, e) => {
              (acc[e.date] ??= []).push(e);
              return acc;
            }, {})
          ).map(([date, items]) => {
            const d = new Date(date);
            const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
            return (
              <Card key={date} className="card-surface overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold capitalize text-foreground">{dayLabel}</span>
                  <Badge variant="outline" className="ml-auto border-border text-muted-foreground">{items.length} événement{items.length > 1 ? "s" : ""}</Badge>
                </div>
                <div className="divide-y divide-border/60">
                  {items.map((e, i) => {
                    const Cat = CATEGORY_META[e.category];
                    const CatIcon = Cat.icon;
                    return (
                      <div key={i} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-accent/30">
                        <span className="w-12 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">{e.time}</span>
                        <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: `${Cat.color}22`, display: "grid", placeItems: "center" }}>
                          <CatIcon className="h-4 w-4" style={{ color: Cat.color }} />
                        </span>
                        <div className="min-w-[180px] flex-1">
                          <p className="text-sm font-medium text-foreground">{e.title}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Flag code={e.flag} size={13} /> {e.country} · {Cat.label}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {e.previous && <span className="text-muted-foreground">Préc. <span className="font-semibold text-foreground">{e.previous}</span></span>}
                          {e.forecast && <span className="text-muted-foreground">Prév. <span className="font-semibold text-primary">{e.forecast}</span></span>}
                        </div>
                        <Badge className={IMPORTANCE_STYLE[e.importance]}>{IMPORTANCE_LABEL[e.importance]}</Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Card className="card-surface">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Aucun événement ne correspond aux filtres sélectionnés.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Clock; color: string }) {
  return (
    <Card className="card-surface">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}1a`, color }}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tabular-nums text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
