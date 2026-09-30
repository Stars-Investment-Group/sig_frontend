import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Home, Minus, Plus } from "lucide-react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { Flag } from "@/components/Flag";
import { useI18n } from "@/lib/i18n";
import { STATIC_COUNTRIES, STATIC_REGIMES, getRating } from "@/data/mockData";
import { buildNumericIndex } from "@/data/worldGeo";
import type { CountryRating, MacroRegime } from "@shared/schema";
import { cn } from "@/lib/utils";

/**
 * Carte mondiale des régimes — planche P1, module 4.
 *
 * Choroplèthe réel : projection Natural Earth appliquée à un TopoJSON monde
 * versionné dans le dépôt (`data/world-110m.json`), donc **aucun appel réseau**.
 * Le fond est chargé en `import()` dynamique : il pèse une centaine de kilo-
 * octets et l'accueil ne doit pas l'attendre pour s'afficher. Tant qu'il n'est
 * pas là, la carte annonce son chargement plutôt que de sauter.
 *
 * Le rapprochement entre le tracé et la donnée passe par `data/worldGeo.ts` :
 * le TopoJSON identifie les pays en ISO numérique, l'application en alpha-3.
 */

/**
 * Six états de la légende de la maquette.
 *
 * L'état combine **direction et niveau** : un pays peu risqué mais en
 * dégradation doit se voir, ce qu'une simple échelle de risque masquerait.
 */
type MapState = "Improving" | "Favorable" | "Neutral" | "Deteriorating" | "Stressed" | "NoData";

const STATE_FILL: Record<MapState, string> = {
  Improving: "#10B981",
  Favorable: "#4ADE80",
  Neutral: "#3B82F6",
  Deteriorating: "#F59E0B",
  Stressed: "#EF4444",
  NoData: "#94A3B8",
};

const STATE_LABEL: Record<MapState, string> = {
  Improving: "Improving",
  Favorable: "Favorable",
  Neutral: "Neutral",
  Deteriorating: "Deteriorating",
  Stressed: "Stressed",
  NoData: "No Data",
};

const STATE_ORDER: MapState[] = [
  "Improving",
  "Favorable",
  "Neutral",
  "Deteriorating",
  "Stressed",
  "NoData",
];

function stateOf(regime: MacroRegime | undefined): MapState {
  if (!regime) return "NoData";
  if (regime.riskScore >= 65) return "Stressed";
  if (regime.momentum === "Deteriorating") return "Deteriorating";
  if (regime.momentum === "Improving") return "Improving";
  return regime.riskScore <= 35 ? "Favorable" : "Neutral";
}

/** ISO 3166-1 numerique de l'Antarctique, ecarte du cadrage. */
const ANTARCTICA = "010";

const WIDTH = 760;
const HEIGHT = 380;
const ZOOM_STEPS = [1, 1.8, 3.2];

interface Feature {
  id: string;
  name: string;
  d: string;
  /** Centre du tracé, pour poser l'étiquette du pays suivi. */
  centroid: [number, number];
}

interface CountryDatum {
  code: string;
  name: string;
  regime: MacroRegime | undefined;
  rating: CountryRating;
  state: MapState;
}

