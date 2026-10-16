#!/usr/bin/env node
/**
 * Alimente la base du backend depuis les donnees statiques du front.
 *
 *   node scripts/seed-neon.mjs [chemin/vers/backend_tracker]
 *
 * Par defaut le backend est cherche en `../../backend_tracker`, c'est-a-dire
 * a cote de `v1-front`.
 *
 * Pourquoi un script et pas le fichier SQL
 * ----------------------------------------
 * Le seed compte pres de quinze mille observations. Colle dans l'editeur web
 * de Neon, un script de cette taille cale ou expire. Ici on passe par le
 * client Prisma **deja installe et genere dans le backend** : pas de
 * dependance a ajouter, pas de `psql` a installer, et des insertions par lots.
 *
 * Le secret ne transite pas
 * -------------------------
 * La chaine de connexion est lue dans le `.env` du backend et n'est jamais
 * affichee. Le script n'imprime que des comptes.
 *
 * AVERTISSEMENT
 * -------------
 * **Ces valeurs sont illustratives, pas des mesures.** Elles sont generees.
 * Chaque ligne porte `source = 'SIG-MOCK'` pour qu'on puisse les distinguer et
 * les retirer quand le pipeline prendra le relais :
 *
 *   DELETE FROM macro_data      WHERE source = 'SIG-MOCK';
 *   DELETE FROM macro_indicators WHERE source = 'SIG-MOCK';
 *
 * Ne jamais les presenter comme des donnees macroeconomiques reelles.
 */

import { build } from "../node_modules/vite/node_modules/esbuild/lib/main.js";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const backend = resolve(process.argv[2] ?? resolve(root, "../../backend_tracker"));

/* --------------------------------------------------------- verifications */

if (!existsSync(backend)) {
  console.error(`Backend introuvable : ${backend}`);
  console.error("Passez son chemin en argument :");
  console.error('  node scripts/seed-neon.mjs "C:/chemin/vers/backend_tracker"');
  process.exit(1);
}

const envPath = resolve(backend, ".env");
if (!existsSync(envPath)) {
  console.error(`Pas de .env dans ${backend} — la chaine de connexion y est lue.`);
  process.exit(1);
}

/** Lit DATABASE_URL sans jamais l'afficher. */
const databaseUrl = (() => {
  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trimStart().startsWith("DATABASE_URL"));
  if (!line) return null;
  const raw = line.slice(line.indexOf("=") + 1).trim();
  return raw.replace(/^["']|["']$/g, "");
})();

if (!databaseUrl) {
  console.error("DATABASE_URL absent du .env du backend.");
  process.exit(1);
}
if (databaseUrl.includes("${")) {
  console.error(
    "DATABASE_URL contient des ${...} : Prisma ne fait pas l'expansion de\n" +
      "variables, il lit le fichier litteralement. Collez l'URL Neon complete."
  );
  process.exit(1);
}

/** Client Prisma du backend : deja installe et genere la-bas. */
let PrismaClient;
try {
  const requireFromBackend = createRequire(resolve(backend, "package.json"));
  ({ PrismaClient } = requireFromBackend("@prisma/client"));
} catch (error) {
  console.error("Client Prisma introuvable dans le backend.");
  console.error("Depuis le dossier du backend, lancez :  npx prisma generate");
  console.error(String(error.message).slice(0, 200));
  process.exit(1);
}

/* ------------------------------------------- donnees statiques du front */

const BUNDLE = resolve(root, "node_modules/.cache-seed-neon.mjs");
const ENTRY = resolve(root, "node_modules/.cache-seed-entry.mjs");

// Une entree de facade : le seed a besoin de trois modules du front, et
// esbuild ne prend qu'un point d'entree. Les sources TypeScript visees sont
// resolues par les alias declares ci-dessous.
writeFileSync(
  ENTRY,
  `export * from "@/data/mockData";
export { globalKpis, houseView } from "@/data/mockDashboard";
export { CALENDAR_EVENTS } from "@/data/calendar";
`
);

await build({
  entryPoints: [ENTRY],
  outfile: BUNDLE,
  bundle: true,
  format: "esm",
  platform: "node",
  logLevel: "warning",
  alias: { "@shared": resolve(root, "shared"), "@": resolve(root, "client/src") },
});

const data = await import(pathToFileURL(BUNDLE).href);
rmSync(BUNDLE, { force: true });
rmSync(ENTRY, { force: true });

const {
  STATIC_COUNTRIES,
  STATIC_INDICATORS,
  STATIC_OBSERVATIONS,
  STATIC_REGIMES,
  STATIC_RATINGS,
  DATA_AS_OF,
  PILLAR_ORDER,
  globalKpis,
  houseView,
  CALENDAR_EVENTS,
} = data;

/** UUID deterministe : rejouer le script garde les memes cles etrangeres. */
function uuidFrom(seed) {
  const h = createHash("sha1").update(`sig:${seed}`).digest("hex");
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    `4${h.slice(13, 16)}`,
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join("-");
}

/** `YYYY-MM` ou `Date` vers une `Date` UTC au premier du mois. */
function day(value) {
  if (value instanceof Date) return new Date(value.toISOString().slice(0, 10));
  const text = String(value);
  return new Date(/^\d{4}-\d{2}$/.test(text) ? `${text}-01` : text.slice(0, 10));
}

/* ----------------------------------------------------------- insertion */

const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
  log: ["warn", "error"],
});

