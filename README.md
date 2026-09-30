# SIG Global Macro Tracker — Frontend

Application web de suivi macroéconomique par pays : régimes, notations, indicateurs millésimés,
prévisions et comparaisons. Elle s'adresse aux analystes et gérants de Stars Investment Group.

> **Ce dépôt ne contient que le frontend.** Il tourne aujourd'hui sur des **données statiques**,
> sans aucun appel réseau. Le backend est développé par une autre équipe dans un dépôt séparé
> (`Stars-Investment-Group/backend_tracker`). Ce n'est pas un manque à combler : c'est l'état
> voulu de cette phase, le temps que les modules backend soient livrés.

---

## Démarrage

Node.js 18 ou supérieur.

```bash
npm install
npm run dev        # serveur Vite  ->  http://localhost:5173
```

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement Vite, rechargement à chaud |
| `npm run build` | Bundle de production dans `dist/public` |
| `npm run preview` | Sert le bundle construit |
| `npx tsc --noEmit` | Vérification de types (pas d'alias npm) |

**Ni test runner ni linter ne sont configurés.** La vérification se fait au typecheck et au
navigateur. Ne dites pas qu'un test passe : il n'y en a pas.

---

## Ce que contient l'application

22 routes, toutes accessibles sans authentification.

### Navigation principale

La barre latérale suit `SIG Tracker Menu Bar.pdf`, qui fait foi.

| Route | Page |
|---|---|
| `/` | Vue d'ensemble globale — KPI mondiaux, choroplèthe des régimes, screener, calendrier |
| `/regions` | Régions |
| `/countries/:code/:tab` | **Fiche pays à 6 onglets** (voir plus bas) |
| `/regimes` | Régimes macroéconomiques |
| `/indicators` | Catalogue d'indicateurs |
| `/markets` | Marchés |
| `/policy` | Tracker de politique monétaire |
| `/calendar` | Calendrier économique |
| `/alerts` | Alertes |
| `/watchlist` | Liste de suivi |
| `/reports` | Rapports |
| `/data` | Explorateur de données — séries, millésimes et révisions |
| `/screener` | Screener multi-critères |
| `/settings` | Préférences |

### Fiche pays

`/countries/:code/:tab` — le pays **et** l'onglet vivent dans l'URL, donc un lien partagé rouvre
exactement la même vue.

| Onglet | Contenu |
|---|---|
| `summary` | House View, 6 KPI, régime, trajectoire de croissance, prévisions, pairs, risques |
| `notation` | Score composite /10, 7 piliers pondérés, drivers, déclencheurs, scénarios, pont de notation |
| `quantitative` | Repères observés et 7 modules analytiques |
| `qualitative` | House View, policy mix, architecture pays, expositions, implications investisseurs |
| `forecasts` | Sélecteur de millésime, hypothèses, SIG vs consensus, scénarios, bandes de confiance |
| `trends` | Matrice multi-horizons, signaux avancés/retardés, diffusion, probabilités de régime |

Chaque onglet est chargé à la demande. `/countries`, `/countries/:code` et les anciens liens
`?code=XXX` convergent automatiquement vers la forme canonique.

### Comparaison

`/compare?codes=CIV,SEN,NGA,ZAF` — la sélection étant dans l'URL, **le lien est la comparaison
sauvegardée**. Accessible depuis le bouton *Comparer* d'une fiche pays et depuis la recherche
globale ; volontairement absente de la barre latérale, qui suit la maquette de navigation.

---

## Architecture

```
client/
  index.html              point d'entrée (Vite a `client/` pour racine)
  src/
    App.tsx               routeur wouter, toutes les pages en lazy
    components/
      layout/             barre latérale, en-tête, recherche globale, pied de page
      dashboard/          pages du tableau de bord
      country/            les 6 onglets de la fiche pays
      common/             primitives transverses (voir plus bas)
      ui/                 kit shadcn/ui — à composer, pas à modifier
    data/                 jeu statique et couches dérivées
    lib/                  i18n, utilitaires
shared/schema.ts          contrat de types des 10 modules backend
docs/                     audits et plan de mise en conformité
```

Alias d'import : `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`.
Toujours passer par les alias, jamais par des chemins relatifs `../..`.

### Couche de données

Aucun appel réseau sur aucune page atteignable.

| Fichier | Rôle |
|---|---|
| `shared/schema.ts` | **Contrat de types** des 10 modules backend. TypeScript simple, pas d'ORM |
| `data/mockData.ts` | Jeu statique typé : pays, catalogue, observations **millésimées**, régimes, notations |
| `data/countryProfile.ts` | Profil consolidé par pays — ce que consomment les 6 onglets |
| `data/comparison.ts` | Normalisation z-score pour la page de comparaison |
| `data/mockDashboard.ts` | Fixtures par widget |
| `data/world-110m.json` | Fond de carte TopoJSON (Natural Earth 110 m), versionné, aucun réseau |

Périmètre actuel du jeu statique : **16 pays**, **4 indicateurs**, 12 périodes mensuelles dont les
4 plus récentes portent 3 millésimes. La cible annoncée par les maquettes est 208 pays et
156 indicateurs.

**Le millésime est la pièce structurante.** Une même période porte plusieurs valeurs publiées à
des dates différentes (`vintageDate`, `releaseDate`, `isForecast`). Sans cette dimension, trois
planches de maquette sont infaisables : Explorateur de données, Tendances & Signaux, Prévisions
& Scénarios.

### Composants transverses

`components/common/` — à composer plutôt qu'à réimplémenter :
`DeltaBadge`, `SectionCard`, `KeyTakeaway`, `ScoreGauge` / `ScoreBar`, `Waterfall`, `Heatmap`.

La **polarité est toujours une prop explicite** : une hausse est favorable pour la croissance et
défavorable pour l'inflation, le chômage ou le risque. Un composant ne peut pas le deviner à
partir du nombre.

---

## Intégration backend

Le backend est développé par une **équipe séparée**, dans son propre dépôt
(`Stars-Investment-Group/backend_tracker` — NestJS 11, Prisma 5.4, PostgreSQL 17 sur Neon, Redis).

Les **10 modules validés** sont : Countries, Macro Indicators, Macro Data, Macro Regimes,
Country Ratings, Country Screener, Global KPIs, Region Snapshot, Events & Calendar, Data Explorer.

`shared/schema.ts` décrit la forme attendue de ces données. **Le branchement doit se limiter à
remplacer la source**, pas à réécrire les pages : gardez les mocks conformes à ces types.

Points à connaître avant de brancher :

- Les codes pays sont en **ISO 3166-1 alpha-3** (`CIV`, `SEN`, `GBR`).
- L'API renvoie des enregistrements Prisma bruts en **camelCase**, listes **non paginées**, et les
  `Decimal` arrivent en chaînes.
- Il n'y a **plus de couche HTTP** dans ce dépôt : l'ancienne a été supprimée car elle visait un
  contrat différent. Écrivez un client neuf contre `shared/schema.ts`. `lib/queryClient.ts` et le
  provider React Query subsistent comme couture.
- La convention retenue pour la zone euro est `EMU` (pas de code alpha-3 officiel) —
  **à confirmer avec l'équipe backend**.

Détail dans `docs/AUDIT_BACKEND_INTEGRATION.md` et `docs/REUNION_INTEGRATION_BACKEND.md`.

---

## Conventions

- **Thème clair / sombre** par variables CSS dans `index.css`, exposées à Tailwind. Les tokens
  sont stockés en **canaux HSL nus** (`215 85% 32%`) : c'est ce qui fait fonctionner les
  modificateurs d'opacité (`bg-primary/70`). N'y remettez jamais un `hsl()` complet, la
  déclaration deviendrait invalide et serait ignorée **en silence**.
- **Style** par tokens sémantiques (`bg-card`, `text-muted-foreground`, `border-border`).
- **Graphiques** : Chart.js via `react-chartjs-2`, plus du SVG écrit à la main là où Chart.js
  serait disproportionné. N'ajoutez pas de seconde librairie de graphiques.
- **Carte** : `d3-geo` sur le TopoJSON versionné. Le fichier identifie les pays en ISO numérique,
  l'application en alpha-3 — `data/worldGeo.ts` est le seul point de traduction.
- **Drapeaux** : `components/Flag.tsx`, SVG écrits à la main. Les émojis drapeaux ne s'affichent
  pas sous Windows/Chrome.
- **i18n** : `lib/i18n.tsx`, cinq langues (FR, EN, ES, PT, AR — l'arabe est RTL).
- **Langue** : commentaires, documentation et messages de commit en français.

---

## Références de conception

Les maquettes vivent **hors du dépôt**, dans `SIG/mockups/`.

| Document | Autorité |
|---|---|
| `SIG_Global_Macro_Tracker_Full_Mockups.pdf` | Visuel et contenu des pages |
| `SIG Tracker Menu Bar.pdf` | Navigation |
| `SIG Tracker Module BackEnd.pdf` | Les 10 modules de données |

Le jeu de PNG à barre latérale sombre est **obsolète**.

**`docs/AUDIT_MAQUETTES_ET_PLAN.md` est la référence de travail** : inventaire des 9 planches,
écart avec l'existant, plan par phases et points ouverts. À lire avant toute modification d'interface.

---

## État et points ouverts

Les phases 0 à 4 du plan sont faites. Restent, en attente de décision et non de développement :

1. **Themes Explorer** — aucune planche n'existe pour cette page, elle n'est mentionnée que dans
   le champ de recherche des maquettes. Périmètre à définir.
2. **Carte infranationale** de la planche Qualitative — demande une source de découpage
   administratif que le fond actuel ne fournit pas.
3. **Périmètre de la bêta** — rester à 16 pays ou monter vers 208.

---

## Licence

Projet propriétaire — Stars Investment Group.
