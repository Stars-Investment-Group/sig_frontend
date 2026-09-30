import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import {
  Star, Search, TrendingUp, Minus, StarOff, GripVertical, ArrowUpRight,
  ArrowDownRight, Layers,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

/* =========================================================================
 * Watchlist — Pays & indicateurs placés sous surveillance.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

interface WatchItem {
  code: string;
  name: string;
  region: string;
  score: number;
  delta: number;
  status: "Improving" | "Deteriorating" | "Stable";
  regime: string;
  risk: "low" | "medium" | "high";
  growth: number;
  inflation: number;
  spark: number[];
  pinned: boolean;
}

const WATCH: WatchItem[] = [
  { code: "CIV", name: "Côte d'Ivoire", region: "UEMOA", score: 72, delta: 5, status: "Improving", regime: "Recovery", risk: "low", growth: 5.8, inflation: 3.2, spark: [52, 55, 58, 62, 65, 68, 72], pinned: true },
  { code: "SEN", name: "Senegal", region: "UEMOA", score: 63, delta: -3, status: "Deteriorating", regime: "Transition", risk: "medium", growth: 4.5, inflation: 4.1, spark: [74, 72, 70, 68, 66, 64, 63], pinned: true },
  { code: "USA", name: "États-Unis", region: "Amériques", score: 78, delta: 1, status: "Stable", regime: "Expansion", risk: "low", growth: 2.3, inflation: 2.9, spark: [75, 76, 76, 77, 77, 78, 78], pinned: false },
  { code: "EMU", name: "Zone euro", region: "EMEA", score: 66, delta: 2, status: "Improving", regime: "Recovery", risk: "medium", growth: 1.6, inflation: 2.4, spark: [58, 60, 61, 63, 64, 65, 66], pinned: false },
  { code: "GBR", name: "Royaume-Uni", region: "EMEA", score: 61, delta: -1, status: "Stable", regime: "Recovery", risk: "medium", growth: 1.2, inflation: 3.1, spark: [62, 62, 61, 62, 61, 61, 61], pinned: false },
  { code: "NGA", name: "Nigeria", region: "Afrique", score: 38, delta: -4, status: "Deteriorating", regime: "Stress", risk: "high", growth: 1.8, inflation: 9.2, spark: [46, 44, 43, 42, 40, 39, 38], pinned: true },
  { code: "IND", name: "Inde", region: "APAC", score: 70, delta: 3, status: "Improving", regime: "Recovery", risk: "medium", growth: 6.3, inflation: 5.4, spark: [60, 62, 64, 66, 67, 69, 70], pinned: false },
  { code: "JPN", name: "Japon", region: "APAC", score: 59, delta: 0, status: "Stable", regime: "Transition", risk: "medium", growth: 0.7, inflation: 1.8, spark: [59, 59, 58, 59, 59, 59, 59], pinned: false },
];

const REGIME_FR: Record<string, string> = {
  Recovery: "Récupération", Transition: "Transition", Expansion: "Expansion", Stress: "Stress",
};

const STATUS_META: Record<WatchItem["status"], { cls: string; icon: typeof Minus; label: string }> = {
  Improving: { cls: "text-green-500", icon: ArrowUpRight, label: "En amélioration" },
  Deteriorating: { cls: "text-red-500", icon: ArrowDownRight, label: "En détérioration" },
  Stable: { cls: "text-muted-foreground", icon: Minus, label: "Stable" },
};

const RISK_CLS: Record<string, string> = {
  low: "bg-green-500/15 text-green-300 border-green-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function WatchlistPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "delta" | "name">("score");
  const [items, setItems] = useState(WATCH);

  const filtered = useMemo(() => {
    return items
      .filter((w) => w.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (sortBy === "score") return b.score - a.score;
        if (sortBy === "delta") return b.delta - a.delta;
        return a.name.localeCompare(b.name);
      });
  }, [items, query, sortBy]);

  const pinnedCount = items.filter((w) => w.pinned).length;
  const avgScore = Math.round(items.reduce((s, w) => s + w.score, 0) / items.length);
  const improving = items.filter((w) => w.status === "Improving").length;

  const togglePin = (code: string) =>
    setItems((prev) => prev.map((w) => (w.code === code ? { ...w, pinned: !w.pinned } : w)));

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Star className="h-6 w-6 text-primary" /> {t("page.watchlist.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.watchlist.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-44 rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            <option value="score">Trier : Score</option>
            <option value="delta">Trier : Variation</option>
            <option value="name">Trier : Nom</option>
          </select>
        </div>
      </div>

      {/* ===== Bandeau ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pays suivis" value={String(items.length)} icon={Layers} color="#3B82F6" />
        <StatCard label="Épinglés" value={String(pinnedCount)} icon={Star} color="#F59E0B" />
        <StatCard label="Score moyen" value={String(avgScore)} icon={TrendingUp} color="#8B5CF6" />
        <StatCard label="En amélioration" value={String(improving)} icon={ArrowUpRight} color="#22C55E" />
      </div>

      {/* ===== Tableau ===== */}
      <Card className="card-surface overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">Pays surveillés</CardTitle>
          <Badge variant="outline" className="border-border text-muted-foreground">{filtered.length} entrées</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-10 px-3 py-3" />
                <th className="px-3 py-3 font-medium">Pays</th>
                <th className="px-3 py-3 font-medium">Régime</th>
                <th className="px-3 py-3 text-center font-medium">Risque</th>
                <th className="px-3 py-3 text-right font-medium">Score SIG</th>
                <th className="px-3 py-3 text-right font-medium">Var. semaine</th>
                <th className="px-3 py-3 text-right font-medium">PIB</th>
                <th className="px-3 py-3 text-right font-medium">Inflation</th>
                <th className="px-3 py-3 text-center font-medium">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => {
                const sm = STATUS_META[w.status];
                return (
                  <tr key={w.code} className="group border-b border-border/60 last:border-0 hover:bg-accent/30">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground/40" />
                        <button onClick={() => togglePin(w.code)} aria-label={w.pinned ? "Désépingler" : "Épingler"}>
                          {w.pinned ? (
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ) : (
                            <StarOff className="h-4 w-4 text-muted-foreground/50 hover:text-foreground" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Flag code={w.code} size={18} />
                        <div>
                          <p className="font-medium text-foreground">{w.name}</p>
                          <p className="text-xs text-muted-foreground">{w.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {REGIME_FR[w.regime] ?? w.regime}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge className={RISK_CLS[w.risk]}>{w.risk === "low" ? "Faible" : w.risk === "medium" ? "Moyen" : "Élevé"}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-base font-bold tabular-nums text-foreground">{w.score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-semibold tabular-nums ${sm.cls}`}>
                        <sm.icon className="h-3.5 w-3.5" />
                        {w.delta > 0 ? "+" : ""}{w.delta}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">{w.growth.toFixed(1)}%</td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">{w.inflation.toFixed(1)}%</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <Sparkline data={w.spark} color={w.delta >= 0 ? "#22C55E" : "#EF4444"} width={72} height={26} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ===== Notes rapides ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {filtered.slice(0, 3).map((w) => (
          <Card key={w.code} className="card-surface">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag code={w.code} size={18} />
                  <span className="font-semibold text-foreground">{w.name}</span>
                </div>
                <Badge className={RISK_CLS[w.risk]}>{REGIME_FR[w.regime] ?? w.regime}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Score SIG {w.score}/100 · {smLabel(w.status)}. PIB {w.growth.toFixed(1)}% / Inflation {w.inflation.toFixed(1)}%.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}

function smLabel(s: WatchItem["status"]) {
  return s === "Improving" ? "dynamique positive" : s === "Deteriorating" ? "dynamique négative" : "dynamique stable";
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Star; color: string }) {
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
