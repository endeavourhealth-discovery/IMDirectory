import { StatusService } from "@/services";
import { useSharedStore } from "@/stores/sharedStore";

let inFlight: Promise<void> | undefined;

/** Reads the public and dev modes once. Simultaneous callers share one pair of requests; a failed read is tried again next time. */
export function setModes(): Promise<void> {
  const sharedStore = useSharedStore();
  if (typeof sharedStore.isPublicMode !== "undefined" && typeof sharedStore.isDevMode !== "undefined") return Promise.resolve();
  inFlight ??= loadModes().finally(() => (inFlight = undefined));
  return inFlight;
}

async function loadModes() {
  const sharedStore = useSharedStore();
  const [publicMode, devMode] = await Promise.all([
    typeof sharedStore.isPublicMode === "undefined" ? StatusService.isPublicMode() : undefined,
    typeof sharedStore.isDevMode === "undefined" ? StatusService.isDevMode() : undefined
  ]);
  if (typeof publicMode !== "undefined") sharedStore.updateIsPublicMode(publicMode);
  if (typeof devMode !== "undefined") sharedStore.updateIsDevMode(devMode);
}
