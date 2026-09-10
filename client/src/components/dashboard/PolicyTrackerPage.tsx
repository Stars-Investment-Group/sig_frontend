import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import {
  Landmark, Percent, ArrowUpRight, ArrowDownRight, Minus, Calendar, Building2,
  Radio, Activity, Clock,
} from "lucide-react";

/* =========================================================================
 * Policy Tracker — Suivi des décisions de politique économique & monétaire.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

type Tone = "hawkish" | "neutral" | "dovish" | "restrictive";

interface CentralBank {
  code: string;          // drapeau
  name: string;          // ex: Réserve fédérale
  region: string;
  regionFlag: string;
  currentRate: string;
  lastChange: string;
  changeDir: "up" | "down" | "flat";
  nextMeeting: string;
  tone: Tone;
  toneLabel: string;
  inflationTarget: string;
  inflationNow: string;
  policyBias: string;
  trend: number[];
}

const CENTRAL_BANKS: CentralBank[] = [
  {
    code: "US", name: "Réserve fédérale (FOMC)", region: "États-Unis", regionFlag: "US",
    currentRate: "4.25%", lastChange: "-25 bps", changeDir: "down",
    nextMeeting: "28 juil. 2026", tone: "dovish", toneLabel: "Assouplissement graduel",
    inflationTarget: "2,0 %", inflationNow: "2,9 %", policyBias: "Cycle de baisse en cours",
    trend: [5.5, 5.25, 5.25, 5, 4.75, 4.5, 4.25],
  },
  {
    code: "EU", name: "BCE", region: "Zone euro", regionFlag: "EU",
    currentRate: "3.40%", lastChange: "-25 bps", changeDir: "down",
    nextMeeting: "04 août 2026", tone: "neutral", toneLabel: "Direction dépendante des données",
    inflationTarget: "2,0 %", inflationNow: "2,4 %", policyBias: "Assouplissement progressif",
    trend: [4, 3.75, 3.75, 3.65, 3.65, 3.4, 3.4],
  },
  {
    code: "GB", name: "Banque d'Angleterre", region: "Royaume-Uni", regionFlag: "GB",
    currentRate: "4.75%", lastChange: "0 bps", changeDir: "flat",
    nextMeeting: "11 août 2026", tone: "neutral", toneLabel: "Pause en cours",
    inflationTarget: "2,0 %", inflationNow: "3,1 %", policyBias: "Prudence monétaire",
    trend: [5.25, 5.25, 5, 5, 4.75, 4.75, 4.75],
  },
  {
    code: "JP", name: "Banque du Japon", region: "Japon", regionFlag: "JP",
    currentRate: "0.10%", lastChange: "+15 bps", changeDir: "up",
    nextMeeting: "26 sept. 2026", tone: "hawkish", toneLabel: "Normalisation progressive",
    inflationTarget: "2,0 %", inflationNow: "1,8 %", policyBias: "Sortie de taux négatifs",
    trend: [-0.1, 0, 0, 0, 0.05, 0.1, 0.1],
  },
  {
    code: "CI", name: "BCEAO", region: "UEMOA", regionFlag: "CI",
    currentRate: "3.00%", lastChange: "-25 bps", changeDir: "down",
    nextMeeting: "03 août 2026", tone: "dovish", toneLabel: "Accompagnement de la croissance",
    inflationTarget: "1-3 %", inflationNow: "3,2 %", policyBias: "Stabilité des prix & soutien à l'expansion",
    trend: [4.5, 4.25, 4, 3.75, 3.5, 3.25, 3],
  },
  {
    code: "IN", name: "RBI (Inde)", region: "Inde", regionFlag: "IN",
    currentRate: "6.50%", lastChange: "0 bps", changeDir: "flat",
    nextMeeting: "08 août 2026", tone: "restrictive", toneLabel: "Vigilance inflation",
    inflationTarget: "4,0 %", inflationNow: "5,4 %", policyBias: "Équilibre croissance/prix",
    trend: [6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5],
  },
];

const NB_TONE_STYLE: Record<Tone, string> = {
  hawkish: "bg-red-500/15 text-red-300 border-red-500/30",
  neutral: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  dovish: "bg-green-500/15 text-green-300 border-green-500/30",
  restrictive: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const RECENT_ACTIONS = [
  { date: "30 juil. 2026", bank: "Banque du Japon", action: "Relèvement du taux directeur à 0,10 %", dir: "up" as const },
  { date: "17 juil. 2026", bank: "FOMC", action: "Baisse de 25 bps du taux des fonds fédéraux à 4,25 %", dir: "down" as const },
  { date: "04 juin 2026", bank: "BCE", action: "Baisse de 25 bps du taux de dépôt à 3,40 %", dir: "down" as const },
  { date: "22 mai 2026", bank: "BCEAO", action: "Baisse de 25 bps du taux directeur à 3,00 %", dir: "down" as const },
];

export function PolicyTrackerPage() {
  const [expanded, setExpanded] = useState<string | null>("US");

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Landmark className="h-6 w-6 text-primary" /> Policy Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Décisions de politique monétaire et orientation des principales banques centrales.
          </p>
        </div>
        <Badge variant="outline" className="border-border text-muted-foreground">
          <Radio className="mr-1 h-3 w-3" /> Live · Normalisation mondiale
        </Badge>
      </div>

      {/* ===== Bandeau global ===== */}
      <Card className="card-surface overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-blue-400 to-green-500" />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Politique monétaire mondiale</p>
              <p className="text-sm text-muted-foreground">
                Normalisation en cours : assouplissement graduel dans les économies avancées, maintien sous haute surveillance en Inde.
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div><p className="text-2xl font-bold text-green-500">4</p><p className="text-xs text-muted-foreground">baisses récentes</p></div>
            <div><p className="text-2xl font-bold text-foreground">6</p><p className="text-xs text-muted-foreground">banques suivies</p></div>
            <div><p className="text-2xl font-bold text-amber-500">3.0–4.3 %</p><p className="text-xs text-muted-foreground">corridor global</p></div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Banques centrales ===== */}
      <div className="space-y-4">
        {CENTRAL_BANKS.map((cb) => {
          const isOpen = expanded === cb.code;
          const dirIcon = cb.changeDir === "down" ? <ArrowDownRight className="h-4 w-4" /> : cb.changeDir === "up" ? <ArrowUpRight className="h-4 w-4" /> : <Minus className="h-4 w-4" />;
          const dirCls = cb.changeDir === "down" ? "text-green-500" : cb.changeDir === "up" ? "text-red-500 dark:text-red-400" : "text-muted-foreground";
          return (
            <div key={cb.code} className="card-surface overflow-hidden">
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 w-1.5"
                  style={{ background: cb.changeDir === "down" ? "#22C55E" : cb.changeDir === "up" ? "#EF4444" : "#64748B" }}
                />
                <button
                  onClick={() => setExpanded(isOpen ? null : cb.code)}
                  className="flex w-full items-center justify-between gap-3 p-5 pl-8 text-left"
                >
                  <div className="flex items-center gap-3 pl-2">
                    <Flag code={cb.code} size={26} />
                    <div>
                      <p className="font-semibold text-foreground">{cb.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" /> {cb.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Taux actuel</p>
                      <p className="text-lg font-bold tabular-nums text-foreground">{cb.currentRate}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-semibold ${dirCls}`}>
                      {dirIcon}{cb.lastChange}
                    </span>
                    <Badge className={NB_TONE_STYLE[cb.tone]}>{cb.toneLabel}</Badge>
                  </div>
                </button>
              </div>

              {isOpen && (
                <div className="grid grid-cols-1 gap-6 border-t border-border bg-card/40 p-5 md:grid-cols-3">
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Percent className="h-4 w-4 text-primary" /> Inflation vs cible
                    </h4>
                    <PolicyStat label="Inflation actuelle" value={cb.inflationNow} />
                    <PolicyStat label="Cible" value={cb.inflationTarget} />
                    <PolicyStat label="Prochaine réunion" value={cb.nextMeeting} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Orientation</h4>
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      <p><span className="font-semibold text-foreground">Biais :</span> {cb.policyBias}</p>
                      <p className="mt-1"><span className="font-semibold text-foreground">Note :</span> {cb.toneLabel}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Évolution du taux</h4>
                    <RatePath values={cb.trend} color={cb.changeDir === "down" ? "#22C55E" : cb.changeDir === "up" ? "#EF4444" : "#3B82F6"} min={Math.min(...cb.trend)} max={Math.max(...cb.trend)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Actions récentes ===== */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" /> Actions récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECENT_ACTIONS.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                a.dir === "down" ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-400"
              }`}>
                {a.dir === "down" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </span>
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {a.date}
                  <span className="text-xs text-muted-foreground">· {a.bank}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{a.action}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ===== Légende ton ===== */}
      <div className="flex flex-wrap gap-2">
        <ToneLegend label="Hawkish (resserrement)" cls={NB_TONE_STYLE.hawkish} />
        <ToneLegend label="Dovish (assouplissement)" cls={NB_TONE_STYLE.dovish} />
        <ToneLegend label="Neutre" cls={NB_TONE_STYLE.neutral} />
        <ToneLegend label="Restrictif" cls={NB_TONE_STYLE.restrictive} />
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Données illustratives de maquette — remplacées par les données gouvernées du pipeline (spec §H).
      </p>
    </div>
  );
}

/* ---------- Helpers ---------- */
function PolicyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function RatePath({ values, color, min, max }: { values: number[]; color: string; min: number; max: number }) {
  const w = 180, h = 48, pad = 4;
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: 220 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={pad + i * stepX} cy={pad + ((max - v) / range) * (h - pad * 2)} r={2.4} fill={color} />
      ))}
    </svg>
  );
}

function ToneLegend({ label, cls }: { label: string; cls: string }) {
  return <Badge className={`${cls} border`}>{label}</Badge>;
}
