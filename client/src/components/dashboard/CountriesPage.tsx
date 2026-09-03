import { useState } from "react";
import { Download, Share2, ChevronDown, TrendingUp, TrendingDown, Minus, Calendar, Building2, ArrowUpRight, ArrowDownRight, LayoutGrid, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { QuantitativeAnalysisView } from "@/components/dashboard/QuantitativeAnalysisView";
import {
  countryOverviewKpis,
  regimeSnapshot,
  gdpTrend,
  countryWhatChanged,
  countryForecastTable,
  peerWaemu,
  peerAfrica,
  marketSnapshot,
  strategicSectors,
  riskSnapshot,
  countryTimeline,
  countryWatchRows,
} from "@/data/mockDashboard";

const countrySelection = countryWatchRows.slice(0, 10);

/* ============ helpers ============ */
const upDown = (delta: number) =>
  delta > 0.001 ? (
    <span className="inline-flex items-center gap-0.5 font-semibold text-green-600 dark:text-green-500">
      <ArrowUpRight className="h-3.5 w-3.5" />+{delta.toFixed(1)} pp
    </span>
  ) : delta < -0.001 ? (
    <span className="inline-flex items-center gap-0.5 font-semibold text-red-600 dark:text-red-400">
      <ArrowDownRight className="h-3.5 w-3.5" />{delta.toFixed(1)} pp
    </span>
  ) : (
    <span className="font-semibold text-muted-foreground">- 0.00 pp</span>
  );

const SECTION_TITLE = "text-base font-semibold text-foreground";
const CARD_SURFACE = "card-surface p-5";

type CountryView = "overview" | "quantitative";

export function CountriesPage() {
  const [country, setCountry] = useState(countrySelection[0]);
  const [view, setView] = useState<CountryView>("overview");

  return (
    <div className="space-y-6">
      {/* ===== Header commun ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Flag code={country.code} size={28} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{country.name}</h1>
            <p className="text-xs text-muted-foreground">
              Updated: May 14, 2025 / May 16, 2025 08:45 UTC
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bascule Overview / Quantitative */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setView("overview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "overview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Overview
            </button>
            <button
              onClick={() => setView("quantitative")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "quantitative" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LineChart className="h-3.5 w-3.5" /> Quantitative
            </button>
          </div>

          {/* Selecteur de pays */}
          <div className="relative">
            <select
              value={country.code}
              onChange={(e) => {
                const c = countrySelection.find((x) => x.code === e.target.value);
                if (c) setCountry(c);
              }}
              className="appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none"
            >
              {countrySelection.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* ===== Vue selectionnee ===== */}
      {view === "overview" ? (
        <CountryOverview />
      ) : (
        <QuantitativeAnalysisView />
      )}
    </div>
  );
}

function CountryOverview() {
  return (
    <>

      {/* ===== SIG House View ===== */}
      <section className={CARD_SURFACE}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className={SECTION_TITLE}>SIG House View</h2>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
            Positive
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Croissance robuste portee par la production de cacao et les infrastructures.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Inflation maitrisee, proche de la cible BCEAO.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Position exterieure confortable, reserves adequates.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Investissements strategiques en energie et logistique porteurs.</li>
        </ul>
      </section>

      {/* ===== Grille de KPIs ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {countryOverviewKpis.map((k) => (
          <div key={k.id} className={CARD_SURFACE}>
            <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{k.value}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">vs 2024</span>
              {upDown(k.delta)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">2024: {k.previous}</p>
          </div>
        ))}
      </section>

      {/* ===== Macro Regime Snapshot + line chart ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD_SURFACE} lg:col-span-1`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Macro Regime Snapshot</h2>
          <dl className="space-y-2.5">
            {regimeSnapshot.map((r) => (
              <div key={r.label} className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="font-medium text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={`${CARD_SURFACE} lg:col-span-2`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Real GDP Growth</h2>
          <GdpChart />
        </div>
      </section>

      {/* ===== What Changed ===== */}
      <section className={CARD_SURFACE}>
        <h2 className={`${SECTION_TITLE} mb-3`}>What Changed Since Last Review</h2>
        <ul className="space-y-2">
          {countryWhatChanged.map((w) => {
            const Icon = w.impact === "Positive" ? TrendingUp : w.impact === "Negative" ? TrendingDown : Minus;
            const cls = w.impact === "Positive" ? "text-green-600 dark:text-green-500" : w.impact === "Negative" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400";
            return (
              <li key={w.item} className="flex items-center gap-3 text-sm">
                <Icon className={`h-4 w-4 shrink-0 ${cls}`} />
                <span className="font-medium text-foreground">{w.item}:</span>
                <span className="text-muted-foreground">{w.change}</span>
                <span className="ml-auto text-xs text-muted-foreground">{w.date}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ===== Forecast Summary + Peer Positioning ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD_SURFACE} lg:col-span-2`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Forecast Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Indicator</th>
                  <th className="px-2 py-2 text-right font-medium">2023 (A)</th>
                  <th className="px-2 py-2 text-right font-medium">2024 (A)</th>
                  <th className="px-2 py-2 text-right font-medium">2025F</th>
                  <th className="px-2 py-2 text-right font-medium">2026F</th>
                  <th className="px-2 py-2 text-right font-medium">2027F</th>
                  <th className="px-2 py-2 text-center font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {countryForecastTable.map((r) => (
                  <tr key={r.indicator} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2 text-xs font-medium text-foreground">{r.indicator}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r["2023a"]}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r["2024a"]}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">{r["2025f"]}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-foreground">{r["2026f"]}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-foreground">{r["2027f"]}</td>
                    <td className="px-2 py-2 text-center">
                      <Sparkline data={r.spark} color="#2563EB" width={64} height={22} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <PeerPositioning />
      </section>

      {/* ===== Sectors + Risks ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD_SURFACE} lg:col-span-1`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Strategic Sectors</h2>
          <div className="space-y-3">
            {strategicSectors.map((s) => (
              <div key={s.name} className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                    {s.impact} Impact
                  </span>
                </div>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {s.drivers.map((d) => (
                    <li key={d} className="flex gap-1.5"><span className="text-primary">*</span>{d}</li>
                  ))}
                </ul>
                <a href="#" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">View detailed -&gt;</a>
              </div>
            ))}
          </div>
        </div>

        <div className={`${CARD_SURFACE} lg:col-span-2`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Risk Snapshot</h2>
          <RiskTable />
        </div>
      </section>

      {/* ===== Timeline + Market ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD_SURFACE} lg:col-span-1`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Policy &amp; Events Timeline</h2>
          <ol className="relative space-y-4 border-l border-border pl-4">
            {countryTimeline.map((e) => (
              <li key={e.title} className="relative">
                <span className="absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary" />
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {e.date}
                </p>
                <p className="text-xs text-muted-foreground">{e.title}</p>
                <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {e.tag}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className={`${CARD_SURFACE} lg:col-span-2`}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Market Snapshot</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {marketSnapshot.map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{m.value}</span>
                  <span className="text-xs text-muted-foreground">{m.change}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h3 className={`${SECTION_TITLE} mb-2`}>What Matters Now</h3>
            <ul className="space-y-2">
              {[
                "1. Surveiller l'allegement monetaire BCEAO dans l'H2 2026.",
                "2. Capitaliser sur la hausse des prix du cacao pour les exportations.",
                "3. Suivre la trajectoire de la dette et la concretisation des investissements.",
              ].map((x) => (
                <li key={x} className="flex gap-2 text-sm text-muted-foreground">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============ Real GDP Growth chart ============ */
function GdpChart() {
  const width = 360;
  const height = 160;
  const pad = { top: 12, right: 12, bottom: 24, left: 30 };
  const data = gdpTrend;

  const allVals = data.map((d) => (d.actual >= 0 ? d.actual : d.forecast ?? 0));
  const min = Math.min(...allVals) - 1;
  const max = Math.max(...allVals) + 1;
  const range = max - min;

  const x = (i: number) => pad.left + (i / (data.length - 1)) * (width - pad.left - pad.right);
  const y = (v: number) => pad.top + ((max - v) / range) * (height - pad.top - pad.bottom);

  const actLine = data.map((d, i) => (d.actual >= 0 ? `${x(i)},${y(d.actual)}` : null)).filter(Boolean).join(" ");
  const fcLine = data.filter((d) => d.forecast != null).map((d) => {
    const idx = data.findIndex((z) => z === d);
    return `${x(idx)},${y(d.forecast!)}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Real GDP Growth 2020-2027F">
      {[0, 1, 2, 3].map((g) => {
        const gy = pad.top + (g / 3) * (height - pad.top - pad.bottom);
        return (
          <g key={g}>
            <line x1={pad.left} x2={width - pad.right} y1={gy} y2={gy} stroke="currentColor" className="stroke-border" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={gy + 3} textAnchor="end" fontSize="9" className="fill-muted-foreground">
              {(max - (g / 3) * range).toFixed(1)}
            </text>
          </g>
        );
      })}

      {actLine && <polyline points={actLine} fill="none" stroke="#2563EB" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
      {fcLine && <polyline points={fcLine} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />}

      {data.map((d, i) => (
        <text key={d.year} x={x(i)} y={height - 8} textAnchor="middle" fontSize="8.5" className="fill-muted-foreground">
          {d.year.replace("F", "")}
        </text>
      ))}

      {data.filter((d) => d.forecast != null).map((d) => {
        const idx = data.findIndex((z) => z === d);
        return <circle key={d.year} cx={x(idx)} cy={y(d.forecast!)} r={3} fill="#F59E0B" />;
      })}

      <g transform={`translate(${pad.left}, ${pad.top - 2})`}>
        <circle cx={4} cy={0} r={3} fill="#2563EB" />
        <text x={12} y={3} fontSize="9" className="fill-muted-foreground">Actual</text>
        <line x1={42} y1={0} x2={56} y2={0} stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3" />
        <text x={62} y={3} fontSize="9" className="fill-muted-foreground">Forecast</text>
      </g>
    </svg>
  );
}

/* ============ Peer Positioning ============ */
function PeerPositioning() {
  const [tab, setTab] = useState<"waemu" | "africa">("waemu");
  const rows = tab === "waemu" ? peerWaemu : peerAfrica;

  return (
    <div className={`${CARD_SURFACE} lg:col-span-1`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={SECTION_TITLE}>Peer Positioning</h2>
      </div>
      <div className="mb-3 flex gap-1 rounded-lg bg-muted p-1">
        {[["waemu", "Within UEMOA"], ["africa", "Across Africa"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val as "waemu" | "africa")}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              tab === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-medium">Country</th>
              <th className="px-2 py-2 text-right font-medium">Growth</th>
              <th className="px-2 py-2 text-right font-medium">Inflation</th>
              <th className="px-2 py-2 text-right font-medium">Fiscal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.country} className="border-b border-border/50 last:border-0">
                <td className="px-2 py-2">
                  <span className="mr-1.5 inline-flex align-middle"><Flag code={r.code} size={16} /></span>
                  <span className="text-xs font-medium text-foreground">{r.country}</span>
                </td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">{r.growth.toFixed(1)}%</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.inflation.toFixed(1)}%</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.fiscal.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ Risk Table ============ */
function RiskTable() {
  const cls = {
    Low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">Category</th>
            <th className="px-2 py-2 font-medium">Level</th>
            <th className="px-2 py-2 font-medium">Outlook</th>
            <th className="px-2 py-2 font-medium">Comment</th>
          </tr>
        </thead>
        <tbody>
          {riskSnapshot.map((r) => (
            <tr key={r.category} className="border-b border-border/50 last:border-0">
              <td className="px-2 py-2 text-xs font-medium text-foreground">{r.category}</td>
              <td className="px-2 py-2">
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${cls[r.level as keyof typeof cls]}`}>{r.level}</span>
              </td>
              <td className="px-2 py-2 text-xs text-muted-foreground">{r.outlook}</td>
              <td className="px-2 py-2 text-xs text-muted-foreground">{r.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
