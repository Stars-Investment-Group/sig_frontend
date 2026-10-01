# Depouillement des maquettes de reference et plan de mise en conformite

> Sources de reference (dossier `SIG/mockups/`, hors depot) :
> - `SIG_Global_Macro_Tracker_Full_Mockups.pdf` (9 pages, design clair) — **fait foi pour le visuel et le contenu des pages**.
>   Le jeu de PNG `mockups/*.png` (sidebar navy) devient obsolete.
> - `SIG Tracker Menu Bar.pdf` — **fait foi pour la navigation**, qui prime sur la sidebar des maquettes.
>   La nav actuelle du frontend y est deja conforme.
> - `SIG Tracker Module BackEnd.pdf` (10 modules) — valide par l'equipe backend.
>
> Perimetre produit : le Tracker d'abord. Le **produit suivant** portera sur les marches financiers
> et le portefeuille d'investissement — c'est lui qui alimentera Markets, Policy Tracker, Alerts,
> Watchlist et Reports, seules entrees de menu sans module backend parmi les 10.
>
> Codes pays : passage confirme a l'ISO 3166-1 **alpha-3**.

---

## 1. Ecart structurel global

L'implementation actuelle suit l'ancien jeu de maquettes. Les divergences ne sont pas cosmetiques :

| Axe | Implementation actuelle | Maquette de reference | Impact |
|---|---|---|---|
| Sidebar | navy `#0B192C`, texte clair | **claire / blanche**, icones et texte sombres | Design system : tokens `--sidebar-*` a redefinir |
| Navigation | Overview (accordeon) > Global Overview/Regions/Countries/Regimes, puis Indicators, Markets, Policy Tracker, Calendar, Alerts, Watchlist, Reports, Data Explorer, Screener, Settings | **identique** (cf. `SIG Tracker Menu Bar.pdf`) | **Aucun changement** : la nav actuelle est conforme |
| Fiche pays | **6 onglets routes** (`/countries/:code/:tab`) : Summary, Notation & Risk, Quantitative, Qualitative, Forecasts & Scenarios, Trends & Signals | 9 libelles dans le bandeau des planches | **Fait** (phase 3). Les 4 libelles non retenus sont des sections de P2, pas des pages — cf. point 17 |
| Score composite | SIG Composite Score /10, 7 piliers ponderes, rang/univers | idem | **Fait** (module 5 type, onglet Notation & Risk) |
| En-tete | recherche centree, Watchlist, cloche, avatar | logo **SIG GLOBAL MACRO TRACKER**, recherche "countries, regions, themes", **Watchlist (n)** avec compteur, cloche, aide, avatar | Ajustements |
| Pied de page | absent des pages internes | present partout : "SIG Global Macro Tracker · (c) 2025 SIG Global · Terms of Use · Privacy Policy · Contact" | A ajouter au layout |

Note : les onglets de la fiche pays varient d'une planche a l'autre du PDF (page 7 affiche `Financials`
la ou la page 2 affiche `Forecasts`). L'union des onglets est retenue ci-dessus ; a confirmer avec le designer.

---

## 2. Inventaire des 9 planches

### P1 — Global Overview
Filtres : `All Regions`, plage de dates (`May 11 - May 18, 2025`), `Download PDF`.
1. **SIG House View** — narratif + lien "Read full house view"
2. **4 KPI** avec sparkline : Global Growth (2025F) 3.2%, Global Inflation 3.6%, Global Policy Rate (Weighted Avg.) 3.71%, Global Risk Index 48/100 — chacun avec delta "vs Apr 2025"
3. **Global Regime Map** — choroplethe mondial reel, controles de zoom (accueil / + / -), tooltip au survol (Overall Regime, Momentum, Risk Score, lien "View region"), legende 6 etats : Improving / Favorable / Neutral / Deteriorating / Stressed / No Data
4. **Region Snapshot** — UEMOA, Africa (ex-UEMOA), Europe, United States, Asia (ex-Japan), Latin America : etat + score /100
5. **Top Movers / Watchlist** — carrousel horizontal de cartes pays (drapeau, region, delta, score cible, sparkline, tendance)
6. **What Changed (vs Previous Update)** — Country/Region, Indicator, Change, New, Prev, Impact, Note
7. **Regional Regime Matrix (Risk Score)** — heatmap Region x (Overall, Growth Momentum, Inflation Outlook, External Balance, Fiscal Sustainability, Monetary Stance), echelle 5 paliers 0-20 / 21-40 / 41-60 / 61-80 / 81-100
8. **Upcoming Events & Policy Calendar** — Date, Event, Region, Impact
9. **Country Screener** — filtres (Regions, Incomes, Regimes, recherche), `Export CSV`, colonnes Rank, Country, Region, Income, Growth 2025F, Inflation 2025F, External Balance, Risk Score /100, Outlook, Trend (3M), Watch (etoile), **pagination** ("Showing 1 to 13 of 25 countries")
10. **Alerts / Notable Signal Changes**
11. **Data Confidence & Coverage** — barre 78%, Countries Covered **208 of 208**, Indicators Tracked **156 of 156**, Data Timeliness 95%
12. **How to Use This Page** — 4 puces + lien User Guide

