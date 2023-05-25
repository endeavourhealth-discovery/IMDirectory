import { describe, expect, it } from "vitest";
import { buildMatchFromTreeNode } from "@/helpers/QueryBuilder";
import { fullTestQueryDefinition, match, where, treeNode } from "./Query.testData";
import { TreeNode } from "@/interfaces";

describe("QueryBuilder.ts ___", () => {
  describe("buildMatchFromTreeNode", () => {
    it("can get a match clause from folder treeNode", () => {
      const match = buildMatchFromTreeNode(treeNode.folder as any);
      expect(match).toEqual(treeNode.folderMatch);
    });
  });
});
