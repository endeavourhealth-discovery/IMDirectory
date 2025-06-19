import { describe, expect, it } from "vitest";
import { hasDefinition, hasMap, hasMultiplePredicates, hasParameter, hasProperty } from "./detailsBuilderTestData";
import { buildDetails } from "@/helpers/DetailsBuilder";

describe("detailsBuilder", () => {
  describe("buildDetails", () => {
    it("Builds details for entity that has definition", () => {
      const actual = buildDetails(hasDefinition.entityBundle);
      expect(actual).toEqual(hasDefinition.details);
    });

    it("Builds details for entity that has multiple predicates", () => {
      const actual = buildDetails(hasMultiplePredicates.entityBundle);
      expect(actual).toEqual(hasMultiplePredicates.details);
    });

    it("Builds details for entity that has maps", () => {
      const actual = buildDetails(hasMap.entityBundle);
      expect(actual).toEqual(hasMap.details);
    });

    it("Builds details for entity that has property", () => {
      const actual = buildDetails(hasProperty.entityBundle);
      expect(actual).toEqual(hasProperty.details);
    });

    it("Builds details for entity that has parameter", () => {
      const actual = buildDetails(hasParameter.entityBundle);
      expect(actual).toEqual(hasParameter.details);
    });
  });
});
