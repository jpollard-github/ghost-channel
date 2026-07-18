import type { Signal } from "@/lib/signals/types";
import { SeismicRings } from "@/components/visuals/SeismicRings";
import { WeatherField } from "@/components/visuals/WeatherField";
import visualStyles from "@/components/visuals/Visuals.module.css";
import styles from "./ChannelPlayer.module.css";

export function SignalStage({ signal }: { signal: Signal }) {
  const renderer = signal.media?.kind === "procedural" ? signal.media.renderer : "quiet-grid";
  return <div className={styles.stage} data-testid="signal-stage"><section className={styles.copy}><div className={styles.eyebrow}>{signal.label}</div><h1 className={styles.title}>{signal.title}</h1>{signal.body ? <p className={styles.body}>{signal.body}</p> : null}</section><div className={styles.visual}>{renderer === "weather-field" ? <WeatherField /> : renderer === "seismic-rings" ? <SeismicRings /> : <div className={visualStyles.grid} role="img" aria-label="Quiet abstract grid" />}</div></div>;
}
