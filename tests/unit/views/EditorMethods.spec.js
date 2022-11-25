import { afterAll, afterEach, vi } from "vitest";
import { EntityService } from "@/im_library/services";
import { IM } from "@/im_library/vocabulary";
import { fakerFactory } from "@/mocks/factory";
import testData from "./EditorMethods.testData";

describe("fetchEntity", () => {
  let getFullEntitySpy;
  beforeEach(async () => {
    vi.resetModules();
    // vi.resetAllMocks();
    getFullEntitySpy = vi.spyOn(EntityService, "getFullEntity");
  });

  it("does nothing if no editorIri", async () => {
    vi.doMock("vuex", () => ({
      useStore: vi.fn().mockReturnValue({ state: { editorIri: undefined } })
    }));
    const testEntity = fakerFactory.entity.create();
    getFullEntitySpy.mockResolvedValue(testEntity);
    let { setupEntity, setupShape } = await import("@/views/EditorMethods");
    const { fetchEntity, editorEntity, editorEntityOriginal, entityName } = setupEntity();
    await fetchEntity();
    expect(getFullEntitySpy).not.toHaveBeenCalled();
    expect(editorEntity.value).toEqual({});
    expect(editorEntityOriginal.value).toEqual({});
    expect(entityName.value).toEqual("");
  });

  it("gets full entity by iri and process entity", async () => {
    vi.doMock("vuex", () => ({
      useStore: vi.fn().mockReturnValue({ state: { editorIri: "testIri" } })
    }));
    let { setupEntity, setupShape } = await import("@/views/EditorMethods");
    const testEntity = fakerFactory.entity.create();
    getFullEntitySpy.mockResolvedValue(testEntity);
    let { fetchEntity, editorEntity, editorEntityOriginal, entityName, processEntity } = setupEntity();
    await fetchEntity();
    expect(getFullEntitySpy).toHaveBeenCalled();
    expect(editorEntityOriginal.value).toEqual(processEntity(testEntity));
    expect(editorEntity.value).toEqual(processEntity(testEntity));
    expect(entityName.value).toEqual(testEntity["http://www.w3.org/2000/01/rdf-schema#label"]);
  });

  afterEach(() => {
    vi.resetModules();
  });
});

describe("processEntity", () => {
  it("changes @id to full iri and removes im1id and im1scheme", async () => {
    const { setupEntity } = await import("@/views/EditorMethods");
    const { processEntity } = setupEntity();
    const testEntity = fakerFactory.entity.create();
    testEntity[IM.IM_1_ID] = "testIri";
    testEntity[IM.IM_1_SCHEME] = [{ "@id": "testScheme" }];
    const result = processEntity(testEntity);
    expect(result).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity["@id"] }));
    expect(result).toEqual(
      expect.not.objectContaining({ "http://endhealth.info/im#im1Id": testEntity.IM_1_ID, "http://endhealth.info/im#im1Scheme": testEntity.IM_1_SCHEME })
    );
  });
});

describe("setupShape", async () => {
  let getShapeFromTypeSpy;
  let getShapeSpy;
  const { setupShape } = await import("@/views/EditorMethods");
  const { getShape, getShapesCombined, addToShape, processShape, processComponentType, setSteps, shape, targetShape, groups, stepsItems } = setupShape();

  describe("getShape", () => {
    beforeEach(() => {
      vi.resetAllMocks();
      getShapeFromTypeSpy = vi.spyOn(EntityService, "getShapeFromType");
      getShapeSpy = vi.spyOn(EntityService, "getShape");
    });

    it("gets shape from a type iri ___ success", async () => {
      getShapeFromTypeSpy.mockResolvedValue({ "@id": testData.CONCEPT_SHAPE["@id"] });
      getShapeSpy.mockResolvedValue(testData.CONCEPT_SHAPE);
      const shape = await getShape("testTypeIri");
      expect(shape).toEqual(testData.CONCEPT_SHAPE);
    });

    it("gets shape from a type iri ___ fail", async () => {
      getShapeFromTypeSpy.mockResolvedValue({});
      getShapeSpy.mockResolvedValue(testData.CONCEPT_SHAPE);
      const shape = await getShape("testTypeIri");
      expect(shape).toEqual({});
    });
  });

  describe("addToShape", () => {
    it("adds missing groups to the existing shape", () => {
      const startShape = { ...testData.CONCEPT_SHAPE };
      const shapeToAdd = { ...testData.CONCEPT_SET_SHAPE };
      expect(startShape.group.length).toBe(4);
      addToShape(startShape, shapeToAdd);
      expect(startShape.group.length).toBe(5);
      expect(startShape.group[0]).toEqual(testData.CONCEPT_SHAPE.group[0]);
      expect(startShape.group[1]).toEqual(testData.CONCEPT_SHAPE.group[1]);
      expect(startShape.group[2]).toEqual(testData.CONCEPT_SHAPE.group[2]);
      expect(startShape.group[3]).toEqual(testData.CONCEPT_SHAPE.group[3]);
      expect(startShape.group[4]).toEqual(testData.CONCEPT_SET_SHAPE.group[3]);
    });
  });
});
