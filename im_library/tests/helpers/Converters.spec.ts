import { enumToArray, iriToUrl, urlToIri } from "@/helpers/Converters";
import { describe, expect, it } from "vitest";

describe("Converters", () => {
  describe("iriToUrl", () => {
    it("converts an iri to a url", () => {
      expect(iriToUrl("http://endhealth.info/im#Ontologies")).toBe("http:%2F%2Fendhealth.info%2Fim%23Ontologies");
    });
  });

  describe("urlToIri", () => {
    it("converts a url to an iri", () => {
      expect(urlToIri("http:%2F%2Fendhealth.info%2Fim%23Ontologies")).toBe("http://endhealth.info/im#Ontologies");
    });
  });

  describe("enumToArray", () => {
    it("converts enum to array of values", () => {
      enum TestEnum {
        CHROME = "chrome",
        FIREFOX = "firefox",
        EDGE = "edge",
        IE = "ie"
      }
      expect(enumToArray(TestEnum)).toEqual(["chrome", "firefox", "edge", "ie"]);
    });
  });
});
