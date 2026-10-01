import { useMemo, useState } from "react";
import { useSearchParams } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Flame,
  Landmark,
  Scale,
  Search,
  ShieldAlert,
  Ship,
  TrendingUp,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { Flag } from "@/components/Flag";
import { Button } from "@/components/ui/button";
import { DeltaBadge } from "@/components/common/DeltaBadge";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { SectionCard, SubHeading } from "@/components/common/SectionCard";
import { ScoreBar } from "@/components/common/ScoreGauge";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { STATIC_THEMES, getTheme, type ThemeDetail } from "@/data/themes";
import { getCountryProfile } from "@/data/countryProfile";
import { getStaticHistory } from "@/data/mockData";
import type { ThemeSignal, ThemeTrend } from "@shared/schema";
import { cn } from "@/lib/utils";

/**
 * Themes Explorer — module 11.
 *
 * Specifie par `Tracker Section Theme Explore SIG.pdf`. La page repond a une
 * question que ni la fiche pays ni l'explorateur d'indicateurs ne traitent :
 * **naviguer par sujet** plutot que par pays ou par serie.
 *
 * Le theme ouvert vit dans l'URL (`/themes?code=inflation_prices`) : le
 * drill-down de la spec est donc partageable, et le retour a la liste ne perd
 * rien. Les quatre fonctionnalites attendues y sont : vue agregee, comparaison
 * entre pays du perimetre, signaux, et acces aux indicateurs sous-jacents.
 */

/** Le backend renvoie un nom d'icone ; la table de rendu vit cote client. */
const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  landmark: Landmark,
  "shield-alert": ShieldAlert,
  ship: Ship,
  wheat: Wheat,
  "building-2": Building2,
  scale: Scale,
  "trending-up": TrendingUp,
};

const TREND_LABEL: Record<ThemeTrend, string> = {
  improving: "En amélioration",
  stable: "Stable",
  deteriorating: "En dégradation",
};

const TREND_TONE: Record<ThemeTrend, string> = {
  improving: "text-emerald-600 dark:text-emerald-500",
  stable: "text-blue-600 dark:text-blue-400",
  deteriorating: "text-red-600 dark:text-red-400",
};

const SEVERITY_TONE: Record<ThemeSignal["severity"], string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

const SIGNAL_LABEL: Record<ThemeSignal["signalType"], string> = {
  threshold_breach: "Seuil franchi",
  trend_change: "Inflexion",
  regime_shift: "Bascule de régime",
};

export function ThemesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const theme = code ? getTheme(code) : undefined;

  const open = (next: string) => setSearchParams({ code: next });
  const back = () => setSearchParams({});

  return theme ? <ThemeDetailView theme={theme} onBack={back} /> : <ThemeGrid onOpen={open} />;
}

/* =========================================================================
 * Liste des themes
 * ========================================================================= */

function ThemeGrid({ onOpen }: { onOpen: (code: string) => void }) {
  const [query, setQuery] = useState("");
  const [onlyWithSignals, setOnlyWithSignals] = useState(false);

  const themes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return STATIC_THEMES.filter(
      (t) =>
        (!needle ||
          t.name.toLowerCase().includes(needle) ||
          (t.description ?? "").toLowerCase().includes(needle)) &&
        (!onlyWithSignals || t.activeSignals > 0)
    );
  }, [query, onlyWithSignals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Themes Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Naviguer par sujet d&apos;analyse plutôt que par pays ou par région.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un thème…"
              aria-label="Rechercher un thème"
              className="w-56 rounded-md border border-border bg-card py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button
            variant={onlyWithSignals ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyWithSignals((v) => !v)}
          >
            Signaux actifs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => {
          const Icon = ICONS[theme.icon ?? ""] ?? TrendingUp;
          return (
            <button
              key={theme.code}
              onClick={() => onOpen(theme.code)}
              className="card-surface flex flex-col p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${theme.color}1A`,
                    color: theme.color ?? undefined,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">{theme.name}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {theme.description}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{theme.countryCount}</span> pays
                {" · "}
                <span className="font-semibold text-foreground">{theme.indicatorCount}</span>{" "}
                indicateur{theme.indicatorCount > 1 ? "s" : ""}
                {" · "}
                <span
                  className={cn(
                    "font-semibold",
                    theme.activeSignals > 0 ? "text-amber-600 dark:text-amber-500" : "text-foreground"
                  )}
                >
                  {theme.activeSignals}
                </span>{" "}
                signal{theme.activeSignals > 1 ? "s" : ""} actif
                {theme.activeSignals > 1 ? "s" : ""}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={cn("text-[11px] font-medium", TREND_TONE[theme.trend])}>
                  {TREND_LABEL[theme.trend]}
                </span>
                <span className="text-xs font-semibold tabular-nums text-foreground">
                  {theme.averageScore === null ? "Non noté" : `${theme.averageScore}/100`}
                </span>
              </div>
              {/* Pas de barre sans score : une barre vide se lirait comme un zéro. */}
              {theme.averageScore === null ? (
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  En attente d&apos;indicateurs au catalogue
                </p>
              ) : (
                <ScoreBar value={theme.averageScore} max={100} className="mt-1.5" />
              )}

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Voir le thème
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {themes.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Aucun thème ne correspond à cette recherche.
        </p>
      )}
    </div>
  );
}

