# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server (client/ as root) — http://localhost:5173
npm run build      # Production bundle to dist/public
npm run preview    # Serve the built bundle
npx tsc --noEmit   # Typecheck (no script alias exists)
```

There is **no test runner and no linter** configured — don't claim tests pass; verify UI changes in the browser.

`npx tsc --noEmit` is **clean** since the dead-code removal of 2026-09-30. Keep it that way: any error it reports now is one you introduced.

## Architecture

**This is a frontend-only app running on static mock data.** The React SPA is the whole product; nothing is fetched from a live server in the current state.

- Vite `root` is `client/`, so `client/index.html` → `client/src/main.tsx` is the entry. Aliases: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`. Always import via aliases, never relative `../..` paths.
- `client/src/App.tsx` is the router (wouter `<Switch>`): every page is `lazy()`-loaded and wrapped in `AppLayout`. Adding a page means adding both the lazy import and the `<Route>`.
- **The country file is a tab container**, not a page: `/countries/:code/:tab` (three `<Route>`s, all rendering `CountriesPage`, which canonicalises the URL). The tab list lives in `client/src/components/country/tabs.ts` — that registry is the single source of truth for the tab bar, the routing and the default slug, so adding or renaming a tab is a one-line change. Each tab component is itself `lazy()`-loaded, so the six tabs are six separate chunks.
- `/compare` is the multi-country comparison (P3). Its selection lives in `?codes=CIV,SEN,USA`, so the URL *is* the saved comparison — don't move that into component state. It has **no sidebar entry on purpose**: `SIG Tracker Menu Bar.pdf` governs navigation and doesn't list one; the page is reached from the country file's *Comparer* button and from global search.
- `/rating`, `/qualitative`, `/quantitative` and `/trends` are **redirects** to the matching country tab. Their old page components (`pages/Rating.tsx`, `pages/QualitativeAnalysis.tsx`, `pages/QuantitativeAnalysis.tsx`, `pages/Trends.tsx`) are no longer rendered and are on the deletion list.
- `client/src/components/layout/AppLayout.tsx` owns the persistent sidebar + header and is the de-facto source of truth for which routes are *reachable by users*. Several routes (`/overview`, `/quantitative`, `/qualitative`, `/rating`, `/trends`) are registered but not linked in the sidebar.
- Page components live in **three** places: older ones in `client/src/pages/`, the dashboard set in `client/src/components/dashboard/`, and the six country tabs in `client/src/components/country/` (`IndicatorsPage`, `MarketsPage`, `PolicyTrackerPage`, `CalendarPage`, `AlertsPage`, `WatchlistPage`, `ReportsPage`, `ScreenerPage`, `SettingsPage`, plus `RegionsPage`/`CountriesPage`/`DataExplorerPage`). Dashboard pages use **named** exports, hence the `.then(m => ({default: m.X}))` in the lazy imports.

### Data layer

All displayed data comes from two static modules; there are no network calls on any reachable page.

- `client/src/data/mockData.ts` — `STATIC_COUNTRIES`, `STATIC_INDICATORS`, `STATIC_OBSERVATIONS` (vintaged), `STATIC_REGIMES`, `STATIC_RATINGS`, plus the accessors `getStaticHistory`, `getVintages`, `getRating`. Typed against `shared/schema.ts`. Series are generated per country **and** per indicator (`seriesShape`): a shape shared across countries made diffusion and trend matrices identical everywhere, which read as data but was an artefact — don't reintroduce a common curve.
- `client/src/data/comparison.ts` — normalisation for the compare page. Z-scores there are computed **over the current selection**, not the universe, and are **orientation-adjusted** so a positive score always means "better than the group" even for inflation or risk where low is good. Removing a country legitimately moves everyone else.
- `client/src/data/countryProfile.ts` — `getCountryProfile(code)` assembles the consolidated per-country view (KPIs, regime lines, growth path, forecast table, peers, house view) from the typed sources. **Every country tab consumes this and nothing else**, so the country selector actually drives the whole page. This is the seam the API will replace; keep derivations here rather than inside tab components.
- `client/src/data/mockDashboard.ts` — the richer per-widget fixtures (KPIs, regime matrix, screener rows, forecasts, peers…), each with its own exported interface.
- `shared/schema.ts` is the **type contract for the 10 backend modules** — plain TypeScript, no Drizzle: `Country`, `MacroIndicator`, `MacroObservation` (carries `vintageDate` / `releaseDate` / `isForecast`), `MacroRegime`, `CountryRating` with its 7 `PillarKey` pillars, `EconomicEvent`, `EconomicAlert`. No database is connected. Keep mock data conforming to these types so the eventual API swap is mechanical.
- `client/src/data/world-110m.json` — Natural Earth 110m TopoJSON, vendored from `world-atlas@2.0.2` (public domain) so the map needs no network. See **Maps** under Conventions.