export function RegimeMapCard() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [zoom, setZoom] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[] | null>(null);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Donnée par pays suivi, indexée par alpha-3. */
  const data = useMemo(() => {
    const map = new Map<string, CountryDatum>();
    for (const country of STATIC_COUNTRIES) {
      const regime = STATIC_REGIMES.find((r) => r.countryCode === country.code);
      map.set(country.code, {
        code: country.code,
        name: country.name,
        regime,
        rating: getRating(country.code),
        state: stateOf(regime),
      });
    }
    return map;
  }, []);

  const numericIndex = useMemo(
    () => buildNumericIndex(STATIC_COUNTRIES.map((c) => c.code)),
    []
  );

  // Le fond de carte arrive après le premier rendu : l'accueil ne l'attend pas.
  useEffect(() => {
    let cancelled = false;

    Promise.all([import("@/data/world-110m.json"), import("topojson-client")])
      .then(([topology, topojson]) => {
        if (cancelled) return;
        const raw = (topology as { default: unknown }).default ?? topology;
        const collection = topojson.feature(
          raw as Parameters<typeof topojson.feature>[0],
          (raw as { objects: { countries: unknown } }).objects
            .countries as Parameters<typeof topojson.feature>[1]
        ) as unknown as { features: GeoPermissibleObjects[] };

        // L'Antarctique occupe environ un sixieme de la hauteur de la
        // projection et ne portera jamais de donnee : l'ecarter agrandit
        // d'autant le monde habite dans le meme cadre.
        const drawn = collection.features.filter(
          (feature) => String((feature as unknown as { id: string }).id) !== ANTARCTICA
        );

        const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
          type: "FeatureCollection",
          features: drawn,
        } as never);
        const path = geoPath(projection);

        setFeatures(
          drawn.map((feature) => {
            const f = feature as unknown as {
              id: string;
              properties: { name: string };
            };
            return {
              id: String(f.id),
              name: f.properties?.name ?? "",
              d: path(feature) ?? "",
              centroid: path.centroid(feature) as [number, number],
            };
          })
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const active = hovered ? data.get(hovered) : undefined;
  const scale = ZOOM_STEPS[zoom];

  // Le zoom recentre sur le barycentre des pays suivis, pas sur le milieu de la
  // carte : sans cela, zoomer sort l'Afrique de l'Ouest du cadre.
  const focus = useMemo(() => {
    if (!features) return { x: WIDTH / 2, y: HEIGHT / 2 };
    const tracked = features.filter((f) => numericIndex.has(f.id));
    if (!tracked.length) return { x: WIDTH / 2, y: HEIGHT / 2 };
    const sum = tracked.reduce(
      (acc, f) => ({ x: acc.x + f.centroid[0], y: acc.y + f.centroid[1] }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / tracked.length, y: sum.y / tracked.length };
  }, [features, numericIndex]);

  const transform = `translate(${WIDTH / 2 - focus.x * scale} ${HEIGHT / 2 - focus.y * scale}) scale(${scale})`;

  return (
    <div className="card-surface flex flex-col p-5 lg:col-span-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("regimeMap.title")}</h2>
          <p className="text-[11px] text-muted-foreground">
            {data.size} pays couverts · survol pour le détail
          </p>
        </div>

        {/* Contrôles de zoom de la maquette : accueil / + / - */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setZoom(0)}
            aria-label="Revenir à la vue monde"
            title="Vue monde"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0, z - 1))}
            disabled={zoom === 0}
            aria-label="Dézoomer"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
            disabled={zoom === ZOOM_STEPS.length - 1}
            aria-label="Zoomer"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 rounded-lg border border-border bg-muted/30">
        {!features && (
          <div
            className="flex h-full min-h-[280px] items-center justify-center"
            aria-busy={!failed}
          >
            <p className="text-xs text-muted-foreground">
              {failed ? "Fond de carte indisponible." : "Chargement du fond de carte…"}
            </p>
          </div>
        )}

        {features && (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Carte mondiale des régimes macroéconomiques, ${data.size} pays couverts`}
          >
            <g transform={transform}>
              {features.map((feature) => {
                const code = numericIndex.get(feature.id);
                const datum = code ? data.get(code) : undefined;
                const state: MapState = datum?.state ?? "NoData";
                const tracked = Boolean(datum);
                return (
                  <path
                    key={feature.id}
                    d={feature.d}
                    fill={STATE_FILL[state]}
                    fillOpacity={tracked ? (hovered === code ? 1 : 0.85) : 0.28}
                    stroke="#FFFFFF"
                    strokeWidth={0.5 / scale}
                    className={cn(
                      "transition-opacity",
                      tracked && "cursor-pointer focus:outline-none"
                    )}
                    tabIndex={tracked ? 0 : -1}
                    role={tracked ? "button" : undefined}
                    aria-label={
                      tracked
                        ? `${datum!.name} — ${STATE_LABEL[state]}, risque ${datum!.regime?.riskScore ?? "n/d"}/100`
                        : undefined
                    }
                    onMouseEnter={() => tracked && setHovered(code!)}
                    onFocus={() => tracked && setHovered(code!)}
                    onMouseLeave={() => tracked && setHovered(null)}
                    onBlur={() => tracked && setHovered(null)}
                    onClick={() => tracked && navigate(`/countries/${code}/summary`)}
                  />
                );
              })}

              {/* Étiquettes des pays suivis, lisibles seulement une fois zoomé */}
              {zoom > 0 &&
                features
                  .filter((f) => numericIndex.get(f.id))
                  .map((feature) => (
                    <text
                      key={`label-${feature.id}`}
                      x={feature.centroid[0]}
                      y={feature.centroid[1]}
                      textAnchor="middle"
                      fontSize={7 / scale}
                      className="pointer-events-none fill-slate-900 font-bold"
                    >
                      {numericIndex.get(feature.id)}
                    </text>
                  ))}
            </g>
          </svg>
        )}

        {/* Infobulle : régime, momentum, score de risque, accès à la fiche */}
        {active && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg border border-border bg-popover/95 p-3 shadow-lg sm:right-auto sm:w-64">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Flag code={active.code} size={18} />
              {active.name}
            </p>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Overall Regime</dt>
                <dd className="font-medium text-foreground">{active.regime?.regime ?? "n/d"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Momentum</dt>
                <dd className="font-medium text-foreground">{active.regime?.momentum ?? "n/d"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Risk Score</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {active.regime?.riskScore ?? "—"}/100
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Score SIG</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {active.rating.compositeScore.toFixed(1)}/10
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] font-medium text-primary">Ouvrir la fiche pays →</p>
          </div>
        )}
      </div>

      {/* Légende : les six états de la maquette */}
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {STATE_ORDER.map((state) => (
          <li key={state} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATE_FILL[state] }}
            />
            <span className="text-muted-foreground">{STATE_LABEL[state]}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Fond Natural Earth 110 m versionné dans le dépôt. Les pays sans couverture restent en
        « No Data » et s&apos;allumeront à mesure que le module Régimes s&apos;étend.
      </p>
    </div>
  );
}
