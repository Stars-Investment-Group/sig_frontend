import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Map,
  Flag,
  Radar,
  Activity,
  Landmark,
  Calendar,
  Bell,
  Star,
  Database,
  SlidersHorizontal,
  Settings,
  Search,
  LineChart,
  Globe,
  Menu,
  ChevronDown,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

/** Largeurs de la sidebar (étendue / réduite) sur desktop */
const SIDEBAR_EXPANDED = "w-[240px]";
const SIDEBAR_COLLAPSED = "w-[64px]";

/**
 * Navigation canonique — Global Workspace (spec §C)
 * Structure de la sidebar persistante.
 */
const navigation = [
  {
    section: "Global Workspace",
    items: [
      { name: "Global Overview", href: "/", icon: LayoutDashboard },
      { name: "Regions", href: "/regions", icon: Map },
      { name: "Countries", href: "/countries", icon: Flag },
      { name: "Regimes", href: "/regimes", icon: Radar },
      { name: "Indicators", href: "/indicators", icon: Activity },
      { name: "Markets", href: "/markets", icon: LineChart },
      { name: "Policy Tracker", href: "/policy", icon: Landmark },
      { name: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    section: "Analysis",
    items: [
      { name: "Alerts", href: "/alerts", icon: Bell },
      { name: "Watchlist", href: "/watchlist", icon: Star },
      { name: "Data Explorer", href: "/data", icon: Database },
      { name: "Screener", href: "/screener", icon: SlidersHorizontal },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Traductions locales des libellés de navigation (indépendantes de GlobalOverview) */
const NAV_I18N: Record<string, Record<string, string>> = {
  fr: {
    "Global Overview": "Global Overview",
    Regions: "Régions",
    Countries: "Pays",
    Regimes: "Régimes",
    Indicators: "Indicateurs",
    Markets: "Marchés",
    "Policy Tracker": "Tracker de Politique",
    Calendar: "Calendrier",
    Alerts: "Alertes",
    Watchlist: "Liste de suivi",
    "Data Explorer": "Explorateur de Données",
    Screener: "Screener",
    Settings: "Paramètres",
    "Global Workspace": "Espace de Travail",
    Analysis: "Analyse",
  },
  en: {},
  es: {
    "Global Overview": "Visión Global",
    Regions: "Regiones",
    Countries: "Países",
    Regimes: "Regímenes",
    Indicators: "Indicadores",
    Markets: "Mercados",
    "Policy Tracker": "Tracker de Política",
    Calendar: "Calendario",
    Alerts: "Alertas",
    Watchlist: "Seguimiento",
    "Data Explorer": "Explorador de Datos",
    Screener: "Filtro",
    Settings: "Ajustes",
    "Global Workspace": "Espacio de Trabajo",
    Analysis: "Análisis",
  },
  pt: {
    "Global Overview": "Visão Geral",
    Regions: "Regiões",
    Countries: "Países",
    Regimes: "Regimes",
    Indicators: "Indicadores",
    Markets: "Mercados",
    "Policy Tracker": "Tracker de Política",
    Calendar: "Calendário",
    Alerts: "Alertas",
    Watchlist: "Seguimento",
    "Data Explorer": "Explorador de Dados",
    Screener: "Filtro",
    Settings: "Definições",
    "Global Workspace": "Espaço de Trabalho",
    Analysis: "Análise",
  },
  ar: {
    "Global Overview": "نظرة عامة",
    Regions: "المناطق",
    Countries: "الدول",
    Regimes: "الأنظمة",
    Indicators: "المؤشرات",
    Markets: "الأسواق",
    "Policy Tracker": "متابعة السياسات",
    Calendar: "التقويم",
    Alerts: "التنبيهات",
    Watchlist: "قائمة المتابعة",
    "Data Explorer": "مستكشف البيانات",
    Screener: "المصفاة",
    Settings: "الإعدادات",
    "Global Workspace": "مساحة العمل",
    Analysis: "التحليل",
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useI18n();
  const [location] = useLocation();

  const trNav = (label: string) =>
    NAV_I18N[language]?.[label] ?? label;
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false); // desktop : 240px ↔ 64px
  const [mobileOpen, setMobileOpen] = useState(false); // mobile : drawer

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  /** Bascule la sidebar selon le contexte (desktop = réduire, mobile = drawer) */
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  };

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== Sidebar persistante =====
           Desktop   : toujours affichée (largeur collapsed ↔ expanded)
           Mobile    : hors-écran par défaut, glisse via translate-x */
      }
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300
          ${collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* LOGO SIG */}
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border bg-sidebar">
          <div
            className={`flex min-h-16 flex-1 items-center gap-2.5 px-5 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <Globe className="h-6 w-6 shrink-0 text-white" />
            <span className={`font-serif text-2xl font-bold text-white ${collapsed ? "hidden" : ""}`}>
              SIG
            </span>
          </div>
          {/* Bouton fermer (mobile uniquement) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="mr-3 rounded-md p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div key={group.section}>
              <p className={`px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${collapsed ? "hidden" : ""}`}>
                {trNav(group.section)}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={`nav-link ${active ? "active" : ""} ${
                          collapsed ? "justify-center px-0" : "justify-start px-3"
                        }`}
                        title={collapsed ? item.name : undefined}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className={collapsed ? "hidden" : ""}>{trNav(item.name)}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pied de sidebar */}
        <div className="border-t border-sidebar-border p-3">
          <div className={`flex items-center gap-2 rounded-lg px-2 py-2 ${collapsed ? "hidden" : ""}`}>
            <div className="flex w-full items-center justify-center gap-2">
              <Settings className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-xs text-slate-400">
                v0.1 Beta · Institutionnel SIG
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Overlay mobile (clic extérieur pour fermer) — masqué sur desktop ===== */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ===== Zone droite ===== */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:pl-[64px] pl-0" : "lg:pl-[240px] pl-0"
        }`}
      >
        {/* Top Header — menu + recherche centrée + actions */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6 dark:bg-card">
          {/* Côté Gauche : Bouton Menu */}
          <div className="flex items-center shrink-0">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
              aria-label={isMobile ? "Ouvrir le menu" : "Réduire la navigation"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Centre : Recherche parfaitement centrée */}
          <div className="relative mx-2 w-full max-w-md md:mx-4">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search countries, indicators, events..."
              className="w-full rounded-full border border-input bg-slate-50 py-2 pl-4 pr-9 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          {/* Côté Droit : Actions & Profil */}
          <div className="flex items-center gap-1 shrink-0 md:gap-3">
            {/* Sélecteur de langue */}
            <LanguageSwitcher />
            {/* Bascule thème clair / sombre */}
            <ThemeToggle />
            {/* Watchlist — icône + texte (texte masqué sur mobile) */}
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Star className="h-5 w-5" />
              <span className="hidden text-xs font-medium md:inline">
                Watchlist
              </span>
            </button>
            {/* Notifications — badge circulaire rouge "3" */}
            <button className="relative rounded-md p-1 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            {/* Avatar profil */}
            <div className="flex items-center gap-2.5 border-l border-border pl-3 md:pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B192C] text-xs font-semibold text-white">
                AB
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-bold leading-none text-foreground">
                  Alex B.
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">SIG Research</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </div>
          </div>
        </header>

        {/* Contenu principal — grille 12 colonnes responsive, p-6 */}
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}