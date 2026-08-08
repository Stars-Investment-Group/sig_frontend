# 🧾 Audit du Frontend — Global Macroeconomic Tracker

> **Statut** : Rapport d'audit · **Portée** : `client/` (React + TypeScript + Tailwind + shadcn/ui)
> **Mission stagiaire** : Audit du code Replit existant vs spec canonique (composants réutilisables, structure)
> **Référentiel** : `README.md` & `replit.md`

---

## 1. Résumé exécutif

| Critère | Verdict initial | Verdict après correctifs |
|---------|-----------------|-------------------------|
| Conformité structurelle à la spec | ⚠️ **Partielle** (dossier `services/` manquant) | ✅ **Résolu** (`client/src/services/` créé) |
| Réutilisation des composants | ✅ **Bonne**, frictions sur graphiques | ✅ **Résolu** (`TimeSeriesChart` unifié) |
| Cohérence du système de design | ❌ Classes `terminal-*` inexistantes | ✅ **Résolu** (migration `slate-*`) |
| Cohérence des imports | ⚠️ Mix relatif / alias | ✅ **Résolu** (alias `@/` partout) |
| Dettes de repo (deps inutilisées) | ⚠️ Plusieurs librairies non utilisées | ⚠️ **Différé** (référencées par le UI kit, cf. §1bis) |
| Accessibilité / erreurs de rendu | ⚠️ Placeholder "TrendsChart sera intégré" | ✅ **Résolu** (graphique réel + export CSV) |

**Synthèse** : le code est fonctionnel et bien structuré par endroits, mais il existe des **écarts critiques** entre ce qui est documenté (spec canonique) et ce qui est réellement implémenté. Les plus bloquants sont l'absence du dossier `services/`, les classes Tailwind `terminal-*` non définies, et la duplication du code de graphique.

---

## 1bis. Journal des correctifs appliqués (branche `front-end`)

| # | Écart audit | Résolution | Commit |
|---|-------------|-----------|--------|
| 1 | Classes `terminal-*` inexistantes | Migration vers l'échelle `slate-*` (unification du design) | `4dc8eb7` |
| 2 | Duplication charting (`TrendsChart.tsx`) | Suppression du composant mort + création `TimeSeriesChart.tsx` | `4dc8eb7` |
| 3 | Page 404 en thème clair | Alignement sur thème sombre + bouton retour accueil | `4dc8eb7` |
| 4 | Dossier `services/` manquant | Création de `client/src/services/` (http, forecasts, intelligence, market, news) + factorisation des `fetch` | `3f87de3` |
| 5 | Types dupliqués | Centralisation des types API dans les modules de service | `3f87de3` |
| 6 | Imports mixtes relatif/alias | Uniformisation sur l'alias `@/` (`App.tsx`, `MarketData.tsx`) | `3f87de3` |
| 7 | Export Data Explorer = `console.log` | Implémentation CSV (utilitaire `exportCsv.ts`, RFC 4180) | `3f87de3` |
| 8 | Dépendances inutilisées | ⚠️ **Non retirées** : le UI kit shadcn complet de ce template les référence (voir note ci-dessous) | — |
| 9 | Code mort CSS (`.regime-*`, `.risk-*`) | Suppression dans `index.css` | `3f87de3` |

> **Note sur les dépendances** : l'analyse de retrait a montré que les libs initialement jugées inutilisées (`recharts`, `vaul`, `cmdk`, `react-hook-form`, `react-resizable-panels`, `input-otp`, `react-day-picker`, `framer-motion`, `react-icons`, `next-themes`) sont **référencées par les composants du UI kit shadcn fourni** (`components/ui/chart.tsx`, `drawer.tsx`, `form.tsx`, `command.tsx`, `resizable.tsx`, etc.). Un retrait sans purge des fichiers UI non utilisés casserait le build. Leur élagage est donc différé et impliquerait de retirer aussi les fichiers UI superflus hors du périmètre de cette passe de correctifs.

**Statut global** : points 🔴 critiques **résolus** ; points 🟠 résolus ; points 🟡 traités hors dépendances. Le frontend compile **sans erreur TypeScript** (les seules erreurs restantes concernent le backend `server/index.ts`, pré-existantes et hors périmètre frontend).

---

## 2. Écarts de **structure** vs spec canonique

### 2.1 ❌ Dossier `client/src/services/` manquant

La spec (README §Structure du projet) documente explicitement :

```
client/src/
  ├── components/   # OK
  ├── pages/        # OK
  ├── services/     # ❌ ABSENT
  └── utils/        # OK
```

