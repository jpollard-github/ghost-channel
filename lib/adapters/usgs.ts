import { z } from "zod";
import type { Signal, SourceResult } from "@/lib/signals/types";

const usgsSchema = z.object({
  features: z.array(
    z.object({
      id: z.string(),
      properties: z.object({
        mag: z.number().nullable(),
        place: z.string().nullable(),
        time: z.number(),
        url: z.url(),
        alert: z.string().nullable().optional(),
        tsunami: z.number().optional(),
      }),
    }),
  ),
});
type Fetcher = typeof fetch;
export const USGS_FEED =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export function normalizeUsgs(payload: unknown, now = new Date()): Signal[] {
  return usgsSchema
    .parse(payload)
    .features.filter((event) => event.properties.mag !== null)
    .sort((a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0))
    .slice(0, 4)
    .map((event) => {
      const p = event.properties;
      const details = [
        `Recorded ${new Date(p.time).toLocaleString("en-US", { timeZone: "UTC" })} UTC.`,
      ];
      if (p.alert)
        details.push(
          `${p.alert[0].toUpperCase()}${p.alert.slice(1)} alert level.`,
        );
      if (p.tsunami === 1)
        details.push(
          "USGS tsunami flag is set; consult official local guidance.",
        );
      return {
        id: `usgs-${event.id}`,
        channelId: "world-pulse",
        sourceId: "usgs",
        label: "World pulse",
        title: `Magnitude ${p.mag?.toFixed(1)} · ${p.place ?? "Location pending"}`,
        body: details.join(" "),
        media: {
          kind: "procedural",
          renderer: "seismic-rings",
          seed: event.id,
        },
        sourceUrl: p.url,
        attribution: "U.S. Geological Survey",
        fetchedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
        priority: Math.max(4, Math.round((p.mag ?? 0) * 2)),
        dwellMs: 11000,
      };
    });
}

export async function loadUsgs(
  fetcher: Fetcher = fetch,
  now = new Date(),
): Promise<SourceResult> {
  const fetchedAt = now.toISOString();
  try {
    const response = await fetcher(USGS_FEED, {
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 600 },
    });
    if (!response.ok)
      throw new Error(`USGS request returned ${response.status}`);
    return {
      sourceId: "usgs",
      status: "fresh",
      fetchedAt,
      expiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
      signals: normalizeUsgs(await response.json(), now),
    };
  } catch (error) {
    return {
      sourceId: "usgs",
      status: "failed",
      fetchedAt,
      signals: [],
      message: error instanceof Error ? error.message : "USGS request failed.",
    };
  }
}
