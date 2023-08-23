import { describe, expect, it } from "vitest";
import {
  getDisplayFromMatch,
  getDisplayFromProperty,
  getDisplayFromOrderBy,
  getUnnamedObjects,
  describeMatch,
  describeProperty
} from "@/helpers/QueryDescriptor";
import { Match, Node, OrderLimit, Property } from "@/interfaces/AutoGen";
import { fullTestQueryDefinition, match, where, orderBy } from "./Query.testData";
import _ from "lodash";

describe("QueryDescriptor.ts ___", () => {
  describe("getUnnamedObjects", () => {
    it("can get all resolved object iris without a name in query with a reference to the object", () => {
      const unnamedObjects = getUnnamedObjects(fullTestQueryDefinition as Match);
      expect(Object.keys(unnamedObjects).length).toEqual(4);
    });
  });

  describe("getDisplayFromOrderBy", () => {
    it("can get description from OrderBy latest", () => {
      const description = getDisplayFromOrderBy(orderBy.getLatest as OrderLimit);
      expect(description).toEqual("<div class='variable-line'>get latest by effectiveDate</div>");
    });
    it("can get description from OrderBy earliest", () => {
      const description = getDisplayFromOrderBy(orderBy.getEarliest as OrderLimit);
      expect(description).toEqual("<div class='variable-line'>get earliest by effectiveDate</div>");
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

    it("can describe a concept property with name", () => {
      const testMatch: Match = _.cloneDeep(match.withName);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.description).toEqual("Text message consultation");
    });

    it("can describe a concept property with DescendantsOrSelfOf", () => {
      const testProperty: Property = _.cloneDeep(match.withDescendantsOrSelfOf);
      describeProperty(testProperty, 0, "and");
      expect(testProperty.description).toEqual("Text message consultation");
    });

    it("can describe a concept property with AncestorsOf", () => {
      const testProperty: Property = _.cloneDeep(match.withAncestorsOf);
      describeProperty(testProperty, 0, "and");
      expect(testProperty.description).toEqual("ancestors of Text message consultation");
    });

    it("can describe a concept match with DescendantsOf", () => {
      const testProperty: Property = _.cloneDeep(match.withDescendantsOf);
      describeProperty(testProperty, 0, "and");
      expect(testProperty.description).toEqual("descendants of Text message consultation");
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

    it("can describe a match with one nested property of is", () => {
      const testMatch: Match = _.cloneDeep(match.withOneNestedPropertyOfIs);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.property[0].match.property[0].description).toEqual("concept of Prediabetes");
    });

    it("can describe a match with one nested property of inSet", () => {
      const testMatch: Match = _.cloneDeep(match.withOneNestedPropertyOfInSet);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.property[0].match.property[0].description).toEqual("concept of Prediabetes");
    });

    it("can describe a match with one nested property of is", () => {
      const testMatch: Match = _.cloneDeep(fullTestQueryDefinition);
      describeMatch(testMatch, 0, "and");
      expect(testMatch.property[0].match.property[0].description).toEqual(
        "concept of a value of [Hypertensive disorder, systemic arterial (disorder) and <span class='node-ref'>more...</span> ]"
      );
    });
  });
});
