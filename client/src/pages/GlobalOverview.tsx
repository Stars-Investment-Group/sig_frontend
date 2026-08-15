import { Download, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Sparkline } from "@/components/dashboard/Sparkline";
import {
  globalKpis,
  regionSnapshots,
  topMovers,
  watchlist,
  whatChanged,
  screenerRows,
  type RegionSnapshot,
  type CountryMover,
} from "@/data/mockDashboard";

/* ---- helpers ---- */
const riskBadge: Record<RegionSnapshot["riskLevel"], string> = {
  Low: "bg-green-100 text-green-800 border-green-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  High: "bg-red-100 text-red-800 border-red-200",
};
const outlookColor: Record<string, string> = {
  Positive: "text-green-600",
  Stable: "text-slate-600",
  Watch: "text-amber-600",
  Negative: "text-red-600",
};
const moverRisk: Record<CountryMover["risk"], string> = {
  Low: "text-green-600 bg-green-50",
  Medium: "text-amber-600 bg-amber-50",
  High: "text-red-600 bg-red-50",
};

export default function GlobalOverview() {
  return (
    <div className="space-y-6">
      {/* ===== En-tête de page ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Overview</h1>
          <p className="text-sm text-muted-foreground">
            Institutional macro intelligence · données illustratives en attente d'API
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* ===== Range 1 — 5 KPI Cards ===== */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {globalKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* ===== Range 2 — Regime Map + Region Snapshot ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Carte interactive (placeholder) */}
        <div className="card-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Global Regime Map</h2>
            <Badge variant="outline" className="text-xs">Click to drill-down</Badge>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl">🌍</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Interactive regime map
                </p>
                <p className="text-xs text-muted-foreground/70">
                  (à intégrer · carte UEMOA / Afrique / benchmarks)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Region Snapshot */}
        <div className="card-surface p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Region Snapshot</h2>
            <Badge variant="outline" className="text-xs">As of Jul 2026</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Region</th>
                  <th className="py-2 pr-4 font-medium">Regime</th>
                  <th className="py-2 pr-4 font-medium">Outlook</th>
                  <th className="py-2 pr-4 font-medium">Risk</th>
                  <th className="py-2 pr-4 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {regionSnapshots.map((r) => (
                  <tr key={r.region} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{r.region}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{r.regime}</td>
                    <td className={`py-2.5 pr-4 font-medium ${outlookColor[r.outlook]}`}>
                      {r.outlook}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge className={riskBadge[r.riskLevel]}>{r.riskLevel}</Badge>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {r.changed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== Range 3 — Top Movers / Watchlist ===== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Top Movers / Watchlist</h2>
          <button className="text-sm font-medium text-primary hover:underline">
            Manage watchlist
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {watchlist.map((c) => (
            <div
              key={c.code}
              className="card-surface p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl leading-none">{c.flag}</span>
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${moverRisk[c.risk]}`}>
                  {c.risk}
                </span>
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">
                {c.name}
              </p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold tabular-nums">{c.score}</span>
                <span
                  className={`flex items-center text-xs font-medium ${
                    c.deltaScore >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {c.deltaScore >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {c.deltaScore > 0 ? "+" : ""}
                  {c.deltaScore}
                </span>
              </div>
              <Sparkline
                data={c.spark}
                positive={c.deltaScore >= 0}
                width={100}
                height={28}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== Range 4 — What Changed + Country Screener ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* What Changed */}
        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">
            What Changed vs Previous Update
          </h2>
          <ul className="space-y-3">
            {whatChanged.map((c) => (
              <li key={c.date} className="flex gap-3 border-l-2 border-blue-500 pl-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {c.date} · <span className="text-primary">{c.type}</span>
                  </p>
                  <p className="text-sm text-foreground">{c.entity}</p>
                  <p className="text-xs text-muted-foreground">{c.change}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Country Screener */}
        <div className="card-surface p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Country Screener</h2>
            <Button variant="outline" size="sm">Open Screener</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Country</th>
                  <th className="py-2 pr-4 font-medium">Regime</th>
                  <th className="py-2 pr-4 font-medium">Risk</th>
                  <th className="py-2 pr-4 text-right font-medium">Growth</th>
                  <th className="py-2 pr-4 text-right font-medium">Inflation</th>
                  <th className="py-2 pr-4 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {screenerRows.map((r) => (
                  <tr key={r.country} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      <span className="mr-2">{r.flag}</span>
                      <span className="font-medium text-foreground">{r.country}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{r.regime}</td>
                    <td className="py-2.5 pr-4">
                      <Badge className={riskBadge[r.risk]}>{r.risk}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {r.growth > 0 ? `+${r.growth.toFixed(1)}%` : `${r.growth.toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                      {r.inflation.toFixed(1)}%
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">
                      {r.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Note de gouvernance */}
      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette. Les valeurs dynamiques seront injectées
        par le pipeline de données (source, vintage et qualité conformément à la spec §H).
      </p>
    </div>
  );
}
