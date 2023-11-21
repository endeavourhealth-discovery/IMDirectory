import { buildPropertyTreeNode } from "@/helpers/PropertyTreeNodeBuilder";
import { TTProperty } from "@im-library/interfaces";
import { describe, expect, it } from "vitest";
import { testProperty, testTreeNode } from "./PropertyTreeNodeBuilder.testData";

describe("PropertyTreeNodeBuilder.ts ___", () => {
  describe("buildPropertyTreeNode", () => {
    it("can build treenode", () => {
      const treeNode = buildPropertyTreeNode(testProperty as TTProperty);
      expect(treeNode.iri).equal("http://endhealth.info/im#statedGender");
      expect(treeNode.label).equal("stated gender");
      expect(treeNode).toStrictEqual(testTreeNode);
    });
  });
});
