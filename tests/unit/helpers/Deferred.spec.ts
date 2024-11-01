import { deferred } from "@/helpers/Deferred";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

describe("deferred", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("can create a promise to resolve/reject use at a later date", () => {
    const deferredPromise = deferred();
    expect(deferredPromise.promise).toBeTypeOf("object");
    expect(deferredPromise.reject).toBeTypeOf("function");
    expect(deferredPromise.resolve).toBeTypeOf("function");
  });

  it("can resolve the promise", async () => {
    const deferredPromise = deferred();
    let result;
    deferredPromise.promise.then(res => (result = res));
    deferredPromise.resolve("resolved");
    await flushPromises();
    expect(result).toEqual("resolved");
  });

  it("can reject the promise", async () => {
    const deferredPromise = deferred();
    let result;
    deferredPromise.promise.catch(res => (result = res));
    deferredPromise.reject("reject");
    await flushPromises();
    expect(result).toEqual("reject");
  });

  it("timesout and rejects", async () => {
    vi.useFakeTimers();
    const deferredPromise = deferred(600);
    let result;
    deferredPromise.promise.catch(res => (result = res));
    vi.advanceTimersByTime(800);
    await flushPromises();
    expect(result).toEqual("Timedout");
  });
});