### P2 — Country Overview (onglet Summary)
En-tete pays : drapeau, nom, tags `UEMOA · West Africa`, selecteur de pays, `Latest Update`, `Download PDF`.
1. **SIG House View** avec badge d'orientation (Positive)
2. **6 KPI** avec sparkline : Real GDP Growth, Inflation, Fiscal Balance, Current Account, Policy Rate, Overall Risk (niveau + stabilite)
3. **Macro Regime Snapshot** — Growth / Inflation / Fiscal / External / Policy / **Cycle Position** + graphe Real GDP Growth 2021-2027F
4. **What Changed Since Last Review** — 4 postes avec delta signe
5. **Forecast Summary** — Indicator x (2023, 2024, 2025F, 2026F, 2027F) + sparkline de tendance
6. **Peer Positioning** — selecteurs `Compare to` / `Metric`, barres horizontales avec ligne "UEMOA Avg"
7. **Strategic Sectors & Value Chains** — fiches secteur avec badge d'importance, indicateurs cles, Outlook, Key Priorities
8. **Risk Snapshot** — Risk, Level, Trend (fleche), Key Monitor
9. **Policy & Events Timeline** — evenements dates avec pastille de couleur
10. **Market Snapshot** — Indicator, Latest, 1M Change, YTD Change, Trend (12M) : USD/XOF, Sovereign Bond Yield, BRVM Composite, 5Y CDS
11. **What Matters Now** — checklist
12. **Sources & Data Confidence** + **Coverage Notes**

### P3 — Compare Countries
1. **Selection** — chips pays avec drapeau et suppression, "Clear all"
2. **Parametres** — Metric Set, Peer Group, Timeframe, Reset
3. **SIG House View Scorecard** — carte par pays : score /100, `Rank x/8`, delta, sparkline
4. **Comparison Heatmap** — colonnes groupees Macro / Fiscal / External / Markets / Structural + Overall Score, legende Best - Worst Performer
5. **Growth vs. Risk** — nuage de points a 4 quadrants (z-scores)
6. **Normalized Trend Comparison** — multi-lignes normalisees en z-score (0 = moyenne long terme)
7. **Forecast Comparison** — table groupee par metrique x (2024, 2025F, 2026F)
8. **Strategic Sectors Comparison** — 5 panneaux (Agriculture, Infrastructure, Energy, Manufacturing, Digital Economy), score 0-100 par pays
9. **Peer Comparison Table** — scores normalises + `Export CSV`
Actions d'en-tete : `Save Comparison`, `Share`, `Download PDF`.

### P4 — Data Explorer
Filtres : Indicator, Country/Region, Source, Frequency, Release Date, `More Filters (6)`, Reset.
1. **Fiche indicateur** — badge `Official`, valeur + periode, delta vs periode precedente, Next Release, Frequency, Unit, **Seasonally Adjusted**, Coverage
2. **Graphe** — type, plages 1Y/5Y/10Y/Max, `Compare`, **zone grisee = prevision**
3. **Indicator Values & Vintages** — selecteur `Vintages: All Available`, bascule **Show Revisions**, colonnes Period / Latest / Previous / Change (pp) / 3M Ago / 6M Ago / 1Y Ago, "Load More History", `Export Table`
4. **Source & Methodology** — source, release, next release, coverage, frequency, unit, methodologie
5. **Release Calendar** — Release Date, For Period, Status (Upcoming / Released)
6. **Download & Export** — Data : CSV / Excel / JSON ; Chart : PNG / SVG / PDF ; **API Access**
7. **Related Indicators** — correlation + sparkline
8. **Revision History** — Vintage Date, Value, Change (pp)
9. **Data Quality** — Source Reliability, Timeliness, Coverage, Revision Volatility, Breaks/Structural Changes, Overall Score /100
10. **Indicator Notes** + **Tags**

### P5 — Trends & Signals (pays)
1. **5 KPI** : Current Regime (+ date de debut), Trend Score /100, Confidence (donut %), Breadth (%) + histogramme, Momentum
2. **Multi-Horizon Trend Matrix** — 7 lignes (Growth, Inflation, External, Fiscal, Financial Conditions, Policy & Liquidity, Sentiment) x 4 horizons (1M, 3M, 6M, 12M) + Trend Strength de -1 a +1
3. **Leading / Coincident / Lagging Indicators** — 3 panneaux, colonnes Latest / Trend / Signal
4. **Momentum Composites** — Growth, Inflation, Financial (variation 3M)
5. **Breadth & Diffusion** — donut + repartition Improving / Stable / Deteriorating
6. **Surprise Monitor** — Growth / Inflation / Fiscal Surprise vs attentes
7. **Regime Probabilities (Next 6-12 Months)** — Expansion / Slowdown / Contraction en %
8. **Signal Journal & Inflection Points** — Date, Signal, Category, Impact, Details
9. **Forecast Revision Deltas**, **Revision Heatmap (3M)**, **Top Forecast Changes**
10. **What Changed Since Last Update** — Key Upgrades / Key Downgrades / New Signals

### P6 — Notation & Risk (onglet pays)
1. **Bandeau** — SIG Composite Score **6.3/10** avec jauge et `Rank vs Universe 23/208`, Outlook, **Watch Status** (+ bouton "View Watch Rationale"), Confidence (donut), Change Since Prior Review
2. **Pillar Scores** — **7 piliers** : Macro Strength, Macro Resilience, Fiscal Capacity, External Resilience, Political & Institutional Quality, Structural Opportunity, Market Attractiveness — colonnes Score (/10), vs Prior, Percentile
3. **Score Decomposition (Score Tree)** — contribution ponderee par pilier + ajustement analyste + score ajuste
4. **Positive Drivers** / 5. **Negative Drivers** — Driver, Impact, Rationale
6. **Upgrade & Downgrade Triggers** — deux listes de seuils
7. **Scenario-Implied Scores** — Downside / Base / Upside / Stress avec score et **probabilite**
8. **Rating Bridge** — waterfall du score precedent au score courant
9. **Peer Positioning** — Country, Score, barre, Percentile, vs Prior
10. **Data Foundations & Model Inputs** — Data Coverage, Timeliness, **Model Version**, Last Updated / Next refresh
11. **Methodology & Governance** — methodologie, cadence de revue, gouvernance, proprietaire du modele

Mention explicite a reprendre : *"Scores are model output. Outlook and Watch Status reflect analyst judgment."*

