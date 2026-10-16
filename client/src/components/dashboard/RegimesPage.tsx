import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Radar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Flag } from "@/components/Flag";
import { SectionCard } from "@/components/common/SectionCard";
import { KeyTakeaway } from "@/components/common/KeyTakeaway";
import { RegimeMapCard } from "@/components/dashboard/RegimeMapCard";
import { STATIC_COUNTRIES, DATA_AS_OF } from "@/data/mockData";
import { useRegimes } from "@/api/regimes";
import { sourceAttr } from "@/api/useApiData";
import type { MacroRegime } from "@shared/schema";
import { cn } from "@/lib/utils";

/**
 * Regimes — module 4.
 *
 * Remplace la branche `regimes` de l'ancien `SectionPage`, qui portait onze
 * autres sections jamais routees : quatre cents lignes de JSX mort, une table
 * de regions basee sur des codes alpha-2 disparus, et des pastilles restees
 * sur la palette sombre.
 *
 * Tout vient de `STATIC_REGIMES`. Rien n'est ecrit a la main ici, pas meme les
 * effectifs : une page de classification qui compterait faux ne vaudrait rien.
 */

const REGIME_ORDER: MacroRegime["regime"][] = [
  "Expansion",
  "Recovery",
  "Transition",
  "Recession",
];

const REGIME_LABEL: Record<string, string> = {
  Expansion: "Expansion",
  Recovery: "Récupération",
  Transition: "Transition",
  Recession: "Récession",
};

/**
 * Une couleur par regime, du plus porteur au plus degrade. Surchauffe et
 * recession ne partagent pas le rouge : un lecteur doit pouvoir distinguer
 * « l'economie accelere » de « elle recule ».
 */
