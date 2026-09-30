import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Map,
  Flag,
  Radar,
  Activity,
  Landmark,
  Calendar,
  Bell,
  Star,
  FileText,
  Database,
  SlidersHorizontal,
  Settings,
  LineChart,
  Globe,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  HelpCircle,
  MessageSquare,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { useI18n } from "@/lib/i18n";
import { watchlist } from "@/data/mockDashboard";
import { cn } from "@/lib/utils";

/** Largeurs de la sidebar (étendue / réduite) sur desktop */
const SIDEBAR_EXPANDED = "w-[240px]";
const SIDEBAR_COLLAPSED = "w-[64px]";

/** Liens directs de premier niveau (hors groupe Overview en accordéon) */
const topLevelLinks = [
  { name: "Indicators", href: "/indicators", icon: Activity },
  { name: "Markets", href: "/markets", icon: LineChart },
  { name: "Policy Tracker", href: "/policy", icon: Landmark },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Data Explorer", href: "/data", icon: Database },
  { name: "Screener", href: "/screener", icon: SlidersHorizontal },
  { name: "Settings", href: "/settings", icon: Settings },
];

/** Groupe parent Overview (2e niveau imbriqué) */
const overviewParent = {
  name: "Overview",
  href: "/",
  icon: Home,
  children: [
    { name: "Global Overview", href: "/", icon: Home },
    { name: "Regions", href: "/regions", icon: Map },
    { name: "Countries", href: "/countries", icon: Flag },
    { name: "Regimes", href: "/regimes", icon: Radar },
  ],
};

