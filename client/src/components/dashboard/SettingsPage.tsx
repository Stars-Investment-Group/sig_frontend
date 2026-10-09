import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon, User, Palette, Bell, Database, Globe, Shield,
  Check, Moon, Sun, Mail, Smartphone, Download, RefreshCw, Key,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { STATIC_COUNTRIES } from "@/data/mockData";

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
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <SettingsIcon className="h-6 w-6 text-primary" /> {t("page.settings.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("page.settings.subtitle")}
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

const IDENTITY_FIELDS = [
  { key: "name", label: "Nom complet", value: "Alex B." },
  { key: "email", label: "Email", value: "alex.b@sig-research.com" },
  { key: "role", label: "Fonction", value: "Analyste Macroéconomique" },
  { key: "team", label: "Département", value: "SIG Research" },
] as const;

/**
 * Preferences qui gouvernent ce que l'application montre par defaut. Elles
 * sont servies par des selecteurs plutot que par du texte libre : un fuseau
 * ou un pays saisis a la main seraient invalides une fois sur deux.
 */
const WORKSPACE_FIELDS = [
  {
    key: "home",
    label: "Page d'ouverture",
    options: ["Global Overview", "Fiche pays", "Themes Explorer", "Liste de suivi"],
  },
  {
    key: "timezone",
    label: "Fuseau horaire",
    options: ["GMT (Abidjan, Dakar)", "GMT+1 (Paris)", "GMT-5 (New York)", "GMT+8 (Singapour)"],
  },
  {
    key: "dateFormat",
    label: "Format de date",
    options: ["31/07/2026", "2026-07-31", "31 juil. 2026"],
  },
  {
    key: "currency",
    label: "Devise de référence",
    options: ["USD", "EUR", "XOF"],
  },
] as const;

function ProfileTab() {
  const { toast } = useToast();
  const defaults = useMemo(
    () => ({
      ...Object.fromEntries(IDENTITY_FIELDS.map((f) => [f.key, f.value])),
      ...Object.fromEntries(WORKSPACE_FIELDS.map((f) => [f.key, f.options[0]])),
      defaultCountry: "CIV",
    }),
    []
  );
  const [form, setForm] = useState<Record<string, string>>(defaults);
  const dirty = Object.keys(defaults).some((k) => form[k] !== defaults[k as keyof typeof defaults]);
  const set = (key: string) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

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
            {IDENTITY_FIELDS.map((f) => (
              <Field key={f.key} label={f.label} value={form[f.key]} onChange={set(f.key)} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Préférences de travail
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ce que l&apos;application affiche par défaut à l&apos;ouverture.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <SelectField
            label="Pays par défaut"
            value={form.defaultCountry}
            onChange={set("defaultCountry")}
            options={STATIC_COUNTRIES.filter((c) => !c.isAggregate).map((c) => ({
              value: c.code,
              label: c.name,
            }))}
          />
          {WORKSPACE_FIELDS.map((f) => (
            <SelectField
              key={f.key}
              label={f.label}
              value={form[f.key]}
              onChange={set(f.key)}
              options={f.options.map((o) => ({ value: o, label: o }))}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Shield className="h-4 w-4 text-primary" /> Sécurité et session
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {SECURITY_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="text-xs tabular-nums text-muted-foreground">{row.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Le formulaire n'avait aucune action : on pouvait tout modifier sans
          rien valider. La barre reste discrete tant que rien n'a bouge. */}
      <div className="flex items-center justify-end gap-3">
        <p className="mr-auto text-xs text-muted-foreground">
          {dirty ? "Modifications non enregistrées." : "Tout est enregistré."}
        </p>
        <button
          type="button"
          disabled={!dirty}
          onClick={() => setForm(defaults)}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-40"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={!dirty}
          onClick={() =>
            toast({
              title: "Préférences enregistrées",
              description: "Elles seront appliquées à votre prochaine session.",
            })
          }
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>
    </>
  );
}

const SECURITY_ROWS = [
  { label: "Dernière connexion", value: "31 juil. 2026, 08:12 · Abidjan" },
  { label: "Authentification à deux facteurs", value: "Activée · application mobile" },
  { label: "Clé API personnelle", value: "sig_live_••••••••••7f2a" },
];

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
              <Badge className={s.status === "actif" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-muted text-muted-foreground"}>
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
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
