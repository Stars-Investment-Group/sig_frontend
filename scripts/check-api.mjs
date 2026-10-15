#!/usr/bin/env node
/**
 * Verifie que le backend repond et que sa forme correspond a ce que le front
 * attend.
 *
 *   node scripts/check-api.mjs [base]
 *
 * `base` vaut `http://localhost:3000` par defaut, ou `$VITE_API_URL`.
 *
 * Le script ne modifie rien : il lit. Pour chaque route il dit le code HTTP,
 * le nombre d'elements et les champs manquants ou inattendus. Une table vide
 * est signalee comme telle : une API qui repond 200 avec zero ligne donne des
 * pages blanches, et c'est le genre de chose qu'on decouvre trop tard.
 */

const BASE = (process.argv[2] ?? process.env.VITE_API_URL ?? "http://localhost:3000")
  .replace(/\/+$/, "");

// Dix secondes suffisent sur une base locale. Contre un Neon froid, une seule
// requete peut prendre trois secondes : CHECK_TIMEOUT_MS allonge le delai, de
// sorte qu'une route lente ne passe pas pour une route cassee.
const TIMEOUT_MS = Number(process.env.CHECK_TIMEOUT_MS ?? 10_000);

/** Un echantillon de pays et d'indicateurs, decouvert a l'execution. */
const discovered = { country: null, indicator: null, region: null };

/**
 * Chaque sonde dit la route, les champs qu'elle doit porter, et si une liste
 * vide est acceptable.
 */
const PROBES = [
  { name: "sante", path: () => "/health", expect: [], emptyOk: true },

  {
    name: "module 1 — pays",
    path: () => "/countries",
    expect: ["code", "name", "region", "incomeLevel", "isAggregate"],
    onOk: (rows) => {
      const real = rows.find((r) => !r.isAggregate) ?? rows[0];
      if (real) discovered.country = real.code;
    },
  },
  { name: "module 1 — regions", path: () => "/countries/regions", expect: [] },
  {
    name: "module 1 — fiche",
    path: () => (discovered.country ? `/countries/${discovered.country}` : null),
    expect: ["code", "name"],
  },
  {
    name: "module 1 — overview",
    path: () =>
      discovered.country ? `/countries/${discovered.country}/overview` : null,
    expect: ["code", "name", "region"],
  },

  {
    name: "module 2 — catalogue",
    path: () => "/indicators",
    expect: ["code", "name", "category", "unit", "frequency"],
    onOk: (rows) => {
      if (rows[0]) discovered.indicator = rows[0].code;
    },
  },
  { name: "module 2 — categories", path: () => "/indicators/categories", expect: [] },

  {
    name: "code inflation — cpi_inflation",
    path: () => "/indicators/cpi_inflation",
    expect: ["code"],
    tolerate404: true,
  },
  {
    name: "code inflation — inflation_rate",
    path: () => "/indicators/inflation_rate",
    expect: ["code"],
    tolerate404: true,
  },

  {
    name: "module 3 — derniers points",
    path: () => "/macro-data/latest",
    expect: ["countryCode", "period", "value", "vintageDate"],
  },
  {
    name: "module 3 — serie",
    path: () =>
      discovered.country && discovered.indicator
        ? `/macro-data/${discovered.country}/${discovered.indicator}`
        : null,
    expect: ["countryCode", "period", "value", "vintageDate", "isForecast"],
  },
  {
    name: "module 3 — millesimes",
    path: () =>
      discovered.country && discovered.indicator
        ? `/macro-data/${discovered.country}/${discovered.indicator}/vintages`
        : null,
    expect: ["period", "value", "vintageDate"],
  },

  {
    name: "module 4 — regimes",
    path: () => "/macro-regime",
    expect: ["countryCode", "regime", "riskScore", "growthScore", "inflationScore"],
  },
  { name: "module 4 — global", path: () => "/macro-regime/global", expect: [] },

  {
    name: "module 5 — notation",
    path: () =>
      discovered.country ? `/country-rating/${discovered.country}` : null,
    // La route expose `pillars`, pas `pillarScores` comme la colonne.
    expect: ["countryCode", "overallScore", "pillars", "reviewDate"],
  },
  {
    name: "module 5 — piliers",
    path: () =>
      discovered.country ? `/country-rating/${discovered.country}/pillars` : null,
    expect: [],
  },

  { name: "module 6 — screener", path: () => "/country-screener", expect: [] },
  { name: "module 6 — classement", path: () => "/country-screener/rankings", expect: [] },

  { name: "module 7 — KPI", path: () => "/global-kpi/kpis", expect: [] },
  { name: "module 7 — house view", path: () => "/global-kpi/house-view", expect: [] },
  { name: "module 7 — movers", path: () => "/global-kpi/movers", expect: [] },

  { name: "module 8 — regions", path: () => "/regions", expect: [] },

  { name: "module 9 — evenements", path: () => "/calendar/events/upcoming", expect: [] },
  { name: "module 9 — publications", path: () => "/calendar/releases", expect: [] },

  { name: "explorateur — indicateurs", path: () => "/data-explorer/indicators", expect: [] },

  // Routes protegees : on attend un 401 sans jeton. Un 200 serait un trou.
  { name: "alertes (doit exiger un jeton)", path: () => "/alerts", expectStatus: 401 },
  { name: "watchlists (doit exiger un jeton)", path: () => "/watchlists", expectStatus: 401 },
];

