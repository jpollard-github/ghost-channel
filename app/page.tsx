import { Suspense } from "react";
import { ChannelPlayer } from "@/components/channel-player/ChannelPlayer";
import { loadLocalSignals } from "@/lib/adapters/local";
import type { SignalBundle } from "@/lib/signals/types";

export default async function Home() {
  const local = await loadLocalSignals();
  const fallback: SignalBundle = { generatedAt: local.fetchedAt, sources: [local], signals: local.signals };
  return <Suspense fallback={<main aria-label="Loading Ghost Channel" />}><ChannelPlayer fallback={fallback} /></Suspense>;
}
