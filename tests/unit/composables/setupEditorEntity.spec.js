import { expect, vi } from "vitest";
import { EntityService } from "@/services";
import { IM, SHACL } from "@/vocabulary";
import { fakerFactory } from "@/mocks/fakerFactory";
import { mountComposable } from "../TestMethods";
import { EditorMode } from "@/enums";

import { setupEditorEntity } from "@/composables/setupEditorEntity";
import { useEditorStore } from "@/stores/editorStore";
import { useCreatorStore } from "@/stores/creatorStore";

describe("fetchEntity", () => {
  let getFullEntitySpy;
  let getEntityTypesSpy;
  let mockUpdateType;
  beforeEach(() => {
    vi.resetAllMocks();
    getFullEntitySpy = vi.spyOn(EntityService, "getFullEntity");
    getEntityTypesSpy = vi.spyOn(EntityService, "getEntityTypes");
    mockUpdateType = vi.fn();
  });

  it("does nothing if no editorIri", async () => {
    const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType], { editor: { editorIri: undefined } });

    await wrapper.vm.fetchEntity();
    expect(wrapper.vm.editorEntity).toEqual({});
    expect(wrapper.vm.editorEntityOriginal).toEqual({});
    expect(wrapper.vm.entityName).toEqual("");
  });

  it("gets full entity by iri and process entity", async () => {
    const testEntity = fakerFactory.entity.create();
    getFullEntitySpy.mockResolvedValue(testEntity);
    getEntityTypesSpy.mockResolvedValue([]);
    const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType], { editor: { editorIri: "testIri" } });

    await wrapper.vm.fetchEntity();
    expect(getFullEntitySpy).toHaveBeenCalled();
    expect(wrapper.vm.editorEntityOriginal).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity.iri }));
    expect(wrapper.vm.editorEntity).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity.iri }));
    expect(wrapper.vm.entityName).toEqual(testEntity["http://www.w3.org/2000/01/rdf-schema#label"]);
  });
});