### P7 — Qualitative Analysis (onglet pays)
1. **Executive House View** — badge + narratif + 3 tuiles (Growth Outlook, Policy Credibility, External Resilience) + House View Highlights
2. **Macro Regime & Policy** — frise des phases de regime, **Policy Mix** (Fiscal, Monetary, FX Regime, Structural), Key Policy Priorities
3. **Country Architecture** — schema Endowments -> Growth Engines -> Economic Outcomes -> Enablers avec boucle de reinvestissement ; donut Economic Structure ; Growth Composition en pp
4. **Strategic Advantages** / 5. **Strategic Exposures**
6. **Strategic Sector Focus** — chaine de valeur en 4 etapes + **carte regionale infranationale** (densite) + Investment Opportunities
7. **Dependencies & Vulnerabilities** — Impact + Mitigation/Status
8. **Political & Geopolitical Context** — frise chronologique + evaluation
9. **Market Transmission Channels** — Global Factors -> Transmission -> Domestic Outcomes
10. **Key Risks & Key Catalysts**
11. **Investor Implications** — 5 profils investisseurs avec implication dediee

### P8 — Quantitative Analysis (onglet pays)
1. **Growth Forecast vs Consensus** — SIG vs Consensus + **intervalle de confiance 95%** + table d'ecarts
2. **Inflation & Policy Path** — double axe + ligne de cible d'inflation
3. **Macro Snapshot** — barres + Key Takeaway + indicateurs recents (PMI, Credit Growth, FX Reserves, M2)
4. **Forecast Engine** — **Forecast Track Record (MAE)**, **Nowcast**, Forecast Summary
5. **Fiscal & External** + External Snapshot
6. **Financial Markets** — **courbe des taux souverains**, spread vs U.S., Market Snapshot
7. **Strategic Sector Monitor** — volumes et prix du secteur strategique
8. **Peer Comparison** — nuage de points + table
9. **Data Quality** — 3 donuts (Overall Score /100, Coverage, Timeliness) + qualite par categorie + Recent Data Updates

Chaque section porte un encart **Key Takeaway** : composant transverse a creer.

### P9 — Forecasts & Scenarios (onglet pays)
Controles : **Forecast Vintage** et **Compare with** (deux millesimes), `Download PDF`.
1. **SIG Forecast Headline** — titre, narratif, **SIG Stance**, **Conviction**
2. **4 KPI** de prevision avec delta vs millesime precedent
3. **Key Assumptions** — Brent, prix matiere premiere, croissance mondiale, taux directeur, taux de change
4. **Forecast Summary** — onglets par metrique, graphe Actual / SIG Forecast / Consensus, table avec `Change vs` millesime
5. **Scenario Analysis** — 4 cartes (Base, Upside, Downside, Stress) + **Scenario Drivers** avec sensibilites en pp
6. **Forecast Revision Waterfall** — decomposition de la revision + Revision Summary
7. **Key Model Inputs** — table des hypotheses avec variation vs millesime
8. **Driver Contributions** — barres de contribution + donut du total
9. **Fiscal Forecasts** / 10. **External Forecasts**
11. **Confidence Bands** — eventail 80 / 60 / 40%
12. **Forecast Distribution** — histogramme P10 / P50 / P90, "10,000 runs"
13. **Model Performance Snapshot** — RMSE, MAE, Direction Accuracy, Bias (backtest et hors echantillon)
14. **Methodology Notes** — type de modele, couverture, frequence, horizon

---

## 3. Correspondance maquettes / modules backend / existant

| Planche | Module backend | Page frontend actuelle | Ecart |
|---|---|---|---|
| P1 Global Overview | 7 Global KPIs, 8 Region Snapshot, 4 Regimes, 6 Screener, 9 Calendar | `pages/GlobalOverview` | Choroplethe reel (Natural Earth, 6 etats, zoom, infobulle, clic vers la fiche) ; reste la pagination du screener |
| P2 Country Overview | 1 Countries, 3 Macro Data, 4 Regimes | `country/SummaryTab` | **Fait**. Restent en fixtures : secteurs, frise, marches |
| P3 Compare Countries | 1, 3, 5, 6 | `dashboard/ComparePage` | **Fait**. Selection dans l'URL, z-scores sur la selection |
| P4 Data Explorer | 10 Data Explorer, 2 Indicators, 3 Macro Data | `dashboard/DataExplorerPage` | Millesimes et revisions absents |
| P5 Trends & Signals | 3 Macro Data, 4 Regimes | `country/TrendsTab` | **Fait**. Diffusion calculee sur les series reelles (4 indicateurs sur 156 attendus) |
| P6 Notation & Risk | **5 Country Ratings** | `country/NotationRiskTab` | **Fait**. `pages/Rating` redirige vers l'onglet |
| P7 Qualitative Analysis | 1, 4 + contenu editorial | `country/QualitativeTab` | **Fait** hors carte infranationale. Narratifs derives des scores, point ouvert 3 |
| P8 Quantitative Analysis | 3 Macro Data, 6 | `country/QuantitativeTab` | Partiel : reperes par pays en tete, 7 modules internes encore en fixtures |
| P9 Forecasts & Scenarios | 3 Macro Data (millesimes) | `country/ForecastsTab` | **Fait**. Selecteur de millesime branche sur les vraies dates de publication |
| — | **aucun** parmi les 10 | Markets, Policy Tracker, Alerts, Watchlist, Reports | Au menu du Tracker, mais alimentes par le **produit suivant** (marches / portefeuille). Restent en donnees statiques. |
| — | — | Settings | Preferences locales, pas de module dedie |

---

## 4. Alignement du contrat de donnees

A traiter avant que les mocks ne grossissent davantage.

