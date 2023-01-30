import { transformTT } from "@/helpers/TTTransform";
import { describe, expect, it } from "vitest";
import { OntologiesFolderTTEntity, OntologiesFolderTransformed } from "./TTTransform.testData";

describe("Converters", () => {
  describe("iriToUrl", () => {
    it("WHEN ttEntity is empty object __ THEN return empty object", () => {
      expect(transformTT({})).toStrictEqual({});
    });

    it("WHEN ttEntity is populated __ THEN return a simple object without iri properties", () => {
      expect(transformTT(OntologiesFolderTTEntity)).toStrictEqual(OntologiesFolderTransformed);
    });
  });
});
