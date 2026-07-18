"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildPlaylist } from "@/lib/scheduler/build-playlist";
import { cacheBundle, readCachedBundle } from "@/lib/cache/client-signal-cache";
import { signalBundleSchema } from "@/lib/signals/schema";
import type { SignalBundle } from "@/lib/signals/types";
import {
  nextScheduledRefresh,
  shouldRefreshWhenVisible,
  SIGNAL_REFRESH_INTERVAL_MS,
  withoutExpiredSignals,
} from "@/lib/refresh/signal-refresh";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";
import { SignalStage } from "./SignalStage";
import styles from "./ChannelPlayer.module.css";

class RefreshError extends Error {}

function relativeTime(iso: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
  return minutes < 1
    ? "updated just now"
    : `updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}
export function ChannelPlayer({ fallback }: { fallback: SignalBundle }) {
  const searchParams = useSearchParams();
  const [bundle, setBundle] = useState(fallback);
  const [cacheState, setCacheState] = useState("bundled fallback");
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState<string | null>(
    null,
  );
  const [lastSuccessfulRefresh, setLastSuccessfulRefresh] = useState<
    string | null
  >(null);
  const [nextRefresh, setNextRefresh] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [diagnostics, setDiagnostics] = useState(
    searchParams.get("diagnostics") === "1",
  );
  const [decisions, setDecisions] = useState<string[]>([]);
  const playlist = useMemo(
    () => buildPlaylist(bundle.signals, bundle.generatedAt.slice(0, 10)),
    [bundle],
  );
  const signal =
    playlist[index % Math.max(playlist.length, 1)] ?? fallback.signals[0];
  const currentSignalId = useRef<string | null>(null);
  useEffect(() => {
    currentSignalId.current = signal?.id ?? null;
  }, [signal?.id]);
  const move = useCallback(
    (delta: number, reason: string) => {
      setIndex(
        (current) => (current + delta + playlist.length) % playlist.length,
      );
      setDecisions((items) => [...items.slice(-8), reason]);
    },
    [playlist.length],
  );
  useEffect(() => {
    let active = true;
    let inFlight = false;
    let timer: number | null = null;
    let lastSuccessfulRefreshMs: number | null = null;
    let controller: AbortController | null = null;

    function schedule(completedAtMs: number) {
      if (!active) return;
      if (timer !== null) window.clearTimeout(timer);
      const scheduledAt = nextScheduledRefresh(completedAtMs);
      setNextRefresh(new Date(scheduledAt).toISOString());
      timer = window.setTimeout(
        () => void refresh("scheduled"),
        SIGNAL_REFRESH_INTERVAL_MS,
      );
    }

    async function refresh(trigger: "startup" | "scheduled" | "online" | "visible") {
      if (inFlight || !active) return;
      inFlight = true;
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      setNextRefresh(null);
      const attemptedAtMs = Date.now();
      setLastRefreshAttempt(new Date(attemptedAtMs).toISOString());
      setBundle((current) => withoutExpiredSignals(current, attemptedAtMs));
      controller = new AbortController();

      try {
        const response = await fetch("/api/signals", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new RefreshError(
            `Server response failed (HTTP ${response.status}).`,
          );
        }

        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new RefreshError("Server response was not valid JSON.");
        }

        const result = signalBundleSchema.safeParse(payload);
        if (!result.success) {
          throw new RefreshError("Server bundle failed validation.");
        }
        const accepted = withoutExpiredSignals(result.data, Date.now());
        if (!accepted.signals.length) {
          throw new RefreshError("Server bundle contained no signals.");
        }

        if (active) {
          const nextPlaylist = buildPlaylist(
            accepted.signals,
            accepted.generatedAt.slice(0, 10),
          );
          const preservedIndex = nextPlaylist.findIndex(
            (candidate) => candidate.id === currentSignalId.current,
          );
          setBundle(accepted);
          setIndex(preservedIndex >= 0 ? preservedIndex : 0);
          setCacheState("fresh server bundle");
          setLastRefreshError(null);
          lastSuccessfulRefreshMs = Date.now();
          setLastSuccessfulRefresh(
            new Date(lastSuccessfulRefreshMs).toISOString(),
          );
          setDecisions((items) => [
            ...items.slice(-8),
            `${trigger} refresh accepted`,
          ]);
        }
        try {
          await cacheBundle(accepted);
        } catch {
          if (active)
            setCacheState("fresh server bundle; IndexedDB unavailable");
        }
      } catch (error) {
        if (active) {
          setLastRefreshError(
            error instanceof RefreshError
              ? error.message
              : "Server request was unavailable.",
          );
        }

        if (trigger === "startup") {
          try {
            const cached = await readCachedBundle();
            if (!active) return;
            if (cached?.signals.length) {
              const stale = withoutExpiredSignals(
                {
                  ...cached,
                  sources: cached.sources.map((source) => ({
                    ...source,
                    status: source.status === "failed" ? "failed" : "stale",
                  })),
                },
                Date.now(),
              );
              if (stale.signals.length) {
                setBundle(stale);
                setCacheState("stale IndexedDB bundle");
              } else {
                setCacheState("IndexedDB cache empty");
              }
            } else {
              setCacheState("IndexedDB cache empty");
            }
          } catch {
            if (active) setCacheState("IndexedDB cache unavailable");
          }
        }
      } finally {
        inFlight = false;
        controller = null;
        schedule(Date.now());
      }
    }

    function onOnline() {
      void refresh("online");
    }

    function onVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        shouldRefreshWhenVisible(Date.now(), lastSuccessfulRefreshMs)
      ) {
        void refresh("visible");
      }
    }

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibilityChange);
    void refresh("startup");
    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
      controller?.abort();
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
  useEffect(() => {
    if (paused || !signal) return;
    const timer = window.setTimeout(
      () => move(1, `auto after ${signal.id}`),
      signal.dwellMs,
    );
    return () => window.clearTimeout(timer);
  }, [move, paused, signal]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") move(-1, "keyboard previous");
      if (event.key === "ArrowRight") move(1, "keyboard next");
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
      if (event.key.toLowerCase() === "d") setDiagnostics((value) => !value);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);
  if (!signal)
    return (
      <main className={styles.player}>
        <p>No signals are available.</p>
      </main>
    );
  return (
    <main className={styles.player}>
      <ServiceWorkerRegistration />
      <span className={styles.status}>
        {paused ? "TRANSMISSION PAUSED" : "RECEIVING"}
      </span>
      <SignalStage signal={signal} />
      <footer className={styles.footer}>
        <div className={styles.meta}>
          <span>{relativeTime(signal.fetchedAt)}</span>
          {signal.sourceUrl ? (
            <a
              className={styles.sourceLink}
              href={signal.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {signal.attribution ?? "View source"} ↗
            </a>
          ) : (
            <span>{signal.attribution ?? "Ghost Channel local"}</span>
          )}
        </div>
        <nav className={styles.controls} aria-label="Playback controls">
          <button
            className={styles.button}
            onClick={() => move(-1, "control previous")}
          >
            Previous
          </button>
          <button
            className={styles.button}
            onClick={() => move(1, "control next")}
          >
            Next
          </button>
          <button
            className={styles.button}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </nav>
      </footer>
      {diagnostics ? (
        <DiagnosticsPanel
          bundle={bundle}
          currentId={signal.id}
          cacheState={cacheState}
          lastRefreshAttempt={lastRefreshAttempt}
          lastSuccessfulRefresh={lastSuccessfulRefresh}
          nextScheduledRefresh={nextRefresh}
          lastRefreshError={lastRefreshError}
          decisions={decisions}
          onClose={() => setDiagnostics(false)}
        />
      ) : null}
    </main>
  );
}