**Constat** : le dossier `services/` n'existe pas. Toute la logique d'accès réseau est inlinée (via `useQuery` + `fetch` dans les pages) au lieu d'être isolée dans des couches de service réutilisables.

**Exemples de logique qui devrait être factorisée** :
- `Trends.tsx` → `queryFn` avec `fetch('/api/forecasts/country/...')` ligne 88-98
- `Trends.tsx` → `queryFn` avec `fetch('/api/forecasts/compare/...')` ligne 102-112
- `AIInsights.tsx` → `fetch('/api/intelligence/country/...')` dans le `queryFn`

**Recommandation** : créer `client/src/services/` avec des modules typés (`api.ts`, `forecasts.ts`, `intelligence.ts`, `news.ts`, `market.ts`) exposant des wrappers sur `apiRequest`/`getQueryFn`.

---

## 3. Écarts de **composants réutilisables**

### 3.1 ✅ Bonnes pratiques observées (à conserver)
- UI kit shadcn complet sous `components/ui/` (Radix primitives) — conforme.
- `CountryCard`, `AIInsights`, `ForecastSummary`, `NavTabs` sont des composants généralisés et réutilisés.

### 3.2 ❌ Duplication du code de **charting** (deux composants quasi identiques)
Deux composants de graphique coexistent alors qu'ils font le même travail :
- `TrendChart.tsx` (utilise `chart.js` / `react-chartjs-2`)
- `TrendsChart.tsx` (instancie `ChartJS` manuellement via `ref`/`useEffect`)

**Problèmes** :
- Maintenance double et incohérente (palettes, options, registrations).
- `QuantitativeAnalysis.tsx` affiche un placeholder texte *"Graphique des tendances (TrendsChart sera intégré)"* au lieu d'utiliser un des composants.

**Recommandation** : conserver **un seul** composant de chart partagé (`TrendChart.tsx`), unifier les options/thème, supprimer le placeholder dans `QuantitativeAnalysis.tsx` et y brancher le composant unique.

### 3.3 ⚠️ Composants rendus conditionnellement vs spec
`App.tsx` référence 6 pages : Overview, Quantitative, Qualitative, Rating, Trends, Data Explorer.
La spec (replit.md §Frontend Pages) mentionne aussi une fonctionnalité "Data Explorer avec export". L'export de `DataExplorer.tsx` n'est qu'un `console.log` (placeholder) → **fonctionnalité documentée non implémentée**.

---

## 4. Écarts de **système de design / thème** ✅⚠️

### 4.1 ❌ Classes Tailwind `terminal-*` **non définies** (crédibilité)
Le `tailwind.config.ts` ne définit **aucune** palette `terminal`. Pourtant, plusieurs sources utilisent `text-terminal-100`, `bg-terminal-800`, etc. :
- `client/src/pages/DataExplorer.tsx` (tout le fichier)
- `client/src/components/TrendsChart.tsx`
- `client/src/utils/formatIndicators.ts` (`return 'text-terminal-100'`)

**Conséquence** : ces classes sont silencieusement ignorées par Tailwind → la page **Data Explorer** et le(s) graphique(s) rendront avec un style **cassé/incomplet** (fonds transparents, textes de couleur par défaut).

La spec (replit.md §Styling) promet *"custom terminal-themed color palette"* — celle-ci n'existe que dans les composants `slate-*`/`.nav-tab` (CSS custom), pas en palette Tailwind.

**Recommandation** :
- Soit ajouter la palette `terminal` dans `tailwind.config.ts` (`theme.extend.colors`),
- Soit remplacer toutes les classes `terminal-*` par l'échelle `slate-*` utilisée partout ailleurs pour unifier le design.

### 4.2 ⚠️ Mélange de conventions CSS custom et Tailwind
Le système utilise à la fois :
- des classes tailwind inline (`bg-slate-800`, etc.)
- des classes custom définies dans `index.css` sous `@layer components` (`country-card`, `indicator-value`, `alert-info`, `change-positive`, etc.)

C'est acceptable, mais risqué car certaines classes custom ne sont **jamais** utilisées (`.regime-*`, `.risk-*` définis dans `index.css` mais les pages utilisent désormais `getRegimeClass`/`getRiskClass` avec du tailwind inline). → **code mort** dans `index.css`.

### 4.3 ❌ Incohérence de thème clair/sombre : page 404
`not-found.tsx` utilise un thème **clair** (`bg-gray-50`, `text-gray-900`) alors que l'app est en thème **sombre**. Rendu dans le parent sombre, cela produit un affichage cassé.
→ À corriger en `bg-slate-800` / `text-slate-100`.

