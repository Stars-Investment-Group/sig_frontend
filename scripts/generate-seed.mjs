#!/usr/bin/env node
/**
 * Produit un seed SQL pour la base du backend, a partir des donnees statiques
 * du front.
 *
 *   node scripts/generate-seed.mjs [sortie.sql]
 *
 * Pourquoi
 * --------
 * Au 2026-10-13 la base porte **2 pays, 1 indicateur et aucune observation**.
 * L'API repond, mais sur le vide : branchee en l'etat, l'application
 * n'afficherait rien. Le front, lui, tient deja vingt-quatre pays,
 * vingt-quatre indicateurs, des series millesimees, des regimes et des
 * notations — un jeu coherent, conforme au schema Prisma, et dont toutes les
 * pages ont ete verifiees.
 *
 * Ce script le traduit en SQL. Cela donne une base alimentee en une commande,
 * de quoi integrer et demontrer sans attendre le pipeline.
 *
 * AVERTISSEMENT
 * -------------
 * **Ces valeurs sont illustratives, pas des donnees macroeconomiques
 * reelles.** Elles sont generees, pas collectees. Chaque ligne porte
 * `source = 'SIG-MOCK'` pour qu'on puisse les distinguer d'un coup d'oeil et
 * les supprimer quand le pipeline prendra le relais. Ne jamais les presenter
 * comme des mesures.
 *
 * Le SQL est idempotent : `ON CONFLICT` met a jour plutot que d'echouer, donc
 * il peut etre rejoue, et il n'ecrase pas les deux pays deja presents sans le
 * dire.
 */

