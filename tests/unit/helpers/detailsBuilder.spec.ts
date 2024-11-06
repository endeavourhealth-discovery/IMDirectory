import { describe, expect, test } from "vitest";
import { hasDefinition, hasMap, hasMultiplePredicates, hasParameter, hasProperty } from "./detailsBuilderTestData";
import { buildDetails } from "@/helpers/DetailsBuilder";

describe("detailsBuilder", () => {
  describe("buildDetails", () => {
    test("Builds details for entity that has definition", async () => {
      const actual = buildDetails(hasDefinition.entityBundle);
      expect(actual).toEqual(hasDefinition.details);
    });

    test("Builds details for entity that has multiple predicates", async () => {
      const actual = buildDetails(hasMultiplePredicates.entityBundle);
      expect(actual).toEqual(hasMultiplePredicates.details);
    });

    test("Builds details for entity that has maps", async () => {
      const actual = buildDetails(hasMap.entityBundle);
      expect(actual).toEqual(hasMap.details);
    });

    test("Builds details for entity that has property", async () => {
      const actual = buildDetails(hasProperty.entityBundle);
      expect(actual).toEqual(hasProperty.details);
    });

    test("Builds details for entity that has parameter", async () => {
      const actual = buildDetails(hasParameter.entityBundle);
      expect(actual).toEqual(hasParameter.details);
    });
  });
});