const REGIME_TONE: Record<string, { chip: string; bar: string; dot: string }> = {
  Expansion: {
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  Recovery: {
    chip: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  Transition: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  Recession: {
    chip: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
};

const GROWTH_LABEL: Record<string, string> = {
  strong: "Forte",
  stable: "Stable",
  slow: "Molle",
  negative: "Négative",
};

const INFLATION_LABEL: Record<string, string> = {
  high: "Élevée",
  moderate: "Modérée",
  low: "Basse",
};

const RISK_LABEL: Record<string, string> = {
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

const STANCE_LABEL: Record<string, string> = {
  Tight: "Restrictive",
  Neutral: "Neutre",
  Accommodative: "Accommodante",
};

const MOMENTUM_META: Record<
  MacroRegime["momentum"],
  { label: string; icon: typeof Minus; tone: string }
> = {
  Improving: {
    label: "En amélioration",
    icon: ArrowUpRight,
    tone: "text-emerald-600 dark:text-emerald-500",
  },
  Stable: { label: "Stable", icon: Minus, tone: "text-muted-foreground" },
  Deteriorating: {
    label: "En dégradation",
    icon: ArrowDownRight,
    tone: "text-red-600 dark:text-red-400",
  },
};

const countryName = (code: string) =>
  STATIC_COUNTRIES.find((c) => c.code === code)?.name ?? code;

const regionOf = (code: string) =>
  STATIC_COUNTRIES.find((c) => c.code === code)?.region ?? "—";

export function RegimesPage() {
  const [filter, setFilter] = useState<MacroRegime["regime"] | "all">("all");
  const regimes = useRegimes();
  const all = regimes.data;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of all) {
      map.set(r.regime, (map.get(r.regime) ?? 0) + 1);
    }
    return map;
  }, [all]);

  const rows = useMemo(() => {
    const filtered = filter === "all" ? all : all.filter((r) => r.regime === filter);
    // Classe par regime, puis par risque croissant : le plus sain d'abord.
    return [...filtered].sort((a, b) => {
      const byRegime = REGIME_ORDER.indexOf(a.regime) - REGIME_ORDER.indexOf(b.regime);
      return byRegime !== 0 ? byRegime : a.riskScore - b.riskScore;
    });
  }, [filter, all]);

  const total = all.length;
  const expanding = (counts.get("Expansion") ?? 0) + (counts.get("Recovery") ?? 0);

  return (
    <div className="space-y-6" {...sourceAttr(regimes.fromApi)}>
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Radar className="h-6 w-6 text-primary" /> Régimes macroéconomiques
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Classification des {total} économies suivies selon la croissance, l&apos;inflation et
            le risque.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Dernière classification ·{" "}
          {DATA_AS_OF.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ===== Répartition ===== */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {REGIME_ORDER.map((regime) => {
          const count = counts.get(regime) ?? 0;
          const share = Math.round((count / total) * 100);
          const active = filter === regime;
          return (
            <button
              key={regime}
              onClick={() => setFilter(active ? "all" : regime)}
              aria-pressed={active}
              className={cn(
                "card-surface p-4 text-left transition-all",
                active ? "ring-2 ring-primary ring-offset-0" : "hover:shadow-md"
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", REGIME_TONE[regime].dot)} />
                <span className="text-xs font-medium text-muted-foreground">
                  {REGIME_LABEL[regime]}
                </span>
              </span>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">
                {count}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  / {total}
                </span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", REGIME_TONE[regime].bar)}
                  style={{ width: `${share}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{share}% du périmètre</p>
            </button>
          );
        })}
      </section>

      <KeyTakeaway tone={expanding >= total / 2 ? "positive" : "caution"}>
        {expanding} économies sur {total} sont en expansion ou en récupération
        {expanding >= total / 2
          ? " : le cycle reste porteur sur la majorité du périmètre."
          : " seulement : le cycle s'essouffle sur la majorité du périmètre."}
      </KeyTakeaway>

      {/* ===== Cartographie ===== */}
      <RegimeMapCard />
      {/* La carte et le tableau ne disent pas la meme chose, et la planche P1
          les distingue deja : l'une nuance par risque et dynamique, l'autre
          donne la classification en quatre regimes. Sans cette ligne, deux
          legendes differentes sur une meme page passent pour une erreur. */}
      <p className="-mt-3 text-xs text-muted-foreground">
        La carte nuance chaque pays par son <strong className="font-medium">score de risque</strong>{" "}
        et sa <strong className="font-medium">dynamique</strong>. Le tableau ci-dessous donne la{" "}
        <strong className="font-medium">classification en quatre régimes</strong> du module 4 : les
        deux lectures sont complémentaires, pas interchangeables.
      </p>

      {/* ===== Détail par pays ===== */}
      <SectionCard
        title="Régimes par pays"
        subtitle={
          filter === "all"
            ? `${rows.length} économies, du plus sain au plus exposé dans chaque régime`
            : `${rows.length} économie${rows.length > 1 ? "s" : ""} en ${REGIME_LABEL[filter].toLowerCase()}`
        }
        action={
          filter !== "all" ? (
            <button
              onClick={() => setFilter("all")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Tout afficher
            </button>
          ) : undefined
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">Pays</th>
                <th className="px-2 py-2 font-medium">Régime</th>
                <th className="px-2 py-2 font-medium">Dynamique</th>
                <th className="px-2 py-2 font-medium">Croissance</th>
                <th className="px-2 py-2 font-medium">Inflation</th>
                <th className="px-2 py-2 font-medium">Politique</th>
                <th className="px-2 py-2 text-right font-medium">Risque</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const momentum = MOMENTUM_META[r.momentum];
                return (
                  <tr
                    key={r.countryCode}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-2 py-2.5">
                      <Link
                        href={`/countries/${r.countryCode}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Flag code={r.countryCode} size={16} />
                        <span>
                          <span className="block text-xs font-medium text-foreground">
                            {countryName(r.countryCode)}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {regionOf(r.countryCode)}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-semibold",
                          REGIME_TONE[r.regime].chip
                        )}
                      >
                        {REGIME_LABEL[r.regime] ?? r.regime}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={cn("flex items-center gap-1 text-xs", momentum.tone)}>
                        <momentum.icon className="h-3.5 w-3.5" />
                        {momentum.label}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-foreground">
                      {GROWTH_LABEL[r.gdpGrowthLevel] ?? r.gdpGrowthLevel}
                    </td>
                    <td className="px-2 py-2.5 text-xs text-foreground">
                      {INFLATION_LABEL[r.inflationLevel] ?? r.inflationLevel}
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">
                      {STANCE_LABEL[r.policyStance] ?? r.policyStance}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {RISK_LABEL[r.riskLevel] ?? r.riskLevel}
                        </span>
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          {r.riskScore}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        La classification combine les scores de croissance, d&apos;inflation et de risque du
        module 4. Elle est recalculée à chaque millésime.
      </p>
    </div>
  );
}
