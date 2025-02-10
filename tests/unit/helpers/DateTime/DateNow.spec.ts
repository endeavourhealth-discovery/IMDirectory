import { beforeEach, describe, expect, it, vi } from "vitest";
import { dateNow } from "@/helpers/Datetime/DateNow";

describe("DateNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("gets the current date", () => {
    vi.setSystemTime(new Date("2023-03-27"));
    expect(dateNow()).toBe("27/03/2023");
  });
});
