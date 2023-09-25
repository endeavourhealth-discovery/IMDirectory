import { getDisplayFromDate } from "@/helpers/UtilityMethods";
import { describe, expect, it } from "vitest";

describe("getDisplayFromDate", () => {
  it("should return today when 0 days of difference", () => {
    const date = new Date("01/01/2010");
    const now = new Date("01/01/2010");
    expect(getDisplayFromDate(now, date)).toBe("today");
  });

  it("should return yesterday when 1 day of difference", () => {
    const date = new Date("01/01/2010");
    const now = new Date("01/02/2010");
    expect(getDisplayFromDate(now, date)).toBe("yesterday");
  });

  it("should return this week when more than 1 day of difference", () => {
    const date = new Date("01/01/2010");
    const now = new Date("01/03/2010");
    expect(getDisplayFromDate(now, date)).toBe("this week");
  });

  it("should return this week when less than 7 days of difference", () => {
    const date = new Date("12/29/2009");
    const now = new Date("01/01/2010");
    expect(getDisplayFromDate(now, date)).toBe("this week");
  });

  it("should return this month when within the same month", () => {
    const date = new Date("01/01/2010");
    const now = new Date("01/31/2010");
    expect(getDisplayFromDate(now, date)).toBe("this month");
  });

  it("should return this month when within the same year", () => {
    const date = new Date("01/01/2010");
    const now = new Date("02/01/2010");
    expect(getDisplayFromDate(now, date)).toBe("this year");
  });
});
