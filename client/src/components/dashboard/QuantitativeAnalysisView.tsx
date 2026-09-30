import { useState, type ReactNode } from "react";
import { Sparkline } from "@/components/dashboard/Sparkline";
import {
  growthForecastVsConsensus,
  inflationRatePath,
  macroKeyMetrics,
  forecastAssumptions,
  fiscalExternal,
  fiscalExternalMetrics,
  sovereignCurve,
  marketTableData,
  cocoaProduction,
  cocoaPrices,
  cocoaMetrics,
  waemuPeers,
  dataQualityScores,
  recentDataUpdates,
} from "@/data/mockDashboard";

const MODULES = [
  "Macro Snapshot",
  "Forecast Engine",
  "Fiscal & External",
  "Financial Markets",
  "Strategic Sector Monitor",
  "Peer Comparison",
  "Data Quality",
];

const SECTION_PADDING = "card-surface p-5";

function H({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold text-foreground">{children}</h2>;
}

export function QuantitativeAnalysisView() {
  const [active, setActive] = useState(1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <TopKpi label="Real GDP Growth" value="6.4%" delta="0.6" spark={[5.0,5.4,5.8,6.0,6.4]} good />
        <TopKpi label="Headline Inflation" value="2.3%" delta="-0.4" spark={[4.2,3.5,3.1,2.7,2.3]} good />
        <TopKpi label="Policy Rate" value="3.00%" delta="0.0" spark={[4.5,3.5,3.0,3.0,3.0]} />
        <TopKpi label="Fiscal Balance" value="-3.1%" delta="0.3" warn spark={[-3.2,-2.8,-3.1,-2.9,-3.1]} />
        <TopKpi label="Current Account" value="-1.9%" delta="0.4" good spark={[-2.5,-2.3,-1.9,-1.8,-1.9]} />
      </div>
      <div className="sticky top-16 z-20 -mx-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        <div className="flex w-max gap-1">
          {MODULES.map((m, i) => (
            <button key={m} onClick={() => setActive(i + 1)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${active === i + 1 ? "bg-white/20" : "bg-muted"}`}>{i + 1}</span>
              {m}
            </button>
          ))}
        </div>
      </div>
      {active === 1 && <Module1 />}
      {active === 2 && <Module2 />}
      {active === 3 && <Module3 />}
      {active === 4 && <Module4 />}
      {active === 5 && <Module5 />}
      {active === 6 && <Module6 />}
      {active === 7 && <Module7 />}
    </div>
  );
}


function TopKpi({ label, value, delta, spark, good, warn }: { label: string; value: string; delta: string; spark: number[]; good?: boolean; warn?: boolean }) {
  const color = good ? "#16A34A" : warn ? "#EF4444" : "#2563EB";
  const num = parseFloat(delta);
  return (
    <div className={SECTION_PADDING}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
        <span style={{ color }} className="text-xs font-semibold">{num > 0 ? "+" : ""}{delta}</span>
      </div>
      <div className="mt-1"><Sparkline data={spark} color={color} width={120} height={28} /></div>
    </div>
  );
}

function Module1() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={SECTION_PADDING}>
          <H>Forecast vs Consensus</H>
          <p className="mb-3 text-xs text-muted-foreground">Real GDP Growth (%) — zone d'incertitude</p>
          <GrowthVsConsensusChart />
        </div>
        <div className={SECTION_PADDING}>
          <H>Inflation &amp; Policy Rate Path</H>
          <p className="mb-3 text-xs text-muted-foreground">Bande cible BCEAO 2-4%</p>
          <InflationRateChart />
        </div>
      </div>
      <div className={SECTION_PADDING}>
        <H>Key Metrics</H>
        <table className="mt-3 w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">Indicator</th><th className="px-2 py-2 text-right font-medium">2024</th><th className="px-2 py-2 text-right font-medium">2025F</th>
          </tr></thead>
          <tbody>
            {macroKeyMetrics.map((r) => (
              <tr key={r.label} className="border-b border-border/50 last:border-0">
                <td className="px-2 py-2 text-xs font-medium text-foreground">{r.label}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r["2024"]}</td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">{r["2025F"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 rounded-lg bg-muted p-4">
          <H>Key Takeaway</H>
          <p className="mt-1 text-sm text-muted-foreground">La Côte d'Ivoire conserve un écart de croissance positif face au consensus, l'inflation reste dans la bande cible de la BCEAO.</p>
        </div>
      </div>
    </div>
  );
}

function Module2() {
  return (
    <div className={SECTION_PADDING}>
      <H>GDP Forecast Trajectory</H>
      <p className="mb-3 text-xs text-muted-foreground">Avec intervalle de confiance à 80%</p>
      <ConfidenceIntervalChart />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <H>Key Forecast Assumptions</H>
          <dl className="mt-2 space-y-2">
            {forecastAssumptions.map((a) => (
              <div key={a.label} className="flex justify-between border-b border-border/50 pb-1.5 text-sm last:border-0">
                <dt className="text-xs text-muted-foreground">{a.label}</dt><dd className="text-xs font-semibold tabular-nums text-foreground">{a.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-lg bg-muted p-4">
          <H>Model Note</H>
          <p className="mt-1 text-sm text-muted-foreground">Le moteur combine les hypothèses de prix du cacao, du pétrole et de la croissance mondiale. L'intervalle à 80% capture l'incertitude sur les chocs externes.</p>
        </div>
      </div>
    </div>
  );
}

function Module3() {
  return (
    <div className="space-y-6">
      <div className={SECTION_PADDING}>
        <H>Fiscal &amp; External Balance</H>
        <p className="mb-3 text-xs text-muted-foreground">% of GDP, 2023-2027F</p>
        <FiscalExternalChart />
      </div>
      <div className={SECTION_PADDING}>
        <H>Fiscal &amp; External Metrics</H>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {fiscalExternalMetrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">{m.label}</p><p className="mt-1 text-lg font-bold tabular-nums text-foreground">{m.value}</p>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Module4() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className={SECTION_PADDING}>
        <H>Sovereign Yield Curve</H>
        <p className="mb-3 text-xs text-muted-foreground">Obligations souveraines (Côte d'Ivoire / USD)</p>
        <YieldCurveChart />
      </div>
      <div className={SECTION_PADDING}>
        <H>EMBI Spread</H>
        <p className="mb-3 text-xs text-muted-foreground">Écarts EMBI (bps)</p>
        <EmbiSpreadChart />
        <table className="mt-4 w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-1 py-1.5 font-medium">Metric</th><th className="px-1 py-1.5 text-right font-medium">Value</th>
          </tr></thead>
          <tbody>
            {marketTableData.map((r) => (
              <tr key={r.metric} className="border-b border-border/50 last:border-0">
                <td className="px-1 py-1.5 text-xs text-foreground">{r.metric}</td><td className="px-1 py-1.5 text-right text-xs font-semibold tabular-nums text-foreground">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Module5() {
  return (
    <div className="space-y-6">
      <H>Sector Focus — Cocoa</H>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={SECTION_PADDING}>
          <H>Cocoa Production &amp; Exports</H>
          <p className="mb-3 text-xs text-muted-foreground">Million tonnes</p>
          <CocoaBarChart />
        </div>
        <div className={SECTION_PADDING}>
          <H>Cocoa Prices</H>
          <p className="mb-3 text-xs text-muted-foreground">USD / ton</p>
          <CocoaPriceChart />
        </div>
      </div>
      <div className={SECTION_PADDING}>
        <H>Key Sector Metrics</H>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cocoaMetrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">{m.label}</p><p className="mt-1 text-lg font-bold tabular-nums text-foreground">{m.value}</p>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Module6() {
  return (
    <div className={SECTION_PADDING}>
      <H>WAEMU Peer Growth (2025F)</H>
      <PeerBarChart />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <H>Peer Snapshot</H>
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-1 py-1.5 font-medium">Country</th><th className="px-1 py-1.5 text-right font-medium">Growth</th><th className="px-1 py-1.5 text-right font-medium">Inflation</th><th className="px-1 py-1.5 text-right font-medium">Fiscal</th>
            </tr></thead>
            <tbody>
              {waemuPeers.map((p) => (
                <tr key={p.country} className="border-b border-border/50 last:border-0">
                  <td className="px-1 py-2 text-xs font-medium text-foreground">{p.country}</td>
                  <td className="px-1 py-2 text-right text-xs font-semibold tabular-nums text-foreground">{p.growth.toFixed(1)}%</td>
                  <td className="px-1 py-2 text-right text-xs tabular-nums text-muted-foreground">{p.inflation.toFixed(1)}%</td>
                  <td className="px-1 py-2 text-right text-xs tabular-nums text-muted-foreground">{p.fiscal.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <H>Inflation vs GDP Growth (Scatter)</H>
          <ScatterPlot />
        </div>
      </div>
    </div>
  );
}

function Module7() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className={`${SECTION_PADDING} lg:col-span-2`}>
        <H>Data Quality Scores</H>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dataQualityScores.map((s) => (
            <div key={s.label} className="flex items-center gap-4 rounded-lg border border-border p-3">
              <Gauge score={s.score} />
              <div><p className="text-sm font-semibold text-foreground">{s.label}</p><p className="text-xs text-muted-foreground">{s.score}/100</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className={SECTION_PADDING}>
        <H>Recent Data Updates</H>
        <table className="mt-3 w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-1 py-1.5 font-medium">Indicator</th><th className="px-1 py-1.5 text-right font-medium">Freshness</th>
          </tr></thead>
          <tbody>
            {recentDataUpdates.map((r) => (
              <tr key={r.indicator} className="border-b border-border/50 last:border-0">
                <td className="px-1 py-2"><span className="block text-xs font-medium text-foreground">{r.indicator}</span><span className="block text-[11px] text-muted-foreground">{r.date} · {r.frequency}</span></td>
                <td className="px-1 py-2 text-right"><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{r.freshness}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GrowthVsConsensusChart() {
  const W = 460, H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 34 };
  const data = growthForecastVsConsensus;
  const values = data.map((d) => [d.low, d.high, d.sig, d.consensus]).flat();
  const min = Math.min(...values) - 0.5, max = Math.max(...values) + 0.5, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0,1,2,3,4].map((g) => { const gy = pad.top + (g / 4) * ih; return (
        <g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{(max-(g/4)*range).toFixed(1)}</text></g> ); })}
      {data.map((d,i) => <rect key={i} x={x(i)-8} y={y(d.high)} width={16} height={y(d.low)-y(d.high)} fill="#2563EB" opacity={0.12} rx={2} />)}
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.sig)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth={2} />
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.consensus)}`).join(" ")} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 4" />
      {data.map((d,i)=>(<g key={i}><circle cx={x(i)} cy={y(d.sig)} r={3} fill="#2563EB" /><circle cx={x(i)} cy={y(d.consensus)} r={3} fill="#F59E0B" /></g>))}
      {data.map((d,i)=><text key={d.year} x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.year}</text>)}
      <g transform={`translate(${pad.left}, ${pad.top-4})`}><circle cx={5} cy={0} r={3} fill="#2563EB" /><text x={14} y={3} fontSize="9" className="fill-muted-foreground">SIG</text><line x1={40} y1={0} x2={56} y2={0} stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3" /><text x={62} y={3} fontSize="9" className="fill-muted-foreground">Consensus</text></g>
    </svg>
  );
}

function InflationRateChart() {
  const W = 460, H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 34 };
  const data = inflationRatePath;
  const min = 0, max = 6, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  // L'axe est inverse : y(4) est le haut de la bande de cible, y(2) le bas.
  const targetTop = y(4), targetBottom = y(2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <rect x={pad.left} y={targetTop} width={iw} height={targetBottom - targetTop} fill="#F59E0B" opacity={0.15} />
      <text x={pad.left+4} y={targetTop-4} fontSize="9" className="fill-amber-600 dark:fill-amber-400">Target 2-4%</text>
      {[0,1,2,3,4,5,6].map((g)=>(<g key={g}><line x1={pad.left} x2={W-pad.right} y1={y(g)} y2={y(g)} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={y(g)+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}%</text></g>))}
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.inflation)}`).join(" ")} fill="none" stroke="#16A34A" strokeWidth={2} />
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.rate)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth={2} strokeDasharray="5 4" />
      {data.map((d,i)=>(<g key={i}><circle cx={x(i)} cy={y(d.inflation)} r={3} fill="#16A34A" /><circle cx={x(i)} cy={y(d.rate)} r={3} fill="#2563EB" /></g>))}
      {data.map((d,i)=><text key={d.year} x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.year}</text>)}
      <g transform={`translate(${pad.left}, ${pad.top-4})`}><circle cx={4} cy={0} r={3} fill="#16A34A" /><text x={12} y={3} fontSize="9" className="fill-muted-foreground">Inflation</text><line x1={54} y1={0} x2={68} y2={0} stroke="#2563EB" strokeWidth={2} strokeDasharray="4 3" /><text x={74} y={3} fontSize="9" className="fill-muted-foreground">Policy Rate</text></g>
    </svg>
  );
}

function ConfidenceIntervalChart() {
  const W = 560, H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 34 };
  const data = [
    { year: "2024", low: 5.4, high: 6.2, mid: 5.8 },
    { year: "2025F", low: 5.9, high: 6.8, mid: 6.4 },
    { year: "2026F", low: 6.2, high: 7.2, mid: 6.8 },
    { year: "2027F", low: 6.4, high: 7.4, mid: 7.0 },
  ];
  const values = data.map((d) => [d.low, d.high]).flat();
  const min = Math.min(...values) - 0.5, max = Math.max(...values) + 0.5, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0,1,2,3,4].map((g) => { const gy = pad.top + (g / 4) * ih; return (
        <g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{(max-(g/4)*range).toFixed(1)}</text></g> ); })}
      {data.map((d,i)=><rect key={i} x={x(i)-12} y={y(d.high)} width={24} height={y(d.low)-y(d.high)} fill="#2563EB" opacity={0.18} rx={3} />)}
      {data.map((d,i)=>(<g key={i}><circle cx={x(i)} cy={y(d.mid)} r={3.5} fill="#2563EB" /><line x1={x(i)} y1={y(d.high)} x2={x(i)} y2={y(d.low)} stroke="#2563EB" strokeWidth={1.5} /></g>))}
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.mid)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth={2} />
      {data.map((d,i)=><text key={d.year} x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.year}</text>)}
    </svg>
  );
}

function FiscalExternalChart() {
  const W = 560, H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 34 };
  const data = fiscalExternal;
  const values = data.map((d) => [d.fiscal, d.current]).flat();
  const min = Math.min(...values) - 1, max = 1, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  const zeroY = y(0);
  const barW = (iw / data.length) * 0.3;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[-3,-2,-1,0].map((g)=>{ const gy = y(g); return (<g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}%</text></g>); })}
      <line x1={pad.left} x2={W-pad.right} y1={zeroY} y2={zeroY} stroke="#94A3B8" />
      {data.map((d,i)=>(<g key={d.year}><rect x={x(i)-barW-2} y={y(Math.min(0,d.fiscal))} width={barW} height={Math.abs(zeroY-y(d.fiscal))} fill="#EF4444" rx={2} /><rect x={x(i)+2} y={y(Math.min(0,d.current))} width={barW} height={Math.abs(zeroY-y(d.current))} fill="#F59E0B" rx={2} /><text x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.year}</text></g>))}
      <g transform={`translate(${pad.left}, ${pad.top-4})`}><rect x={0} y={-7} width={10} height={10} fill="#EF4444" rx={2} /><text x={15} y={3} fontSize="9" className="fill-muted-foreground">Fiscal</text><rect x={60} y={-7} width={10} height={10} fill="#F59E0B" rx={2} /><text x={75} y={3} fontSize="9" className="fill-muted-foreground">Current Acct</text></g>
    </svg>
  );
}

function YieldCurveChart() {
  const W = 420, H = 200;
  const pad = { top: 18, right: 16, bottom: 26, left: 32 };
  const data = sovereignCurve;
  const min = 3, max = 8, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[4,5,6,7,8].map((g)=>{ const gy = y(g); return (<g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}%</text></g>); })}
      <path d={`M ${data.map((d,i)=>`${x(i)},${y(d.yield)}`).join(" L ")} L ${x(data.length-1)},${H-pad.bottom} L ${pad.left},${H-pad.bottom} Z`} fill="#2563EB" opacity={0.08} />
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.yield)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth={2} />
      {data.map((d,i)=>(<g key={d.tenor}><circle cx={x(i)} cy={y(d.yield)} r={3} fill="#2563EB" /><text x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.tenor}</text></g>))}
    </svg>
  );
}

function EmbiSpreadChart() {
  const W = 420, H = 200;
  const pad = { top: 18, right: 16, bottom: 26, left: 40 };
  const pts = [320, 350, 395, 385, 400, 385];
  const min = 300, max = 420, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (pts.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[300,340,380,420].map((g)=>{ const gy = y(g); return (<g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}</text></g>); })}
      <polyline points={pts.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#F59E0B" strokeWidth={2} />
      {pts.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#F59E0B" />)}
    </svg>
  );
}

function CocoaBarChart() {
  const W = 420, H = 200;
  const pad = { top: 18, right: 16, bottom: 26, left: 34 };
  const data = cocoaProduction;
  const maxV = 3;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const bw = iw / data.length;
  const x = (i: number) => pad.left + i * bw + bw / 2;
  const y = (v: number) => pad.top + ((maxV - v) / maxV) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0,1,2,3].map((g)=>{ const gy = pad.top + (g/3)*ih; return (<g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}</text></g>); })}
      {data.map((d,i)=>(<g key={d.year}><rect x={x(i)-bw*0.35} y={y(d.production)} width={bw*0.3} height={H-pad.bottom-y(d.production)} fill="#2563EB" rx={2} /><rect x={x(i)+bw*0.05} y={y(d.exports)} width={bw*0.3} height={H-pad.bottom-y(d.exports)} fill="#F59E0B" rx={2} /><text x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.year}</text></g>))}
      <g transform={`translate(${pad.left}, ${pad.top-4})`}><rect x={0} y={-7} width={10} height={10} fill="#2563EB" rx={2} /><text x={15} y={3} fontSize="9" className="fill-muted-foreground">Production</text><rect x={90} y={-7} width={10} height={10} fill="#F59E0B" rx={2} /><text x={105} y={3} fontSize="9" className="fill-muted-foreground">Exports</text></g>
    </svg>
  );
}

function CocoaPriceChart() {
  const W = 420, H = 200;
  const pad = { top: 18, right: 16, bottom: 26, left: 40 };
  const data = cocoaPrices;
  const min = 2000, max = 5600, range = max - min;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.top + ((max - v) / range) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[2000,3000,4000,5000].map((g)=>{ const gy = y(g); return (<g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}</text></g>); })}
      <path d={`M ${data.map((d,i)=>`${x(i)},${y(d.value)}`).join(" L ")} L ${x(data.length-1)},${H-pad.bottom} L ${pad.left},${H-pad.bottom} Z`} fill="#8B5CF6" opacity={0.1} />
      <polyline points={data.map((d,i)=>`${x(i)},${y(d.value)}`).join(" ")} fill="none" stroke="#8B5CF6" strokeWidth={2} />
      {data.map((d,i)=>(<g key={d.year}><circle cx={x(i)} cy={y(d.value)} r={3} fill="#8B5CF6" /><text x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.year}</text></g>))}
    </svg>
  );
}

function PeerBarChart() {
  const W = 520, H = 200;
  const pad = { top: 18, right: 16, bottom: 26, left: 34 };
  const data = waemuPeers;
  const maxV = 8;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const bw = iw / data.length;
  const x = (i: number) => pad.left + i * bw + bw / 2;
  const y = (v: number) => pad.top + ((maxV - v) / maxV) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0,2,4,6,8].map((g)=>{ const gy = y(g); return (<g key={g}><line x1={pad.left} x2={W-pad.right} y1={gy} y2={gy} className="stroke-border" strokeDasharray="3 3" /><text x={pad.left-5} y={gy+3} textAnchor="end" fontSize="9" className="fill-muted-foreground tabular-nums">{g}%</text></g>); })}
      {data.map((d,i)=>(<g key={d.country}><rect x={x(i)-bw*0.3} y={y(d.growth)} width={bw*0.6} height={H-pad.bottom-y(d.growth)} fill={d.country === "Côte d'Ivoire" ? "#2563EB" : "#94A3B8"} rx={2} /><text x={x(i)} y={H-10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{d.country === "Côte d'Ivoire" ? "CIV" : d.country.slice(0,3)}</text></g>))}
    </svg>
  );
}

function ScatterPlot() {
  const W = 400, H = 200;
  const pad = { top: 18, right: 16, bottom: 26, left: 34 };
  const pts = waemuPeers.map((p) => ({ x: p.growth, y: p.inflation }));
  const minX = 4, maxX = 7, rangeX = maxX - minX;
  const minY = 2, maxY = 4.5, rangeY = maxY - minY;
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + ((i - minX) / rangeX) * iw;
  const y = (v: number) => pad.top + ((maxY - v) / rangeY) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[4,5,6,7].map((g)=>{ const gx = pad.left + ((g-minX)/rangeX)*iw; return (<g key={g}><line x1={gx} x2={gx} y1={pad.top} y2={H-pad.bottom} className="stroke-border" strokeDasharray="3 3" /><text x={gx+3} y={H-10} fontSize="9" className="fill-muted-foreground">{g}</text></g>); })}
      {pts.map((p,i)=>(<g key={i}><line x1={x(p.x)} y1={y(2)} x2={x(p.x)} y2={y(4.5)} stroke="#2563EB" opacity={0.12} /><circle cx={x(p.x)} cy={y(p.y)} r={5} fill={i === 0 ? "#2563EB" : "#94A3B8"} /></g>))}
      <text x={pad.left} y={pad.top-3} fontSize="9" className="fill-muted-foreground">Inflation %</text>
      <text x={W-70} y={H-10} fontSize="9" className="fill-muted-foreground">Growth %</text>
    </svg>
  );
}

function Gauge({ score }: { score: number }) {
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border-4" style={{ borderColor: color, color }}>
      <span className="text-xs font-bold">{score}</span>
    </div>
  );
}