const compte = {};

try {
  await prisma.$connect();
  console.log("Connecte.\n");

  // --- Pays ---------------------------------------------------------------
  // `upsert` plutot que `createMany` : les deux pays deja presents doivent
  // etre mis a jour, pas rejetes.
  for (const c of STATIC_COUNTRIES) {
    const payload = {
      name: c.name,
      region: c.region,
      subregion: c.subregion,
      incomeLevel: c.incomeLevel,
      currency: c.currency,
      isAggregate: c.isAggregate,
    };
    await prisma.country.upsert({
      where: { code: c.code },
      create: { code: c.code, ...payload },
      update: payload,
    });
  }
  compte.pays = STATIC_COUNTRIES.length;
  console.log(`pays           ${compte.pays}`);

  // --- Catalogue ----------------------------------------------------------
  const indicatorId = new Map();
  for (const i of STATIC_INDICATORS) {
    const id = uuidFrom(`indicator:${i.code}`);
    const payload = {
      name: i.name,
      description: i.description,
      category: i.category,
      unit: i.unit,
      frequency: i.frequency,
      source: "SIG-MOCK",
      isSeasonallyAdjusted: i.isSeasonallyAdjusted,
      // `shortName`, `family` et `block` n'ont pas de colonne : le schema
      // prevoit `metadata` pour cela.
      metadata: { shortName: i.shortName, family: i.family, block: i.block },
    };
    const row = await prisma.macroIndicator.upsert({
      where: { code: i.code },
      create: { id, code: i.code, ...payload },
      update: payload,
    });
    // L'indicateur existant garde **son** id : c'est celui-la qu'il faut
    // referencer, pas celui qu'on aurait choisi.
    indicatorId.set(i.code, row.id);
  }
  compte.indicateurs = STATIC_INDICATORS.length;
  console.log(`indicateurs    ${compte.indicateurs}`);

  // --- Observations -------------------------------------------------------
  const observations = STATIC_OBSERVATIONS.filter((o) =>
    indicatorId.has(o.indicatorCode)
  ).map((o) => ({
    id: uuidFrom(`obs:${o.countryCode}:${o.indicatorCode}:${o.period}:${o.vintageDate}`),
    countryCode: o.countryCode,
    indicatorId: indicatorId.get(o.indicatorCode),
    vintageDate: day(o.vintageDate),
    period: day(o.period),
    value: o.value,
    isForecast: o.isForecast,
    isEstimate: false,
    releaseDate: day(o.releaseDate),
    source: "SIG-MOCK",
  }));

  // Par lots : quinze mille lignes en une requete depasseraient les limites
  // du protocole.
  const LOT = 1000;
  let inserees = 0;
  for (let i = 0; i < observations.length; i += LOT) {
    const r = await prisma.macroData.createMany({
      data: observations.slice(i, i + LOT),
      skipDuplicates: true,
    });
    inserees += r.count;
    process.stdout.write(
      `\robservations   ${inserees} / ${observations.length}`
    );
  }
  compte.observations = inserees;
  console.log("");

  // --- Regimes ------------------------------------------------------------
  // La table n'a aucune contrainte d'unicite : sans purge, rejouer le script
  // donnerait plusieurs regimes courants au meme pays.
  await prisma.macroRegime.deleteMany({
    where: { metadata: { path: ["source"], equals: "SIG-MOCK" } },
  });
  const regimes = await prisma.macroRegime.createMany({
    data: STATIC_REGIMES.map((r) => ({
      id: uuidFrom(`regime:${r.countryCode}:${r.period}`),
      countryCode: r.countryCode,
      regime: r.regime,
      momentum: r.momentum,
      confidence: r.confidence,
      riskScore: r.riskScore,
      growthScore: r.growthScore,
      inflationScore: r.inflationScore,
      policyStance: r.policyStance,
      period: day(r.period),
      validFrom: day(r.validFrom),
      validTo: r.validTo ? day(r.validTo) : null,
      metadata: { source: "SIG-MOCK" },
    })),
    skipDuplicates: true,
  });
  compte.regimes = regimes.count;
  console.log(`regimes        ${compte.regimes}`);

  // --- Notations ----------------------------------------------------------
  for (const r of STATIC_RATINGS) {
    const payload = {
      // Sur 100, comme region_snapshots et comme les ecrans. Le composite du
      // front est sur 10 ; le stocker tel quel ferait afficher 7,3 au
      // screener la ou la fiche pays annonce 73/100.
      overallScore: Number((r.compositeScore * 10).toFixed(2)),
      // `rating` attend une note en lettres, pas une perspective : la
      // perspective se derive du momentum, cote client.
      rating: null,
      // Sur 100 comme `overallScore` : une seule echelle par ligne. Le
      // contrat front lit des scores sur 10, la conversion se fait dans
      // l'adaptateur, une fois.
      pillarScores: Object.fromEntries(
        r.pillars.map((p) => [p.key, Number((p.score * 10).toFixed(2))])
      ),
      positiveDrivers: r.positiveDrivers,
      negativeDrivers: r.negativeDrivers,
      upgradeTriggers: r.upgradeTriggers,
      downgradeTriggers: r.downgradeTriggers,
    };
    await prisma.countryRating.upsert({
      where: {
        uq_country_rating_country_review_date: {
          countryCode: r.countryCode,
          reviewDate: day(r.reviewDate),
        },
      },
      create: {
        id: uuidFrom(`rating:${r.countryCode}`),
        countryCode: r.countryCode,
        reviewDate: day(r.reviewDate),
        ...payload,
      },
      update: payload,
    });
  }
  compte.notations = STATIC_RATINGS.length;
  console.log(`notations      ${compte.notations}`);

  // --- Notations : millesime precedent -----------------------------------
  // `/global-kpi/movers` compare les **deux** dernieres revues d'un pays et
  // passe son tour quand il n'y en a qu'une : sans ce second millesime la
  // route repond 200 avec une liste vide, et la carte « Top Movers » de
  // l'accueil reste blanche. L'ecart repris est `changeSincePrior`, celui-la
  // meme qu'affiche le front, pour que le mouvement calcule par l'API
  // coincide avec le mouvement affiche.
  for (const r of STATIC_RATINGS) {
    const reviewDate = day(r.reviewDate);
    const previousDate = new Date(reviewDate);
    previousDate.setMonth(previousDate.getMonth() - 3);
    const payload = {
      overallScore: Number(((r.compositeScore - r.changeSincePrior) * 10).toFixed(2)),
      rating: null,
      // Les scores de piliers precedents ne sont pas connus. Les reprendre
      // tels quels n'affirme rien sur le pilier qui aurait bouge ; en
      // inventer d'autres, si.
      // Sur 100 comme `overallScore` : une seule echelle par ligne. Le
      // contrat front lit des scores sur 10, la conversion se fait dans
      // l'adaptateur, une fois.
      pillarScores: Object.fromEntries(
        r.pillars.map((p) => [p.key, Number((p.score * 10).toFixed(2))])
      ),
      positiveDrivers: r.positiveDrivers,
      negativeDrivers: r.negativeDrivers,
      upgradeTriggers: r.upgradeTriggers,
      downgradeTriggers: r.downgradeTriggers,
    };
    await prisma.countryRating.upsert({
      where: {
        uq_country_rating_country_review_date: {
          countryCode: r.countryCode,
          reviewDate: previousDate,
        },
      },
      create: {
        id: uuidFrom(`rating:prev:${r.countryCode}`),
        countryCode: r.countryCode,
        reviewDate: previousDate,
        ...payload,
      },
      update: payload,
    });
  }
  compte.notationsPrecedentes = STATIC_RATINGS.length;
  console.log(`revues N-1     ${compte.notationsPrecedentes}`);

  // --- KPI globaux --------------------------------------------------------
  // Les valeurs du front sont reprises telles quelles : l'accueil les affiche
  // deja, et une moyenne recalculee ferait bouger la planche a la bascule
  // vers l'API. `risk_index` est le code attendu par `/global-kpi/risk-index`.
  const KPI_CODES = {
    growth: "global_growth",
    inflation: "global_inflation",
    rate: "global_policy_rate",
    risk: "risk_index",
  };
  const kpiPeriod = day(DATA_AS_OF);
  for (const k of globalKpis) {
    const value = Number.parseFloat(k.value);
    const payload = {
      kpiName: k.label,
      value,
      previousValue: Number((value - k.delta).toFixed(4)),
      change: k.delta,
      changeType: k.delta > 0 ? "increase" : k.delta < 0 ? "decrease" : "stable",
      unit: k.unit ?? null,
      metadata: { source: "SIG-MOCK", icon: k.icon, qualifier: k.qualifier ?? null },
    };
    const kpiCode = KPI_CODES[k.id] ?? k.id;
    await prisma.globalKpi.upsert({
      where: { kpiCode_period: { kpiCode, period: kpiPeriod } },
      create: { id: uuidFrom(`kpi:${kpiCode}`), kpiCode, period: kpiPeriod, ...payload },
      update: payload,
    });
  }
  compte.kpi = globalKpis.length;
  console.log(`KPI globaux    ${compte.kpi}`);

  // --- House view ---------------------------------------------------------
  // La table n'a pas de contrainte d'unicite ni de colonne `source` : on
  // purge sur le titre, qui n'appartient qu'a nous.
  await prisma.houseView.deleteMany({ where: { title: houseView.title } });
  await prisma.houseView.create({
    data: {
      id: uuidFrom("houseview:sig"),
      title: houseView.title,
      narrative: houseView.summary,
      outlook: houseView.status,
      scores: { conviction: houseView.conviction, horizon: houseView.horizon },
      regionBreakdown: {},
      period: kpiPeriod,
    },
  });
  compte.houseView = 1;
  console.log("house view     1");

  // --- Instantanes regionaux ---------------------------------------------
  // Les regions sont celles de la colonne `region` des pays — celles que
  // `/countries/regions` renvoie et sous lesquelles `/regions/:code/snapshot`
  // sera interroge. Les scores sont **agreges depuis les pays injectes**, pas
  // recopies des six blocs de presentation du front, qui decoupent le monde
  // autrement (« Africa ex-UEMOA », « Asia ex-Japan ») : un instantane doit
  // s'accorder avec les fiches qu'il resume.
  const parRegion = new Map();
  for (const c of STATIC_COUNTRIES) {
    if (c.isAggregate) continue;
    const rating = STATIC_RATINGS.find((r) => r.countryCode === c.code);
    const regime = STATIC_REGIMES.find((r) => r.countryCode === c.code);
    if (!rating || !regime) continue;
    const bucket = parRegion.get(c.region) ?? [];
    bucket.push({ rating, regime });
    parRegion.set(c.region, bucket);
  }

  const moyenne = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

  for (const [region, membres] of parRegion) {
    const momentums = membres.map((m) => m.regime.momentum);
    const dominant = [...new Set(momentums)]
      .map((m) => ({ m, n: momentums.filter((x) => x === m).length }))
      .sort((a, b) => b.n - a.n)[0].m;

    const payload = {
      regionName: region,
      // Le score composite du front est sur 10 ; la colonne attend 0-100.
      overallScore: Number(
        (moyenne(membres.map((m) => m.rating.compositeScore)) * 10).toFixed(2)
      ),
      momentum: dominant,
      riskScore: Number(
        moyenne(membres.map((m) => m.regime.riskScore)).toFixed(2)
      ),
      pillarScores: Object.fromEntries(
        PILLAR_ORDER.map((key) => [
          key,
          Number(
            moyenne(
              membres.map(
                (m) => m.rating.pillars.find((p) => p.key === key)?.score ?? 0
              )
            ).toFixed(2)
          ),
        ])
      ),
    };
    await prisma.regionSnapshot.upsert({
      where: { regionCode_period: { regionCode: region, period: kpiPeriod } },
      create: {
        id: uuidFrom(`region:${region}`),
        regionCode: region,
        period: kpiPeriod,
        ...payload,
      },
      update: payload,
    });
  }
  compte.regions = parRegion.size;
  console.log(`regions        ${compte.regions}`);

  // --- Evenements ---------------------------------------------------------
  const paysConnus = new Set(STATIC_COUNTRIES.map((c) => c.code));
  const regionParPays = new Map(STATIC_COUNTRIES.map((c) => [c.code, c.region]));

  await prisma.event.deleteMany({ where: { source: "SIG-MOCK" } });
  const evenements = await prisma.event.createMany({
    data: CALENDAR_EVENTS.map((e) => {
      const countryCode = paysConnus.has(e.flag) ? e.flag : null;
      return {
        id: uuidFrom(`event:${e.date}:${e.title}`),
        eventType: e.category,
        title: e.title,
        description: e.forecast ? `Attendu : ${e.forecast}` : null,
        countryCode,
        regionCode: countryCode ? regionParPays.get(countryCode) ?? null : null,
        eventDate: new Date(`${e.date}T00:00:00.000Z`),
        // Colonne `Time` : Prisma n'en retient que la partie horaire, la date
        // porteuse est sans objet.
        eventTime: new Date(`1970-01-01T${e.time}:00.000Z`),
        impact: e.importance,
        importance: e.importance === "High" ? 3 : e.importance === "Medium" ? 2 : 1,
        source: "SIG-MOCK",
      };
    }),
    skipDuplicates: true,
  });
  compte.evenements = evenements.count;
  console.log(`evenements     ${compte.evenements}`);

  // --- Publications -------------------------------------------------------
  // Une publication par observation ferait quinze mille lignes pour un
  // calendrier qui en montre une centaine. On garde la fenetre utile autour
  // de la date d'arret des donnees, millesime final seulement.
  const asOf = day(DATA_AS_OF);
  const debut = new Date(asOf);
  debut.setMonth(debut.getMonth() - 4);
  const fin = new Date(asOf);
  fin.setMonth(fin.getMonth() + 2);

  // Millesime final par (pays, indicateur, periode), puis valeur precedente.
  const finalParSerie = new Map();
  for (const o of STATIC_OBSERVATIONS) {
    if (!indicatorId.has(o.indicatorCode)) continue;
    const cle = `${o.countryCode}|${o.indicatorCode}`;
    const parPeriode = finalParSerie.get(cle) ?? new Map();
    const connu = parPeriode.get(o.period);
    if (!connu || day(o.vintageDate) > day(connu.vintageDate)) {
      parPeriode.set(o.period, o);
    }
    finalParSerie.set(cle, parPeriode);
  }

  const publications = [];
  for (const [cle, parPeriode] of finalParSerie) {
    const [countryCode, indicatorCode] = cle.split("|");
    const periodes = [...parPeriode.keys()].sort();
    periodes.forEach((periode, i) => {
      const o = parPeriode.get(periode);
      const releaseDate = day(o.releaseDate);
      if (releaseDate < debut || releaseDate > fin) return;
      const precedent = i > 0 ? parPeriode.get(periodes[i - 1]) : null;
      publications.push({
        id: uuidFrom(`release:${countryCode}:${indicatorCode}:${periode}`),
        indicatorId: indicatorId.get(indicatorCode),
        countryCode,
        releaseDate,
        period: day(periode),
        status: releaseDate <= asOf ? "released" : "scheduled",
        actualValue: releaseDate <= asOf ? o.value : null,
        previousValue: precedent ? precedent.value : null,
      });
    });
  }

  // Pas de purge ici : la table n'a ni contrainte d'unicite ni colonne
  // `source`, donc rien ne permettrait de distinguer nos lignes de celles du
  // pipeline. Les identifiants etant deterministes, rejouer le script
  // n'ajoute rien.
  let pubInserees = 0;
  for (let i = 0; i < publications.length; i += LOT) {
    const r = await prisma.dataRelease.createMany({
      data: publications.slice(i, i + LOT),
      skipDuplicates: true,
    });
    pubInserees += r.count;
  }
  compte.publications = pubInserees;
  console.log(
    `publications   ${pubInserees} (sur ${publications.length} dans la fenetre)`
  );

  console.log("\nTermine.");
  console.log(
    "Ces valeurs sont ILLUSTRATIVES. Chaque ligne porte source = 'SIG-MOCK'."
  );
} catch (error) {
  // Ne jamais laisser l'URL fuiter dans un message d'erreur Prisma.
  const message = String(error?.message ?? error).replaceAll(databaseUrl, "***");
  console.error("\nEchec :", message.slice(0, 900));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
