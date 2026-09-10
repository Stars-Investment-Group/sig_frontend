import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Flag } from "@/components/Flag";
import {
  TrendingUp, TrendingDown, Globe, Landmark, LineChart, ArrowUpRight, ArrowDownRight,
  Percent, Banknote, BarChart3, Shield, Activity, ExternalLink,
} from "lucide-react";

/* =========================================================================
 * Markets — Synthèse des conditions de marché & liquidité.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

/* ---- Maquette de données markets ---- */
const FX = [
  { ccy: "EUR/USD", code: "EU", value: "1.0812", change: "+0.18%", up: true, spark: [1.052, 1.064, 1.058, 1.072, 1.078, 1.076, 1.081] },
  { ccy: "USD/JPY", code: "JP", value: "153.42", change: "-0.42%", up: false, spark: [151.2, 152.1, 151.8, 152.9, 153.4, 153.1, 153.4] },
  { ccy: "GBP/USD", code: "GB", value: "1.2910", change: "+0.09%", up: true, spark: [1.271, 1.283, 1.279, 1.288, 1.294, 1.29, 1.291] },
  { ccy: "XOF/USD", code: "CI", value: "575.20", change: "-0.02%", up: false, spark: [582, 580, 578, 577, 576, 575.5, 575.2] },
];

const EQUITIES = [
  { name: "S&P 500", region: "US", value: "5 482", change: "+0.64%", up: true, spark: [5120, 5190, 5340, 5410, 5390, 5470, 5482] },
  { name: "Euro Stoxx 50", region: "EU", value: "4 918", change: "-0.12%", up: false, spark: [4820, 4890, 4950, 4920, 4960, 4925, 4918] },
  { name: "FTSE 100", region: "GB", value: "8 415", change: "+0.30%", up: true, spark: [8210, 8250, 8320, 8380, 8360, 8400, 8415] },
  { name: "Nikkei 225", region: "JP", value: "39 850", change: "+0.48%", up: true, spark: [38100, 38700, 39300, 39000, 39500, 39650, 39850] },
  { name: "BRVM Composite", region: "CI", value: "245.18", change: "+0.82%", up: true, spark: [231, 235, 238, 240, 242, 243, 245] },
  { name: "NGX (Nigeria)", region: "NG", value: "98 720", change: "-0.35%", up: false, spark: [100500, 100100, 99500, 99200, 99000, 99050, 98720] },
];

const BONDS = [
  { label: "Rendement 10Y US", region: "US", value: "4.10%", change: "-2 bps", up: false },
  { label: "Rendement 10Y Allemagne", region: "EU", value: "2.42%", change: "+1 bps", up: true },
  { label: "Rendement 10Y Japon", region: "JP", value: "0.95%", change: "0 bps", up: false },
  { label: "Rendement 10Y Italie", region: "IT", value: "3.58%", change: "-4 bps", up: false },
  { label: "Eurobond Côte d'Ivoire 2032", region: "CI", value: "6.30%", change: "-8 bps", up: false },
];

const MINTS_KPIS = [
  { label: "ORA / Or", value: "2 410", unit: "USD/oz", change: "+0.8%", up: true },
  { label: "Pétrole (Brent)", value: "78.2", unit: "USD/bbl", change: "-0.6%", up: false },
  { label: "Indice USD (DXY)", value: "101.9", unit: "pts", change: "-0.2%", up: false },
  { label: "BTC", value: "64 500", unit: "USD", change: "+2.1%", up: true },
];

const FUNDING = [
  { label: "Primary Dealers Libor / Fed Funds", stance: "Neutral", tone: "neutral" as const },
  { label: "OIS 3M EUR", stance: "2.8%", tone: "neutral" as const },
  { label: "Risque EM (EMBI)", stance: "Élevé", tone: "negative" as const },
  { label: "Conditions de liquidité globales", stance: "Accommodant", tone: "positive" as const },
];

