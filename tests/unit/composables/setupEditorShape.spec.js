import { expect, vi } from "vitest";
import testData from "./setupEditorShape.testData";
import { mountComposable } from "../TestMethods";

import { setupEditorShape } from "@/composables/setupEditorShape";
import { IM } from "@/vocabulary";
import ConceptShape from "@/constants/editorShapes/Concept";

describe("setupShape", async () => {
  let wrapper;

  describe("getShape", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("gets shape from a type iri ___ success", () => {
      wrapper = mountComposable(setupEditorShape);
      const shape = wrapper.vm.getShape(IM.CONCEPT);
      expect(shape).toEqual(ConceptShape);
    });

    it("gets shape from a type iri ___ fail", () => {
      wrapper = mountComposable(setupEditorShape, undefined);
      expect(() => wrapper.vm.getShape("testErrorTypeIri")).toThrowError("No editor shape found for type: testErrorTypeIri");
    });
  });

  describe("addToShape", () => {
    it("adds missing groups to the existing shape", () => {
      const startShape = { ...testData.CONCEPT_SHAPE };
      const shapeToAdd = { ...testData.CONCEPT_SET_SHAPE };
      expect(startShape.property.length).toBe(4);
      wrapper = mountComposable(setupEditorShape);
      wrapper.vm.addToShape(startShape, shapeToAdd);
      expect(startShape.property.length).toBe(5);
      expect(startShape.property[0]).toEqual(testData.CONCEPT_SHAPE.property[0]);
      expect(startShape.property[1]).toEqual(testData.CONCEPT_SHAPE.property[1]);
      expect(startShape.property[2]).toEqual(testData.CONCEPT_SHAPE.property[2]);
      expect(startShape.property[3]).toEqual(testData.CONCEPT_SHAPE.property[3]);
      expect(startShape.property[4]).toEqual(testData.CONCEPT_SET_SHAPE.property[3]);
    });
  });
});
