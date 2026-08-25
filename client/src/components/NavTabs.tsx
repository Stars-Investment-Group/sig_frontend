import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Database,
  Globe,
  User,
  Menu,
  Newspaper,
  Activity,
  Brain,
  Star
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Overview", href: "/", icon: Newspaper },
  { name: "Quantitative Analysis", href: "/quantitative", icon: TrendingUp },
  { name: "Qualitative Analysis", href: "/qualitative", icon: Brain },
  { name: "Notation", href: "/rating", icon: Star },
  { name: "Trends", href: "/trends", icon: Activity },
  { name: "Data Explorer", href: "/data", icon: Database },
];

export default function NavTabs() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="text-primary text-xl" />
              <h1 className="text-xl font-semibold text-foreground">
                Global Macroeconomic Tracker
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`nav-tab ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Explore Indicators
            </Button>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] card-surface">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {item.name}
                        </button>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}


