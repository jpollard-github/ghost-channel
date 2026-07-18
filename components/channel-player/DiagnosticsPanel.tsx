import type { SignalBundle } from "@/lib/signals/types";
import styles from "./DiagnosticsPanel.module.css";

type DiagnosticsPanelProps = {
  bundle: SignalBundle;
  currentId: string;
  cacheState: string;
  lastRefreshError: string | null;
  decisions: string[];
};

export function DiagnosticsPanel({
  bundle,
  currentId,
  cacheState,
  lastRefreshError,
  decisions,
}: DiagnosticsPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Diagnostics">
      <h2>Signal diagnostics</h2>
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
        Cache: {cacheState}
        <br />
        Last refresh error: {lastRefreshError ?? "none"}
        <br />
        Current: {currentId}
        <br />
        Generated: {bundle.generatedAt}
        <br />
        Decisions: {decisions.slice(-5).join(" · ") || "initial"}
      </p>
    </aside>
  );
}
