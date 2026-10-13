import { Flag } from "@/components/Flag";
import { upcomingEvents, type EventImportance } from "@/data/mockDashboard";
import { useI18n } from "@/lib/i18n";

const importanceBadge: Record<EventImportance, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

/**
 * Range 5 (droite) — Upcoming Events & Policy Calendar (spec §01B).
 * Calendrier des publications à 30 jours avec importance High / Medium.
 */
export function UpcomingEvents() {
  const { t } = useI18n();

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-2">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("events.title")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("events.subtitle")}
          </p>
        </div>
        <a
          href="#"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {t("events.viewFull")}
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">{t("events.date")}</th>
              <th className="px-3 py-2.5 font-medium">{t("events.event")}</th>
              <th className="px-3 py-2.5 font-medium">{t("events.region")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("events.importance")}</th>
            </tr>
          </thead>
          <tbody>
            {upcomingEvents.map((e) => (
              <tr key={`${e.date}-${e.event}`} className="border-b border-border/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-muted-foreground">
                  {e.date}
                </td>
                <td className="px-3 py-2.5 font-medium text-foreground">
                  {e.event}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                  <span className="mr-1.5 inline-flex align-middle">
                    <Flag code={e.flagCode} size={16} />
                  </span>
                  {e.region}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${importanceBadge[e.importance]}`}>
                    {e.importance}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
