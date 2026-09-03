import { useState } from "react";
import { Calendar, Download, Share2, Star, Check, Info, ExternalLink, ChevronDown, TrendingUp, TrendingDown, LineChart, BarChart3, AreaChart, ScatterChart, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Flag } from "@/components/Flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* Échantillon de données Côte d'Ivoire — Real GDP Growth (YoY) 2015–2024 */
const CHART_DATA: { year: number; value: number }[] = [
  { year: 2015, value: 8.8 },
  { year: 2016, value: 7.9 },
  { year: 2017, value: 7.4 },
  { year: 2018, value: 6.9 },
  { year: 2019, value: 6.2 },
  { year: 2020, value: -2.0 },
  { year: 2021, value: 8.7 },
  { year: 2022, value: 6.2 },
  { year: 2023, value: 5.6 },
  { year: 2024, value: 6.2 },
];

const VINTAGE_ROWS = [
  { year: "2024", latest: 6.2, prev: 6.1, change: 0.1, first: "May 16, 2025", obs: 4 },
  { year: "2023", latest: 5.6, prev: 5.6, change: 0.0, first: "May 16, 2025", obs: 3 },
  { year: "2022", latest: 6.2, prev: 6.3, change: -0.1, first: "Oct 15, 2024", obs: 3 },
  { year: "2021", latest: 8.7, prev: 8.5, change: 0.2, first: "Oct 15, 2024", obs: 2 },
  { year: "2020", latest: -2.0, prev: -2.0, change: 0.0, first: "May 16, 2024", obs: 2 },
  { year: "2019", latest: 6.2, prev: 6.2, change: 0.0, first: "May 16, 2024", obs: 2 },
  { year: "2018", latest: 6.9, prev: 6.9, change: 0.0, first: "May 16, 2024", obs: 2 },
  { year: "2017", latest: 7.4, prev: 7.4, change: 0.0, first: "May 16, 2024", obs: 1 },
  { year: "2016", latest: 7.9, prev: 7.9, change: 0.0, first: "May 16, 2024", obs: 1 },
  { year: "2015", latest: 8.8, prev: 8.8, change: 0.0, first: "Oct 15, 2024", obs: 1 },
];

export interface RelatedIndicator {
  name: string;
  latest: string;
  yoy: string;
  dir: "up" | "down";
}

const relatedIndicators: RelatedIndicator[] = [
  { name: "Real GDP (Constant 2015 US$)", latest: "$81.45B", yoy: "6.2%", dir: "up" },
  { name: "GDP per Capita (Constant US$)", latest: "$2,868", yoy: "4.1%", dir: "up" },
  { name: "GDP Growth (Quarterly YoY)", latest: "6.4%", yoy: "0.7 pp", dir: "up" },
  { name: "Inflation, CPI (Annual %)", latest: "3.5%", yoy: "-0.3 pp", dir: "down" },
  { name: "Investment (% of GDP)", latest: "22.7%", yoy: "0.9 pp", dir: "up" },
];

const revisionHistory = [
  { date: "May 16, 2025", values: "2020–2024", maxChange: "+0.1", notes: "Incorpore les derniers comptes nationaux" },
  { date: "Oct 15, 2024", values: "2019–2023", maxChange: "+0.2", notes: "Révision annuelle" },
  { date: "May 16, 2024", values: "2018–2022", maxChange: "0.0", notes: "Benchmark update" },
];

const releaseCalendar = [
  { date: "May 16, 2025", event: "Annual Update", source: "World Bank - WDI" },
  { date: "May 31, 2026", event: "Annual Update", source: "World Bank - WDI" },
  { date: "May 15, 2027", event: "Annual Update", source: "World Bank - WDI" },
];

const qaBadges = ["Timeliness", "Accuracy", "Completeness", "Consistency"];
const tags = ["#Growth", "#National Accounts", "#Real GDP", "#YoY", "#Macro"];

const SECTION_PADDING = "card-surface p-5";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-foreground">{children}</h2>;
}

