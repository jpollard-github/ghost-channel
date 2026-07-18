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

On initial load, the client validates the complete server bundle before replacing the server-rendered local fallback. It refreshes again ten minutes after each completed attempt, when the browser returns online, and when a visible document has gone at least five minutes without a successful refresh. Requests never overlap. A playlist update preserves the current stable signal ID when that signal remains eligible, and a failed refresh keeps the last valid non-expired bundle on screen.

`expiresAt` is the exclusive playback eligibility boundary for a signal. At or after that UTC timestamp, the signal is removed from aggregate and per-source playlists during the next acceptance or refresh attempt; source health remains visible. Diagnostics separately report the last attempt, last success, next scheduled refresh, latest error, and IndexedDB cache availability, while the normal player remains free of implementation details.

Commands: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:e2e`, `npm run verify`, and `npm run verify:full`. Browser tests intercept `/api/signals`; unit tests use fixtures and do not call NWS or USGS.

### Responsive device review

`npm run test:e2e` is the fast behavioral Chromium suite. `npm run test:responsive` uses the separate `playwright.review.config.ts` and deterministic mocked local, NWS, and USGS signals to assert four focused device layouts; it is not evidence that the live NWS or USGS APIs work. `npm run review:screenshots` replaces only `review-artifacts/screenshots/current`, runs that responsive suite, writes its manifest, and creates a timestamped screenshot ZIP. `npm run review:change` packages work since the marked baseline with the latest current screenshots, while `npm run review:repo` packages the repository.

The tracked `config/review-devices.example.json` provides desktop Chrome at 1440×900, a provisional Android tablet landscape target at 1280×800 and DPR 1.5, and provisional iPhone 17 Pro Max portrait/landscape targets at 440×956 and 956×440 with DPR 3. Copy it to the ignored `config/review-devices.local.json` to adjust measurements in one place. The iPhone projects use the closest available Playwright iPhone/WebKit descriptor with explicit viewport, screen, and scale overrides. This is browser emulation, not a substitute for testing physical Safari or installed-PWA behavior.

Install the additional review browser once with `npm run playwright:install:review`.

### Measure a physical device over the LAN

1. Connect the Mac and tablet or iPhone to the same trusted local network.
2. Run `npm run dev:lan` and note the Network URL printed by Next.js.
3. Open `<Network URL>/?diagnostics=1` on the physical device and rotate it to the target orientation.
4. Measure once in the ordinary browser and once after installing/opening the PWA in standalone mode.
5. Use **Copy device profile** in diagnostics, then adapt the matching entry in `config/review-devices.local.json` and retain a note identifying browser or standalone mode.
6. Run `npm run review:screenshots` again and inspect every current PNG.

Only use `dev:lan` on a network you trust; it binds the development server to all local interfaces.

## PWA and deployment

The manifest supports standalone installation without forcing orientation and provides 192×192 and 512×512 PNG icons plus a dedicated opaque 512×512 maskable icon for Android install surfaces. A versioned service worker caches only a minimal shell and uses network-first navigation fallback; live API responses are never added to its cache. This is a modest offline fallback, not a claim of complete offline operation.

Install the deployed HTTPS URL from a Chromium-family browser such as Chrome, Samsung Internet, or Edge. On the Samsung tablet, rotate to landscape before or after launch; Ghost Channel intentionally does not force landscape globally because portrait tablets and phones remain supported. Physical-device installation and icon rendering still require validation on the target hardware.

In an installed PWA, press and hold the transmission status in the upper-right corner for 1.2 seconds to open diagnostics without a keyboard or address bar. The existing `D` shortcut and `?diagnostics=1` URL remain available.

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
