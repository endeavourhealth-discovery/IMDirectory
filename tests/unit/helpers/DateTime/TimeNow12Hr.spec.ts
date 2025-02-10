import { beforeEach, describe, expect, it, vi } from "vitest";
import { timeNow12Hr } from "@/helpers/Datetime/TimeNow12Hr";

describe("TimeNow12Hr", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("gets the current time in AM/PM format __ low pm", () => {
    vi.setSystemTime(new Date("2023-03-27T15:25:01"));
    expect(timeNow12Hr()).toBe("03:25:01PM");
  });

  it("gets the current time in AM/PM format __ high pm", () => {
    vi.setSystemTime("2023-03-27T23:25:01");
    expect(timeNow12Hr()).toBe("11:25:01PM");
  });

  it("gets the current time in AM/PM format __ low am", () => {
    vi.setSystemTime("2023-03-27T03:25:01");
    expect(timeNow12Hr()).toBe("03:25:01AM");
  });

  it("gets the current time in AM/PM format __ high am", () => {
    vi.setSystemTime("2023-03-27T11:25:01");
    expect(timeNow12Hr()).toBe("11:25:01AM");
  });
});