export function DataExplorerPage() {
  const [showVintages, setShowVintages] = useState(true);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeVintages, setIncludeVintages] = useState(true);
  const [includeFootnotes, setIncludeFootnotes] = useState(false);

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Outil d'analyse quantitative avancée, de comparaison de séries temporelles et d'audit des révisions (vintages).
        </p>
      </div>

      {/* ===== Barre de filtres ===== */}
      <FilterBar />

      {/* ===== Graphique + Latest Value ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Graphique */}
        <div className={`${SECTION_PADDING} lg:col-span-2`}>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <H>Real GDP Growth (YoY)</H>
              <p className="text-xs text-muted-foreground">Annual percent change</p>
            </div>
            <div className="flex items-center gap-1">
              {["1Y", "5Y", "10Y", "Max"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    i === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setChartType("line")} className={`rounded-md p-1.5 ${chartType === "line" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <LineChart className="h-4 w-4" />
              </button>
              <button onClick={() => setChartType("bar")} className={`rounded-md p-1.5 ${chartType === "bar" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <BarChart3 className="h-4 w-4" />
              </button>
              <button className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"><Settings2 className="h-4 w-4" /></button>
            </div>
          </div>

          <Chart type={chartType} />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Flag code="CI" size={14} /><span className="font-medium text-foreground">Côte d'Ivoire</span></span>
            </div>
            <p className="text-xs text-muted-foreground">Source: World Bank - World Development Indicators</p>
            <p className="text-xs italic text-muted-foreground">Click on chart to explore. Drag to zoom.</p>
          </div>
        </div>

        {/* Latest Value & Release Details */}
        <div className={`${SECTION_PADDING}`}>
          <H>Latest Value (2024)</H>
          <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">6.2%</p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-500">
            <TrendingUp className="h-4 w-4" /> 0.6 pp vs 2023 (5.6%)
          </p>

          <div className="mt-5">
            <H>Release Details</H>
            <dl className="mt-2 space-y-1.5 text-sm">
              {[
                ["Source", "World Bank - WDI"],
                ["Series Code", "NY.GDP.MKTP.KD.ZG"],
                ["Last Updated", "May 16, 2025"],
                ["Next Release", "May 2026"],
                ["Frequency", "Annual"],
                ["Coverage", "1960 – 2024"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/50 pb-1.5 text-xs last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-5">
            <H>Quick Stats</H>
            <dl className="mt-2 space-y-1.5 text-sm">
              {[
                ["10Y Average", "5.2%"],
                ["10Y High (2021)", "8.7%"],
                ["10Y Low (2020)", "-2.0%"],
                ["Observations", "65"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold tabular-nums text-foreground">{v}</span>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ===== Vintages / Methodology ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tableau des révisions */}
        <div className={`${SECTION_PADDING} lg:col-span-2`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <H>Indicator Values &amp; Vintages</H>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show revisions</span>
              <Switch checked={showVintages} onCheckedChange={setShowVintages} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Year</th>
                  <th className="px-2 py-2 text-right font-medium">Latest (May 16, 2025)</th>
                  <th className="px-2 py-2 text-right font-medium">Previous (Oct 15, 2024)</th>
                  <th className="px-2 py-2 text-right font-medium">Change (pp)</th>
                  <th className="px-2 py-2 font-medium">First Release</th>
                  <th className="px-2 py-2 text-right font-medium">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {VINTAGE_ROWS.map((r) => (
                  <tr key={r.year} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2 font-medium text-foreground">{r.year}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">{r.latest.toFixed(1)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.prev.toFixed(1)}</td>
                    <td className={`px-2 py-2 text-right tabular-nums ${r.change > 0 ? "text-green-600 dark:text-green-500 font-semibold" : "text-muted-foreground"}`}>
                      {r.change > 0 ? "+" : ""}{r.change.toFixed(1)}
                    </td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{r.first}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.obs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Showing 2015 – 2024</span>
            <a href="#" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Download className="h-3.5 w-3.5" /> Download table (CSV)
            </a>
          </div>
        </div>

        {/* Source & Methodology / Release Calendar */}
        <div className={`${SECTION_PADDING}`}>
          <H>Source &amp; Methodology</H>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="text-xs"><span className="text-muted-foreground">Source: </span><span className="font-medium text-foreground">World Bank - WDI</span></div>
            <div className="text-xs"><span className="text-muted-foreground">Method: </span><span className="text-foreground">Constant 2015 US$ GDP growth rate</span></div>
            <p className="text-xs text-muted-foreground">
              "Annual percentage growth rate of GDP at market prices based on constant local currency."
            </p>
          </dl>
          <a href="#" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View full methodology → <ExternalLink className="h-3 w-3" />
          </a>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <H>Release Calendar</H>
              <span className="text-[10px] text-muted-foreground">All times in UTC</span>
            </div>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-1 py-1.5 font-medium">Date</th>
                  <th className="px-1 py-1.5 font-medium">Event</th>
                  <th className="px-1 py-1.5 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {releaseCalendar.map((c) => (
                  <tr key={c.date} className="border-b border-border/50 last:border-0">
                    <td className="px-1 py-1.5 text-xs tabular-nums text-muted-foreground">{c.date}</td>
                    <td className="px-1 py-1.5 text-xs text-foreground">{c.event}</td>
                    <td className="px-1 py-1.5 text-[11px] text-muted-foreground">{c.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href="#" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">View full calendar →</a>
          </div>
        </div>
      </section>

      {/* ===== Export / Related / Revision History ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Download & Export */}
        <div className={SECTION_PADDING}>
          <H>Download &amp; Export</H>
          <div className="mt-3 flex gap-1 rounded-lg bg-muted p-1">
            {["CSV", "Excel", "JSON", "SDMX"].map((f, i) => (
              <button key={f} className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${i === 0 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2.5">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={includeMeta} onCheckedChange={(v) => setIncludeMeta(Boolean(v))} /> Include metadata
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={includeVintages} onCheckedChange={(v) => setIncludeVintages(Boolean(v))} /> Include vintages (revisions)
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={includeFootnotes} onCheckedChange={(v) => setIncludeFootnotes(Boolean(v))} /> Include footnotes
            </label>
          </div>

          <Button className="mt-4 w-full"><Download className="mr-2 h-4 w-4" /> Download Data</Button>
        </div>

        {/* Related indicators */}
        <div className={SECTION_PADDING}>
          <H>Related Indicators</H>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-1 py-1.5 font-medium">Indicator</th>
                  <th className="px-1 py-1.5 text-right font-medium">Latest (2024)</th>
                  <th className="px-1 py-1.5 text-right font-medium">YoY</th>
                </tr>
              </thead>
              <tbody>
                {relatedIndicators.map((r) => (
                  <tr key={r.name} className="border-b border-border/50 last:border-0">
                    <td className="px-1 py-2 text-xs font-medium text-foreground">{r.name}</td>
                    <td className="px-1 py-2 text-right text-xs tabular-nums text-muted-foreground">{r.latest}</td>
                    <td className={`px-1 py-2 text-right text-xs tabular-nums ${r.dir === "up" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-400"}`}>
                      {r.dir === "up" ? <TrendingUp className="mr-1 inline h-3 w-3" /> : <TrendingDown className="mr-1 inline h-3 w-3" />}
                      {r.dir === "up" ? "↑" : "↓"} {r.yoy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href="#" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">View all related indicators →</a>
        </div>

        {/* Revision history */}
        <div className={SECTION_PADDING}>
          <H>Revision History</H>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-1 py-1.5 font-medium">Vintage</th>
                  <th className="px-1 py-1.5 font-medium">Revised</th>
                  <th className="px-1 py-1.5 text-right font-medium">Max Δ (pp)</th>
                  <th className="px-1 py-1.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {revisionHistory.map((r) => (
                  <tr key={r.date} className="border-b border-border/50 last:border-0">
                    <td className="px-1 py-2 text-xs tabular-nums text-foreground">{r.date}</td>
                    <td className="px-1 py-2 text-xs tabular-nums text-muted-foreground">{r.values}</td>
                    <td className="px-1 py-2 text-right text-xs tabular-nums text-muted-foreground">{r.maxChange}</td>
                    <td className="px-1 py-2 text-[11px] text-muted-foreground">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href="#" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">View full revision history →</a>
        </div>
      </section>

      {/* ===== Data quality / Notes / Quick chart ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Data quality */}
        <div className={SECTION_PADDING}>
          <div className="flex items-center justify-between">
            <H>Data Quality</H>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">High</Badge>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {qaBadges.map((b) => (
              <li key={b} className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                <span><span className="font-medium text-foreground">{b}:</span> {qualityDesc(b)}</span>
              </li>
            ))}
          </ul>
          <a href="#" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">Learn more about our data quality framework →</a>
        </div>

        {/* Indicator notes */}
        <div className={SECTION_PADDING}>
          <H>Indicator Notes</H>
          <p className="mt-3 text-xs text-muted-foreground">
            Breaks in series may occur due to methodological changes or rebasing. Associated quarterly series:{" "}
            <span className="font-medium text-foreground">NY.GDP.MKTP.KD.ZG</span>.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer">{t}</span>
            ))}
          </div>
          <a href="#" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">View all notes &amp; tags →</a>
        </div>

        {/* Quick chart options */}
        <div className={SECTION_PADDING}>
          <H>Quick Chart Options</H>
          <p className="mt-3 text-xs font-medium text-foreground">Type</p>
          <div className="mt-1.5 flex gap-1">
            {[LineChart, BarChart3, AreaChart, ScatterChart].map((Ic, i) => (
              <button key={i} className={`rounded-md p-1.5 ${i === 0 ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Ic className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-foreground">Compare</p>
              <Select defaultValue="none">
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select country or region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="senegal">Senegal</SelectItem>
                  <SelectItem value="ghana">Ghana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Transform</p>
              <Select defaultValue="none">
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="changyoy">Change YoY</SelectItem>
                  <SelectItem value="index">Index 100</SelectItem>
                  <SelectItem value="log">Log</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <a href="#" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">Advanced chart settings →</a>
        </div>
      </section>
    </div>
  );
}

function qualityDesc(name: string): string {
  switch (name) {
    case "Timeliness": return "Data released within expected timeframe.";
    case "Accuracy": return "Source data is consistent and reliable.";
    case "Completeness": return "No missing observations in selected range.";
    case "Consistency": return "Methodology consistent over time.";
    default: return "";
  }
}

/* ============ Filter Bar ============ */
function FilterBar() {
  return (
    <div className="card-surface p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <Label>Indicator</Label>
          <Select defaultValue="gdp">
            <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gdp">Real GDP Growth (YoY)</SelectItem>
              <SelectItem value="inflation">Inflation (CPI %)</SelectItem>
              <SelectItem value="fiscal">Fiscal Balance (% GDP)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Country / Region</Label>
          <Select defaultValue="ci">
            <SelectTrigger className="mt-1 h-9 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Flag code="CI" size={14} />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ci">Côte d'Ivoire</SelectItem>
              <SelectItem value="sn">Senegal</SelectItem>
              <SelectItem value="gh">Ghana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Source</Label>
          <Select defaultValue="wb">
            <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="wb">World Bank - WDI</SelectItem>
              <SelectItem value="imf">IMF</SelectItem>
              <SelectItem value="bceao">BCEAO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Frequency</Label>
          <Select defaultValue="annual">
            <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {/* Date range */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="rounded-md border border-border px-2 py-1.5 tabular-nums">01/01/2010</span>
          <span>→</span>
          <span className="rounded-md border border-border px-2 py-1.5 tabular-nums">05/16/2025</span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Compare with</span>
            <Select defaultValue="none">
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sn">Senegal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Switch defaultChecked />
            <span>Revisions</span>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Save</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Share2 className="h-3.5 w-3.5" /> Share</Button>
          <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground">{children}</label>;
}

/* ============ Chart ============ */
function Chart({ type }: { type: "line" | "bar" }) {
  const W = 560;
  const H = 240;
  const pad = { top: 16, right: 18, bottom: 30, left: 40 };
  const data = CHART_DATA;
  const values = data.map((d) => d.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min;
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => pad.top + ((max - v) / range) * innerH;
  const barW = innerW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* grille */}
      {[0, 1, 2, 3, 4].map((g) => {
        const gy = pad.top + (g / 4) * innerH;
        const val = max - (g / 4) * range;
        return (
          <g key={g}>
            <line x1={pad.left} x2={W - pad.right} y1={gy} y2={gy} stroke="currentColor" className="stroke-border" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={gy + 3} textAnchor="end" fontSize="10" className="fill-muted-foreground tabular-nums">{val.toFixed(0)}%</text>
          </g>
        );
      })}

      {type === "line" ? (
        <>
          <polyline points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => (
            <circle key={d.year} cx={x(i)} cy={y(d.value)} r={3} fill="#2563EB" className="cursor-pointer">
              <title>{`${d.year}: ${d.value}%`}</title>
            </circle>
          ))}
        </>
      ) : (
        data.map((d, i) => (
          <rect key={d.year} x={pad.left + i * barW + barW * 0.25} y={y(Math.max(0, d.value))} width={barW * 0.5} height={Math.abs(y(0) - y(d.value))} fill="#2563EB" rx="2" />
        ))
      )}

      {/* axe X */}
      {data.map((d, i) => (
        <text key={d.year} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground tabular-nums">{d.year}</text>
      ))}
    </svg>
  );
}
