# Ghost Channel

Ghost Channel is a fullscreen, data-driven ambient broadcast engine whose programming changes as normalized local, atmospheric, and world signals arrive. It is currently a pre-alpha vertical slice: calm enough to run unattended on a landscape display, responsive on mobile, and deliberately small enough to evolve.

## Goals and non-goals

The project aims for interchangeable channels, resilient source health, restrained procedural visuals, one web codebase, and PWA installability. It does not include accounts, a database, CMS, admin UI, analytics, autoplay audio, job-search features, or internal imports from ArcadeGhosts.

Supported targets are 1280×800 landscape tablets, 1440×900 desktops, and a reflowed 390×844 mobile composition. Portrait tablets remain a supported responsive target.

## Architecture

Next.js 16.2.10 App Router, React 19.2.4, strict TypeScript 5.9.3, CSS Modules, and a small global token layer form the application. Zod 4.3.6 validates external and cached data. The same-origin `/api/signals` boundary loads independent adapters in parallel; local JSON always participates, while NWS and USGS report explicit failure health. UI components receive only normalized `Signal`, `SourceResult`, and `SignalBundle` values with canonical UTC timestamps. A pure scheduler deduplicates and interleaves channels. The browser retains the last non-empty valid bundle in IndexedDB.

Initial channels are Personal (original repository-backed local notes), Local atmosphere (NWS forecast when configured), and World pulse (recent USGS earthquakes). NASA APOD is deferred.

## Setup

Use Node 24.16.0 and npm 11.13.0:

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Configure `GHOST_CHANNEL_LOCATION_LABEL`, `GHOST_CHANNEL_LATITUDE`, `GHOST_CHANNEL_LONGITUDE`, and a descriptive `GHOST_CHANNEL_NWS_USER_AGENT`. Without them, weather reports `failed` in diagnostics while local and USGS signals continue.

On initial load, the client validates the complete server bundle before replacing the server-rendered local fallback. Diagnostics separately report the last server refresh error and IndexedDB cache availability, while the normal player remains free of implementation error details.

Commands: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:e2e`, `npm run verify`, and `npm run verify:full`. Browser tests intercept `/api/signals`; unit tests use fixtures and do not call NWS or USGS.

## PWA and deployment

The manifest supports standalone installation without forcing orientation. A versioned service worker caches only a minimal shell and uses network-first navigation fallback; live API responses are never added to its cache. This is a modest offline fallback, not a claim of complete offline operation.

The project builds for Vercel with no Vercel project or `.vercel` state required. No custom domain is needed for local or preview development.

## Reviews

`npm run review:repo` exports the repository. For an exact prompt-sized packet, first make a checkpoint commit or run `npm run review:mark -- "before descriptive prompt"` on a clean tree, then later run `npm run review:change`. Git cannot reconstruct an unknown prompt boundary after the fact. See `docs/review-workflow.md`.

## Repository map

- `app/`: routes, metadata, manifest, and aggregation API
- `components/`: player, diagnostics, and procedural visuals
- `lib/adapters/`: source validation and normalization
- `lib/scheduler/`, `lib/cache/`, `lib/signals/`: owned behavior and model
- `data/`: original local programming
- `tests/`: unit, review-tooling, fixtures, and browser coverage
- `docs/`: architecture, source, and review decisions

Upstream facts must retain links and attribution. Future media must preserve caption, credit, copyright, and rights metadata; inclusion is not permission to discard licensing constraints.
