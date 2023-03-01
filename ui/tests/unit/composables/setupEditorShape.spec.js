import { afterAll, afterEach, expect, vi } from "vitest";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { fakerFactory } from "@/mocks/factory";
import testData from "./setupEditorShape.testData";
import { createTestStore, createTestRouter, mountComposable } from "../TestMethods";

import { setupEditorShape } from "@/composables/setupEditorShape";

describe("setupShape", async () => {
  let getShapeFromTypeSpy;
  let getShapeSpy;
  let wrapper;

  describe("getShape", () => {
    beforeEach(() => {
      vi.resetAllMocks();
      getShapeFromTypeSpy = vi.spyOn(EntityService, "getShapeFromType");
      getShapeSpy = vi.spyOn(EntityService, "getShape");
    });

    it("gets shape from a type iri ___ success", async () => {
      getShapeFromTypeSpy.mockResolvedValue({ "@id": testData.CONCEPT_SHAPE["@id"] });
      getShapeSpy.mockResolvedValue(testData.CONCEPT_SHAPE);
      wrapper = mountComposable(setupEditorShape, undefined, createTestRouter());
      const shape = await wrapper.vm.getShape("testTypeIri");
      expect(shape).toEqual(testData.CONCEPT_SHAPE);
    });

    it("gets shape from a type iri ___ fail", async () => {
      getShapeFromTypeSpy.mockResolvedValue({});
      getShapeSpy.mockResolvedValue(testData.CONCEPT_SHAPE);
      wrapper = mountComposable(setupEditorShape, undefined, createTestRouter());
      const shape = await wrapper.vm.getShape("testTypeIri");
      expect(shape).toEqual({});
    });
  });

  describe("addToShape", () => {
    it("adds missing groups to the existing shape", () => {
      const startShape = { ...testData.CONCEPT_SHAPE };
      const shapeToAdd = { ...testData.CONCEPT_SET_SHAPE };
      expect(startShape.group.length).toBe(4);
      wrapper = mountComposable(setupEditorShape, undefined, createTestRouter());
      wrapper.vm.addToShape(startShape, shapeToAdd);
      expect(startShape.group.length).toBe(5);
      expect(startShape.group[0]).toEqual(testData.CONCEPT_SHAPE.group[0]);
      expect(startShape.group[1]).toEqual(testData.CONCEPT_SHAPE.group[1]);
      expect(startShape.group[2]).toEqual(testData.CONCEPT_SHAPE.group[2]);
      expect(startShape.group[3]).toEqual(testData.CONCEPT_SHAPE.group[3]);
      expect(startShape.group[4]).toEqual(testData.CONCEPT_SET_SHAPE.group[3]);
    });
  });
});
