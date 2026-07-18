export type SourceHealth = "fresh" | "stale" | "failed";

export type SignalMedia =
  | {
      kind: "image";
      src: string;
      alt: string;
      caption?: string;
      credit?: string;
      rights?: string;
    }
  | {
      kind: "procedural";
      renderer: "weather-field" | "seismic-rings" | "quiet-grid";
      seed?: string;
    };

export type Signal = {
  id: string;
  channelId: string;
  sourceId: string;
  label: string;
  title: string;
  body?: string;
  media?: SignalMedia;
  sourceUrl?: string;
  attribution?: string;
  fetchedAt: string;
  expiresAt?: string;
  priority: number;
  dwellMs: number;
};

export type SourceResult = {
  sourceId: string;
  status: SourceHealth;
  fetchedAt: string;
  expiresAt?: string;
  signals: Signal[];
  message?: string;
};
export type SignalBundle = {
  generatedAt: string;
  sources: SourceResult[];
  signals: Signal[];
};
