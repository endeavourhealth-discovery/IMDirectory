import { afterAll, afterEach, expect, vi } from "vitest";
import { EntityService } from "@/im_library/services";
import { IM } from "@/im_library/vocabulary";
import { fakerFactory } from "@/mocks/factory";
import testData from "./EditorMethods.testData";
import { createTestStore, createTestRouter, mountComposable } from "@/im_library/helpers/modules/TestMethods";

import { setupEntity, setupShape } from "@/views/EditorMethods";

describe("fetchEntity", () => {
  let getFullEntitySpy;
  beforeEach(async () => {
    vi.resetAllMocks();
    getFullEntitySpy = vi.spyOn(EntityService, "getFullEntity");
  });

  it("does nothing if no editorIri", async () => {
    const mockState = { editorIri: undefined };
    const mockCommit = vi.fn();
    const mockDispatch = vi.fn();
    const wrapper = mountComposable(setupEntity, createTestStore(mockState, mockCommit, mockDispatch));
    await wrapper.vm.fetchEntity();
    expect(wrapper.vm.editorEntity).toEqual({});
    expect(wrapper.vm.editorEntityOriginal).toEqual({});
    expect(wrapper.vm.entityName).toEqual("");
  });

  it("gets full entity by iri and process entity", async () => {
    const testEntity = fakerFactory.entity.create();
    getFullEntitySpy.mockResolvedValue(testEntity);
    const mockState = { editorIri: "testIri" };
    const mockCommit = vi.fn();
    const mockDispatch = vi.fn();
    const wrapper = mountComposable(setupEntity, createTestStore(mockState, mockCommit, mockDispatch));
    await wrapper.vm.fetchEntity();
    expect(getFullEntitySpy).toHaveBeenCalled();
    expect(wrapper.vm.editorEntityOriginal).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity["@id"] }));
    expect(wrapper.vm.editorEntity).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity["@id"] }));
    expect(wrapper.vm.entityName).toEqual(testEntity["http://www.w3.org/2000/01/rdf-schema#label"]);
  });
});

describe("processEntity", () => {
  it("changes @id to full iri and removes im1id and im1scheme", async () => {
    const testEntity = fakerFactory.entity.create();
    testEntity[IM.IM_1_ID] = "testIri";
    testEntity[IM.IM_1_SCHEME] = [{ "@id": "testScheme" }];
    const wrapper = mountComposable(setupEntity, createTestStore());
    const result = wrapper.vm.processEntity(testEntity);
    expect(result).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity["@id"] }));
    expect(result).toEqual(
      expect.not.objectContaining({ "http://endhealth.info/im#im1Id": testEntity.IM_1_ID, "http://endhealth.info/im#im1Scheme": testEntity.IM_1_SCHEME })
    );
  });
});

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
      wrapper = mountComposable(setupShape, undefined, createTestRouter());
      const shape = await wrapper.vm.getShape("testTypeIri");
      expect(shape).toEqual(testData.CONCEPT_SHAPE);
    });

    it("gets shape from a type iri ___ fail", async () => {
      getShapeFromTypeSpy.mockResolvedValue({});
      getShapeSpy.mockResolvedValue(testData.CONCEPT_SHAPE);
      const shape = await wrapper.vm.getShape("testTypeIri");
      expect(shape).toEqual({});
    });
  });

  describe("addToShape", () => {
    it("adds missing groups to the existing shape", () => {
      const startShape = { ...testData.CONCEPT_SHAPE };
      const shapeToAdd = { ...testData.CONCEPT_SET_SHAPE };
      expect(startShape.group.length).toBe(4);
      wrapper = mountComposable(setupShape, undefined, createTestRouter());
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
