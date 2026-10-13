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
import { existsSync, readFileSync, rmSync } from "node:fs";
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

await build({
  entryPoints: [resolve(root, "client/src/data/mockData.ts")],
  outfile: BUNDLE,
  bundle: true,
  format: "esm",
  platform: "node",
  logLevel: "warning",
  alias: { "@shared": resolve(root, "shared"), "@": resolve(root, "client/src") },
});

const data = await import(pathToFileURL(BUNDLE).href);
rmSync(BUNDLE, { force: true });

const {
  STATIC_COUNTRIES,
  STATIC_INDICATORS,
  STATIC_OBSERVATIONS,
  STATIC_REGIMES,
  STATIC_RATINGS,
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
      overallScore: r.compositeScore,
      // `rating` attend une note en lettres, pas une perspective : la
      // perspective se derive du momentum, cote client.
      rating: null,
      pillarScores: Object.fromEntries(r.pillars.map((p) => [p.key, p.score])),
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
