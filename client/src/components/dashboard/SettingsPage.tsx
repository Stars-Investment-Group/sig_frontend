import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon, User, Palette, Bell, Database, Globe, Shield,
  Check, Moon, Sun, Mail, Smartphone, Download, RefreshCw, Key,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useI18n, LANGUAGES } from "@/lib/i18n";

/* =========================================================================
 * Settings — Préférences de l'espace de travail SIG.
 * UI fonctionnelle (thème/langue réels) + préférences de démonstration.
 * ========================================================================= */

type Tab = "profile" | "appearance" | "notifications" | "data";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profil", icon: User },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Données & Sources", icon: Database },
];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <SettingsIcon className="h-6 w-6 text-primary" /> Paramètres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personnalisez votre espace de travail, vos préférences et vos sources de données.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ===== Navigation latérale ===== */}
        <nav className="lg:col-span-1">
          <Card className="card-surface p-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </Card>
        </nav>

        {/* ===== Panneau de contenu ===== */}
        <div className="space-y-4 lg:col-span-3">
          {tab === "profile" && <ProfileTab />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "data" && <DataTab />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Profil ---------- */
function ProfileTab() {
  return (
    <>
      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">Profil utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0B192C] text-xl font-semibold text-white">
              AB
            </div>
            <div>
              <p className="font-semibold text-foreground">Alex B.</p>
              <p className="text-sm text-muted-foreground">SIG Research · Analyste Macro</p>
              <Badge variant="outline" className="mt-1 border-border text-muted-foreground">
                <Shield className="mr-1 h-3 w-3" /> Accès Standard
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom complet" value="Alex B." />
            <Field label="Email" value="alex.b@sig-research.com" />
            <Field label="Fonction" value="Analyste Macroéconomique" />
            <Field label="Département" value="SIG Research" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Apparence ---------- */
function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useI18n();

  const themeOptions = [
    { id: "light" as const, label: "Clair", icon: Sun },
    { id: "dark" as const, label: "Sombre", icon: Moon },
  ];

  return (
    <>
      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">Thème</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Globe className="h-4 w-4 text-primary" /> Langue de l'interface
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-5">
          {LANGUAGES.map((l) => {
            const active = l.code.toLowerCase() === language;
            return (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code.toLowerCase() as typeof language)}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  active ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Notifications ---------- */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    regimeChanges: true,
    ratingChanges: true,
    marketAlerts: true,
    policyDecisions: true,
    weeklyDigest: false,
    email: true,
    push: false,
  });

  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <>
      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">Alertes économiques</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          <ToggleRow label="Changements de régime" desc="Lorsqu'un pays change de régime macroéconomique." checked={prefs.regimeChanges} onChange={() => toggle("regimeChanges")} />
          <ToggleRow label="Variations de notation SIG" desc="Lorsque le score de notation d'un pays évolue significativement." checked={prefs.ratingChanges} onChange={() => toggle("ratingChanges")} />
          <ToggleRow label="Alertes de marché" desc="Volatilité ou mouvements inhabituels sur les marchés suivis." checked={prefs.marketAlerts} onChange={() => toggle("marketAlerts")} />
          <ToggleRow label="Décisions de politique" desc="Décisions des banques centrales (FOMC, BCE, BCEAO…)." checked={prefs.policyDecisions} onChange={() => toggle("policyDecisions")} />
          <ToggleRow label="Résumé hebdomadaire" desc="Synthèse récapitulative envoyée chaque lundi." checked={prefs.weeklyDigest} onChange={() => toggle("weeklyDigest")} />
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">Canaux de diffusion</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          <ToggleRow icon={Mail} label="Email" desc="Notifications envoyées à alex.b@sig-research.com." checked={prefs.email} onChange={() => toggle("email")} />
          <ToggleRow icon={Smartphone} label="Notifications push" desc="Alertes en temps réel sur navigateur et mobile." checked={prefs.push} onChange={() => toggle("push")} />
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Data ---------- */
function DataTab() {
  const sources = [
    { name: "FRED", desc: "Federal Reserve Economic Data", status: "actif", color: "#3B82F6" },
    { name: "Eurostat", desc: "Statistiques officielles UE", status: "actif", color: "#8B5CF6" },
    { name: "IMF", desc: "International Monetary Fund", status: "actif", color: "#22C55E" },
    { name: "World Bank", desc: "Banque mondiale — bases ouvertes", status: "actif", color: "#F59E0B" },
    { name: "BCEAO", desc: "Banque Centrale des États de l'Afrique de l'Ouest", status: "planifié", color: "#14B8A6" },
  ];

  return (
    <>
      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Database className="h-4 w-4 text-primary" /> Sources de données
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          {sources.map((s) => (
            <div key={s.name} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold" style={{ background: `${s.color}1a`, color: s.color }}>
                  {s.name.slice(0, 2)}
                </span>
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              <Badge className={s.status === "actif" ? "bg-green-500/15 text-green-300 border-green-500/30" : "bg-slate-500/15 text-slate-300 border-slate-500/30"}>
                {s.status === "actif" ? "Actif" : "Planifié"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">Gestion des données</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 p-5">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            <RefreshCw className="h-4 w-4" /> Actualiser le cache
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            <Download className="h-4 w-4" /> Exporter mes données
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            <Key className="h-4 w-4" /> Clés API
          </button>
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Version de la plateforme</p>
            <p className="text-xs text-muted-foreground">SIG Global Macro Tracker · frontend v1.0 · schéma de données gouverné</p>
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground">Phase maquette</Badge>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Sous-composants ---------- */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function ToggleRow({
  label, desc, checked, onChange, icon: Icon,
}: { label: string; desc: string; checked: boolean; onChange: () => void; icon?: typeof Mail }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
