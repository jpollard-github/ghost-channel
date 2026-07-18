import { signalBundleSchema } from "@/lib/signals/schema";
import type { SignalBundle } from "@/lib/signals/types";

const DB = "ghost-channel";
const STORE = "bundles";
const KEY = "latest";
export function serializeBundle(bundle: SignalBundle) {
  return JSON.stringify(signalBundleSchema.parse(bundle));
}
export function deserializeBundle(value: string): SignalBundle | null {
  try {
    return signalBundleSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function cacheBundle(bundle: SignalBundle) {
  if (!bundle.signals.length) return;
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(serializeBundle(bundle), KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
export async function readCachedBundle(): Promise<SignalBundle | null> {
  const db = await database();
  return new Promise((resolve) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => {
      db.close();
      resolve(
        typeof request.result === "string"
          ? deserializeBundle(request.result)
          : null,
      );
    };
    request.onerror = () => {
      db.close();
      resolve(null);
    };
  });
}
