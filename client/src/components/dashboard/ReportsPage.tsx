import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Search, Download, BookOpen, Clock, TrendingUp, Globe, Star,
  Layers, ChevronRight, FileBarChart, Bookmark,
} from "lucide-react";

/* =========================================================================
 * Reports — Bibliothèque de recherche & publications SIG.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

type ReportType = "House View" | "Macro" | "Markets" | "Policy" | "Sector";
type Frequency = "Hebdomadaire" | "Mensuel" | "Trimestriel" | "Ponctuel";

interface Report {
  id: string;
  title: string;
  summary: string;
  type: ReportType;
  frequency: Frequency;
  date: string;
  readTime: string;
  pages: number;
  featured: boolean;
}

const REPORTS: Report[] = [
  { id: "r1", title: "SIG House View — T3 2026", summary: "Vision stratégique trimestrielle : normalisation monétaire mondiale, opportunités sélectives en UEMOA et gestion des risques de refinancement EM.", type: "House View", frequency: "Trimestriel", date: "01 août 2026", readTime: "18 min", pages: 42, featured: true },
  { id: "r2", title: "Perspectives marchés émergents", summary: "Analyse approfondie des primes de risque, flux de capitaux et soutenabilité de la dette dans les économies émergentes et frontières.", type: "Markets", frequency: "Mensuel", date: "28 juil. 2026", readTime: "12 min", pages: 28, featured: false },
  { id: "r3", title: "Rapport inflation & taux directeurs", summary: "Trajectoire des banques centrales, désinflation en cours et implications pour les courbes de taux souveraines.", type: "Macro", frequency: "Mensuel", date: "22 juil. 2026", readTime: "10 min", pages: 24, featured: true },
  { id: "r4", title: "Moniteur des régimes macro", summary: "Classification et évolution des régimes économiques par région, avec signaux d'alerte et changements notables.", type: "Macro", frequency: "Hebdomadaire", date: "18 juil. 2026", readTime: "7 min", pages: 16, featured: false },
  { id: "r5", title: "Tracker de politique monétaire", summary: "Suivi des décisions des banques centrales (FOMC, BCE, BCEAO, BoJ, RBI) et orientations de politique.", type: "Policy", frequency: "Hebdomadaire", date: "15 juil. 2026", readTime: "8 min", pages: 18, featured: false },
  { id: "r6", title: "Secteur cacao & agro-industrie", summary: "Analyse de la filière cacao en Côte d'Ivoire : prix, production, transformation locale et impacts macroéconomiques.", type: "Sector", frequency: "Trimestriel", date: "10 juil. 2026", readTime: "14 min", pages: 30, featured: false },
  { id: "r7", title: "Note flash — Décision BCEAO", summary: "Réaction immédiate à la décision de politique monétaire de la BCEAO et implications pour la notation des pays UEMOA.", type: "Policy", frequency: "Ponctuel", date: "03 juil. 2026", readTime: "5 min", pages: 8, featured: false },
  { id: "r8", title: "Global Growth Outlook 2026-2027", summary: "Perspectives de croissance mondiale, scénarios de risque et impacts sur les allocations d'actifs.", type: "Macro", frequency: "Trimestriel", date: "28 juin 2026", readTime: "16 min", pages: 36, featured: false },
];

const TYPE_META: Record<ReportType, { color: string; icon: typeof FileText }> = {
  "House View": { color: "#8B5CF6", icon: BookOpen },
  Macro: { color: "#3B82F6", icon: TrendingUp },
  Markets: { color: "#14B8A6", icon: Globe },
  Policy: { color: "#F59E0B", icon: FileBarChart },
  Sector: { color: "#22C55E", icon: Layers },
};

export function ReportsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");

  const filtered = useMemo(
    () =>
      REPORTS.filter((r) => (typeFilter === "all" ? true : r.type === typeFilter)).filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.summary.toLowerCase().includes(query.toLowerCase())
      ),
    [query, typeFilter]
  );

  const featured = REPORTS.filter((r) => r.featured);

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FileText className="h-6 w-6 text-primary" /> Rapports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bibliothèque de recherche SIG : analyses macro, marchés et politiques.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un rapport…"
            className="w-56 rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* ===== À la une ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {featured.map((r) => {
          const m = TYPE_META[r.type];
          return (
            <div
              key={r.id}
              className="card-surface relative overflow-hidden p-5"
              style={{ background: `linear-gradient(135deg, ${m.color}0f, transparent)` }}
            >
              <span className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: m.color }}>
                <Star className="h-3 w-3 fill-current" /> À la une
              </span>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${m.color}1a`, color: m.color }}>
                  <m.icon className="h-4.5 w-4.5" />
                </span>
                <Badge variant="outline" className="border-border text-muted-foreground">{r.type}</Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">{r.frequency}</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">{r.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.summary}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.readTime}</span>
                  <span>{r.pages} pages</span>
                  <span>{r.date}</span>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Filtres par type ===== */}
      <div className="flex flex-wrap gap-1.5">
        <TypeChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>Tous</TypeChip>
        {(Object.keys(TYPE_META) as ReportType[]).map((t) => (
          <TypeChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} color={TYPE_META[t].color}>
            {t}
          </TypeChip>
        ))}
      </div>

      {/* ===== Liste ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => {
          const m = TYPE_META[r.type];
          return (
            <Card key={r.id} className="card-surface group flex flex-col transition-all hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${m.color}1a`, color: m.color }}>
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{r.type}</span>
                  </div>
                  <Bookmark className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <p className="mt-1 line-clamp-3 flex-1 text-xs text-muted-foreground">{r.summary}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.readTime}</span>
                    <span>{r.pages} p.</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Lire <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{r.date} · {r.frequency}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="card-surface">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucun rapport ne correspond à la recherche.
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}

function TypeChip({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-transparent bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
      style={active && color ? { color, background: `${color}1a`, borderColor: `${color}40` } : undefined}
    >
      {children}
    </button>
  );
}
