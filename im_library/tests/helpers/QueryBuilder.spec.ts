import { describe, expect, it } from "vitest";
import { isNestedProperty, getParentPath, gatherParentPathRecursively, buildNestedPropertyMatch } from "@/helpers/QueryBuilder";
import { fullTestQueryDefinition, match, where } from "./Query.testData";
import { treeNodeProperty, nestedProperty, observationNestedProperty, odsCodeNestedProperty } from "./QueryBuilder.testData";
import { Match } from "@/interfaces/AutoGen";

describe("QueryBuilder.ts ___", () => {
  describe("isNestedProperty", () => {
    it("returns false if direct property", () => {
      const result = isNestedProperty(treeNodeProperty.directFolderProperty as any);
      expect(result).toEqual(false);
    });

    it("returns false if direct property of nodeRef", () => {
      const result = isNestedProperty(treeNodeProperty.nodeRefProperty as any);
      expect(result).toEqual(false);
    });

    it("returns true if nested property", () => {
      const result = isNestedProperty(treeNodeProperty.nestedProperty as any);
      expect(result).toEqual(true);
    });
  });

  describe("gatherParentPathRecursively", () => {
    it("returns paths of a direct property", () => {
      const path = [];
      gatherParentPathRecursively(treeNodeProperty.directFolderProperty as any, path);
      expect(path.length).toEqual(1);
      expect(path[0]).toEqual("Patient");
    });

    it("returns paths of a direct nodeRef property", () => {
      const path = [];
      gatherParentPathRecursively(treeNodeProperty.nodeRefProperty as any, path);
      expect(path.length).toEqual(1);
      expect(path[0]).toEqual("latestBP (Observation)");
    });

    it("returns paths of a nested property", () => {
      const path = [];
      gatherParentPathRecursively(treeNodeProperty.nestedProperty as any, path);
      expect(path.length).toEqual(3);
      expect(path[0]).toEqual("Address");
      expect(path[1]).toEqual("homeAddress");
      expect(path[2]).toEqual("Patient");
    });
  });

  describe("getParentPath", () => {
    it("returns path of a direct property", () => {
      const path = getParentPath(treeNodeProperty.directFolderProperty as any);
      expect(path).toEqual("Patient");
    });

    it("returns path of a direct nodeRef property", () => {
      const path = getParentPath(treeNodeProperty.nodeRefProperty as any);
      expect(path).toEqual("latestBP (Observation)");
    });

    it("returns path of a nested property", () => {
      const path = getParentPath(treeNodeProperty.nestedProperty as any);
      expect(path).toEqual("Address/homeAddress/Patient");
    });
  });

  describe("buildNestedPropertyMatch", () => {
    it("returns match with parent structure", () => {
      const nestedPropertyMatch = buildNestedPropertyMatch(observationNestedProperty.treeNode as any);
      expect(nestedPropertyMatch).toStrictEqual(observationNestedProperty.match);
    });

    it("returns multi-level match with parent structure", () => {
      const nestedPropertyMatch = buildNestedPropertyMatch(odsCodeNestedProperty.treeNode as any);
      expect(nestedPropertyMatch).toStrictEqual(odsCodeNestedProperty.match);
    });
  });
});
