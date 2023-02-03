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

    it("converts oral nsaids", () => {
      expect(eclToIMQ(testData.ecl.oralNsaids)).toEqual(testData.query.oralNsaids);
    });

    it("converts simple and descendants", () => {
      expect(eclToIMQ(testData.ecl.simpleAndDescendants)).toEqual(testData.query.simpleAndDescendants);
    });

    it("converts simple and should be 0", () => {
      expect(eclToIMQ(testData.ecl.simpleAndShouldBe0)).toEqual(testData.query.simpleAndShouldBe0);
    });
  });
});
