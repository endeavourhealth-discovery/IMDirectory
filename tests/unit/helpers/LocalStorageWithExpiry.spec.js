import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry.ts";
import { vi, afterEach, it } from "vitest";

describe("localStorageWithExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("deletes after expiry", () => {
    localStorageWithExpiry.setItem("expiryTest", "expiryTest", 3000);
    vi.advanceTimersByTime(2000);
    expect(localStorageWithExpiry.getItem("expiryTest")).toBe("expiryTest");
    vi.advanceTimersByTime(2000);
    expect(localStorageWithExpiry.getItem("expiryTest")).toBe(null);
  });
  it("parses boolean correctly", () => {
    localStorageWithExpiry.setItem("expiryTest", true, 3000);
    vi.advanceTimersByTime(2000);
    expect(localStorageWithExpiry.getItem("expiryTest")).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(localStorageWithExpiry.getItem("expiryTest")).toBe(null);
  });
});