| Sujet | Etat actuel | Cible |
|---|---|---|
| Code pays | ISO alpha-2, avec `"UK"` invalide | **ISO alpha-3** (`CIV`, `SEN`, `GBR`, `USA`) |
| Type socle | `shared/schema.ts` (Drizzle, `id` serial) | Types alignes sur le contrat des 10 modules |
| Regimes | `recovery / transition / recession / overheating` | Regimes du module 4 + `momentum`, `confidence`, `riskScore`, `policyStance` |
| Notation | inexistante | `compositeScore` /10, `rank/universe`, 7 piliers (score, vsPrior, percentile), drivers, triggers, scenarios, watchStatus |
| Indicateurs | type libre (`"inflation"`) | catalogue module 2 : `code`, `category`, `unit`, `frequency`, `source`, `isSeasonallyAdjusted`, `coverageStart/End` |
| Series | valeur simple | `period`, **`vintageDate`**, `releaseDate`, `isForecast` — sans quoi P4, P5 et P9 sont infaisables |
| Regions | 5 zones ad hoc | `UEMOA`, `Africa (ex-UEMOA)`, `Europe`, `United States`, `Asia (ex-Japan)`, `Latin America` |
| Perimetre | 16 pays | **208 pays**, 156 indicateurs |

Le point le plus structurant est le **millesime (vintage)** : trois planches en dependent directement.

---

## 5. Plan d'execution

### Phase 0 — Fiabilisation (aucune dependance, a faire en premier)
1. [x] Drapeaux `IN`, `CN`, `ZA` ajoutes + table d'alias (`UK` -> `GB`, et tous les ISO alpha-3 vers les rendus existants) : plus aucun rectangle gris
2. [x] `<title>` et `<meta description>` ajoutes, script `replit-dev-banner.js` retire, `maximum-scale=1` supprime
3. [x] Boutons Export branches sur `exportCsv` : Screener, Calendrier, et Data Explorer (CSV + JSON ; Excel et SDMX desactives en attendant le module 10)
4. [x] `Alertes3` corrige (badge sorti du `h1`, avec `aria-label`) et date de `CountriesPage` derivee de `DATA_AS_OF`
5. [x] `dir` / `lang` appliques au montage : le RTL arabe survit au rechargement
6. [x] `CardTitle` rend un `h3` : la hierarchie de titres existe sur toutes les pages
7. [x] **Fait le 2026-09-30** — suppression du code mort, **30 fichiers** retires par
    l'utilisateur (le bac a sable refusait l'action destructive). La liste s'etait allongee en
    phase 3 : les quatre pages autonomes remplacees par les onglets pays ne sont plus rendues.
    **`npx tsc --noEmit` ne renvoie plus aucune erreur** — c'est la premiere fois sur ce projet.
    Commande executee :

    ```bash
    git rm -r -f server drizzle.config.ts client/src/services \
      client/src/pages/DataExplorer.tsx \
      client/src/pages/Rating.tsx \
      client/src/pages/QualitativeAnalysis.tsx \
      client/src/pages/QuantitativeAnalysis.tsx \
      client/src/pages/Trends.tsx \
      client/src/components/AIInsights.tsx \
      client/src/components/CountryNewsFeed.tsx \
      client/src/components/EconomicIntelligence.tsx \
      client/src/components/LiveNews.tsx \
      client/src/components/NewsFeed.tsx \
      client/src/components/MarketData.tsx \
      client/src/components/ForecastSummary.tsx \
      client/src/components/NavTabs.tsx \
      client/src/components/CountryCard.tsx \
      client/src/utils/fetchEconomicData.ts \
      client/src/utils/formatIndicators.ts \
      client/src/utils/interpretTrends.ts
    ```

    Deux precisions, tirees d'un essai a blanc (`git rm -r -n -f ...`, qui ne supprime rien) :
    `-r` est indispensable pour les repertoires (`server`, `client/src/services`), et `-f` l'est
    parce que quatre fichiers de la liste portent des modifications locales
    (`Rating`, `QualitativeAnalysis`, `QuantitativeAnalysis`, `Trends`) — `git rm` refuse sinon
    **tout le lot**. Ces modifications n'ont aucune valeur : ce sont des fichiers qu'on supprime.
    L'essai a blanc annonce **30 fichiers**.

    `"server/**"` a deja ete retire de l'`include` de `tsconfig.json` (2 erreurs de typecheck en
    moins). Les 3 erreurs restantes viennent de `CountryCard` et `CountryNewsFeed`, supprimes par
    la commande ci-dessus — **le typecheck sera vert ensuite**.

    Verifie avant de proposer la commande : aucun fichier conserve n'importe `@/services`, aucun
    script npm ne reference `server/`, et rien hors de `server/` n'y fait reference.
    Optionnel ensuite : purger les dependances backend (`express`, `passport`, `drizzle-kit`,
    `@neondatabase/serverless`).
8. [x] Barre de recherche du header branchee (`components/layout/GlobalSearch.tsx`) : pays, indicateurs et pages, navigation au clavier, le pays selectionne pointe vers `/countries/:code/summary` (la forme `?code=` reste honoree)

Verifie au navigateur : 20 routes, 0 erreur console, 0 requete en echec, export des trois pages confirme par un telechargement reel.

### Phase 1 — Migration du design system
9. [x] Tokens `--sidebar-*` bascules en clair (+ token dedie `--sidebar-muted`, l'opacite Tailwind etant alors impossible sur ces variables — **cause corrigee en phase 3**, cf. plus bas ; le token dedie reste valide mais n'est plus une necessite). Contrastes mesures : 5,0:1 en clair et 9,2:1 en sombre sur le texte de navigation
10. [x] Navigation : rien a faire, conforme a `SIG Tracker Menu Bar.pdf`
11. [x] Pied de page global sur toutes les pages ; logo sur deux lignes et compteur de watchlist dynamique dans l'en-tete
12. [x] Composants transverses : `DeltaBadge` cree (`components/common/`) et applique a `RegionSnapshot` et `TopMovers`, qui dupliquaient la logique. Il porte la **polarite** en prop (`higherBetter` / `lowerBetter`), car une hausse est favorable pour la croissance et defavorable pour le risque ou l'inflation.
    Les autres (`KeyTakeaway`, `SectionCard`, `ScoreGauge`, `Waterfall`, `Heatmap`) ont ete differes a dessein : aucune page ne les utilisait alors, les creer aurait produit du code mort. **Extraits en phase 3** (point 19), en meme temps que les onglets pays qui les emploient.
