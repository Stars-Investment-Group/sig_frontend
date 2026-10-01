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
import { exportCsv } from "@/utils/exportCsv";
import { getStaticHistory, getVintages } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";

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

/**
 * Millesimes reels issus du jeu statique : une ligne par periode, avec la
 * valeur du dernier millesime, celle du millesime precedent, et le nombre de
 * revisions connues. Alimente par `getVintages` (module 3).
 */
const EXPLORER_COUNTRY = "CIV";
const EXPLORER_INDICATOR = "real_gdp_growth";

const VINTAGE_ROWS = getStaticHistory(EXPLORER_COUNTRY, EXPLORER_INDICATOR)
  .slice()
  .reverse()
  .map((obs) => {
    const vintages = getVintages(EXPLORER_COUNTRY, EXPLORER_INDICATOR, obs.period);
    const previous = vintages[1] ?? null;
    return {
      year: obs.period,
      latest: obs.value,
      prev: previous ? previous.value : obs.value,
      change: previous ? Math.round((obs.value - previous.value) * 10) / 10 : 0,
      first: vintages[vintages.length - 1]?.releaseDate ?? obs.releaseDate,
      obs: vintages.length,
    };
  });

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

/** Excel et SDMX exigent le générateur côté backend (module 10). */
type ExportFormat = "CSV" | "JSON";
const EXPORT_FORMATS: { id: string; enabled: boolean }[] = [
  { id: "CSV", enabled: true },
  { id: "Excel", enabled: false },
  { id: "JSON", enabled: true },
  { id: "SDMX", enabled: false },
];

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-foreground">{children}</h2>;
}

/**
 * Valeur d'une periode **telle qu'on la connaissait** il y a N mois.
 *
 * C'est tout l'interet du millesime : les colonnes « 3M Ago », « 6M Ago » et
 * « 1Y Ago » de la maquette ne sont pas des periodes anterieures, ce sont des
 * *etats de connaissance* anterieurs de la meme periode. On cherche donc le
 * millesime le plus recent publie avant la date cible.
 */
function valueAsOf(period: string, monthsBack: number): number | null {
  const vintages = getVintages(EXPLORER_COUNTRY, EXPLORER_INDICATOR, period);
  if (!vintages.length) return null;

  const [y, m, d] = vintages[0].vintageDate.split("-").map(Number);
  // Les dates de millesime sont calees au 1er du mois : pas de debordement.
  const target = new Date(y, m - 1 - monthsBack, d);
  const pad = (n: number) => String(n).padStart(2, "0");
  const targetIso = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;

  const known = vintages.find((v) => v.vintageDate <= targetIso);
  return known ? known.value : null;
}

/** Nombre de periodes affichees avant « Load More History ». */
const INITIAL_ROWS = 8;

