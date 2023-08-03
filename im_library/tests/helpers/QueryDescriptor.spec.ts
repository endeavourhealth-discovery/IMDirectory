import { describe, expect, it } from "vitest";
import { getDisplayFromMatch, getDisplayFromProperty, getDisplayFromOrderBy, getUnnamedObjects, describeMatch } from "@/helpers/QueryDescriptor";
import { Match, Node, OrderLimit, Property } from "@/interfaces/AutoGen";
import { fullTestQueryDefinition, match, where, orderBy } from "./Query.testData";
import _ from "lodash";

describe("QueryDescriptor.ts ___", () => {
  describe("getUnnamedObjects", () => {
    it("can get all resolved object iris without a name in query with a reference to the object", () => {
      const unnamedObjects = getUnnamedObjects(fullTestQueryDefinition as Match);
      expect(Object.keys(unnamedObjects).length).toEqual(10);
    });
  });

  describe("getDisplayFromOrderBy", () => {
    it("can get description from OrderBy latest", () => {
      const description = getDisplayFromOrderBy(orderBy.getLatest as OrderLimit);
      expect(description).toEqual("<div class='variable-line'>get latest</div>");
    });
    it("can get description from OrderBy earliest", () => {
      const description = getDisplayFromOrderBy(orderBy.getEarliest as OrderLimit);
      expect(description).toEqual("<div class='variable-line'>get earliest</div>");
    });
  });

  describe("describeMatch", () => {
    it("can describe a type match", () => {
      const testMatch: Match = _.cloneDeep(match.withType);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("Patient");
    });

    it("can describe a set match", () => {
      const testMatch: Match = _.cloneDeep(match.withSet);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("in 'CSET_EmailOnlineEncounter'");
    });

    it("can describe a concept match", () => {
      const testMatch: Match = _.cloneDeep(match.withIri);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("325841000000109");
    });

    it("can describe a concept match with name", () => {
      const testMatch: Match = _.cloneDeep(match.withName);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("Text message consultation");
    });

    it("can describe a concept match with DescendantsOrSelfOf", () => {
      const testMatch: Match = _.cloneDeep(match.withDescendantsOrSelfOf);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("Text message consultation");
    });

    it("can describe a concept match with AncestorsOf", () => {
      const testMatch: Match = _.cloneDeep(match.withAncestorsOf);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("ancestors of Text message consultation");
    });

    it("can describe a concept match with DescendantsOf", () => {
      const testMatch: Match = _.cloneDeep(match.withDescendantsOf);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("descendants of Text message consultation");
    });

    it("can describe a concept match with Exclude", () => {
      const testMatch: Match = _.cloneDeep(match.withExclude);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("<span style='color: red;'>exclude if</span>  in 'Q_Hypertensives'");
    });

    it("can describe a match with one direct property of range", () => {
      const testMatch: Match = _.cloneDeep(match.withOneDirectPropertyOfRange as Match);
      describeMatch(testMatch, 0, "and");
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

    it("can describe a match with one nested property of in", () => {
      const testMatch: Match = _.cloneDeep(match.withOneNestedPropertyOfIn);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.property[0].match.property[0].description).toEqual("concept of Prediabetes");
    });
  });
});
