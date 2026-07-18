import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const sizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const reviewDeviceSchema = z.object({
  browser: z.enum(["chromium", "webkit"]),
  viewport: sizeSchema,
  screen: sizeSchema.optional(),
  deviceScaleFactor: z.number().positive(),
  isMobile: z.boolean(),
  hasTouch: z.boolean(),
  provisional: z.boolean(),
  measurementNote: z.string().min(1),
});

export const reviewDevicesSchema = z.object({
  desktop: reviewDeviceSchema,
  tabletLandscape: reviewDeviceSchema,
  iphone17ProMaxPortrait: reviewDeviceSchema,
}).strict();

export type ReviewDevice = z.infer<typeof reviewDeviceSchema>;
export type ReviewDevices = z.infer<typeof reviewDevicesSchema>;

export const REVIEW_PROJECT_NAMES: Record<keyof ReviewDevices, string> = {
  desktop: "desktop",
  tabletLandscape: "tablet-landscape",
  iphone17ProMaxPortrait: "iphone-17-pro-max-portrait",
};

export function loadReviewDevices(root = process.cwd()): ReviewDevices {
  const localPath = path.join(root, "config/review-devices.local.json");
  const examplePath = path.join(root, "config/review-devices.example.json");
  const selectedPath = existsSync(localPath) ? localPath : examplePath;

  try {
    return reviewDevicesSchema.parse(
      JSON.parse(readFileSync(selectedPath, "utf8")) as unknown,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Invalid responsive review device config at ${selectedPath}: ${message}`);
  }
}