---

## 5. Écarts de **conventions de code / imports** ⚠️

### 5.1 Imports mixtes relatif vs alias
`App.tsx` mélange :
```ts
import Overview from "@/pages/Overview";                    // alias
import QuantitativeAnalysis from "./pages/QuantitativeAnalysis"; // relatif
```
Vérification : `Overview.tsx` utilise `@shared/schema`, les composants utilisent parfois `./ui/...` (incohérent avec la config shadcn qui mappe `@/components`).

### 5.2 Types / interfaces locales dupliquées
Chaque composant re-déclare ses propres interfaces (`ForecastData`, `CountryForecastData` dans `Trends.tsx`, `AIAnalysis`, `CountryIndicators` dans `AIInsights.tsx`, `ProcessedArticle` dans `LiveNews.tsx`…) au lieu de les centraliser.

**Recommandation** : déplacer les types partagés dans `client/src/types/` ou `shared/schema.ts`.

---

## 6. Dépendances **inutilisées** (detectées) ⚠️

Plusieurs paquets installés dans `package.json` ne sont **référencés par aucun import** dans `client/src` :
- `framer-motion`
- `recharts` (on utilise `chart.js`)
- `react-icons`
- `react-resizable-panels`
- `next-themes`
- `vaul`
- `cmdk`
- `react-hook-form` (+ `@hookform/resolvers`)

**Impact** : taille de bundle / temps d'installation inutiles (« dependency bloat »).

**Recommandation** : `npm uninstall <paquet>` pour les supprimer du `package.json`, ou les réserver à un usage réel.

---

## 7. Hooks génériques non utilisés
- `hooks/use-mobile.tsx` (`useIsMobile`) : aucun composant ne l'importe (recherche sans résultat).
- `hooks/use-toast.ts` : généré par shadcn mais le `Toaster` est monté ; usage à confirmer — potentiellement sous-utilisé.

---

## 8. Points positifs / à sanctuariser ✅
- Le système de tokens CSS via variables (`--background`, `--primary`, etc.) est proprement isolé dans `index.css`.
- `lib/utils.ts` (`cn`) correctement utilisé (shadcn standard).
- `lib/queryClient.ts` gère intelligent le décodage de la réponse API standard `{ success, data }`.
- Les états de chargement (skeleton/pulse) sont bien présents sur les pages principales.
- Le thème Bloomberg sombre est globalement respecté dans Overview, Trends, Qualitative, Rating, Quantitative.

---

## 9. Plan d'action prioritaire (suggestions)

| # | Priorité | Action |
|---|----------|--------|
| 1 | 🔴 Haute | Corriger les classes `terminal-*` (créer palette OU migrer vers `slate-*`) |
| 2 | 🔴 Haute | Unifier le charting (supprimer placeholder `QuantitativeAnalysis`, fusionner `TrendsChart`→`TrendChart`) |
| 3 | 🔴 Haute | Aligner `not-found.tsx` sur le thème sombre |
| 4 | 🟠 Moyenne | Créer `client/src/services/` et factoriser les `fetch` des pages |
| 5 | 🟠 Moyenne | Centraliser les types partagés (supprimer les duplications d'interfaces) |
| 6 | 🟠 Moyenne | Uniformiser les imports (`@/` partout) |
| 7 | 🟡 Basse | Nettoyer les dépendances inutilisées (`framer-motion`, `recharts`, `react-icons`, etc.) |
| 8 | 🟡 Basse | Supprimer le code mort CSS (`.regime-*`, `.risk-*`) non référencé |
| 9 | 🟡 Basse | Documenter / réparer la fonctionnalité Export du Data Explorer |

---

## 10. Fichiers audités
- `client/src/App.tsx`, `main.tsx`, `index.html`
- `client/src/index.css`
- `client/src/pages/` : Overview, QuantitativeAnalysis, QualitativeAnalysis, Rating, Trends, DataExplorer, not-found
- `client/src/components/` : NavTabs, CountryCard, CountryNewsFeed, AIInsights, EconomicIntelligence, LiveNews, MarketData, NewsFeed, TrendChart, TrendsChart, ForecastSummary
- `client/src/lib/` : queryClient, utils
- `client/src/utils/` : fetchEconomicData, formatIndicators, interpretTrends
- `client/src/hooks/` : use-mobile, use-toast
- `tailwind.config.ts`, `components.json`, `package.json`

---

*Document généré dans le cadre du stage — Stars Group Investment — Développement Frontend.*
