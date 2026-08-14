import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Map,
  Flag,
  Radar,
  Activity,
  TrendingUp,
  Landmark,
  Calendar,
  Bell,
  Star,
  Database,
  SlidersHorizontal,
  Settings,
  Search,
  LineChart,
  FileText,
} from "lucide-react";

/**
 * Navigation canonique — Global Workspace (spec §C)
 * Structure de la sidebar persistante.
 */
const navigation = [
  { section: "Global Workspace", items: [
    { name: "Global Overview", href: "/", icon: LayoutDashboard },
    { name: "Regions", href: "/regions", icon: Map },
    { name: "Countries", href: "/countries", icon: Flag },
    { name: "Regimes", href: "/regimes", icon: Radar },
    { name: "Indicators", href: "/indicators", icon: Activity },
    { name: "Markets", href: "/markets", icon: LineChart },
    { name: "Policy Tracker", href: "/policy", icon: Landmark },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ]},
  { section: "Analysis", items: [
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Watchlist", href: "/watchlist", icon: Star },
    { name: "Data Explorer", href: "/data", icon: Database },
    { name: "Screener", href: "/screener", icon: SlidersHorizontal },
    { name: "Settings", href: "/settings", icon: Settings },
  ]},
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const [search, setSearch] = useState("");

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== Sidebar persistante 240px ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-sidebar text-sidebar-foreground">
        {/* Logo SIG */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">
            SIG
          </span>
          <span className="mt-0.5 hidden text-[10px] font-medium text-slate-400 lg:block">
            MACRO TRACKER
          </span>
        </div>

        {/* Recherche rapide sidebar */}
        <div className="px-3 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-sidebar-border bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group.section}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={`nav-link ${active ? "active" : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        {item.name}
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
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">v0.1 Beta · Institutionnel</span>
          </div>
        </div>
      </aside>

      {/* ===== Zone droite ===== */}
      <div className="pl-[240px]">
        {/* Top Header avec recherche centrale */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white/80 px-6 backdrop-blur">
          {/* Recherche centrale */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search countries, indicators, events..."
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Alertes */}
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
            </button>
            {/* Watchlist */}
            <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Star className="h-5 w-5" />
            </button>
            {/* Avatar profil */}
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                AB
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">Alex B.</p>
                <p className="text-xs text-muted-foreground">Institutionnal</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal — grille 12 colonnes responsive, p-6 */}
        <main className="mx-auto max-w-[1600px] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