describe("processEntity", () => {
  let mockUpdateType;
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateType = vi.fn();
  });
  it("changes iri to full iri and removes im1id and im1scheme", () => {
    const testEntity = fakerFactory.entity.create();
    testEntity[IM.IM_1_ID] = "testIri";
    testEntity[IM.IM_1_SCHEME] = [{ iri: "testScheme" }];
    const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
    const result = wrapper.vm.processEntity(testEntity);
    expect(result).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity.iri }));
    expect(result).toEqual(
      expect.not.objectContaining({ "http://endhealth.info/im#im1Id": testEntity.IM_1_ID, "http://endhealth.info/im#im1Scheme": testEntity.IM_1_SCHEME })
    );
  });

  describe("findPrimaryType", () => {
    let mockUpdateType;
    beforeEach(() => {
      vi.resetAllMocks();
      mockUpdateType = vi.fn();
    });

    it("returns undefined if no types", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      wrapper.vm.editorEntityOriginal = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      wrapper.vm.editorEntity = {};
      expect(wrapper.vm.findPrimaryType()).toBeUndefined();
    });

    it("returns type if edit and original same type", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      wrapper.vm.editorEntityOriginal = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      wrapper.vm.editorEntity = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      expect(wrapper.vm.findPrimaryType()).toEqual({
        iri: "http://endhealth.info/im#Concept"
      });
    });

    it("returns new type if types different", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      wrapper.vm.editorEntityOriginal = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      wrapper.vm.editorEntity = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT_SET }] };
      expect(wrapper.vm.findPrimaryType()).toEqual({
        iri: "http://endhealth.info/im#ConceptSet"
      });
    });

    it("returns nodeshape if present in multiple types", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      wrapper.vm.editorEntityOriginal = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      wrapper.vm.editorEntity = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT_SET }, { iri: SHACL.NODESHAPE }] };
      expect(wrapper.vm.findPrimaryType()).toEqual({
        iri: SHACL.NODESHAPE
      });
    });

    it("returns first if multiple types no rules", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      wrapper.vm.editorEntityOriginal = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      wrapper.vm.editorEntity = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT_SET }, { iri: IM.VALUE_SET }] };
      expect(wrapper.vm.findPrimaryType()).toEqual({
        iri: IM.CONCEPT_SET
      });
    });
  });

  describe("updateEntity", () => {
    let mockUpdateType;
    beforeEach(() => {
      vi.resetAllMocks();
      mockUpdateType = vi.fn();
    });

    it("can update entity ___ array ___ editor", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const store = useEditorStore();
      const store2 = useCreatorStore();
      const dataToAdd = [{ testIri1: "testValue1" }, { testIri2: "testValue2" }];
      wrapper.vm.updateEntity(dataToAdd);
      expect(wrapper.vm.editorEntity).toEqual({ testIri1: "testValue1", testIri2: "testValue2" });
      expect(store.updateEditorSavedEntity).toHaveBeenCalled();
      expect(store2.updateCreatorSavedEntity).not.toHaveBeenCalled();
    });

    it("can update entity ___ array ___ creator", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.CREATE, mockUpdateType]);
      const store = useCreatorStore();
      const store2 = useEditorStore();
      const dataToAdd = [{ testIri1: "testValue1" }, { testIri2: "testValue2" }];
      wrapper.vm.updateEntity(dataToAdd);
      expect(wrapper.vm.editorEntity).toEqual({ testIri1: "testValue1", testIri2: "testValue2" });
      expect(store.updateCreatorSavedEntity).toHaveBeenCalled();
      expect(store2.updateEditorSavedEntity).not.toHaveBeenCalled();
    });

    it("can update entity ___ object", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const store = useEditorStore();
      const store2 = useCreatorStore();
      const dataToAdd = { testIri1: "testValue1", testIri2: "testValue2" };
      wrapper.vm.updateEntity(dataToAdd);
      expect(wrapper.vm.editorEntity).toEqual({ testIri1: "testValue1", testIri2: "testValue2" });
      expect(store.updateEditorSavedEntity).toHaveBeenCalled();
      expect(store2.updateCreatorSavedEntity).not.toHaveBeenCalled();
    });

    it("can update entity ___ object ___ with type missing from editor", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const store = useEditorStore();
      const store2 = useCreatorStore();
      const dataToAdd = {
        testIri1: "testValue1",
        testIri2: "testValue2",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT_SET }, { iri: IM.VALUE_SET }]
      };
      wrapper.vm.updateEntity(dataToAdd);
      expect(mockUpdateType).toHaveBeenCalled();
      expect(store.updateEditorSavedEntity).toHaveBeenCalled();
      expect(store2.updateCreatorSavedEntity).not.toHaveBeenCalled();
    });

    it("can update entity ___ object ___ with type different from editor", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const store = useEditorStore();
      const store2 = useCreatorStore();
      wrapper.vm.editorEntity = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      const dataToAdd = {
        testIri1: "testValue1",
        testIri2: "testValue2",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT_SET }, { iri: IM.VALUE_SET }]
      };
      wrapper.vm.updateEntity(dataToAdd);
      expect(mockUpdateType).toHaveBeenCalled();
      expect(store.updateEditorSavedEntity).toHaveBeenCalled();
      expect(store2.updateCreatorSavedEntity).not.toHaveBeenCalled();
    });

    it("can update entity ___ object ___ with type same as editor", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const store = useEditorStore();
      const store2 = useCreatorStore();
      wrapper.vm.editorEntity = { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }] };
      const dataToAdd = {
        testIri1: "testValue1",
        testIri2: "testValue2",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: IM.CONCEPT }]
      };
      wrapper.vm.updateEntity(dataToAdd);
      expect(mockUpdateType).not.toHaveBeenCalled();
      expect(store.updateEditorSavedEntity).not.toHaveBeenCalled();
      expect(store2.updateCreatorSavedEntity).not.toHaveBeenCalled();
    });
  });

  describe("deleteEntityKey", () => {
    it("can delete a key from the enditorEntity", () => {
      let mockUpdateType = vi.fn();
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      wrapper.vm.editorEntity = { testIri1: "testValue1", testIri2: "testValue2" };
      wrapper.vm.deleteEntityKey("testIri1");
      expect(wrapper.vm.editorEntity).toEqual(expect.not.objectContaining({ testIri1: "testValue1" }));
    });
  });

  describe("checkForChanges", () => {
    let mockUpdateType;
    beforeEach(() => {
      vi.resetAllMocks();
      mockUpdateType = vi.fn();
    });

    it("can check for changes ___ has changes ___ editor", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const editorStore = useEditorStore();
      wrapper.vm.editorEntity = { testIri1: "testValue1", testIri2: "testValue2" };
      wrapper.vm.editorEntityOriginal = { testIri1: "testValue1" };
      expect(wrapper.vm.checkForChanges()).toBe(true);
      expect(editorStore.updateEditorHasChanges).toHaveBeenCalledWith(true);
    });

    it("can check for changes ___ no changes ___ editor", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.EDIT, mockUpdateType]);
      const editorStore = useEditorStore();
      wrapper.vm.editorEntity = { testIri1: "testValue1", testIri2: "testValue2" };
      wrapper.vm.editorEntityOriginal = { testIri1: "testValue1", testIri2: "testValue2" };
      expect(wrapper.vm.checkForChanges()).toBe(false);
      expect(editorStore.updateEditorHasChanges).toHaveBeenCalledWith(false);
    });

    it("can check for changes ___ has changes ___ creator", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.CREATE, mockUpdateType]);
      const creatorStore = useCreatorStore();
      wrapper.vm.editorEntity = { testIri1: "testValue1", testIri2: "testValue2" };
      wrapper.vm.editorEntityOriginal = { testIri1: "testValue1" };
      expect(wrapper.vm.checkForChanges()).toBe(true);
      expect(creatorStore.updateCreatorHasChanges).toHaveBeenCalledWith(true);
    });

    it("can check for changes ___ no changes ___ creator", () => {
      const wrapper = mountComposable(setupEditorEntity, [EditorMode.CREATE, mockUpdateType]);
      const creatorStore = useCreatorStore();
      wrapper.vm.editorEntity = { testIri1: "testValue1", testIri2: "testValue2" };
      wrapper.vm.editorEntityOriginal = { testIri1: "testValue1", testIri2: "testValue2" };
      expect(wrapper.vm.checkForChanges()).toBe(false);
      expect(creatorStore.updateCreatorHasChanges).toHaveBeenCalledWith(false);
    });
  });
});