/** Traductions locales des libellés de navigation (indépendantes de GlobalOverview) */
const NAV_I18N: Record<string, Record<string, string>> = {
  fr: {
    Overview: "Overview",
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
    Reports: "Rapports",
    "Data Explorer": "Explorateur de Données",
    Screener: "Screener",
    Settings: "Paramètres",
    Help: "Aide",
    Feedback: "Commentaires",
    Collapse: "Replier",
  },
  en: {},
  es: {
    Overview: "Resumen",
    Regions: "Regiones",
    Countries: "Países",
    Regimes: "Regímenes",
    Indicators: "Indicadores",
    Markets: "Mercados",
    "Policy Tracker": "Tracker de Política",
    Calendar: "Calendario",
    Alerts: "Alertas",
    Watchlist: "Seguimiento",
    Reports: "Informes",
    "Data Explorer": "Explorador de Datos",
    Screener: "Filtro",
    Settings: "Ajustes",
    Help: "Ayuda",
    Feedback: "Comentarios",
    Collapse: "Plegar",
  },
  pt: {
    Overview: "Resumo",
    Regions: "Regiões",
    Countries: "Países",
    Regimes: "Regimes",
    Indicators: "Indicadores",
    Markets: "Mercados",
    "Policy Tracker": "Tracker de Política",
    Calendar: "Calendário",
    Alerts: "Alertas",
    Watchlist: "Seguimento",
    Reports: "Relatórios",
    "Data Explorer": "Explorador de Dados",
    Screener: "Filtro",
    Settings: "Definições",
    Help: "Ajuda",
    Feedback: "Comentários",
    Collapse: "Recolher",
  },
  ar: {
    Overview: "نظرة عامة",
    Regions: "المناطق",
    Countries: "الدول",
    Regimes: "الأنظمة",
    Indicators: "المؤشرات",
    Markets: "الأسواق",
    "Policy Tracker": "متابعة السياسات",
    Calendar: "التقويم",
    Alerts: "التنبيهات",
    Watchlist: "قائمة المتابعة",
    Reports: "التقارير",
    "Data Explorer": "مستكشف البيانات",
    Screener: "المصفاة",
    Settings: "الإعدادات",
    Help: "مساعدة",
    Feedback: "ملاحظات",
    Collapse: "طيّ",
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useI18n();
  const [location] = useLocation();

  const trNav = (label: string) => NAV_I18N[language]?.[label] ?? label;
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false); // desktop : 240px ↔ 64px
  const [mobileOpen, setMobileOpen] = useState(false); // mobile : drawer
  const [overviewOpen, setOverviewOpen] = useState(true); // accordéon Overview ouvert par défaut

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
           Mobile    : hors-écran par défaut, glisse via translate-x */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
          collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* LOGO SIG */}
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border bg-sidebar">
          <div
            className={cn(
              "flex min-h-16 flex-1 items-center gap-2.5 px-5",
              collapsed && "justify-center px-0"
            )}
          >
            <Globe className="h-6 w-6 shrink-0 text-sidebar-primary" />
            <span className={cn("flex items-baseline gap-1.5", collapsed && "hidden")}>
              <span className="font-serif text-2xl font-bold leading-none text-sidebar-foreground">
                SIG
              </span>
              <span className="text-[9px] font-semibold uppercase leading-[1.15] tracking-wide text-sidebar-muted">
                Global
                <br />
                Macro Tracker
              </span>
            </span>
          </div>
          {/* Bouton fermer (mobile uniquement) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="mr-3 rounded-md p-1 text-sidebar-muted hover:text-sidebar-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {/* ===== Groupe parent OVERVIEW (accordéon / nested menu) ===== */}
          {!collapsed ? (
            <div className="mb-3">
              <button
                onClick={() => setOverviewOpen((o) => !o)}
                className={cn(
                  "nav-link w-full justify-start px-3",
                  isActive("/") && "active"
                )}
                aria-expanded={overviewOpen}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{trNav(overviewParent.name)}</span>
                {overviewOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Sous-items imbriqués */}
              {overviewOpen && (
                <div className="mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {overviewParent.children.map((child) => {
                    const active = isActive(child.href);
                    return (
                      <Link key={child.name} href={child.href}>
                        <span
                          className={cn("nav-link justify-start px-2", active && "active")}
                          aria-current={active ? "page" : undefined}
                        >
                          <child.icon className="h-4 w-4 flex-shrink-0" />
                          <span>{trNav(child.name)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Version repliée : le groupe Overview montre juste son icône Home */
            <Link href="/">
              <span
                className={cn(
                  "nav-link justify-center px-0",
                  isActive("/") && "active"
                )}
                title="Overview"
              >
                <Home className="h-4 w-4 flex-shrink-0" />
              </span>
            </Link>
          )}

          {/* ===== Liens directs de premier niveau ===== */}
          <div className="space-y-1">
            {topLevelLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <span
                    className={cn(
                      "nav-link",
                      active && "active",
                      collapsed ? "justify-center px-0" : "justify-start px-3"
                    )}
                    title={collapsed ? item.name : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className={collapsed ? "hidden" : ""}>{trNav(item.name)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ===== Pied de sidebar : 3 actions verticales ===== */}
        <div className="border-t border-sidebar-border p-3">
          <div className="space-y-1">
            {/* Help */}
            <button
              className={cn(
                "nav-link w-full",
                collapsed ? "justify-center px-0" : "justify-start px-3"
              )}
              title={collapsed ? trNav("Help") : undefined}
            >
              <HelpCircle className="h-4 w-4 flex-shrink-0" />
              <span className={collapsed ? "hidden" : ""}>{trNav("Help")}</span>
            </button>

            {/* Feedback */}
            <button
              className={cn(
                "nav-link w-full",
                collapsed ? "justify-center px-0" : "justify-start px-3"
              )}
              title={collapsed ? trNav("Feedback") : undefined}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className={collapsed ? "hidden" : ""}>{trNav("Feedback")}</span>
            </button>

            {/* Collapse — replie la sidebar (desktop) */}
            {!isMobile && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className={cn(
                  "nav-link w-full",
                  collapsed ? "justify-center px-0" : "justify-start px-3"
                )}
                title={collapsed ? trNav("Collapse") : undefined}
              >
                <ChevronsLeft
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-transform",
                    collapsed && "rotate-180"
                  )}
                />
                <span className={collapsed ? "hidden" : ""}>{trNav("Collapse")}</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ===== Overlay mobile (clic extérieur pour fermer) — masqué sur desktop ===== */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ===== Zone droite ===== */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-[64px] pl-0" : "lg:pl-[240px] pl-0"
        )}
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

          {/* Centre : Recherche globale (pays, indicateurs, pages) */}
          <GlobalSearch />

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
                Watchlist ({watchlist.length})
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
                <p className="text-sm font-bold leading-none text-foreground">Alex B.</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">SIG Research</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </div>
          </div>
        </header>

        {/* Contenu principal — grille 12 colonnes responsive, p-6 */}
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</main>

        {/* Pied de page global — présent sur toutes les pages des maquettes */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
            <span className="font-medium text-foreground">SIG Global Macro Tracker</span>
            <span>&copy; {new Date().getFullYear()} SIG Global. Tous droits réservés.</span>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a href="#" className="hover:text-foreground">Conditions d&apos;utilisation</a>
              <a href="#" className="hover:text-foreground">Confidentialité</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
