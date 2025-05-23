import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatDateTime } from "@/helpers/Datetime/FormatDateTime";

describe("FormatDateTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("gets the current date", () => {
    const date = new Date("2023-03-27T03:24:00");
    vi.setSystemTime(date);
    expect(formatDateTime(date)).toBe("27/03/2023 03:24:00");
  });
});
