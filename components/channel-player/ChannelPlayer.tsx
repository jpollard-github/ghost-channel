"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildPlaylist } from "@/lib/scheduler/build-playlist";
import { cacheBundle, readCachedBundle } from "@/lib/cache/client-signal-cache";
import { signalBundleSchema } from "@/lib/signals/schema";
import type { SignalBundle } from "@/lib/signals/types";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";
import { SignalStage } from "./SignalStage";
import styles from "./ChannelPlayer.module.css";

function relativeTime(iso: string) { const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)); return minutes < 1 ? "updated just now" : `updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`; }
export function ChannelPlayer({ fallback }: { fallback: SignalBundle }) {
  const searchParams = useSearchParams(); const [bundle, setBundle] = useState(fallback); const [cacheState, setCacheState] = useState("bundled fallback"); const [index, setIndex] = useState(0); const [paused, setPaused] = useState(false); const [diagnostics, setDiagnostics] = useState(searchParams.get("diagnostics") === "1"); const [decisions, setDecisions] = useState<string[]>([]);
  const playlist = useMemo(() => buildPlaylist(bundle.signals, bundle.generatedAt.slice(0, 10)), [bundle]); const signal = playlist[index % Math.max(playlist.length, 1)] ?? fallback.signals[0];
  const move = useCallback((delta: number, reason: string) => { setIndex((current) => (current + delta + playlist.length) % playlist.length); setDecisions((items) => [...items.slice(-8), reason]); }, [playlist.length]);
  useEffect(() => { let active = true; async function refresh() { try { const response = await fetch("/api/signals"); if (!response.ok) throw new Error(String(response.status)); const next = signalBundleSchema.parse(await response.json()); if (active && next.signals.length) { setBundle(next); setCacheState("fresh server bundle"); await cacheBundle(next); } } catch { const cached = await readCachedBundle(); if (active && cached?.signals.length) { setBundle({ ...cached, sources: cached.sources.map((source) => ({ ...source, status: source.status === "failed" ? "failed" : "stale" })) }); setCacheState("stale IndexedDB bundle"); } } } void refresh(); return () => { active = false; }; }, []);
  useEffect(() => { if (paused || !signal) return; const timer = window.setTimeout(() => move(1, `auto after ${signal.id}`), signal.dwellMs); return () => window.clearTimeout(timer); }, [move, paused, signal]);
  useEffect(() => { function onKey(event: KeyboardEvent) { if (event.key === "ArrowLeft") move(-1, "keyboard previous"); if (event.key === "ArrowRight") move(1, "keyboard next"); if (event.key === " ") { event.preventDefault(); setPaused((value) => !value); } if (event.key.toLowerCase() === "d") setDiagnostics((value) => !value); } window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [move]);
  if (!signal) return <main className={styles.player}><p>No signals are available.</p></main>;
  return <main className={styles.player}><ServiceWorkerRegistration /><span className={styles.status}>{paused ? "TRANSMISSION PAUSED" : "RECEIVING"}</span><SignalStage signal={signal} /><footer className={styles.footer}><div className={styles.meta}><span>{relativeTime(signal.fetchedAt)}</span>{signal.sourceUrl ? <a className={styles.sourceLink} href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.attribution ?? "View source"} ↗</a> : <span>{signal.attribution ?? "Ghost Channel local"}</span>}</div><nav className={styles.controls} aria-label="Playback controls"><button className={styles.button} onClick={() => move(-1, "control previous")}>Previous</button><button className={styles.button} onClick={() => move(1, "control next")}>Next</button><button className={styles.button} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? "Resume" : "Pause"}</button></nav></footer>{diagnostics ? <DiagnosticsPanel bundle={bundle} currentId={signal.id} cacheState={cacheState} decisions={decisions} /> : null}</main>;
}
