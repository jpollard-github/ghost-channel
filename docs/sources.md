# Sources

## Local

`data/local-signals.json` contains original project programming and is read server-side. It has no external attribution requirement and remains available through network failures.

## National Weather Service

The configured latitude/longitude is resolved through `api.weather.gov/points`, then its forecast URL is fetched with a descriptive User-Agent. Forecasts refresh conservatively around 15 minutes. NWS period timestamps may contain local UTC offsets; the adapter converts signal expiration times to canonical UTC ISO strings before returning normalized data. Missing configuration, timeout, HTTP error, or invalid payload produces a failed source with diagnostics; upstream HTML is never rendered. NWS attribution and links remain attached.

## U.S. Geological Survey

The documented `2.5_day.geojson` summary feed refreshes around 10 minutes. Only a few higher-magnitude recent events are normalized. Magnitude, place, event time, event URL, alert, and tsunami flag are retained when available, with neutral language and a procedural rings visual.

## NASA APOD — deferred

APOD is not implemented. Future support must keep API keys server-side and retain copyright, credit, caption, and rights metadata. Media use must follow the applicable NASA and third-party terms.

Failures are visible source health, never empty successes. Refresh timestamps support relative UI freshness. Initial client refresh failures are summarized only in diagnostics and remain distinct from cache availability. Cached client data is explicitly stale; live API responses are not indefinitely service-worker cached.
