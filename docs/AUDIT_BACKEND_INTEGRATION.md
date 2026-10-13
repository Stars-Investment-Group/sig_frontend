# Audit d'integration Frontend <-> Backend (backend_tracker)

> Audit prealable au branchement des interfaces SIG sur les vraies donnees.
> Backend cible : Stars-Investment-Group/backend_tracker (NestJS 11 + Prisma 5.4 + PostgreSQL 17 / Neon).

## 1. Constat critique : deux domaines differents

Le frontend actuel a ete construit sur des mocks "macro" (regimes, notation pays, UEMOA, screener pays).
Le backend reel est une API de gestion de portefeuille d'investissement multi-actifs, avec un module macro UEMOA secondaire.

| Domaine mock frontend | Present dans le backend ? | Strategie |
|---|---|---|
| Regimes macro par pays | Non | Deriver cote client depuis /uemoa + /price-history, ou garder mock badge "demo" |
| Notation / score pays | Non | Modele de scoring frontend |
| Screener de pays | Non | Idem |
| Regions / Countries | Partiel (Instrument.country, /uemoa?country=) | Mapper sur /uemoa/series |
| KPI globaux monde | Non | Mocks ou recalcul local |
| Alertes macro | Partiel (Alert = instrument/prix/news) | Mapper /alerts (scope utilisateur) |
| Watchlist | Oui (Watchlist + WatchlistInstrument) | Branchement direct /watchlists |
| News & calendrier economique | Oui (NewsArticle + EconomicEvent) | Branchement direct /news |
| Policy Tracker | Partiel (taux BCEAO via /uemoa) | Mock + UEMOA taux directeur |

Conclusion : le branchement reel concerne en priorite News, Calendrier economique, Watchlists,
Instruments, Price History, UEMOA, Portfolios/Transactions/Positions, Alerts, Auth/Users.
Les pages purement "macro pays" restent sur un moteur de scoring frontend.

## 2. Configuration generale de l API

- Base URL locale : http://localhost:3000
- Swagger : http://localhost:3000/api
- Healthcheck : GET /health
- Prefixe global : AUCUN (routes a la racine : /auth, /news, /uemoa...)
- CORS : CORS_ORIGIN (liste sep. virgules) ou * ; credentials: true
- Auth : JWT Bearer global (toutes routes protegees sauf @Public())
- Erreurs : AllExceptionsFilter (JSON sanitise + X-Request-ID)
- Validation : ValidationPipe global (whitelist, forbidNonWhitelisted, transform)
- IDs : UUID v4

### Auth (/auth)
- POST /auth/register (public) -> user + tokens
- POST /auth/login (public) -> access_token, refresh_token
- POST /auth/refresh (public) -> nouveaux tokens
- POST /auth/logout (protege)
- GET /auth/me (protege) -> { success, user }

