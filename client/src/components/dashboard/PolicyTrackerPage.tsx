import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/Flag";
import {
  Landmark, Percent, ArrowUpRight, ArrowDownRight, Minus, Calendar, Building2,
  Radio, Activity, Clock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getRegime, getStaticHistory } from "@/data/mockData";

/* =========================================================================
 * Policy Tracker — Suivi des décisions de politique économique & monétaire.
 * Données statiques illustratives (frontend), en attente du backend gouverné.
 * ========================================================================= */

type Tone = "restrictive" | "neutral" | "dovish";

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

/**
 * Les six banques suivies.
 *
 * Le mandat, la cible d'inflation, le biais et la date de reunion sont
 * redactionnels. **Le taux directeur, l'inflation constatee et la trajectoire
 * se lisent sur la donnee** : la page annoncait la BCEAO a 3,00 % quand le
 * catalogue donne 5,2 % a la Cote d'Ivoire, et l'inflation americaine a 2,9 %
 * pour 3,6 % constates. Trois pages ouvertes cote a cote donnaient trois
 * chiffres pour la meme chose.
 */
const BANK_SEEDS: {
  code: string;
  name: string;
  region: string;
  regionFlag: string;
  nextMeeting: string;
  inflationTarget: string;
}[] = [
  {
    code: "USA",
    name: "Réserve fédérale (FOMC)",
    region: "États-Unis",
    regionFlag: "USA",
    nextMeeting: "28 juil. 2026",
    inflationTarget: "2,0 %",
  },
  {
    code: "EMU",
    name: "BCE",
    region: "Zone euro",
    regionFlag: "EMU",
    nextMeeting: "04 août 2026",
    inflationTarget: "2,0 %",
  },
  {
    code: "GBR",
    name: "Banque d'Angleterre",
    region: "Royaume-Uni",
    regionFlag: "GBR",
    nextMeeting: "11 août 2026",
    inflationTarget: "2,0 %",
  },
  {
    code: "JPN",
    name: "Banque du Japon",
    region: "Japon",
    regionFlag: "JPN",
    nextMeeting: "26 sept. 2026",
    inflationTarget: "2,0 %",
  },
  {
    code: "CIV",
    name: "BCEAO",
    region: "UEMOA",
    regionFlag: "CIV",
    nextMeeting: "03 août 2026",
    inflationTarget: "1-3 %",
  },
  {
    code: "IND",
    name: "RBI (Inde)",
    region: "Inde",
    regionFlag: "IND",
    nextMeeting: "08 août 2026",
    inflationTarget: "4,0 %",
  },
];

/** Variation du taux directeur sur un mois, exprimee en points de base. */
function lastMove(code: string): { label: string; dir: "up" | "down" | "flat" } {
  const history = getStaticHistory(code, "policy_rate");
  const last = history[history.length - 1]?.value;
  const previous = history[history.length - 2]?.value;
  if (last === undefined || previous === undefined) return { label: "n/d", dir: "flat" };
  // Arrondi au quart de point, comme une decision de banque centrale.
  const bps = Math.round(((last - previous) * 100) / 25) * 25;
  if (bps === 0) return { label: "0 bps", dir: "flat" };
  return { label: `${bps > 0 ? "+" : ""}${bps} bps`, dir: bps > 0 ? "up" : "down" };
}

/** L'orientation vient du module 4 ; elle decrit le niveau, pas le mouvement. */
const TONE_BY_STANCE: Record<string, { tone: Tone; label: string }> = {
  Tight: { tone: "restrictive", label: "Orientation restrictive" },
  Neutral: { tone: "neutral", label: "Orientation neutre" },
  Accommodative: { tone: "dovish", label: "Orientation accommodante" },
};

/** Le biais suit la pente du taux sur six mois, et ne peut donc pas la nier. */
function policyBiasOf(rates: number[]): string {
  if (rates.length < 2) return "Historique insuffisant";
  const span = rates[rates.length - 1] - rates[0];
  if (span <= -0.25) return "Cycle de baisse en cours";
  if (span >= 0.25) return "Cycle de hausse en cours";
  return "Statu quo prolongé";
}

