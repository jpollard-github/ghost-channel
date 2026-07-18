import { loadLocalSignals } from "@/lib/adapters/local";
import { loadNws } from "@/lib/adapters/nws";
import { loadUsgs } from "@/lib/adapters/usgs";
import { getLocationConfig } from "@/lib/config/env";
import type { SignalBundle } from "@/lib/signals/types";

export async function loadSources(): Promise<SignalBundle> {
  const generatedAt = new Date().toISOString();
  const sources = await Promise.all([
    loadLocalSignals(),
    loadNws(getLocationConfig()),
    loadUsgs(),
  ]);
  return {
    generatedAt,
    sources,
    signals: sources.flatMap((source) => source.signals),
  };
}
