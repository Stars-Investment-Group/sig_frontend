import { regimeMatrixRows, type RegimePulse } from "@/data/mockDashboard";
import { useI18n } from "@/lib/i18n";

const pulseMap: Record<RegimePulse, string> = {
  Positive: "bg-green-500",
  Stable: "bg-blue-500",
  Watch: "bg-amber-500",
  Negative: "bg-red-500",
};

const pulseLabel: Record<RegimePulse, string> = {
  Positive: "Positive",
  Stable: "Stable",
  Watch: "Watch",
  Negative: "Negative",
};

const columns: { key: keyof Omit<typeof regimeMatrixRows[number], "region">; labelKey: string }[] = [
  { key: "growth", labelKey: "matrix.growth" },
  { key: "inflation", labelKey: "matrix.inflation" },
  { key: "external", labelKey: "matrix.external" },
  { key: "policy", labelKey: "matrix.policy" },
  { key: "overall", labelKey: "matrix.overall" },
];

/**
 * Range 5 (gauche) — Regional Regime Matrix (spec §01B).
 * Matrice des régions × statut des signaux macro (Growth, Inflation, External, Policy, Overall).
 */
export function RegionalRegimeMatrix() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-2">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          {t("matrix.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("matrix.subtitle")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2.5 font-medium">{t("matrix.region")}</th>
              {columns.map((c) => (
                <th key={c.key} className="px-2 py-2.5 text-center font-medium">
                  {t(c.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regimeMatrixRows.map((row) => (
              <tr key={row.region} className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-2 py-2.5 font-medium text-foreground">{row.region}</td>
                {columns.map((c) => {
                  const pulse = row[c.key];
                  return (
                    <td key={c.key} className="px-2 py-2.5 text-center">
                      <span
                        className="group relative inline-block"
                        title={pulseLabel[pulse]}
                      >
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${pulseMap[pulse]}`} />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3">
        {(Object.keys(pulseMap) as RegimePulse[]).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${pulseMap[p]}`} />
            {pulseLabel[p]}
          </span>
        ))}
      </div>
    </div>
  );
}