export function DataExplorerPage() {
  const { t } = useI18n();
  const [showVintages, setShowVintages] = useState(true);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeVintages, setIncludeVintages] = useState(true);
  const [includeFootnotes, setIncludeFootnotes] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");
  const [expanded, setExpanded] = useState(false);

  const visibleRows = expanded ? VINTAGE_ROWS : VINTAGE_ROWS.slice(0, INITIAL_ROWS);
  const latest = VINTAGE_ROWS[0];

  /** Construit le jeu exporté à partir des options cochées. */
  const buildExportRows = () => {
    const base = includeVintages
      ? VINTAGE_ROWS.map((r) => ({
          period: r.year,
          value: r.latest,
          previousVintage: r.prev,
          change: r.change,
          firstRelease: r.first,
          observations: r.obs,
        }))
      : CHART_DATA.map((d) => ({ period: String(d.year), value: d.value }));

    if (!includeMeta) return base;
    return base.map((row) => ({
      indicator: "Real GDP Growth (YoY)",
      countryCode: EXPLORER_COUNTRY,
      unit: "%",
      source: "IMF - WEO",
      ...row,
      ...(includeFootnotes ? { footnote: "Valeurs de démonstration — jeu statique." } : {}),
    }));
  };

  const handleDownload = () => {
    const rows = buildExportRows();
    const filename = `sig-real-gdp-growth-civ-${new Date().toISOString().slice(0, 10)}`;

    if (exportFormat === "CSV") {
      exportCsv(rows, filename);
      return;
    }

    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.data.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("page.data.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Star className="h-4 w-4" /> Save View
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download Data
          </Button>
        </div>
      </div>

      {/* ===== Barre de filtres ===== */}
      <FilterBar onExport={handleDownload} />

      {/* ===== Fiche indicateur + graphique =====
          La maquette met l'identite de la serie a gauche et le graphe a droite :
          on lit ce qu'on regarde avant de regarder la courbe. */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={SECTION_PADDING}>
          <div className="flex flex-wrap items-center gap-2">
            <H>Real GDP Growth (YoY)</H>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
              Official
            </Badge>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm">
            <Flag code={EXPLORER_COUNTRY} size={16} />
            <span className="font-medium text-foreground">Côte d&apos;Ivoire</span>
          </p>
          <p className="text-xs text-muted-foreground">IMF - World Economic Outlook</p>

          <p className="mt-4 text-4xl font-bold tabular-nums text-foreground">
            {latest ? latest.latest.toFixed(1) : "—"}%
          </p>
          <p className="text-xs text-muted-foreground">Dernier ({latest?.year ?? "n/d"})</p>

          {latest && (
            <p
              className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${
                latest.change >= 0
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {latest.change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {latest.change >= 0 ? "+" : ""}
              {latest.change.toFixed(1)} pp vs millésime précédent
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              ["Prochaine publication", "21 mai 2026"],
              ["Fréquence", "Mensuelle"],
              ["Unité", "Pourcentage (%)"],
              ["Corrigé des variations saisonnières", "Oui"],
              ["Couverture", `${VINTAGE_ROWS.length} périodes`],
              ["Millésimes", `${latest?.obs ?? 0} sur la dernière période`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] leading-tight text-muted-foreground">{k}</dt>
                <dd className="text-sm font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={`${SECTION_PADDING} lg:col-span-2`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {["1Y", "5Y", "10Y", "Max"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    i === 2
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChartType("line")}
                aria-label="Courbe"
                className={`rounded-md p-1.5 ${chartType === "line" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LineChart className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("bar")}
                aria-label="Barres"
                className={`rounded-md p-1.5 ${chartType === "bar" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button aria-label="Options" className="rounded-md p-1.5 text-muted-foreground hover:text-foreground">
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Chart type={chartType} />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>Source : IMF - WEO</span>
            <span className="italic">La zone grisée indique la prévision</span>
          </div>
        </div>
      </section>

      {/* ===== Valeurs et millésimes, pleine largeur ===== */}
      <section className={SECTION_PADDING}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <H>Indicator Values &amp; Vintages</H>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show revisions</span>
              <Switch checked={showVintages} onCheckedChange={setShowVintages} />
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Export Table
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Période</th>
                <th className="px-2 py-2 text-right font-medium">Dernier</th>
                {showVintages && (
                  <>
                    <th className="px-2 py-2 text-right font-medium">Précédent</th>
                    <th className="px-2 py-2 text-right font-medium">Change (pp)</th>
                    <th className="px-2 py-2 text-right font-medium">Il y a 3M</th>
                    <th className="px-2 py-2 text-right font-medium">Il y a 6M</th>
                    <th className="px-2 py-2 text-right font-medium">Il y a 1 an</th>
                  </>
                )}
                <th className="px-2 py-2 text-right font-medium">Millésimes</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={r.year} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 font-medium text-foreground">{r.year}</td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">
                    {r.latest.toFixed(1)}
                  </td>
                  {showVintages && (
                    <>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {r.prev.toFixed(1)}
                      </td>
                      <td
                        className={`px-2 py-2 text-right tabular-nums ${
                          r.change > 0
                            ? "font-semibold text-green-600 dark:text-green-500"
                            : r.change < 0
                              ? "font-semibold text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {r.change > 0 ? "+" : ""}
                        {r.change.toFixed(1)}
                      </td>
                      {[3, 6, 12].map((months) => {
                        const value = valueAsOf(r.year, months);
                        return (
                          <td
                            key={months}
                            className="px-2 py-2 text-right tabular-nums text-muted-foreground"
                          >
                            {value === null ? "—" : value.toFixed(1)}
                          </td>
                        );
                      })}
                    </>
                  )}
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {visibleRows.length} période{visibleRows.length > 1 ? "s" : ""} sur {VINTAGE_ROWS.length}
          </span>
          {VINTAGE_ROWS.length > INITIAL_ROWS && (
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Réduire l'historique" : "Charger plus d'historique"}
            </Button>
          )}
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          « Il y a 3M / 6M / 1 an » donne la valeur de la période <em>telle qu'on la connaissait</em>{" "}
          à cette date, pas la valeur d'une période antérieure. Un tiret signale qu&apos;aucun
          millésime n&apos;était publié.
        </p>
      </section>

      {/* ===== Source, calendrier, export ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={SECTION_PADDING}>
          <H>Source &amp; Methodology</H>
          <dl className="mt-3 space-y-2">
            {[
              ["Source", "IMF - World Economic Outlook"],
              ["Publication", "Avril 2026"],
              ["Prochaine", "21 mai 2026"],
              ["Couverture", `${VINTAGE_ROWS.length} périodes`],
              ["Fréquence", "Mensuelle"],
              ["Unité", "Pourcentage (%)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border/50 pb-1.5 text-xs last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Croissance annuelle du PIB réel, en monnaie locale constante. Les valeurs de prévision
            sont produites par le FMI et peuvent différer des notes pays.
          </p>
          <a href="#" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Voir la méthodologie complète <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className={SECTION_PADDING}>
          <div className="flex items-center justify-between">
            <H>Release Calendar</H>
            <a href="/calendar" className="text-xs font-medium text-primary hover:underline">
              Calendrier complet →
            </a>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-1 py-1.5 font-medium">Publication</th>
                <th className="px-1 py-1.5 font-medium">Période</th>
                <th className="px-1 py-1.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {VINTAGE_ROWS.slice(0, 5).map((r, i) => (
                <tr key={r.year} className="border-b border-border/50 last:border-0">
                  <td className="px-1 py-2 text-xs tabular-nums text-muted-foreground">{r.first}</td>
                  <td className="px-1 py-2 text-xs text-foreground">{r.year}</td>
                  <td className="px-1 py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                        i === 0 ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-500"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${i === 0 ? "bg-blue-500" : "bg-green-500"}`}
                      />
                      {i === 0 ? "À venir" : "Publié"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={SECTION_PADDING}>
          <H>Download &amp; Export</H>
          <p className="mt-2 text-xs text-muted-foreground">
            Télécharge l&apos;historique complet au format voulu.
          </p>
          <div className="mt-3 flex gap-1 rounded-lg bg-muted p-1">
            {EXPORT_FORMATS.map(({ id, enabled }) => (
              <button
                key={id}
                disabled={!enabled}
                onClick={() => enabled && setExportFormat(id as ExportFormat)}
                title={enabled ? undefined : "Disponible avec le backend (module 10)"}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  exportFormat === id
                    ? "bg-background text-foreground shadow-sm"
                    : enabled
                      ? "text-muted-foreground hover:text-foreground"
                      : "cursor-not-allowed text-muted-foreground/40"
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {[
              ["Métadonnées", includeMeta, setIncludeMeta],
              ["Millésimes", includeVintages, setIncludeVintages],
              ["Notes de bas de page", includeFootnotes, setIncludeFootnotes],
            ].map(([label, checked, setter]) => (
              <label key={label as string} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={checked as boolean}
                  onCheckedChange={(v) => (setter as (b: boolean) => void)(Boolean(v))}
                />
                {label as string}
              </label>
            ))}
          </div>

          <Button className="mt-4 w-full gap-2" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Télécharger ({exportFormat})
          </Button>

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-medium text-foreground">Accès API</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Cet indicateur sera accessible via l&apos;API du module 10.
            </p>
            <a href="#" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Documentation API <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== Indicateurs liés, révisions, qualité ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={SECTION_PADDING}>
          <H>Related Indicators</H>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-1 py-1.5 font-medium">Indicateur</th>
                <th className="px-1 py-1.5 text-right font-medium">Dernier</th>
                <th className="px-1 py-1.5 text-right font-medium">Variation</th>
              </tr>
            </thead>
            <tbody>
              {relatedIndicators.map((r) => (
                <tr key={r.name} className="border-b border-border/50 last:border-0">
                  <td className="px-1 py-2 text-xs text-foreground">{r.name}</td>
                  <td className="px-1 py-2 text-right text-xs font-semibold tabular-nums text-foreground">
                    {r.latest}
                  </td>
                  <td
                    className={`px-1 py-2 text-right text-xs font-medium tabular-nums ${
                      r.dir === "up"
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {r.yoy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="/indicators" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
            Explorer d&apos;autres indicateurs →
          </a>
        </div>

        <div className={SECTION_PADDING}>
          <H>Revision History</H>
          <p className="mt-1 text-xs text-muted-foreground">
            Dernière période : {latest?.year ?? "n/d"} — comment la valeur a changé d&apos;un
            millésime à l&apos;autre.
          </p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-1 py-1.5 font-medium">Millésime</th>
                <th className="px-1 py-1.5 text-right font-medium">Valeur</th>
                <th className="px-1 py-1.5 text-right font-medium">Change (pp)</th>
              </tr>
            </thead>
            <tbody>
              {(latest ? getVintages(EXPLORER_COUNTRY, EXPLORER_INDICATOR, latest.year) : []).map(
                (v, i, all) => {
                  const older = all[i + 1];
                  const delta = older ? Math.round((v.value - older.value) * 10) / 10 : null;
                  return (
                    <tr key={v.vintageDate} className="border-b border-border/50 last:border-0">
                      <td className="px-1 py-2 text-xs tabular-nums text-muted-foreground">
                        {v.vintageDate}
                      </td>
                      <td className="px-1 py-2 text-right text-xs font-semibold tabular-nums text-foreground">
                        {v.value.toFixed(1)}
                      </td>
                      <td
                        className={`px-1 py-2 text-right text-xs tabular-nums ${
                          delta === null
                            ? "text-muted-foreground"
                            : delta > 0
                              ? "font-semibold text-green-600 dark:text-green-500"
                              : delta < 0
                                ? "font-semibold text-red-600 dark:text-red-400"
                                : "text-muted-foreground"
                        }`}
                      >
                        {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {revisionHistory.length} campagnes de révision connues sur la série.
          </p>
        </div>

        <div className={SECTION_PADDING}>
          <div className="flex items-center justify-between">
            <H>Data Quality</H>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              High
            </Badge>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {qaBadges.map((b) => (
              <li key={b} className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                <span className="text-xs">
                  <span className="font-medium text-foreground">{b} : </span>
                  {qualityDesc(b)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Score global</span>
            <span className="text-lg font-bold tabular-nums text-foreground">95/100</span>
          </div>
          <a href="#" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            Notre cadre de qualité des données →
          </a>
        </div>
      </section>

      {/* ===== Notes et tags ===== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${SECTION_PADDING} lg:col-span-2`}>
          <H>Indicator Notes</H>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Des ruptures de série peuvent survenir lors d&apos;un changement de méthodologie ou
            d&apos;un rebasage. Les valeurs de prévision sont grisées sur le graphe et portent
            l&apos;indicateur <code className="text-foreground">isForecast</code> dans les données.
          </p>
          <a href="#" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
            Voir toutes les notes →
          </a>
        </div>

        <div className={SECTION_PADDING}>
          <H>Tags</H>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="cursor-pointer rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
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
function FilterBar({ onExport }: { onExport: () => void }) {
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
                <Flag code="CIV" size={14} />
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
          <Button size="sm" className="gap-1.5" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
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