export function MarketsPage() {
  const [view, setView] = useState<"fx" | "equities">("equities");
  const [ticker, setTicker] = useState<"majors" | "focused">("focused");

  const upEqu = EQUITIES.filter((e) => e.up).length;
  const assetUp = useMemo(() => [...FX, ...EQUITIES].filter((a) => a.up).length, []);
  const assetTot = FX.length + EQUITIES.length;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" /> Marchés
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conditions financières, taux, devises et appétit pour le risque.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
          <button
            onClick={() => setView("fx")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "fx" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            Devises
          </button>
          <button
            onClick={() => setView("equities")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "equities" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            Actions
          </button>
        </div>
      </div>

      {/* ===== Mood market + avancés ===== */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mood global</p>
              <p className="mt-1 flex items-center gap-2 text-xl font-bold text-green-500 dark:text-green-400">
                <TrendingUp className="h-5 w-5" /> Risk-on
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Actifs en hausse</p>
              <p className="text-xl font-bold text-foreground">{assetUp}/{assetTot}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-green-400 to-green-600"
              style={{ width: `${(assetUp / assetTot) * 100}%` }}
            />
          </div>
        </div>
        <Card className="card-surface">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <Activity className="h-4 w-4 text-primary" /> Heures de marché
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex justify-between"><span>Abidjan (GMT)</span><span className="font-medium text-foreground">Ouv. 08:00 · Ferm. 16:30</span></div>
            <div className="flex justify-between"><span>New York</span><span className="font-medium text-foreground">Ouv. 14:30 · Ferm. 21:00</span></div>
            <div className="flex justify-between"><span>Tokyo</span><span className="font-medium text-foreground">Ouv. 00:00 · Ferm. 06:00</span></div>
          </CardContent>
        </Card>
      </div>

      {/* ===== KPIs matières & fx ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MINTS_KPIS.map((k) => {
          const IconAsset = k.label.startsWith("ORA") ? Shield : k.label.startsWith("Pét") ? Landmark : k.label.startsWith("Indice USD") ? Globe : LineChart;
          return (
            <Card key={k.label} className="card-surface">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{k.value}<span className="ml-1 text-xs font-normal text-muted-foreground">{k.unit}</span></p>
                  <p className={`text-xs ${k.up ? "text-green-500" : "text-red-500"} flex items-center gap-0.5`}>
                    {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{k.change}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-primary"><IconAsset className="h-5 w-5" /></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ===== Tableau actifs (fx/actions) ===== */}
      <Card className="card-surface overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              {view === "fx" ? "Marché des changes" : "Indices actions"}
            </CardTitle>
            <Badge variant="outline" className="border-border text-muted-foreground">{view === "fx" ? `${FX.length} paires` : `${EQUITIES.length} indices`}</Badge>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
          {(view === "fx" ? FX : EQUITIES).map((a, i) => (
            <div key={i} className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: a.up ? "#22C55E" : "#EF4444" }} />
                  <span className="font-semibold text-foreground">{view === "fx" ? (a as typeof FX[number]).ccy : (a as typeof EQUITIES[number]).name}</span>
                  <Flag code={view === "fx" ? (a as typeof FX[number]).code : (a as typeof EQUITIES[number]).region} size={14} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-semibold ${a.up ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {a.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {a.change}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{a.value}</p>
              <div className="mt-2 flex justify-end">
                <Sparkline data={a.spark} color={a.up ? "#22C55E" : "#EF4444"} width={120} height={32} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ===== Obligations + funding ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BONDS.map((b) => (
            <div key={b.label} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2.5">
                <Flag code={b.region} size={16} />
                <span className="text-sm font-medium text-foreground">{b.label}</span>
              </div>
              <div className="text-right">
                <p className="text-base font-bold tabular-nums text-foreground">{b.value}</p>
                <p className={`text-xs ${b.up ? "text-amber-500" : "text-green-500"}`}>{b.change}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="card-surface">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <Banknote className="h-4 w-4 text-primary" /> Conditions de financement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {FUNDING.map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <Badge className={
                  f.tone === "positive" ? "bg-green-500/15 text-green-300 border-green-500/30"
                    : f.tone === "negative" ? "bg-red-500/15 text-red-300 border-red-500/30"
                    : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                }>{f.stance}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Cotations illustratives de maquette — remplacées par les flux de marché réels (backend).
      </p>
    </div>
  );
}