A savoir : @Public() uniquement sur health, uemoa/indicators, uemoa/series, auth/* (register/login/refresh).
news, instruments, price-history SONT PROTEGES -> token JWT requis.

## 3. Cartographie des modules

### 3.1 UEMOA - Macro BCEAO (PUBLIC)
- GET /uemoa/indicators?country&dataset&provider&seriesCode
- GET /uemoa/series
- POST /uemoa/sync (ADMIN)
Forme (snake_case) : { id, provider, dataset, series_code, series_name, country, period, value, fetched_at }
-> IndicatorsPage, MarketsPage (FX BCEAO), trends macro.

### 3.2 News & Calendrier (PROTEGE)
- GET /news/breaking, /news/most-read (limit, offset)
- GET /news/asset-class/:assetClass
- GET /news/search
- GET /news/economic-calendar?period=today|this_week|this_month|all&country&impact
- GET /news/economic-calendar/events
- POST /news/economic-calendar/events (ADMIN/ANALYSTE)
- GET /news/:id, GET /news/:id/portfolio-impact
Modeles : NewsArticle (title, summary, content, sentiment, assetClass, isBreaking, readCount, publishedAt),
EconomicEvent (title, country, eventDate, impact, actual, forecast, previous, unit).
-> CalendarPage, ReportsPage, CountryNewsFeed, AlertsPage.

### 3.3 Instruments (PROTEGE)
- GET /instrument, GET /instrument/:id, POST/PATCH/DELETE
Modele : ticker, name, assetClass: equity|bond|crypto|fx|commodity, sector, exchange, country, currency, ISIN/CUSIP/SEDOL.
-> MarketsPage, ScreenerPage.

### 3.4 Price History - OHLCV (PROTEGE)
- POST /price-history, POST /price-history/bulk
- GET /price-history/instrument/:instrumentId
- GET /price-history/ticker/:ticker
- GET /price-history/latest/:instrumentId
Modele : timestamp, open, high, low, close, volume, isAdjusted.
-> Sparkline, graphiques, MarketsPage.

### 3.5 Portfolios / Positions / Transactions (PROTEGE)
- GET/POST /portfolio, GET/PATCH/DELETE /portfolio/:id
- GET /portfolio-positions, GET /portfolio-positions/portfolio/:id
- GET/POST /transaction
-> futur module portefeuille.

### 3.6 Watchlists (PROTEGE)
- GET/POST /watchlists ; GET/PATCH/DELETE /watchlists/:id
- POST/GET/DELETE /watchlists/:id/instruments/:instrumentId
-> WatchlistPage (attention : instruments, pas pays).

### 3.7 Alerts (PROTEGE)
- GET/POST /alerts ; GET/PATCH/DELETE /alerts/:id
Modele : Alert (alertType: price|news|economic|earnings, condition JSON, isActive, triggeredAt).
-> AlertsPage (semantique differente).

### 3.8 Users / Audit (PROTEGE, RBAC)
- GET/POST /users, GET/PATCH/DELETE /users/:id, PATCH /users/:id/role (ADMIN)
- GET /audit ; roles USER, ANALYSTE, ADMIN.
-> SettingsPage, page Audit.

## 4. Ecarts de nommage a normaliser

| Point | Backend | Frontend | Action |
|---|---|---|---|
| Casse | series_code, series_name, fetched_at | camelCase | Normaliser en camelCase |
| Dates | ISO 8601 | "28 juil. 2026" | Formatter a l affichage |
| Montants | Decimal -> string | number | parseFloat |
| Asset class | equity|bond|crypto|fx|commodity | FR | Table de libelles |
| Sentiment | positive|neutral|negative | n/a | Mapper |
| Impact | low|medium|high | High/Medium/Low | Aligner enums |

## 5. Points bloquants / decisions requises
1. Auth obligatoire pour news/instrument/price-history/watchlists/alerts -> compte de service OU routes @Public().
2. Pas de modele regimes/notation pays -> scoring reste frontend.
3. Watchlist = instruments, pas pays -> clarifier UX.
4. CORS : verifier que CORS_ORIGIN inclut http://localhost:5173.
5. Neon : DATABASE_URL cote backend uniquement.
6. Pas de prefixe /api : viser http://localhost:3000/...

## 6. Elements necessaires (a demander)
- [ ] URL de l API deployee (ou http://localhost:3000)
- [ ] Identifiants de service (email + mdp, role USER/ANALYSTE)
- [ ] CORS_ORIGIN incluant le frontend
- [ ] Strategie pages macro pays (mock vs serveur)
- [ ] Swagger en ligne si dispo

## 7. Plan d execution propose
1. Couche service (client/src/services/) : client HTTP + JWT + refresh + normalisation camelCase.
2. Auth : ecran login minimal + stockage token + refresh auto.
3. Branchement module par module : News+Calendrier, UEMOA, Instruments+PriceHistory, Watchlists, Portfolios.
4. Garder les mocks en fallback (useQuery fallbackData) -> UI ne casse jamais.
5. Tests de mapping + etats chargement/erreur/vides.

Principe directeur : aucune regression visuelle. Mocks = fallbacks, vraies donnees = source primaire.