### Dead code was removed on 2026-09-30

There is **no dead code left** and the typecheck is clean. Removed in one pass: `server/` (the old Express API, never started by any script), `drizzle.config.ts`, `client/src/services/` (the whole `/api/*` HTTP layer), the nine unrendered API-backed components (`AIInsights`, `CountryNewsFeed`, `EconomicIntelligence`, `LiveNews`, `NewsFeed`, `MarketData`, `ForecastSummary`, `NavTabs`, `CountryCard`), `pages/DataExplorer.tsx`, the four pages superseded by the country tabs (`Rating`, `QualitativeAnalysis`, `QuantitativeAnalysis`, `Trends`), and three unreferenced utils — 30 files.

Consequences worth knowing:

- **There is no HTTP layer any more.** When the backend lands, write a fresh client against `shared/schema.ts`; don't try to resurrect `services/` from git history, it targeted a different contract.
- `lib/queryClient.ts` and the `@tanstack/react-query` provider survive but are unused. They are the intended seam for the real API.
- `README.md` and `replit.md` still describe the deleted Express architecture (port 5000, `/api/*`, in-memory storage). They are **stale** — prefer `docs/` and the code. They are worth rewriting.
- **Dependencies were purged on 2026-09-30**: 57 direct packages removed in three passes, taking `package.json` from 68 + 24 down to **21 + 14**. Gone: the whole backend stack (`express`, `passport`, `drizzle-*`, `@neondatabase/serverless`, session stores, their `@types`, `tsx`) and eleven frontend orphans nothing imported (`framer-motion`, `next-themes`, `react-icons`, `zod`, `@hookform/resolvers`, `nanoid`…). Each was verified at zero references before removal, and typecheck plus build were re-run after each group. The third pass removed the unreachable `ui/` components and the 28 packages only they imported, including `recharts` — the app charts with Chart.js, `ui/chart.tsx` was never rendered. `vite.config.ts` `manualChunks` had to drop two Radix entries that went with them. The package was also renamed from the Replit template's `rest-express` to `sig-frontend`. `replit.md` was deleted: it described the removed Express architecture and contradicted the README.

### Design reference and data contract (decided 2026-09-30)

`docs/AUDIT_MAQUETTES_ET_PLAN.md` is the working reference: full inventory of the 9 mockup pages, the gap against the current UI, and the phased plan. Read it before any UI work.

- **The authoritative mockups are the light-sidebar set** (`SIG_Global_Macro_Tracker_Full_Mockups.pdf`, outside the repo). The navy-sidebar PNGs in `mockups/` — which the current implementation follows — are **obsolete**. Expect a design-system migration; don't add UI matching the navy design.
- The 10-module backend spec (`SIG Tracker Module BackEnd.pdf`) is **validated by the backend team**. It supersedes the "no model for regimes/rating/screener" conclusion in `docs/AUDIT_BACKEND_INTEGRATION.md` — modules 4 (Macro Regimes), 5 (Country Ratings) and 6 (Country Screener) are planned.
- **Country codes move to ISO 3166-1 alpha-3** (`CIV`, `SEN`, `GBR`). The current alpha-2 mocks are legacy, and `"UK"` was never a valid code.
- Macro series must carry a **vintage dimension** (`period`, `vintageDate`, `releaseDate`, `isForecast`). Three mockup pages (Data Explorer, Trends & Signals, Forecasts & Scenarios) are impossible without it.
- Order of work: stabilize what exists first, then build the missing pages.

### Planned backend integration

A **separate team** owns the backend in its own repo — `Stars-Investment-Group/backend_tracker` (NestJS 11 + Prisma 5.4 + PostgreSQL 17 + Redis, pnpm, public on GitHub). This repo is `Stars-Investment-Group/sig_frontend`. `docs/AUDIT_BACKEND_INTEGRATION.md` and `docs/REUNION_INTEGRATION_BACKEND.md` hold the integration plan and the open questions for that team.

