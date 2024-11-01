import { beforeEach, describe, expect, it, vi } from "vitest";
import { timeNow } from "@/helpers/Datetime/TimeNow";

describe("TimeNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("gets the current time in 24hr format __ above 12", () => {
    vi.setSystemTime(new Date("2023-03-27T15:25:01"));
    expect(timeNow()).toBe("15:25:01");
  });

  it("gets the current time in 24hr format __ below 12", () => {
    vi.setSystemTime(new Date("2023-03-27T03:25:01"));
    expect(timeNow()).toBe("03:25:01");
  });
});