async function probe(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(BASE + path, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { status: response.status, body };
  } catch (error) {
    return { status: 0, error: error.name === "AbortError" ? "delai depasse" : error.message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deballe les enveloppes connues.
 *
 * Trois conventions coexistent dans ce backend. Compter sans deballer
 * afficherait « 1 element » pour une page de cinquante lignes, ou pour une
 * page vide.
 */
function unwrap(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  for (const key of ["data", "series", "movers", "heatmap", "countries", "events", "releases"]) {
    if (Array.isArray(body[key])) return body[key];
  }
  return body;
}

/** Champs attendus absents du premier element. */
function missingFields(body, expect) {
  if (!expect.length) return [];
  const sample = Array.isArray(body) ? body[0] : body;
  if (!sample || typeof sample !== "object") return expect;
  return expect.filter((f) => !(f in sample));
}

/** Signale les `Decimal` qui arrivent en chaine — le front doit les convertir. */
function decimalStrings(body) {
  const sample = Array.isArray(body) ? body[0] : body;
  if (!sample || typeof sample !== "object") return [];
  return Object.entries(sample)
    .filter(([, v]) => typeof v === "string" && /^-?\d+\.\d+$/.test(v))
    .map(([k]) => k);
}

const results = [];

for (const p of PROBES) {
  const path = p.path();
  if (!path) {
    results.push({ name: p.name, verdict: "IGNORE", detail: "depend d'une sonde precedente" });
    continue;
  }

  const { status, body, error } = await probe(path);

  if (status === 0) {
    results.push({ name: p.name, path, verdict: "INJOIGNABLE", detail: error });
    continue;
  }

  if (p.expectStatus) {
    const ok = status === p.expectStatus;
    results.push({
      name: p.name,
      path,
      verdict: ok ? "OK" : "ATTENTION",
      detail: ok ? `${status} comme attendu` : `${status} au lieu de ${p.expectStatus}`,
    });
    continue;
  }

  if (status >= 400) {
    results.push({
      name: p.name,
      path,
      verdict: p.tolerate404 && status === 404 ? "ABSENT" : "ERREUR",
      detail: p.tolerate404 && status === 404
        ? "ce code n'existe pas au catalogue"
        : `${status} ${body?.message ?? ""}`.trim(),
    });
    continue;
  }

  const payload = unwrap(body);
  const count = Array.isArray(payload) ? payload.length : payload ? 1 : 0;
  const missing = missingFields(payload, p.expect);
  const decimals = decimalStrings(payload);
  p.onOk?.(Array.isArray(payload) ? payload : [payload]);
  const enveloppe = payload !== body ? " (enveloppe deballee)" : "";

  let verdict = "OK";
  const notes = [`${count} element${count > 1 ? "s" : ""}${enveloppe}`];
  if (count === 0 && !p.emptyOk) {
    verdict = "VIDE";
    notes.push("la table ne contient rien");
  }
  if (missing.length) {
    verdict = "ATTENTION";
    notes.push(`champs absents : ${missing.join(", ")}`);
  }
  if (decimals.length) notes.push(`decimaux en chaine : ${decimals.join(", ")}`);

  results.push({ name: p.name, path, verdict, detail: notes.join(" · ") });
}

/* ----------------------------- Restitution ----------------------------- */

const WIDTH = 34;
console.log(`\nContrat backend — ${BASE}\n`);
for (const r of results) {
  const mark =
    r.verdict === "OK" ? "  ok  " : r.verdict === "IGNORE" ? " ---- " : ` ${r.verdict.slice(0, 4)} `;
  console.log(`[${mark}] ${r.name.padEnd(WIDTH)} ${r.detail ?? ""}`);
}

const counts = results.reduce((acc, r) => {
  acc[r.verdict] = (acc[r.verdict] ?? 0) + 1;
  return acc;
}, {});

console.log(
  "\n" +
    Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")
);

const blocking = results.filter((r) =>
  ["INJOIGNABLE", "ERREUR"].includes(r.verdict)
).length;
const empty = results.filter((r) => r.verdict === "VIDE").length;

if (empty) {
  console.log(
    `\n${empty} route${empty > 1 ? "s repondent" : " repond"} 200 avec une table vide : ` +
      "l'API fonctionne mais la base n'est pas alimentee. Les pages seraient blanches."
  );
}

process.exit(blocking ? 1 : 0);