- Base `http://localhost:3000`, **no global route prefix** (`/api` serves Swagger only). JWT Bearer on everything except `@Public()` routes: `/health`, `/uemoa/indicators`, `/uemoa/series`, `/auth/{register,login,refresh}`.
- `main` is portfolio-domain only (Portfolio, Transaction, Instrument, PriceHistory, Alert, Watchlist, NewsArticle, EconomicEvent, EconomicIndicator). Regimes, country rating and the country screener have no backend model and stay client-side.
- **Two unmerged branches change the picture** — verify current state before planning integration work: `feat/countries_and_macro_indicator` adds `Country` + `MacroIndicator` models with 7 **public** routes (`/countries`, `/countries/regions`, `/countries/:code`, `/countries/:code/overview`, `/indicators`, `/indicators/categories`, `/indicators/:code`); `feature/pipeline-millesimes` adds data vintages and `GET /uemoa/revisions`.
- The API returns **raw Prisma records in camelCase** (`seriesCode`, `fetchedAt`) — the `snake_case` claim in `docs/AUDIT_BACKEND_INTEGRATION.md` §3.1/§4 is wrong, so no case-conversion layer is needed. `Decimal` fields still arrive as strings, and list endpoints are **unpaginated**.
- Guiding rule from the audit: real data becomes the primary source, mocks remain the fallback, **no visual regression**.

## Conventions

- **Theming**: light/dark via CSS custom properties in `client/src/index.css` (`:root` and `.dark`), mapped into Tailwind in `tailwind.config.ts`. `hooks/useTheme.ts` toggles the `dark` class on `<html>` and persists to `localStorage["sig-theme"]`. Style with semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-sidebar`) plus `dark:` variants where a raw palette color is unavoidable. `terminal-*` classes appear in older docs and do not exist — never reintroduce them.
- **Colour tokens are stored as bare HSL channels** (`--primary: 215 85% 32%`) and mapped as `hsl(var(--primary) / <alpha-value>)`. This is load-bearing, not cosmetic: it is what makes opacity modifiers work. Writing a full `hsl(...)` in the variable makes `bg-primary/70` compile to `hsl(hsl(215 85% 32%) / 0.7)`, which the browser discards **silently** — backgrounds vanish, `fill-*` falls back to black, and nothing appears in the console. The repo ran that way until 2026-09-30 and ~40 tinted backgrounds were invisible. Never put a complete `hsl()` back into a token, and if a tint looks missing, check the computed `background-color` before assuming the class is wrong.
- **UI kit**: shadcn/ui (new-york, neutral) under `client/src/components/ui/`. Treat these as generated; compose rather than edit. **Only the 11 files the app actually reaches are kept** — `badge`, `button`, `card`, `checkbox`, `popover`, `select`, `switch`, `table`, `toast`, `toaster`, `tooltip`. The other 36 were deleted on 2026-09-30 along with the 28 packages they alone imported. If you need another shadcn component, re-add it with the CLI rather than restoring it from git history, so its dependency comes back with it.
- **Maps**: `components/dashboard/RegimeMapCard.tsx` is the only map. It renders a real choropleth with `d3-geo` (Natural Earth projection) over `client/src/data/world-110m.json`, a TopoJSON vendored from `world-atlas@2.0.2` so nothing is fetched at runtime. Both the projection code and the topology load via `import()` so the home page paints without them; `vite.config.ts` isolates them in a `geo` chunk. The topology identifies countries by **ISO numeric**, the app by alpha-3 — `client/src/data/worldGeo.ts` is the single translation point, never match on country name. Aggregates (`isAggregate`, e.g. `EMU`) have no outline: they colour their member countries, and individually-tracked members keep their own colour.
- **Charts**: Chart.js via `react-chartjs-2`. `components/TimeSeriesChart.tsx` and `components/TrendChart.tsx` are the shared chart components; `components/dashboard/Sparkline.tsx` for inline micro-charts. Don't add a second charting library. Hand-rolled SVG is used where Chart.js would be overkill (gauges, waterfall, fan) — **beware inverted y-axes**: a `<rect>` height computed as `y(high) - y(low)` comes out negative and logs a console error on every render.
- **Shared presentation primitives** live in `client/src/components/common/`: `DeltaBadge`, `SectionCard`, `KeyTakeaway`, `ScoreGauge` / `ScoreBar`, `Waterfall`, `Heatmap`. Compose these rather than re-deriving colour or polarity logic. Polarity is always an explicit prop — a rise is good for growth and bad for risk, inflation or unemployment, and the component can't infer that from the number. Country-specific vocabulary badges (outlook, momentum, watch status) are in `components/country/shared.tsx`.
- **Flags**: use `components/Flag.tsx` (hand-written SVGs). Emoji flags are intentionally avoided because they don't render on Windows/Chrome.
- **i18n**: `lib/i18n.tsx` provides `useI18n()` / `t(key)` for FR/EN/ES/PT/AR (AR is RTL). `AppLayout` carries its own separate `NAV_I18N` dictionary for sidebar labels. Existing pages mix hardcoded French and English strings; prefer `t()` for new copy.
- **Language**: code comments, docs and commit messages are in French. Follow that.
- **Bundle**: `vite.config.ts` hand-splits vendor chunks (`react`, `chart`, `ui-core`, `data`). Adding a heavyweight dependency means revisiting `manualChunks`.
