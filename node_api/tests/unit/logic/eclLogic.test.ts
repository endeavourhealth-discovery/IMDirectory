import { describe, it, expect } from "vitest";
import { eclToBuild, eclToIMQ } from "../../../src/logic/eclLogic";
import testData from "./eclLogic.testData";

describe("eclLogic", () => {
  describe("eclToIMQ", () => {
    it("converts orGroupMinusOrGroup", () => {
      expect(eclToIMQ(testData.ecl.orGroupMinusOrGroup)).toEqual(testData.query.orGroupMinusOrGroup);
    });

    it("converts allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
      expect(eclToIMQ(testData.ecl.allergyToPenicillinsOrCephasporinsWithCausativeLactams)).toEqual(
        testData.query.allergyToPenicillinsOrCephasporinsWithCausativeLactams
      );
    });

    it("converts andGroupedWithSubsumptionAttributeValue", () => {
      expect(eclToIMQ(testData.ecl.andGroupedWithSubsumptionAttributeValue)).toEqual(testData.query.andGroupedWithSubsumptionAttributeValue);
    });

    it("converts andNoAttributeGroup", () => {
      expect(eclToIMQ(testData.ecl.andNoAttributeGroup)).toEqual(testData.query.andNoAttributeGroup);
    });

    it("converts andWithRefinementOfSecondConcept", () => {
      expect(eclToIMQ(testData.ecl.andWithRefinementOfSecondConcept)).toEqual(testData.query.andWithRefinementOfSecondConcept);
    });

    it("converts andWithSubsumptionPropertyValue", () => {
      expect(eclToIMQ(testData.ecl.andWithSubsumptionPropertyValue)).toEqual(testData.query.andWithSubsumptionPropertyValue);
    });

    it("converts bracketedAnd", () => {
      expect(eclToIMQ(testData.ecl.bracketedAnd)).toEqual(testData.query.bracketedAnd);
    });

    it("converts descendantsAndSelf", () => {
      expect(eclToIMQ(testData.ecl.descendantsAndSelf)).toEqual(testData.query.descendantsAndSelf);
    });

    it("converts descendantsNotSelf", () => {
      expect(eclToIMQ(testData.ecl.descendantsNotSelf)).toEqual(testData.query.descendantsNotSelf);
    });

    it("converts mergedGroupError", () => {
      expect(eclToIMQ(testData.ecl.mergedGroupError)).toEqual(testData.query.mergedGroupError);
    });

    it("converts minusAConcept", () => {
      expect(eclToIMQ(testData.ecl.minusAConcept)).toEqual(testData.query.minusAConcept);
    });

    it("converts minusAWildCardRefined", () => {
      expect(eclToIMQ(testData.ecl.minusAWildCardRefined)).toEqual(testData.query.minusAWildCardRefined);
    });

    it("converts oral nsaids", () => {
      expect(eclToIMQ(testData.ecl.oralNsaids)).toEqual(testData.query.oralNsaids);
    });

    it("converts simple and descendants", () => {
      expect(eclToIMQ(testData.ecl.simpleAndDescendants)).toEqual(testData.query.simpleAndDescendants);
    });

    it("converts simple and should be 0", () => {
      expect(eclToIMQ(testData.ecl.simpleAndShouldBe0)).toEqual(testData.query.simpleAndShouldBe0);
    });

    it("converts singleConcept", () => {
      expect(eclToIMQ(testData.ecl.singleConcept)).toEqual(testData.query.singleConcept);
    });

    it("converts twoAttributeGroups", () => {
      expect(eclToIMQ(testData.ecl.twoAttributeGroups)).toEqual(testData.query.twoAttributeGroups);
    });

    it("converts ungroupedButSeparateGroups", () => {
      expect(eclToIMQ(testData.ecl.ungroupedButSeparateGroups)).toEqual(testData.query.ungroupedButSeparateGroups);
    });

    it("converts unionWithRefinement", () => {
      expect(eclToIMQ(testData.ecl.unionWithRefinement)).toEqual(testData.query.unionWithRefinement);
    });
  });
});
