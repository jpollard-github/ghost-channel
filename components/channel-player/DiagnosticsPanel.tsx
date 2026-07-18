import type { SignalBundle } from "@/lib/signals/types";
import { DeviceMetrics } from "./DeviceMetrics";
import styles from "./DiagnosticsPanel.module.css";

type DiagnosticsPanelProps = {
  bundle: SignalBundle;
  currentId: string;
  cacheState: string;
  lastRefreshAttempt: string | null;
  lastSuccessfulRefresh: string | null;
  nextScheduledRefresh: string | null;
  lastRefreshError: string | null;
  decisions: string[];
  onClose: () => void;
};

export function DiagnosticsPanel({
  bundle,
  currentId,
  cacheState,
  lastRefreshAttempt,
  lastSuccessfulRefresh,
  nextScheduledRefresh,
  lastRefreshError,
  decisions,
  onClose,
}: DiagnosticsPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Diagnostics" data-testid="diagnostics-panel">
      <header className={styles.header}>
        <h2>Signal diagnostics</h2>
        <button className={styles.close} type="button" onClick={onClose} aria-label="Close diagnostics">Close</button>
      </header>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Health</th>
            <th>Signals</th>
            <th>Fetched</th>
          </tr>
        </thead>
        <tbody>
          {bundle.sources.map((source) => (
            <tr key={source.sourceId}>
              <td>{source.sourceId}</td>
              <td>{source.status}</td>
              <td>{source.signals.length}</td>
              <td>{new Date(source.fetchedAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.detail}>
        Open diagnostics: press and hold the transmission status for 1.2 seconds,
        press D on a keyboard, or use ?diagnostics=1.
        <br />
        Cache: {cacheState}
        <br />
        Last refresh attempt: {lastRefreshAttempt ?? "not yet"}
        <br />
        Last successful refresh: {lastSuccessfulRefresh ?? "not yet"}
        <br />
        Next scheduled refresh: {nextScheduledRefresh ?? "pending"}
        <br />
        Latest error: {lastRefreshError ?? "none"}
        <br />
        Current: {currentId}
        <br />
        Generated: {bundle.generatedAt}
        <br />
        Decisions: {decisions.slice(-5).join(" · ") || "initial"}
      </p>
      <DeviceMetrics />
    </aside>
  );
}