const CENTRAL_BANKS: CentralBank[] = BANK_SEEDS.map((seed) => {
  const rates = getStaticHistory(seed.code, "policy_rate");
  const inflation = getStaticHistory(seed.code, "cpi_inflation");
  const move = lastMove(seed.code);
  const trend = rates.slice(-7).map((o) => o.value);
  const stance = TONE_BY_STANCE[getRegime(seed.code).policyStance] ?? TONE_BY_STANCE.Neutral;
  return {
    ...seed,
    currentRate: `${(rates[rates.length - 1]?.value ?? 0).toFixed(2).replace(".", ",")} %`,
    lastChange: move.label,
    changeDir: move.dir,
    inflationNow: `${(inflation[inflation.length - 1]?.value ?? 0).toFixed(1)} %`.replace(".", ","),
    trend,
    tone: stance.tone,
    toneLabel: stance.label,
    policyBias: policyBiasOf(trend),
  };
});

const NB_TONE_STYLE: Record<Tone, string> = {
  neutral: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  dovish: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  restrictive: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/**
 * Les dernieres decisions effectives, lues sur les series.
 *
 * La frise etait figee : elle annoncait la BCEAO « en baisse a 3,00 % »
 * pendant que la carte juste au-dessus donnait un autre taux, dans l'autre
 * sens. Une page ne peut pas se contredire a trente pixels d'intervalle.
 */
const RECENT_ACTIONS = BANK_SEEDS.flatMap((seed) => {
  const history = getStaticHistory(seed.code, "policy_rate");
  const actions: { date: string; bank: string; action: string; dir: "up" | "down"; period: string }[] = [];
  for (let i = history.length - 1; i > 0 && actions.length < 2; i -= 1) {
    const bps = Math.round(((history[i].value - history[i - 1].value) * 100) / 25) * 25;
    if (bps === 0) continue;
    const [year, month] = history[i].period.split("-");
    actions.push({
      date: `${MONTHS_FR[Number(month) - 1]} ${year}`,
      bank: seed.name,
      action: `${bps > 0 ? "Hausse" : "Baisse"} de ${Math.abs(bps)} bps du taux directeur à ${history[i].value.toFixed(2).replace(".", ",")} %`,
      dir: bps > 0 ? "up" : "down",
      period: history[i].period,
    });
  }
  return actions;
})
  .sort((a, b) => b.period.localeCompare(a.period))
  .slice(0, 6);
export function PolicyTrackerPage() {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<string | null>("USA");

  // Comptes du bandeau : ils decrivent les cartes affichees juste en dessous.
  const cuts = CENTRAL_BANKS.filter((b) => b.changeDir === "down").length;
  const rates = CENTRAL_BANKS.map((b) => parseFloat(b.currentRate.replace(",", ".")));
  const corridor = `${Math.min(...rates).toFixed(2).replace(".", ",")}–${Math.max(...rates)
    .toFixed(2)
    .replace(".", ",")} %`;

  return (
    <div className="space-y-6">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Landmark className="h-6 w-6 text-primary" /> {t("page.policy.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("page.policy.subtitle")}
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
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">{cuts}</p>
              <p className="text-xs text-muted-foreground">
                baisse{cuts > 1 ? "s" : ""} récente{cuts > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{CENTRAL_BANKS.length}</p>
              <p className="text-xs text-muted-foreground">banques suivies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{corridor}</p>
              <p className="text-xs text-muted-foreground">corridor global</p>
            </div>
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Orientation du module 4 :</span>
        <ToneLegend label="Restrictive" cls={NB_TONE_STYLE.restrictive} />
        <ToneLegend label="Neutre" cls={NB_TONE_STYLE.neutral} />
        <ToneLegend label="Accommodante" cls={NB_TONE_STYLE.dovish} />
        <span className="ml-2 text-xs text-muted-foreground">
          Elle décrit le niveau du taux, non son dernier mouvement.
        </span>
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
