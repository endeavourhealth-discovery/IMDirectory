import { desanitise, sanitise } from "@/services/graphdb.service";
import { describe, it, expect } from "vitest";
import testData from "./graphdb.service.testData";

describe("graphdb service", () => {
  describe("desanitise", () => {
    it("can desanitise", () => {
      expect(desanitise(testData.RELEASE_STRING)).toEqual(testData.RELEASE_OBJECT);
    });

    it("can desanitise __ object with quote values", () => {
      expect(desanitise(testData.RELEASE_QUOTES_STRING)).toEqual(testData.RELEASE_QUOTES_OBJECT);
    });
  });

  describe("sanitise", () => {
    it("can sanitise", () => {
      expect(sanitise(testData.RELEASE_OBJECT)).toBe(testData.RELEASE_STRING_WRAPPED);
    });
  });

  it("can sanitise ___ object with quote values", () => {
    expect(sanitise(testData.RELEASE_QUOTES_OBJECT)).toBe(testData.RELEASE_QUOTES_STRING_WRAPPED);
  });
});
