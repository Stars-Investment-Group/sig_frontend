import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/common/SectionCard";
import { Flag } from "@/components/Flag";
import { BadgeCheck, Database, Info, TrendingDown, TrendingUp } from "lucide-react";
import { sourceAttr } from "@/api/useApiData";
import { USE_API } from "@/api/client";
import {
  useUemoaCatalogue,
  useUemoaParPerimetre,
  indicatorKeyOf,

  perimetreOf,
  type SerieBceao,
} from "@/api/uemoa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/* =========================================================================
 * Donnees BCEAO — les seules series mesurees de l'application.
 *
 * Pourquoi cette page existe, et pourquoi elle est a part
 * -------------------------------------------------------
 * Tout le reste de l'application affiche des donnees **fabriquees** pour
 * permettre le branchement avant que le pipeline existe : chaque ligne de
 * `macro_data` porte `source = 'SIG-MOCK'`. Ces 119 series-ci viennent de la
 * BCEAO via DBnomics, et sont les seules a mesurer quelque chose.
 *
 * Elles ne pouvaient pas entrer dans les pages existantes : annuelles,
 * arretees en 2024, exprimees en milliards de FCFA pour la plupart, et
 * reperant leurs pays en alpha-2. Le solde budgetaire ivoirien y vaut
 * `-2120,6` quand la fiche pays affiche `-3,2` — les deux sont justes, mais ne
 * mesurent pas la meme chose. Les verser dans les blocs actuels afficherait
 * des milliards de 2024 sous un libelle annonçant un pourcentage de 2026.
 *
 * D'ou cette page : elle montre la donnee dans **sa** forme, avec ses vrais
 * libelles, sa couverture reelle et sa source nommee. Elle n'a pas de repli
 * statique, et c'est volontaire — ces series n'ont pas d'equivalent fabrique,
 * et en inventer un reintroduirait la confusion que l'on cherche a eviter.
 * ========================================================================= */

/** Les neuf perimetres, dans l'ordre d'affichage. L'agregat en tete. */
const PERIMETRES: { code: string; nom: string }[] = [
  { code: "UEMOA", nom: "Ensemble UMOA" },
  { code: "BEN", nom: "Bénin" },
  { code: "BFA", nom: "Burkina Faso" },
  { code: "CIV", nom: "Côte d'Ivoire" },
  { code: "GNB", nom: "Guinée-Bissau" },
  { code: "MLI", nom: "Mali" },
  { code: "NER", nom: "Niger" },
  { code: "SEN", nom: "Sénégal" },
  { code: "TGO", nom: "Togo" },
];

/**
 * Les unites, deduites du jeu de donnees.
 *
 * DBnomics ne les expose pas separement du libelle. Le jeu, lui, les
 * determine : `TAUXINFL_A` et les ratios de `IMECO` sont des pourcentages, le
 * reste des niveaux en milliards de FCFA. L'indice des prix est un indice.
 * Une unite inconnue n'affiche rien plutot que de supposer des milliards.
 */
function uniteDe(serie: SerieBceao): string {
  if (serie.dataset === "TAUXINFL_A") return "%";
  if (serie.dataset === "IHPC") return "indice";
  if (serie.dataset === "TC_A") return "FCFA";
  // Dans IMECO, le suffixe distingue la croissance et les ratios des niveaux.
  const k = serie.indicateur;
  if (k === "SR1041A0BP" || k === "SE1488A0AP") return "%";
  if (k === "FP3001A0FA") return "% du PIB";
  return "Mds FCFA";
}

function formate(valeur: number): string {
  const abs = Math.abs(valeur);
  const decimales = abs >= 100 ? 1 : 2;
  return valeur
    .toFixed(decimales)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d),)/g, " ");
}

