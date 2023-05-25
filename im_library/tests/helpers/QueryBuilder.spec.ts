import { describe, expect, it } from "vitest";
import { buildMatchFromTreeNode } from "@/helpers/QueryBuilder";
import { fullTestQueryDefinition, match, where, treeNode } from "./Query.testData";

describe("QueryBuilder.ts ___", () => {
  describe("buildMatchFromTreeNode", () => {
    it("can get a match clause from folder treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.folder as any);
      expect(match).toEqual(treeNode.folderMatch);
    });

    it("can get a match clause from dataModel treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.dataModel as any);
      expect(match).toEqual(treeNode.dataModelMatch);
    });

    it("can get a match clause from set treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.entity as any);
      expect(match).toEqual(treeNode.entityMatch);
    });

    it("can get a match clause from property treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.classProperty as any);
      expect(match).toEqual(treeNode.classPropertyMatch);
    });

    it("can get a match clause from property treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.set as any);
      expect(match).toEqual(treeNode.setMatch);
    });

    it("can get a match clause from property treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.query as any);
      expect(match).toEqual(treeNode.queryMatch);
    });
  });
});
