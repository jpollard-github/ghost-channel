# Architecture

The flow is `server adapters → SourceResult[] → SignalBundle → /api/signals → IndexedDB cache → scheduler → player`. Ghost Channel owns the normalized model; NWS and USGS shapes stop inside their adapters.

The local adapter validates repository JSON and is independent of networks. External adapters bound requests, validate payloads, preserve source links, and return failed results rather than throwing through the aggregate. `loadSources` starts them together so one unavailable source cannot erase another.

`buildPlaylist` is pure, seeded, stable-ID deduplicating, priority-aware, and avoids adjacent channels whenever an alternative remains. React handles playback and diagnostics but does not understand upstream formats.

The initial page server-renders local fallback. The client prefers a fresh same-origin bundle, validates the complete bundle before replacing that fallback, persists only non-empty validated bundles, and marks a recovered cached bundle stale. A failed HTTP response, invalid JSON, schema rejection, and empty bundle each produce a concise diagnostics-only refresh error. IndexedDB hit, empty, and unavailable states are tracked separately so a cache problem cannot obscure a server problem. Procedural visuals are lightweight CSS and respect reduced motion. The service worker is a separate minimal shell fallback and does not own live data resilience.

All timestamps that cross the adapter boundary are canonical UTC ISO strings. Adapters may accept source-native offset timestamps while parsing upstream payloads, but they must convert them before constructing a `Signal` or `SourceResult`.

Extension points are new adapters returning `SourceResult`, new procedural renderers referenced by normalized media, and scheduling policy refinements. Public ArcadeGhosts data may be consumed later only through a documented public interface.
