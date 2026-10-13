import {
  LayoutGrid,
  ShieldCheck,
  LineChart,
  BookOpen,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";

/**
 * Onglets de la fiche pays.
 *
 * Le registre est la seule source de verite : la barre d'onglets, le routage
 * `/countries/:code/:tab` et la resolution du slug par defaut le lisent tous.
 * Le libelle et l'ordre restent a confirmer avec le designer (point ouvert 1
 * de `docs/AUDIT_MAQUETTES_ET_PLAN.md`) : les planches du PDF ne s'accordent
 * pas entre elles, changer cette liste doit rester une modification d'une ligne.
 */

export interface CountryTab {
  slug: string;
  label: string;
  /** Cle i18n `country.tab.*`. */
  i18nKey: string;
  icon: LucideIcon;
}

export const COUNTRY_TABS: CountryTab[] = [
  { slug: "summary", label: "Summary", i18nKey: "country.tab.summary", icon: LayoutGrid },
  { slug: "notation", label: "Notation & Risk", i18nKey: "country.tab.notation", icon: ShieldCheck },
  { slug: "quantitative", label: "Quantitative Analysis", i18nKey: "country.tab.quantitative", icon: LineChart },
  { slug: "qualitative", label: "Qualitative Analysis", i18nKey: "country.tab.qualitative", icon: BookOpen },
  { slug: "forecasts", label: "Forecasts & Scenarios", i18nKey: "country.tab.forecasts", icon: TrendingUp },
  { slug: "trends", label: "Trends & Signals", i18nKey: "country.tab.trends", icon: Activity },
];

export const DEFAULT_TAB = COUNTRY_TABS[0].slug;

export function isCountryTab(slug: string | undefined): boolean {
  return COUNTRY_TABS.some((t) => t.slug === slug);
}
