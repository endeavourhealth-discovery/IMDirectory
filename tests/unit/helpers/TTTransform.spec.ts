import { TTEntitySchema } from "@endeavour/vue-library/models";

import { describe, expect, it } from "vitest";

import { transformTT } from "@/helpers/TTTransform";

import {
  EventTTEntity,
  EventTTEntityTransformed,
  OntologiesFolderCustomTransformed,
  OntologiesFolderTTEntity,
  OntologiesFolderTransformed,
  customMap
} from "./TTTransform.testData";

describe("TTTransform", () => {
  describe("transformTT", () => {
    it("WHEN ttEntity is empty object __ THEN return empty object", () => {
      expect(transformTT(TTEntitySchema.parse({}))).toStrictEqual({});
    });

    it("WHEN ttEntity is populated __ THEN return a simple object without iri properties", () => {
      expect(transformTT(OntologiesFolderTTEntity)).toStrictEqual(OntologiesFolderTransformed);
    });

    it("WHEN ttEntity has nested objects __ THEN properties of nested object get transformed", () => {
      expect(transformTT(EventTTEntity)).toStrictEqual(EventTTEntityTransformed);
    });

    it("WHEN custom map along with ttEntity __ THEN use map for property names", () => {
      expect(transformTT(OntologiesFolderTTEntity, customMap)).toStrictEqual(OntologiesFolderCustomTransformed);
    });
  });
});
