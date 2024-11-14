import { beforeEach, describe, expect, it, vi } from "vitest";
import { dateNowReverse } from "@/helpers/Datetime/DateNowReverse";

describe("DateNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("gets the current date", () => {
    vi.setSystemTime(new Date("2023-03-27"));
    expect(dateNowReverse()).toBe("2023/03/27");
  });
});
