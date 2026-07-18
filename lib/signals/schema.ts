import { z } from "zod";

const mediaSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("image"),
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
    credit: z.string().optional(),
    rights: z.string().optional(),
  }),
  z.object({
    kind: z.literal("procedural"),
    renderer: z.enum(["weather-field", "seismic-rings", "quiet-grid"]),
    seed: z.string().optional(),
  }),
]);

export const signalSchema = z.object({
  id: z.string().min(1),
  channelId: z.string().min(1),
  sourceId: z.string().min(1),
  label: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  media: mediaSchema.optional(),
  sourceUrl: z.url().optional(),
  attribution: z.string().optional(),
  fetchedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().optional(),
  priority: z.number().int().min(0),
  dwellMs: z.number().int().min(1000).max(120000),
});

export const localSignalInputSchema = signalSchema.omit({
  fetchedAt: true,
  expiresAt: true,
});
export const signalBundleSchema = z.object({
  generatedAt: z.iso.datetime(),
  sources: z.array(
    z.object({
      sourceId: z.string(),
      status: z.enum(["fresh", "stale", "failed"]),
      fetchedAt: z.iso.datetime(),
      expiresAt: z.iso.datetime().optional(),
      signals: z.array(signalSchema),
      message: z.string().optional(),
    }),
  ),
  signals: z.array(signalSchema),
});
