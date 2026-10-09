import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserStore } from "@endeavour/vue-library";

import { createPinia, setActivePinia } from "pinia";

import { cachedRequest, clearRequestCache } from "@/services/requestCache";

describe("requestCache", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    clearRequestCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shares one request between simultaneous callers", async () => {
    const fetcher = vi.fn().mockResolvedValue("a");
    const [first, second] = await Promise.all([cachedRequest("k", fetcher), cachedRequest("k", fetcher)]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect([first, second]).toEqual(["a", "a"]);
  });

  it("does not keep results when no ttl is given", async () => {
    const fetcher = vi.fn().mockResolvedValue("a");
    await cachedRequest("k", fetcher);
    await cachedRequest("k", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps results until the ttl expires", async () => {
    const fetcher = vi.fn().mockResolvedValue("a");
    await cachedRequest("k", fetcher, 1000);
    await cachedRequest("k", fetcher, 1000);
    expect(fetcher).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1001);
    await cachedRequest("k", fetcher, 1000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not keep failures", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue("a");
    await expect(cachedRequest("k", fetcher, 1000)).rejects.toThrow("boom");
    expect(await cachedRequest("k", fetcher, 1000)).toBe("a");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not keep empty responses", async () => {
    const fetcher = vi.fn().mockResolvedValue(undefined);
    await cachedRequest("k", fetcher, 1000);
    await cachedRequest("k", fetcher, 1000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps separate results per key", async () => {
    const fetcher = vi.fn().mockImplementation(async () => "x");
    await cachedRequest("one", fetcher, 1000);
    await cachedRequest("two", fetcher, 1000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps separate results when the user graph is toggled", async () => {
    const fetcher = vi.fn().mockResolvedValue("a");
    await cachedRequest("k", fetcher, 1000);
    useUserStore().includeUserGraph = !useUserStore().includeUserGraph;
    await cachedRequest("k", fetcher, 1000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