/* =========================================================================
 * Detail d'un theme
 * ========================================================================= */

function ThemeDetailView({ theme, onBack }: { theme: ThemeDetail; onBack: () => void }) {
  const Icon = ICONS[theme.icon ?? ""] ?? TrendingUp;

  // Comparaison : les pays du perimetre, classes par score composite.
  const countries = useMemo(
    () =>
      theme.countryCodes
        .map((code) => {
          const profile = getCountryProfile(code);
          return {
            code,
            name: profile.country.name,
            region: profile.country.region,
            score: Math.round(profile.rating.compositeScore * 10),
            riskScore: profile.metrics.riskScore,
            change: profile.rating.changeSincePrior,
            momentum: profile.regime.momentum,
          };
        })
        .sort((a, b) => b.score - a.score),
    [theme.countryCodes]
  );

  return (
    <div className="space-y-6">
      {/* ===== En-tete ===== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${theme.color}1A`, color: theme.color ?? undefined }}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{theme.name}</h1>
            <p className="text-sm text-muted-foreground">{theme.description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Tous les thèmes
        </Button>
      </div>

      {/* ===== Vue agregee ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pays concernés", value: String(theme.countryCount) },
          { label: "Indicateurs", value: String(theme.indicatorCount) },
          { label: "Signaux actifs", value: String(theme.activeSignals) },
          { label: "Score moyen", value: `${theme.averageScore}/100` },
        ].map((stat) => (
          <div key={stat.label} className="card-surface p-4">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* ===== Indicateurs sous-jacents ===== */}
      <SectionCard
        title="Indicateurs du thème"
        subtitle="Drill-down vers les séries qui composent le thème"
      >
        {theme.indicators.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {theme.indicators.map((indicator) => {
              // Serie du premier pays du perimetre, a titre d'apercu.
              const sample = theme.countryCodes[0];
              const history = getStaticHistory(sample, indicator.code);
              return (
                <li key={indicator.code} className="rounded-lg border border-border bg-muted/40 p-3">
                  <SubHeading>{indicator.name}</SubHeading>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {indicator.code} · {indicator.unit}
                  </p>
                  {history.length > 1 && (
                    <Sparkline
                      data={history.map((o) => o.value)}
                      width={200}
                      height={32}
                      className="mt-2 w-full"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucun indicateur de ce thème n&apos;est encore au catalogue du module 2.
          </p>
        )}

        {theme.plannedIndicators.length > 0 && (
          <KeyTakeaway tone="caution">
            Prévus par la spécification mais absents du catalogue :{" "}
            {theme.plannedIndicators.join(", ")}. Le compteur de {theme.indicatorCount} indicateurs
            les inclut, le drill-down ne les montrera qu&apos;une fois servis.
          </KeyTakeaway>
        )}
      </SectionCard>

      {/* ===== Signaux ===== */}
      <SectionCard
        title="Signaux du thème"
        subtitle="Franchissements de seuil et bascules de régime, calculés sur les données courantes"
      >
        {theme.signals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Pays</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Sévérité</th>
                  <th className="px-2 py-2 font-medium">Message</th>
                  <th className="px-2 py-2 text-right font-medium">Déclenché le</th>
                </tr>
              </thead>
              <tbody>
                {theme.signals.map((signal) => (
                  <tr key={signal.id} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-2.5">
                      <span className="flex items-center gap-1.5">
                        {signal.countryCode && <Flag code={signal.countryCode} size={16} />}
                        <span className="text-xs font-medium text-foreground">
                          {signal.countryName}
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">
                      {SIGNAL_LABEL[signal.signalType]}
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          SEVERITY_TONE[signal.severity]
                        )}
                      >
                        {signal.severity}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">{signal.message}</td>
                    <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {signal.triggeredAt.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucun signal actif sur ce thème : aucun seuil franchi, aucun régime en dégradation dans
            le périmètre.
          </p>
        )}
      </SectionCard>

      {/* ===== Comparaison entre pays du perimetre ===== */}
      <SectionCard
        title="Comparaison des pays"
        subtitle={`Les ${countries.length} pays du périmètre, classés par score composite`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Rang</th>
                <th className="px-2 py-2 font-medium">Pays</th>
                <th className="px-2 py-2 font-medium">Région</th>
                <th className="px-2 py-2 text-right font-medium">Score</th>
                <th className="px-2 py-2 font-medium">Niveau</th>
                <th className="px-2 py-2 text-right font-medium">Risque</th>
                <th className="px-2 py-2 text-right font-medium">vs revue</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country, index) => (
                <tr key={country.code} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <Flag code={country.code} size={16} />
                      <span className="text-xs font-medium text-foreground">{country.name}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-xs text-muted-foreground">{country.region}</td>
                  <td className="px-2 py-2.5 text-right text-xs font-bold tabular-nums text-foreground">
                    {country.score}
                  </td>
                  <td className="w-28 px-2 py-2.5">
                    <ScoreBar value={country.score} max={100} />
                  </td>
                  <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                    {country.riskScore}/100
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <DeltaBadge value={country.change} decimals={2} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
