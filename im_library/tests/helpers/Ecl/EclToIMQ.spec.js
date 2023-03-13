import eclToIMQ from "../../../src/helpers/Ecl/EclToIMQ";
import queryTestData from "./query.testData";
import eclTestData from "./ecl.testData";

describe("eclToIMQ", () => {
  it("converts orGroupMinusOrGroup", () => {
    expect(eclToIMQ(eclTestData.orGroupMinusOrGroup)).toEqual(queryTestData.orGroupMinusOrGroup);
  });

  it("converts allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
    expect(eclToIMQ(eclTestData.allergyToPenicillinsOrCephasporinsWithCausativeLactams)).toEqual(
      queryTestData.allergyToPenicillinsOrCephasporinsWithCausativeLactams
    );
  });

  it("converts andGroupedWithSubsumptionAttributeValue", () => {
    expect(eclToIMQ(eclTestData.andGroupedWithSubsumptionAttributeValue)).toEqual(queryTestData.andGroupedWithSubsumptionAttributeValue);
  });

  it("converts andNoAttributeGroup", () => {
    expect(eclToIMQ(eclTestData.andNoAttributeGroup)).toEqual(queryTestData.andNoAttributeGroup);
  });

  it("converts andWithRefinementOfSecondConcept", () => {
    expect(eclToIMQ(eclTestData.andWithRefinementOfSecondConcept)).toEqual(queryTestData.andWithRefinementOfSecondConcept);
  });

  it("converts andWithSubsumptionPropertyValue", () => {
    expect(eclToIMQ(eclTestData.andWithSubsumptionPropertyValue)).toEqual(queryTestData.andWithSubsumptionPropertyValue);
  });

  it("converts bracketedAnd", () => {
    expect(eclToIMQ(eclTestData.bracketedAnd)).toEqual(queryTestData.bracketedAnd);
  });

  it("converts descendantsAndSelf", () => {
    expect(eclToIMQ(eclTestData.descendantsAndSelf)).toEqual(queryTestData.descendantsAndSelf);
  });

  it("converts descendantsNotSelf", () => {
    expect(eclToIMQ(eclTestData.descendantsNotSelf)).toEqual(queryTestData.descendantsNotSelf);
  });

  it("converts mergedGroupError", () => {
    expect(eclToIMQ(eclTestData.mergedGroupError)).toEqual(queryTestData.mergedGroupError);
  });

  it("converts minusAConcept", () => {
    expect(eclToIMQ(eclTestData.minusAConcept)).toEqual(queryTestData.minusAConcept);
  });

  it("converts minusAWildCardRefined", () => {
    expect(eclToIMQ(eclTestData.minusAWildCardRefined)).toEqual(queryTestData.minusAWildCardRefined);
  });

  it("converts oral nsaids", () => {
    expect(eclToIMQ(eclTestData.oralNsaids)).toEqual(queryTestData.oralNsaids);
  });

  it("converts simple and descendants", () => {
    expect(eclToIMQ(eclTestData.simpleAndDescendants)).toEqual(queryTestData.simpleAndDescendants);
  });

  it("converts simple and should be 0", () => {
    expect(eclToIMQ(eclTestData.simpleAndShouldBe0)).toEqual(queryTestData.simpleAndShouldBe0);
  });

  it("converts singleConcept", () => {
    expect(eclToIMQ(eclTestData.singleConcept)).toEqual(queryTestData.singleConcept);
  });

  it("converts twoAttributeGroups", () => {
    expect(eclToIMQ(eclTestData.twoAttributeGroups)).toEqual(queryTestData.twoAttributeGroups);
  });

  it("converts ungroupedButSeparateGroups", () => {
    expect(eclToIMQ(eclTestData.ungroupedButSeparateGroups)).toEqual(queryTestData.ungroupedButSeparateGroups);
  });

  it("converts unionWithRefinement", () => {
    expect(eclToIMQ(eclTestData.unionWithRefinement)).toEqual(queryTestData.unionWithRefinement);
  });

  it("converts minusWithGroups", () => {
    expect(eclToIMQ(eclTestData.minusWithGroups)).toEqual(queryTestData.minusWithGroups);
  });

  it("converts orRefinement", () => {
    expect(eclToIMQ(eclTestData.orRefinement)).toEqual(queryTestData.orRefinement);
  });

  it("converts multipleOrRefinement", () => {
    expect(eclToIMQ(eclTestData.multipleOrRefinement)).toEqual(queryTestData.multipeOrRefinement);
  });

  it("converts refinementConjunctionWithGroup", () => {
    expect(eclToIMQ(eclTestData.refinementConjunctionWithGroup)).toEqual(queryTestData.refinementConjunctionWithGroup);
  });

  it("converts startGroupedConceptWithRefinement", () => {
    expect(eclToIMQ(eclTestData.startGroupedConceptWithRefinement)).toEqual(queryTestData.startGroupedConceptWithRefinement);
  });
});