export function UemoaPage() {
  const [perimetre, setPerimetre] = useState("CIV");
  const [serieOuverte, setSerieOuverte] = useState<string | null>(null);

  const catalogue = useUemoaCatalogue();
  const series = useUemoaParPerimetre(perimetre);

  // Le catalogue sert a compter : combien de series, combien d'indicateurs,
  // combien de perimetres. Ce sont les chiffres que l'on annonce en en-tete,
  // et ils viennent de la base, pas d'une constante ecrite a la main.
  const compte = useMemo(() => {
    const lignes = catalogue.data;
    return {
      series: lignes.length,
      indicateurs: new Set(lignes.map((l) => indicatorKeyOf(l.seriesCode))).size,
      perimetres: new Set(lignes.map((l) => perimetreOf(l.country))).size,
    };
  }, [catalogue.data]);

  const ouverte = useMemo(
    () => series.data.find((s) => s.seriesCode === serieOuverte) ?? series.data[0] ?? null,
    [series.data, serieOuverte]
  );

  const graphique = useMemo(() => {
    if (!ouverte || ouverte.points.length === 0) return null;
    return {
      labels: ouverte.points.map((p) => p.annee),
      datasets: [
        {
          label: ouverte.libelle,
          data: ouverte.points.map((p) => p.valeur),
          borderColor: "hsl(215, 85%, 45%)",
          backgroundColor: "hsla(215, 85%, 45%, 0.12)",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.25,
        },
      ],
    };
  }, [ouverte]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // `parsed.y` peut etre nul : DBnomics rend « NA » sur les periodes
            // non publiees, et l'injection les ecarte, mais une serie future
            // pourrait en porter. Un trou se dit, il ne s'affiche pas en zero.
            label: (ctx: { parsed: { y: number | null } }) =>
              ctx.parsed.y === null
                ? "non disponible"
                : `${formate(ctx.parsed.y)} ${ouverte ? uniteDe(ouverte) : ""}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            // Soixante-cinq annees ne tiennent pas en abscisse : une
            // graduation sur cinq suffit a situer la courbe.
            callback(this: unknown, _v: unknown, i: number) {
              const a = ouverte?.points[i]?.annee;
              return a && Number(a) % 5 === 0 ? a : "";
            },
            maxRotation: 0,
            autoSkip: false,
          },
        },
        y: { grid: { color: "hsla(215, 20%, 65%, 0.15)" } },
      },
    }),
    [ouverte]
  );

  return (
    <div className="space-y-6" {...sourceAttr(series.fromApi)}>
      {/* ===== En-tête ===== */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Database className="h-6 w-6 text-primary" /> Données BCEAO
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Séries officielles de la Banque Centrale des États de l'Afrique de
          l'Ouest, synchronisées depuis DBnomics.
        </p>
      </div>

      {/* ===== Ce que cette page montre, et ce qu'elle ne montre pas ===== */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-start gap-3 p-4">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              Les seules données mesurées de l'application.
            </p>
            <p className="text-muted-foreground">
              Le reste du tracker affiche des valeurs illustratives, injectées
              pour permettre le raccordement avant la mise en service du
              pipeline. Celles de cette page sont réelles — et, pour cette
              raison, <strong>annuelles et arrêtées en 2024</strong> : DBnomics
              ne publie aucune fréquence infra-annuelle pour la BCEAO. Combler
              2025-2026 demande un accès direct à la base EDEN.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===== Compteurs, lus sur la base ===== */}
      {USE_API && (
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Séries suivies", valeur: compte.series },
          { label: "Indicateurs", valeur: compte.indicateurs },
          { label: "Périmètres", valeur: compte.perimetres },
        ].map((k) => (
          <Card key={k.label} className="card-surface">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {k.valeur > 0 ? k.valeur : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* ===== Sélecteur de périmètre ===== */}
      <div className="flex flex-wrap gap-2">
        {PERIMETRES.map((p) => (
          <button
            key={p.code}
            onClick={() => {
              setPerimetre(p.code);
              setSerieOuverte(null);
            }}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              perimetre === p.code
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {p.code !== "UEMOA" && <Flag code={p.code} size={14} />}
            {p.nom}
          </button>
        ))}
      </div>

      {/* ===== Rien à montrer : on le dit, on n'invente pas ===== */}
      {series.data.length === 0 ? (
        <Card className="card-surface">
          <CardContent className="flex items-start gap-3 p-6 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            {/* Trois causes, trois messages. Les distinguer n'est pas un
                detail de confort : sans backend joignable, cette page est
                vide, et un « Aucune serie » sec se lit comme une panne alors
                que c'est le comportement attendu d'une demonstration
                statique. C'est exactement ce que la version publiee sur
                GitHub Pages montrait le 2026-11-13. */}
            {!USE_API ? (
              <div>
                <p className="font-medium text-foreground">
                  Cette démonstration tourne sans backend.
                </p>
                <p className="mt-1 text-muted-foreground">
                  Les 119 séries BCEAO existent bien — 4 991 observations en
                  base — mais elles ne se lisent que par l'API, et cette
                  version est servie en fichiers statiques. Les autres pages
                  fonctionnent ici parce qu'elles disposent de données de
                  référence ; celle-ci n'en a pas, volontairement : ce sont
                  les seuls chiffres mesurés du tracker, et leur inventer un
                  équivalent reviendrait à présenter des valeurs fabriquées
                  comme des faits économiques.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-foreground">
                  {series.loading
                    ? "Chargement des séries…"
                    : "Aucune série pour ce périmètre."}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {series.loading
                    ? "La base est hébergée hors d'Afrique de l'Ouest : le premier appel peut demander plusieurs secondes."
                    : "Cette page n'a pas de données de repli : elle n'affiche que ce que la base contient réellement."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ===== La série ouverte ===== */}
          <SectionCard
            title={ouverte?.libelle ?? "Série"}
            subtitle={
              ouverte
                ? `${uniteDe(ouverte)} · ${ouverte.couverture?.de ?? "?"}–${ouverte.couverture?.a ?? "?"} · jeu ${ouverte.dataset}`
                : undefined
            }
          >
            <div className="h-[320px]">
              {graphique && <Line data={graphique} options={options} />}
            </div>
            {ouverte?.dernier && (
              <div className="mt-3 flex flex-wrap items-baseline gap-2 border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  Dernière valeur connue ({ouverte.dernier.annee})
                </span>
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {formate(ouverte.dernier.valeur)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {uniteDe(ouverte)}
                </span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {ouverte.seriesCode}
                </span>
              </div>
            )}
          </SectionCard>

          {/* ===== Les séries du périmètre ===== */}
          <SectionCard
            title="Séries disponibles"
            subtitle={`${series.data.length} pour ce périmètre`}
          >
            <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {series.data.map((s) => {
                const actif = s.seriesCode === ouverte?.seriesCode;
                // La tendance compare les deux derniers points connus. Deux
                // points suffisent ; un seul ne dit rien, et on n'affiche
                // alors aucune fleche plutot qu'une fleche neutre trompeuse.
                const n = s.points.length;
                const pente =
                  n >= 2 ? s.points[n - 1].valeur - s.points[n - 2].valeur : null;
                return (
                  <button
                    key={s.seriesCode}
                    onClick={() => setSerieOuverte(s.seriesCode)}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors ${
                      actif ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {s.libelle}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {s.couverture?.de}–{s.couverture?.a} · {n} points
                      </span>
                    </span>
                    {pente !== null &&
                      (pente >= 0 ? (
                        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                      ) : (
                        <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                      ))}
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ===== Source ===== */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="border-border">
          Source
        </Badge>
        <span>
          BCEAO, via{" "}
          <a
            href="https://db.nomics.world/BCEAO"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            DBnomics
          </a>
          . Codes de séries EDEN. Fréquence annuelle, couverture 1960-2024.
        </span>
      </div>
    </div>
  );
}