13. [~] Titres et sous-titres des 11 pages passes par `t()` (110 cles, 5 langues). Les melanges FR/EN visibles a l'ecran ont disparu (`Regions` -> `Regions/Regiones/...`, `Watchlist` -> `Liste de suivi`, `Data Explorer` -> `Explorateur de Donnees`).
    Reste a traduire : le corps des pages (en-tetes de tableaux, libelles de filtres, textes de cartes).

Carte des regimes : l'emoji est remplace par un **cartogramme regional** (une tuile par region,
disposee geographiquement, coloree par statut et alimentee par `regionSnapshots`). Le choroplethe
par pays reste reporte au branchement du module 4.

Verifie au navigateur : 20 routes sans erreur, `npm run build` vert, aucun debordement horizontal
en 1440 px comme en 390 px, tiroir mobile et mode sombre conformes.

### Phase 2 — Contrat de donnees
14. [x] Passage ISO alpha-3 effectue : 134 champs migres dans 10 fichiers (`code`, `countryCode`, `flag`, `region`), plus les cles de l'objet `base` de `mockData`, les listes de regroupement d'`IndicatorsPage` et les drapeaux codes en dur. `Flag` accepte les deux notations via sa table d'alias, donc aucun rendu n'a casse : 67 drapeaux verifies sur 5 pages, 0 rectangle gris. La recherche globale pointe desormais vers `/countries?code=CIV`.
    **Point a confirmer avec l'equipe backend** : la zone euro n'a pas de code ISO alpha-3. J'ai retenu `EMU` (convention Banque mondiale) ; `Country.isAggregate` du module 1 confirme que ces agregats sont prevus. Le changement se fait en un seul endroit si une autre convention est retenue.
15. [x] `shared/schema.ts` reecrit : plus de Drizzle, uniquement des types alignes sur les 10 modules
    (`Country`, `MacroIndicator`, `MacroObservation`, `MacroRegime`, `CountryRating` + ses 7 piliers,
    `EconomicEvent`, `EconomicAlert`). Renommages propages aux 8 consommateurs :
    `EconomicIndicator` -> `MacroObservation`, `EconomicRegime` -> `MacroRegime`,
    `indicatorType` -> `indicatorCode`, et les codes d'indicateurs passent au catalogue
    (`inflation` -> `cpi_inflation`, `gdpGrowth` -> `real_gdp_growth`...).
    `inflationLevel` / `gdpGrowthLevel` sont conserves comme **paliers derives** des scores numeriques
    du module 4, pour ne pas reecrire 4 pages sans gain fonctionnel.
16. [x] Dimension millesime en place : `STATIC_OBSERVATIONS` porte plusieurs valeurs par periode
    (`vintageDate`, `releaseDate`, `isForecast`), avec `getStaticHistory` (dernier millesime) et
    `getVintages` (historique des revisions). Le tableau *Indicator Values & Vintages* du Data Explorer
    n'est plus code en dur : 12 periodes, dont 4 portant 3 millesimes.
    Bug corrige au passage : reculer d'un mois depuis le 31 juillet debordait sur le mois suivant,
    ce qui faisait collapser 12 periodes en 7. Les periodes sont desormais calees au 1er du mois.

### Phase 3 — Fiche pays a onglets
17. [x] `CountriesPage` est un conteneur a onglets route en `/countries/:code/:tab`
    (`components/dashboard/CountriesPage.tsx` + registre `components/country/tabs.ts`).
    Le pays **et** l'onglet vivent dans l'URL : un lien partage rouvre exactement la meme vue.
    Quatre formes convergent vers la forme canonique, verifie au navigateur :
    `/countries` -> `/countries/CIV/summary`, `/countries?code=SEN` (ancienne forme) -> `/countries/SEN/summary`,
    `/countries/SEN` -> `/countries/SEN/summary`, `/countries/ZZZ/nope` -> `/countries/CIV/summary`.
    Chaque onglet est charge a la demande : six chunks separes au build, l'onglet Summary
    ne paie pas le poids des cinq autres.

    **Ecart assume : 6 onglets, pas 9.** L'union des planches donnait 9 libelles, mais
    `Risks`, `Sectors`, `Markets` et `Timeline` sont des **sections de la planche P2**, pas des
    pages : en faire des onglets aurait produit quatre vues quasi vides dupliquant la synthese.
    Les six onglets retenus correspondent aux six planches reellement dessinees (P2, P6, P8, P7,
    P9, P5). Le registre `COUNTRY_TABS` est la seule source de verite : ajouter un onglet reste
    une modification d'une ligne, ce qui laisse le point ouvert 1 decidable sans refonte.

