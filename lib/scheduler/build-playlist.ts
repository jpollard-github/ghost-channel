import type { Signal } from "@/lib/signals/types";

function hash(seed: string) {
  let value = 2166136261;
  for (const char of seed)
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}
function score(signal: Signal, seed: string) {
  return (
    signal.priority * 1_000_000 + hash(`${seed}:${signal.id}`) / 0xffffffff
  );
}

export function buildPlaylist(
  input: Signal[],
  seed = "ghost-channel",
): Signal[] {
  const remaining = [
    ...new Map(input.map((signal) => [signal.id, signal])).values(),
  ].sort((a, b) => score(b, seed) - score(a, seed));
  const result: Signal[] = [];
  while (remaining.length) {
    const previous = result.at(-1);
    let index = remaining.findIndex(
      (signal) => signal.channelId !== previous?.channelId,
    );
    if (index < 0) index = 0;
    result.push(remaining.splice(index, 1)[0]);
  }
  return result;
}
