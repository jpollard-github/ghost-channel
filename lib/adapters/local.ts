import { readFile } from "node:fs/promises";
import path from "node:path";
import { localSignalInputSchema } from "@/lib/signals/schema";
import type { SourceResult } from "@/lib/signals/types";

export async function loadLocalSignals(
  now = new Date(),
): Promise<SourceResult> {
  const fetchedAt = now.toISOString();
  try {
    const raw: unknown = JSON.parse(
      await readFile(
        path.join(process.cwd(), "data/local-signals.json"),
        "utf8",
      ),
    );
    const parsed = localSignalInputSchema.array().parse(raw);
    return {
      sourceId: "local",
      status: "fresh",
      fetchedAt,
      signals: parsed.map((signal) => ({ ...signal, fetchedAt })),
    };
  } catch (error) {
    return {
      sourceId: "local",
      status: "failed",
      fetchedAt,
      signals: [],
      message:
        error instanceof Error
          ? `Local signal validation failed: ${error.message}`
          : "Local signal validation failed.",
    };
  }
}