18. [x] Les six onglets sont implementes :
    - **Summary** (P2) — House View, 6 KPI, Macro Regime Snapshot (7 lignes), trajectoire de
      croissance 2021-2027F, Forecast Summary, Peer Positioning avec selecteur de metrique,
      Risk Snapshot **derive des 7 piliers**, secteurs, frise, marches, Sources & Data Confidence.
    - **Notation & Risk** (P6, module 5) — jauge du composite, rang/univers, outlook, watch status,
      donut de confiance, 7 piliers, Score Decomposition ponderee, drivers, declencheurs,
      scenarios probabilises, Rating Bridge, Peer Positioning sur les 16 pays, fondations et
      gouvernance, plus la mention exigee sur la part de jugement analyste.
    - **Quantitative Analysis** (P8) — reperes observes par pays en tete de la vue existante.
    - **Qualitative Analysis** (P7) — Executive House View, frise de regime, Policy Mix,
      Country Architecture, avantages/expositions, dependances, canaux de transmission,
      risques/catalyseurs, 5 profils investisseurs.
    - **Forecasts & Scenarios** (P9) — selecteur de **millesime reel** (lu dans les observations),
      headline, 4 KPI de prevision, hypotheses, SIG vs consensus avec zone de prevision grisee,
      scenarios et sensibilites, cascade de revision, bandes de confiance, distribution P10/P50/P90,
      performance de modele, methodologie.
    - **Trends & Signals** (P5) — 5 KPI, matrice multi-horizons, signaux avances/coincidents/
      retardes, composites de momentum, diffusion, surprises, probabilites de regime,
      journal des inflexions, heatmap de revisions, What Changed.

19. [x] Composants transverses extraits (`components/common/`), ce qui solde le point 12 :
    `SectionCard`, `KeyTakeaway`, `ScoreGauge` (+ `ScoreBar`), `Waterfall`, `Heatmap`.
    Ils rejoignent `DeltaBadge`. Les badges de vocabulaire partage (orientation, momentum,
    surveillance) vivent dans `components/country/shared.tsx`.

20. [x] `client/src/data/countryProfile.ts` — la couche qui rend la fiche reellement dependante
    du pays choisi. **Defaut corrige au passage** : le selecteur de pays ne changeait que le
    drapeau et le titre, tout le corps de la page affichait les chiffres de la Cote d'Ivoire.
    Le profil reconstruit KPI, lignes de regime, trajectoire, table de prevision, pairs et
    House View pour les 16 pays a partir des seules sources typees (modules 1, 3, 4, 5).
    Verifie : les six onglets produisent des valeurs distinctes pour 4 pays testes.

21. [x] Anciennes pages autonomes converties en redirections : `/rating` -> `/countries/CIV/notation`,
    `/qualitative` -> `.../qualitative`, `/quantitative` -> `.../quantitative`, `/trends` -> `.../trends`.
    `pages/{Rating,QualitativeAnalysis,QuantitativeAnalysis,Trends}.tsx` ne sont plus rendues et
    rejoignent la liste de suppression du point 7.

#### Deux defauts de donnees trouves en verifiant, pas en relisant

- **Series identiques pour les 16 pays.** `buildObservations` appliquait la meme sinusoide
  (`sin(i / 2.1) * 0.2 - i * 0.02`) a tout le monde ; seul le niveau de depart changeait. Les
  variations d'une periode a l'autre etaient donc rigoureusement les memes partout, ce qui rendait
  la diffusion et la matrice de tendances **constantes, donc fausses** — et la variation du dernier
  mois tombait a zero apres arrondi, d'ou une diffusion affichee a 0% pour tous. La forme depend
  desormais du couple pays/indicateur (phase, longueur d'onde, derive et bruit deterministes), avec
  une amplitude proportionnelle au niveau et un plancher a zero pour le chomage et le taux directeur.
  Le typecheck ne pouvait rien voir : seul l'affichage revelait l'uniformite.
- **Bande de cible d'inflation inversee** (`QuantitativeAnalysisView`) : `height={tLow-tHigh}`
  valait -58 sur un axe inverse, soit une erreur console a chaque rendu. Les bornes sont renommees
  `targetTop` / `targetBottom`.

#### Defaut transverse du design system, trouve en regardant l'ecran

Les tokens de couleur etaient stockes en `hsl(...)` complet (`--primary: hsl(215, 85%, 32%)`).
Tailwind compile `bg-primary/70` en `hsl(var(--primary) / 0.7)`, ce qui donnait
`hsl(hsl(215, 85%, 32%) / 0.7)` : une declaration invalide, **ignoree en silence**. Consequence
mesuree au navigateur : `bg-primary/70` et `bg-muted/50` renvoyaient `rgba(0, 0, 0, 0)` — donc
**tous les fonds attenues de l'application etaient transparents**, une quarantaine d'occurrences,
y compris dans les composants shadcn/ui (survol de ligne de tableau, etats `hover:bg-accent/50`,
surlignages `bg-primary/5`). En SVG, `fill-muted/50` tombait a **noir**, d'ou la zone de prevision
noire de P9. Rien n'apparaissait en console : l'echec est muet.

Les 66 tokens passent en **canaux HSL nus** et les 35 mappings de `tailwind.config.ts` en
`hsl(var(--x) / <alpha-value>)`, la forme standard. Verifie au navigateur :
`bg-primary/70` -> `rgba(12, 70, 151, 0.7)`, `bg-muted/50` -> `rgba(234, 237, 241, 0.5)`,
`fill-muted/50` -> `rgba(234, 237, 241, 0.5)`. **Aucune regression visuelle** : fond, carte, titre
et bordure rendent exactement les memes valeurs qu'avant, en clair comme en sombre.

C'est la generalisation du symptome rencontre en phase 1 sur `text-sidebar-foreground/75`, qui
avait ete contourne localement par un token dedie. La cause commune est traitee ici.

#### Un choix de lisibilite sur la cascade

Le *Rating Bridge* va de 6,42 a 6,50. Sur un axe tronque sur cette amplitude, deux colonnes
pleines apparaissaient dans un rapport de 1 a 4 : la hauteur mentait sur le rapport des valeurs.
Les points de depart et d'arrivee sont donc des **reperes horizontaux**, pas des colonnes, et une
mention signale l'axe tronque. Seules les contributions restent des barres, ou la hauteur a un sens.

#### Verification (navigateur, phase 3)

28 routes, dont les 6 onglets sur 4 pays : **0 erreur console, 0 requete en echec**, aucun `NaN`
ni `undefined`, aucun debordement horizontal de contenu en 390 / 768 / 1440 px, bascule clair/sombre
conforme sur les tokens de fond, de carte et de titre. `npm run build` vert. Le tableau des
millesimes du Data Explorer n'a pas regresse : 12 periodes, 3 millesimes sur la plus recente.

#### Reste ouvert sur la fiche pays

- Carte infranationale du bloc *Strategic Sector Focus* (P7) : depend du fond de carte, point ouvert 4.
- Secteurs strategiques, frise d'evenements et snapshot de marche de l'onglet Summary restent des
  fixtures Cote d'Ivoire ; elles sont signalees comme telles a l'ecran. Elles dependent du module 9
  et du produit marches/portefeuille.
- Les 7 modules internes de l'onglet Quantitative restent adosses aux memes fixtures.
- `fiscal_balance` et `current_account` ne sont pas au catalogue du module 2 : ils sont derives et
  marques « derive » a l'ecran. **A demander a l'equipe backend** avec leur frequence.

### Phase 4 — Pages manquantes
22. [x] **Compare Countries (P3)** — `components/dashboard/ComparePage.tsx`, route `/compare`.
    La selection vit dans l'URL (`/compare?codes=CIV,SEN,NGA,ZAF`) : c'est ce qui rend
    « Save Comparison » et « Share » realisables sans backend, **le lien est la comparaison
    sauvegardee**. Les neuf sections de la planche sont la : selection en chips, parametres
    (jeu de metriques, groupe de pairs, fenetre), scorecards /100 avec rang et sparkline,
    Comparison Heatmap groupee par famille, nuage croissance/risque a quatre quadrants,
    trajectoires normalisees, comparaison des previsions, secteurs strategiques, table de
    synthese avec export CSV.

    `client/src/data/comparison.ts` porte la normalisation. Deux choix de methode, volontaires :
    - Le **z-score de la heatmap se calcule sur la selection**, pas sur l'univers — la maquette
      annonce « 0 = moyenne du groupe ». Consequence visible et voulue : retirer un pays
      repositionne les autres. Verifie au navigateur (1,37 -> 1,38 apres retrait).
    - Les **trajectoires normalisees centrent chaque pays sur sa propre histoire**, la maquette
      annoncant « 0 = moyenne long terme ». Superposer des niveaux bruts n'aurait rien dit ;
      centre ainsi, le graphe montre qui s'ecarte de son regime habituel.

    Le z-score est **oriente favorable** : un ecart positif signifie « meilleur que le groupe »,
    y compris sur l'inflation ou le risque ou une valeur basse est bonne. Sans cette orientation,
    la heatmap colorerait en vert le pays le plus risque.

    Point d'entree : aucun element de sidebar — `SIG Tracker Menu Bar.pdf` fait foi et n'en prevoit
    pas. La page s'atteint par le bouton **Comparer** de la fiche pays (qui pre-selectionne le pays
    et ses pairs regionaux) et par la recherche globale.