import { build } from "../node_modules/vite/node_modules/esbuild/lib/main.js";
import { createHash } from "node:crypto";
import { writeFileSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const OUT = resolve(process.argv[2] ?? resolve(root, "seed-sig.sql"));
const BUNDLE = resolve(root, "node_modules/.cache-seed-bundle.mjs");

/* ------------------------------------------------------------------ outils */

/** UUID v4 **deterministe** : rejouer le script doit donner les memes ids. */
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

const q = (value) => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replace(/'/g, "''")}'`;
};

/** Un objet JSON pour une colonne `Json` de Prisma. */
const json = (value) => (value === null || value === undefined ? "NULL" : `${q(JSON.stringify(value))}::jsonb`);

/** `YYYY-MM-DD` depuis une `Date` ou une periode `YYYY-MM`. */
function day(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value);
  return /^\d{4}-\d{2}$/.test(text) ? `${text}-01` : text.slice(0, 10);
}

/* ------------------------------------------------- compilation des sources */

await build({
  entryPoints: [resolve(root, "client/src/data/mockData.ts")],
  outfile: BUNDLE,
  bundle: true,
  format: "esm",
  platform: "node",
  logLevel: "warning",
  alias: {
    "@shared": resolve(root, "shared"),
    "@": resolve(root, "client/src"),
  },
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

/* ----------------------------------------------------------------- en-tete */

const lines = [];
const say = (text = "") => lines.push(text);

say("-- Seed SIG — DONNEES ILLUSTRATIVES, PAS DES MESURES REELLES.");
say("--");
say("-- Genere par scripts/generate-seed.mjs depuis les donnees statiques du");
say("-- frontend. Chaque ligne porte source = 'SIG-MOCK' : c'est ce qui permet");
say("-- de les retrouver et de les supprimer quand le pipeline prendra la main.");
say("--");
say(`-- Genere le ${new Date().toISOString().slice(0, 10)}.`);
say("--");
say("-- Pour tout effacer ensuite :");
say("--   DELETE FROM macro_data WHERE source = 'SIG-MOCK';");
say("--   DELETE FROM macro_indicators WHERE source = 'SIG-MOCK';");
say("");
say("BEGIN;");
say("");

/* ----------------------------------------------------------------- Pays */

say("-- ========================= Pays =========================");
for (const c of STATIC_COUNTRIES) {
  say(
    "INSERT INTO countries (code, name, region, subregion, income_level, currency, flag_url, is_aggregate, created_at, updated_at) VALUES (" +
      [
        q(c.code),
        q(c.name),
        q(c.region),
        q(c.subregion),
        q(c.incomeLevel),
        q(c.currency),
        q(c.flagUrl),
        c.isAggregate ? "TRUE" : "FALSE",
        "now()",
        "now()",
      ].join(", ") +
      ")\n  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, region = EXCLUDED.region," +
      " subregion = EXCLUDED.subregion, income_level = EXCLUDED.income_level," +
      " currency = EXCLUDED.currency, is_aggregate = EXCLUDED.is_aggregate, updated_at = now();"
  );
}
say("");

/* ----------------------------------------------------- Catalogue d'indicateurs */

const indicatorId = new Map();
say("-- ==================== Catalogue d'indicateurs ====================");
for (const i of STATIC_INDICATORS) {
  const id = uuidFrom(`indicator:${i.code}`);
  indicatorId.set(i.code, id);
  say(
    "INSERT INTO macro_indicators (id, code, name, description, category, unit, frequency, source, is_seasonally_adjusted, metadata, created_at, updated_at) VALUES (" +
      [
        `${q(id)}::uuid`,
        q(i.code),
        q(i.name),
        q(i.description),
        q(i.category),
        q(i.unit),
        q(i.frequency),
        q("SIG-MOCK"),
        i.isSeasonallyAdjusted ? "TRUE" : "FALSE",
        // `shortName`, `family` et `block` n'ont pas de colonne : ils vivent
        // dans `metadata`, que le schema prevoit justement pour cela.
        json({ shortName: i.shortName, family: i.family, block: i.block }),
        "now()",
        "now()",
      ].join(", ") +
      ")\n  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description," +
      " category = EXCLUDED.category, unit = EXCLUDED.unit, frequency = EXCLUDED.frequency," +
      " metadata = EXCLUDED.metadata, updated_at = now();"
  );
}
say("");

/* --------------------------------------------------------- Observations */

say("-- ======================== Observations ========================");
say("-- Une ligne par pays x indicateur x periode x millesime.");
let observations = 0;
const CHUNK = 400;
let buffer = [];

const flush = () => {
  if (!buffer.length) return;
  say(
    "INSERT INTO macro_data (id, country_code, indicator_id, vintage_date, period, value, is_forecast, is_estimate, release_date, source, created_at) VALUES\n" +
      buffer.join(",\n") +
      "\n  ON CONFLICT (country_code, indicator_id, period, vintage_date) DO UPDATE SET value = EXCLUDED.value, is_forecast = EXCLUDED.is_forecast;"
  );
  say("");
  buffer = [];
};

for (const o of STATIC_OBSERVATIONS) {
  const id = indicatorId.get(o.indicatorCode);
  // Un indicateur hors catalogue n'a pas d'id : la ligne serait orpheline.
  if (!id) continue;
  buffer.push(
    "  (" +
      [
        `${q(uuidFrom(`obs:${o.countryCode}:${o.indicatorCode}:${o.period}:${o.vintageDate}`))}::uuid`,
        q(o.countryCode),
        `${q(id)}::uuid`,
        `${q(day(o.vintageDate))}::date`,
        `${q(day(o.period))}::date`,
        q(o.value),
        o.isForecast ? "TRUE" : "FALSE",
        "FALSE",
        `${q(day(o.releaseDate))}::date`,
        q("SIG-MOCK"),
        "now()",
      ].join(", ") +
      ")"
  );
  observations += 1;
  if (buffer.length >= CHUNK) flush();
}
flush();

/* ------------------------------------------------------------- Regimes */

say("-- ========================== Regimes ==========================");
say("-- `macro_regimes` n'a pas de contrainte d'unicite : sans cette purge,");
say("-- rejouer le seed donnerait plusieurs regimes courants au meme pays.");
say("DELETE FROM macro_regimes WHERE metadata->>'source' = 'SIG-MOCK';");
for (const r of STATIC_REGIMES) {
  say(
    "INSERT INTO macro_regimes (id, country_code, regime, momentum, confidence, risk_score, growth_score, inflation_score, policy_stance, period, valid_from, valid_to, metadata, created_at) VALUES (" +
      [
        `${q(uuidFrom(`regime:${r.countryCode}:${r.period}`))}::uuid`,
        q(r.countryCode),
        q(r.regime),
        q(r.momentum),
        q(r.confidence),
        q(r.riskScore),
        q(r.growthScore),
        q(r.inflationScore),
        q(r.policyStance),
        `${q(day(r.period))}::date`,
        `${q(day(r.validFrom))}::date`,
        r.validTo ? `${q(day(r.validTo))}::date` : "NULL",
        json({ source: "SIG-MOCK" }),
        "now()",
      ].join(", ") +
      ");"
  );
}
say("");

/* ------------------------------------------------------------ Notations */

say("-- ========================= Notations =========================");
for (const r of STATIC_RATINGS) {
  const pillars = Object.fromEntries(r.pillars.map((p) => [p.key, p.score]));
  say(
    "INSERT INTO country_ratings (id, country_code, overall_score, rating, pillar_scores, positive_drivers, negative_drivers, upgrade_triggers, downgrade_triggers, review_date, created_at) VALUES (" +
      [
        `${q(uuidFrom(`rating:${r.countryCode}`))}::uuid`,
        q(r.countryCode),
        q(r.compositeScore),
        // `rating` attend une note en lettres, pas une perspective : la
        // perspective se derive du momentum, cote client.
        "NULL",
        json(pillars),
        json(r.positiveDrivers),
        json(r.negativeDrivers),
        json(r.upgradeTriggers),
        json(r.downgradeTriggers),
        `${q(day(r.reviewDate))}::date`,
        "now()",
      ].join(", ") +
      ")\n  ON CONFLICT (country_code, review_date) DO UPDATE SET overall_score = EXCLUDED.overall_score," +
      " pillar_scores = EXCLUDED.pillar_scores;"
  );
}
say("");

say("COMMIT;");
say("");

writeFileSync(OUT, lines.join("\n"), "utf8");

console.log(`Seed ecrit : ${OUT}`);
console.log(`  pays            ${STATIC_COUNTRIES.length}`);
console.log(`  indicateurs     ${STATIC_INDICATORS.length}`);
console.log(`  observations    ${observations}`);
console.log(`  regimes         ${STATIC_REGIMES.length}`);
console.log(`  notations       ${STATIC_RATINGS.length}`);
console.log("");
console.log("Ces valeurs sont ILLUSTRATIVES. Chaque ligne porte source = 'SIG-MOCK'.");
