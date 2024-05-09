import { describe, expect, it, vi } from "vitest";
import { isNestedProperty, buildProperty } from "@/helpers/QueryBuilder";
import { treeNodeProperty, observationNestedProperty, odsCodeNestedProperty } from "./QueryBuilder.testData";
import { v4 } from "uuid";

vi.mock("uuid", () => ({ v4: () => "123456789" }));

describe("QueryBuilder.ts ___", () => {
  describe("isNestedProperty", () => {
    it("returns false if direct property", () => {
      const result = isNestedProperty(treeNodeProperty.directFolderProperty as any);
      expect(result).toEqual(false);
    });

    it("returns true if nested property of nodeRef", () => {
      const result = isNestedProperty(treeNodeProperty.nodeRefProperty as any);
      expect(result).toEqual(true);
    });

    it("returns true if nested property", () => {
      const result = isNestedProperty(treeNodeProperty.nestedProperty as any);
      expect(result).toEqual(true);
    });
  });
});
