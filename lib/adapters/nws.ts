import { z } from "zod";
import type { LocationConfig } from "@/lib/config/env";
import type { Signal, SourceResult } from "@/lib/signals/types";

const pointsSchema = z.object({ properties: z.object({ forecast: z.url() }) });
const forecastSchema = z.object({
  properties: z.object({
    periods: z.array(
      z.object({
        number: z.number(),
        name: z.string(),
        startTime: z.iso.datetime({ offset: true }),
        endTime: z.iso.datetime({ offset: true }),
        temperature: z.number(),
        temperatureUnit: z.string(),
        windSpeed: z.string(),
        windDirection: z.string(),
        shortForecast: z.string(),
        detailedForecast: z.string(),
      }),
    ),
  }),
});
type Fetcher = typeof fetch;

export function normalizeNwsForecast(
  payload: unknown,
  config: LocationConfig,
  now = new Date(),
): Signal[] {
  return forecastSchema
    .parse(payload)
    .properties.periods.slice(0, 3)
    .map((period) => ({
      id: `nws-${period.startTime}`,
      channelId: "local-atmosphere",
      sourceId: "nws",
      label: `${config.label} · ${period.name}`,
      title: `${period.shortForecast}, ${period.temperature}°${period.temperatureUnit}`,
      body: `${period.detailedForecast} Wind ${period.windDirection} ${period.windSpeed}.`,
      media: {
        kind: "procedural",
        renderer: "weather-field",
        seed: period.startTime,
      },
      sourceUrl: "https://www.weather.gov/",
      attribution: "National Weather Service",
      fetchedAt: now.toISOString(),
      expiresAt: new Date(period.endTime).toISOString(),
      priority: 8,
      dwellMs: 12000,
    }));
}

export async function loadNws(
  config: LocationConfig | null,
  fetcher: Fetcher = fetch,
  now = new Date(),
): Promise<SourceResult> {
  const fetchedAt = now.toISOString();
  if (!config)
    return {
      sourceId: "nws",
      status: "failed",
      fetchedAt,
      signals: [],
      message:
        "Weather location is not configured. Set the Ghost Channel location environment variables.",
    };
  try {
    const init = {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "application/geo+json",
      },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 900 },
    };
    const pointsResponse = await fetcher(
      `https://api.weather.gov/points/${config.latitude},${config.longitude}`,
      init,
    );
    if (!pointsResponse.ok)
      throw new Error(`NWS points request returned ${pointsResponse.status}`);
    const forecastUrl = pointsSchema.parse(await pointsResponse.json())
      .properties.forecast;
    const forecastResponse = await fetcher(forecastUrl, init);
    if (!forecastResponse.ok)
      throw new Error(
        `NWS forecast request returned ${forecastResponse.status}`,
      );
    const signals = normalizeNwsForecast(
      await forecastResponse.json(),
      config,
      now,
    );
    return {
      sourceId: "nws",
      status: "fresh",
      fetchedAt,
      expiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
      signals,
    };
  } catch (error) {
    return {
      sourceId: "nws",
      status: "failed",
      fetchedAt,
      signals: [],
      message: error instanceof Error ? error.message : "NWS request failed.",
    };
  }
}