23. [x] **Choroplethe mondial** — `RegimeMapCard` rend desormais une vraie carte : projection
    **Natural Earth** (`d3-geo`) appliquee a un TopoJSON monde 110 m **versionne dans le depot**
    (`client/src/data/world-110m.json`, issu de `world-atlas@2.0.2`, domaine public). Aucun appel
    reseau : le fichier est servi par le bundle.

    Option retenue par l'equipe le 2026-09-30, ce qui **clot le point ouvert 4**. Cout mesure :
    `d3-geo` + `topojson-client` = **27 Ko** (chunk `geo`), topologie = **106 Ko** (38 Ko gzip),
    les deux en **`import()` dynamique** pour que l'accueil s'affiche sans les attendre. Un chunk
    `geo` a ete ajoute aux `manualChunks` de `vite.config.ts`.

    Le contrat d'interaction de la planche P1 est respecte : infobulle au survol
    (**Overall Regime, Momentum, Risk Score**, score SIG), **controles de zoom** (accueil / + / -,
    3 niveaux) qui recentrent sur le barycentre des pays suivis et non sur le milieu de la carte,
    **legende a 6 etats** (Improving / Favorable / Neutral / Deteriorating / Stressed / No Data)
    contre 4 auparavant, et le clic ouvre la fiche pays.

    Trois decisions de rendu :
    - L'etat combine **direction et niveau** : un pays peu risque mais en degradation doit se voir.
      D'ou six etats, la ou quatre paliers de risque masquaient le momentum.
    - **La zone euro n'a pas de trace.** `Country.isAggregate` prevoit le cas cote contrat ; cote
      carte, l'agregat colore ses pays membres, mais les membres suivis individuellement
      (France, Allemagne, Italie, Espagne) gardent leur propre couleur — un trace ne peut pas
      porter deux etats, et la donnee la plus fine gagne. La table vit dans `data/worldGeo.ts`,
      seul point de traduction **alpha-3 <-> ISO numerique** (le TopoJSON identifie en numerique).
      Rapprocher par nom de pays aurait casse au premier « Cote d'Ivoire » contre « Ivory Coast ».
    - **L'Antarctique est ecarte du cadrage** : il occupait un sixieme de la hauteur et ne portera
      jamais de donnee. Le monde habite gagne d'autant dans le meme cadre.

    La carte passe de `lg:col-span-2` a `lg:col-span-3` : a 402 px de large, le Senegal faisait
    2 px. Elle occupe maintenant 638 px et `RegionSnapshot` passe a 2 colonnes, avec son
    rembourrage resserre de `px-4` a `px-2` pour que la colonne Delta reste dans le cadre
    (verifie : 338 px de tableau pour 340 px de conteneur, non rogne).

    Verifie au navigateur : 295 traces dont 30 alimentes, 4 etats presents, infobulle exacte
    (« Nigeria — Recession, Deteriorating, 78/100, 3,6/10 »), zoom scale 1 -> 1,8 avec recentrage,
    clic -> `/countries/CIV/summary`, 0 erreur console, 0 requete en echec, mode sombre conforme.

