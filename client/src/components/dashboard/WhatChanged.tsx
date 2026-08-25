import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatChanged, type ChangeLog } from "@/data/mockDashboard";

const impactMap: Record<ChangeLog["impact"], { icon: typeof ArrowUpRight; cls: string }> = {
  Positive: { icon: ArrowUpRight, cls: "text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/40" },
  Neutral: { icon: Minus, cls: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40" },
  Negative: { icon: ArrowDownRight, cls: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40" },
};

/**
 * Range 4 (gauche) — What Changed vs Previous Update (spec §01B).
 * Flux des changements récents avec impact Positif / Négatif.
 */
export function WhatChanged() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-2">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          {t("whatChanged.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          Changements sur les 7 derniers jours
        </p>
      </div>

      <ul className="flex-1 space-y-3">
        {whatChanged.map((c) => {
          const imp = impactMap[c.impact];
          const Icon = imp.icon;
          return (
            <li key={`${c.entity}-${c.date}-${c.change}`}>
              <button className="group flex w-full gap-3 rounded-lg border-l-2 border-transparent p-2 text-left transition-colors hover:border-border hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${imp.cls}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.entity}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {c.type}
                    </span>
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{c.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.change}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

