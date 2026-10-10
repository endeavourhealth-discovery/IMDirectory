import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPinia, setActivePinia } from "pinia";

import { setModes } from "@/router/methods/setModes";
import { StatusService } from "@/services";
import { useSharedStore } from "@/stores/sharedStore";

describe("setModes", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("reads the public mode into the store", async () => {
    vi.spyOn(StatusService, "isPublicMode").mockResolvedValue(true);
    await setModes();
    expect(useSharedStore().isPublicMode).toBe(true);
  });

  it("reads the dev mode too when the store has no value for it", async () => {
    vi.spyOn(StatusService, "isPublicMode").mockResolvedValue(true);
    vi.spyOn(StatusService, "isDevMode").mockResolvedValue(false);
    const store = useSharedStore();
    store.isDevMode = undefined as unknown as boolean;
    await setModes();
    expect(store.isDevMode).toBe(false);
  });

  it("shares one pair of requests between simultaneous callers", async () => {
    const isPublicMode = vi.spyOn(StatusService, "isPublicMode").mockResolvedValue(true);
    await Promise.all([setModes(), setModes(), setModes()]);
    expect(isPublicMode).toHaveBeenCalledTimes(1);
  });

  it("makes no requests once both modes are known", async () => {
    vi.spyOn(StatusService, "isPublicMode").mockResolvedValue(true);
    await setModes();
    const again = vi.spyOn(StatusService, "isPublicMode");
    again.mockClear();
    await setModes();
    expect(again).not.toHaveBeenCalled();
  });

  it("tries again on the next call when a mode could not be read", async () => {
    const isPublicMode = vi.spyOn(StatusService, "isPublicMode").mockResolvedValueOnce(undefined as unknown as boolean).mockResolvedValue(true);
    await setModes();
    expect(useSharedStore().isPublicMode).toBeUndefined();
    await setModes();
    expect(isPublicMode).toHaveBeenCalledTimes(2);
    expect(useSharedStore().isPublicMode).toBe(true);
  });
});
