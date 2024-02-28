import { describe, expect, it } from "vitest";
import { getUnnamedObjects, describeMatch, describeProperty, describeOrderByList } from "@/helpers/QueryDescriptor";
import { Bool, Match, OrderLimit, Property } from "@/interfaces/AutoGen";
import { fullTestQueryDefinition, match, orderBy } from "./Query.testData";
import _ from "lodash";

describe("QueryDescriptor.ts ___", () => {
  describe("getUnnamedObjects", () => {
    it("can get all resolved object iris without a name in query with a reference to the object", () => {
      const unnamedObjects = getUnnamedObjects(fullTestQueryDefinition as Match);
      expect(Object.keys(unnamedObjects).length).toEqual(12);
    });
  });

  describe("getDisplayFromOrderBy", () => {
    it("can get description from OrderBy latest", () => {
      describeOrderByList(orderBy.getLatest as OrderLimit);
      expect(orderBy.getLatest.description).toEqual("<div class='variable-line'>get latest</div>");
    });
    it("can get description from OrderBy earliest", () => {
      describeOrderByList(orderBy.getEarliest as OrderLimit);
      expect(orderBy.getEarliest.description).toEqual("<div class='variable-line'>get earliest</div>");
    });
    it("can get description from OrderBy latest with limit", () => {
      describeOrderByList(orderBy.getLatest3 as OrderLimit);
      expect(orderBy.getLatest3.description).toEqual("<div class='variable-line'>get latest 3</div>");
    });
    it("can get description from OrderBy latest full", () => {
      describeOrderByList(orderBy.getLatestFull as OrderLimit);
      expect(orderBy.getLatestFull.description).toEqual("<div class='variable-line'>get latest by endDate</div>");
    });
    it("can get description from OrderBy latest with limit full", () => {
      describeOrderByList(orderBy.getLatest3Full as OrderLimit);
      expect(orderBy.getLatest3Full.description).toEqual("<div class='variable-line'>get latest 3 by endDate</div>");
    });
  });

  describe("describeMatch", () => {
    it("can describe a type of match", () => {
      const testMatch: Match = _.cloneDeep(match.withType);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.description).toEqual("Patient");
    });

    it("can describe an instance match", () => {
      const testMatch: Match = _.cloneDeep(match.withInstance);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.description).toEqual("is instance of 325841000000109");
    });

    it("can describe a set match", () => {
      const testMatch: Match = _.cloneDeep(match.withSet);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.description).toEqual("in 'CSET_EmailOnlineEncounter'");
    });

    it("can describe a concept property with DescendantsOrSelfOf", () => {
      const testProperty: Property = _.cloneDeep(match.withDescendantsOrSelfOf);
      describeProperty(testProperty, 0, Bool.and);
      expect(testProperty.description).toEqual("<span style='color: orange;'>and</span>  Text message consultation");
    });

    it("can describe a concept property with AncestorsOf", () => {
      const testProperty: Property = _.cloneDeep(match.withAncestorsOf);
      describeProperty(testProperty, 0, Bool.and);
      expect(testProperty.description).toEqual("<span style='color: orange;'>and</span>  Text message consultation (ancestors only)");
    });

    it("can describe a concept match with DescendantsOf", () => {
      const testProperty: Property = _.cloneDeep(match.withDescendantsOf);
      describeProperty(testProperty, 0, Bool.and);
      expect(testProperty.description).toEqual("<span style='color: orange;'>and</span>  Text message consultation (excluding subtypes)");
    });

    it("can describe a concept match with Exclude", () => {
      const testMatch: Match = _.cloneDeep(match.withExclude);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.description).toEqual("<span style='color: red;'>exclude if</span>  in 'Q_Hypertensives'");
    });

    it("can describe a match with one direct property of range", () => {
      const testMatch: Match = _.cloneDeep(match.withOneDirectPropertyOfRange as Match);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.property[0].description).toEqual("age between 65 and 70 YEARS");
    });

    // it("can describe a match with one direct property of in", () => {
    //   const testMatch: Match = _.cloneDeep(match.withOneDirectPropertyOfIn as Match);
    //   describeMatch(testMatch, 0, "and");
    //   expect(testMatch.property[0].description).toEqual("statedGender is Female (stated gender)");
    // });

    // it("can describe a match with multiple direct properties", () => {
    //   const testMatch: Match = _.cloneDeep(match.withMultipleDirectProperties as Match);
    //   describeMatch(testMatch, 0, "and");
    //   expect(testMatch.property[0].description).toEqual("age between 65 and 70 YEARS");
    //   expect(testMatch.property[1].description).toEqual("statedGender is Female (stated gender)");
    // });

    it("can describe a match with one nested property of is", () => {
      const testMatch: Match = _.cloneDeep(match.withOneNestedPropertyOfIs);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.property[0].match.property[0].description).toEqual("concept is Prediabetes");
    });

    it("can describe a match with one nested property of is", () => {
      const testMatch: Match = _.cloneDeep(fullTestQueryDefinition);
      describeMatch(testMatch, 0, Bool.and);
      expect(testMatch.match[2].property[0].match.property[0].description).toEqual(
        "concept is <span class='node-ref'>Office or home systolic blood pressure</span> "
      );
    });
  });
});
