"use client";

import { useEffect, useState } from "react";
import styles from "./DiagnosticsPanel.module.css";

type Metrics = {
  inner: { width: number; height: number };
  visualViewport: { width: number; height: number } | null;
  screen: { width: number; height: number };
  deviceScaleFactor: number;
  orientation: string | null;
  standalone: boolean;
  userAgent: string;
  hasTouch: boolean;
};

function readMetrics(): Metrics {
  return {
    inner: { width: window.innerWidth, height: window.innerHeight },
    visualViewport: window.visualViewport
      ? {
          width: Math.round(window.visualViewport.width * 100) / 100,
          height: Math.round(window.visualViewport.height * 100) / 100,
        }
      : null,
    screen: { width: window.screen.width, height: window.screen.height },
    deviceScaleFactor: window.devicePixelRatio,
    orientation: window.screen.orientation?.type ?? null,
    standalone: window.matchMedia("(display-mode: standalone)").matches,
    userAgent: window.navigator.userAgent,
    hasTouch: window.navigator.maxTouchPoints > 0,
  };
}

export function DeviceMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    const update = () => setMetrics(readMetrics());
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.screen.orientation?.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.screen.orientation?.removeEventListener("change", update);
    };
  }, []);

  async function copyProfile() {
    if (!metrics) return;
    const profile = {
      browser: /iPhone|iPad|AppleWebKit/.test(metrics.userAgent)
        ? "webkit"
        : "chromium",
      viewport: metrics.inner,
      screen: metrics.screen,
      deviceScaleFactor: metrics.deviceScaleFactor,
      isMobile: metrics.hasTouch,
      hasTouch: metrics.hasTouch,
      provisional: false,
      measurementNote: metrics.standalone
        ? "Measured in installed standalone mode."
        : "Measured in ordinary browser mode.",
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      setCopyStatus("Device profile copied.");
    } catch {
      setCopyStatus("Clipboard unavailable. Select the metrics manually.");
    }
  }

  if (!metrics) return <p className={styles.metrics}>Reading device metrics…</p>;

  return (
    <section className={styles.metrics} aria-labelledby="device-metrics-title">
      <h3 id="device-metrics-title">Device metrics</h3>
      <dl>
        <div><dt>Window</dt><dd>{metrics.inner.width} × {metrics.inner.height}</dd></div>
        <div><dt>Visual viewport</dt><dd>{metrics.visualViewport ? `${metrics.visualViewport.width} × ${metrics.visualViewport.height}` : "unavailable"}</dd></div>
        <div><dt>Screen</dt><dd>{metrics.screen.width} × {metrics.screen.height}</dd></div>
        <div><dt>DPR</dt><dd>{metrics.deviceScaleFactor}</dd></div>
        <div><dt>Orientation</dt><dd>{metrics.orientation ?? "unavailable"}</dd></div>
        <div><dt>Standalone</dt><dd>{metrics.standalone ? "yes" : "no"}</dd></div>
        <div className={styles.userAgent}><dt>User agent</dt><dd>{metrics.userAgent}</dd></div>
      </dl>
      <button className={styles.action} type="button" onClick={() => void copyProfile()}>
        Copy device profile
      </button>
      <span className={styles.copyStatus} role="status">{copyStatus}</span>
    </section>
  );
}
