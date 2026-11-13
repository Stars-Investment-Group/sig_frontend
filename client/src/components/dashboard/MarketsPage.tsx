import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { SectionCard } from "@/components/common/SectionCard";
import { Flag } from "@/components/Flag";
import {
  TrendingUp, TrendingDown, Globe, Landmark, LineChart, ArrowUpRight, ArrowDownRight,
  Percent, Banknote, BarChart3, Shield, Activity, ExternalLink,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  useMarketConditions,
  useMarketIndices,
  useSovereignYields,
} from "@/api/markets";
import { sourceAttr } from "@/api/useApiData";

/* =========================================================================
 * Markets — Synthèse des conditions de marché & liquidité.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */


export function MarketsPage() {
  const { t } = useI18n();
  const [view, setView] = useState<"fx" | "equities">("equities");
  const [ticker, setTicker] = useState<"majors" | "focused">("focused");

  // Trois requetes, trois blocs. Chacune retombe sur sa fixture
  // independamment : une route lente ne vide pas les deux autres cartes.
  const indices = useMarketIndices();
  const { fx: FX, equities: EQUITIES, commodities: COMMODITIES } = indices.data;
  const taux = useSovereignYields();
  const BONDS = taux.data;
  const FUNDING = useMarketConditions().data;

  const upEqu = EQUITIES.filter((e) => e.up).length;
  const assetUp = useMemo(
    () => [...FX, ...EQUITIES].filter((a) => a.up).length,
    [FX, EQUITIES]
  );
  const assetTot = FX.length + EQUITIES.length;

  return (
    <div className="space-y-6" {...sourceAttr(indices.fromApi)}>
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" /> {t("page.markets.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.markets.subtitle")}
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
        {COMMODITIES.map((k) => {
          const IconAsset = k.name.startsWith("Or") ? Shield : k.name.startsWith("Pét") ? Landmark : k.name.startsWith("Indice USD") ? Globe : LineChart;
          return (
            <Card key={k.name} className="card-surface">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{k.name}</p>
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
                  <span className="font-semibold text-foreground">{a.name}</span>
                  <Flag code={a.countryCode ?? ""} size={14} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-semibold ${a.up ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {a.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {a.change}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{a.value}</p>
              {/* Toutes les lignes n'ont pas de micro-courbe : les matieres
                  premieres n'en portent pas. Un tableau vide tracerait un
                  cadre sans trait, qui se lit comme un graphique casse. */}
              {a.spark && (
                <div className="mt-2 flex justify-end">
                  <Sparkline data={a.spark} color={a.up ? "#22C55E" : "#EF4444"} width={120} height={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ===== Obligations + funding ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Taux souverains"
          subtitle="Rendements de référence et spread ivoirien"
          className="lg:col-span-2"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Instrument</th>
                <th className="px-2 py-2 text-right font-medium">Rendement</th>
                <th className="px-2 py-2 text-right font-medium">Variation</th>
              </tr>
            </thead>
            <tbody>
              {BONDS.map((b) => (
                <tr
                  key={b.label}
                  className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-2 py-2.5">
                    <span className="flex items-center gap-2">
                      <Flag code={b.countryCode ?? ""} size={16} />
                      <span className="text-xs font-medium text-foreground">{b.label}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right text-sm font-bold tabular-nums text-foreground">
                    {b.value}
                  </td>
                  <td
                    className={`px-2 py-2.5 text-right text-xs font-medium tabular-nums ${
                      b.up
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-green-600 dark:text-green-500"
                    }`}
                  >
                    {b.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

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
                  f.tone === "positive" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : f.tone === "negative" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
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