24. [x] **Themes Explorer (module 11)** — specifie le 2026-10-01 par
    `Tracker Section Theme Explore SIG.pdf`, et construit dans la foulee.
    `components/dashboard/ThemesPage.tsx`, route `/themes`, entree de sidebar entre Markets et
    Tracker de Politique (la planche P1 la montrait deja).

    Un theme est un **regroupement transversal** d'indicateurs, de pays et de signaux. Les quatre
    fonctionnalites attendues sont la : vue agregee, comparaison des pays du perimetre, signaux,
    drill-down vers les indicateurs. Le theme ouvert vit dans `?code=`, donc le drill-down est
    partageable.

    Types ajoutes a `shared/schema.ts` : `Theme`, `ThemeSnapshot`, `ThemeSignal`,
    `ThemeIndicatorLink`, d'apres les quatre tables et les cinq routes de la spec.
    **Point de transport a signaler a l'equipe backend** : les routes `/themes` enveloppent la
    charge utile dans `{ success, data }`, alors que les modules 1 a 10 renvoient des
    enregistrements Prisma bruts. Deux conventions dans la meme API.

    Deux partis pris de construction :
    - Le **perimetre pays** est un predicat sur `STATIC_COUNTRIES` (« UEMOA », « Tous »,
      « International »), pas une liste figee : les compteurs suivront jusqu'aux 208 pays.
    - Les **signaux sont calcules** sur les series et les regimes reels (franchissement de seuil,
      bascule de regime), pas rediges. Un signal invente afficherait une alerte que rien ne
      justifie, et c'est precisement ce qu'un operateur vient verifier ici.

    **Deux defauts trouves en regardant la page, pas en relisant le code** :
    - Le score du theme etait la moyenne des scores composites de son perimetre — il ne dependait
      donc **pas du theme**. Six themes partageant le perimetre « Tous » affichaient le meme
      59/100. Le score se calcule desormais sur les **indicateurs du theme**, avec une table de
      notation par serie (une inflation a 2% est saine, une croissance a 2% est moyenne), et vaut
      `null` quand aucun indicateur du theme n'est encore au catalogue : « Non note » plutot qu'un
      chiffre qui ne veut rien dire.
    - La bascule de regime etait remontee comme signal sur **les huit themes**, donnant a lire huit
      alertes la ou il n'y en avait qu'une. Elle est reservee aux themes qui suivent le cycle macro
      (`tracksRegime`).

    Resultat verifie : scores 62 / 86 / 83 / 53 pour les quatre themes notes, « Non note » pour les
    quatre autres, et des comptes de signaux qui different (1, 0, 4, 0, 0, 1, 0, 4).

    **Reste** : le catalogue ne porte que 4 indicateurs sur les ~30 que la spec rattache aux huit
    themes. Chaque theme distingue a l'ecran ceux qu'il peut montrer de ceux qu'il attend.

#### Defaut d'affichage corrige au passage

`RegionSnapshot` enfermait son tableau dans un `overflow-hidden` (pose pour que les coins arrondis
decoupent l'en-tete) : sur ecran etroit le tableau etait **rogne au lieu d'etre defilable**, et les
dernieres colonnes devenaient inatteignables. `overflow-x-auto` conserve le decoupage des coins et
rend le defilement. Verifie : plus aucun debordement de contenu sur l'accueil en 390 px.

#### Verification (navigateur, phase 4)

30 routes, dont `/compare` sous cinq selections differentes (defaut, 2 pays, 3 pays, 4 pays, codes
invalides) : **0 erreur console, 0 requete en echec**, aucun `NaN`, aucun debordement en
390 / 768 / 1440 px, mode sombre conforme. Export CSV confirme par un telechargement reel
(`sig-comparaison-sen-nga-zaf.csv`). `npm run build` vert.

---

## 6. Points ouverts

1. Onglets de la fiche pays : 6 onglets retenus (cf. point 17), les 4 libelles ecartes etant des sections de P2. **Reste a confirmer avec le designer** : le libelle `Forecasts` (P2, P9) vs `Financials` (P7), et l'ordre. Le registre `components/country/tabs.ts` rend le changement trivial
2. ~~Sort des pages hors maquette~~ — **tranche** : elles restent au menu, en statique, jusqu'au produit marches/portefeuille
3. Origine des contenus editoriaux (House View, Investor Implications, Key Takeaway) : redaction analyste ou champ backend ?
4. ~~Fond de carte monde~~ — **tranche le 2026-09-30** : `d3-geo` + TopoJSON 110 m versionne.
   Voir le point 23. **Reste ouvert pour la carte infranationale de P7** (densite par region
   administrative) : il faudra une source de decoupage infranational, que `world-atlas` ne couvre
   pas.
5. ~~Perimetre de la beta~~ — **tranche le 2026-10-01 : 208 pays**. Consequences frontend a
   tenir des maintenant, independamment de la livraison des donnees : le screener doit paginer
   (la maquette affiche « Showing 1 to 13 of 25 countries »), les listes deroulantes de pays
   doivent rester utilisables a 208 entrees, et le choroplethe doit afficher proprement l'etat
   « No Data » pour les pays non couverts. Le jeu statique reste a 16 pays : les generer tous les
   208 produirait du bruit sans valeur, alors que le backend les fournira.
6. ~~Themes Explorer~~ — **tranche le 2026-10-01**, specification recue et page construite
   (point 24). Reste a confirmer avec l'equipe backend : l'enveloppe `{ success, data }` des
   routes `/themes`, differente du reste de l'API.
