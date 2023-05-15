import { expect, vi } from "vitest";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { mountComposable } from "../TestMethods";

import { setupEditorEntity } from "@/composables/setupEditorEntity";

describe("fetchEntity", () => {
  let getFullEntitySpy;
  beforeEach(async () => {
    vi.resetAllMocks();
    getFullEntitySpy = vi.spyOn(EntityService, "getFullEntity");
  });

  it("does nothing if no editorIri", async () => {
    const wrapper = mountComposable(setupEditorEntity, { editor: { editorIri: undefined}});

    await wrapper.vm.fetchEntity();
    expect(wrapper.vm.editorEntity).toEqual({});
    expect(wrapper.vm.editorEntityOriginal).toEqual({});
    expect(wrapper.vm.entityName).toEqual("");
  });

  it("gets full entity by iri and process entity", async () => {
    const testEntity = fakerFactory.entity.create();
    getFullEntitySpy.mockResolvedValue(testEntity);
    const wrapper = mountComposable(setupEditorEntity, { editor: { editorIri: "testIri"}});

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
    const wrapper = mountComposable(setupEditorEntity);
    const result = wrapper.vm.processEntity(testEntity);
    expect(result).toEqual(expect.objectContaining({ "http://endhealth.info/im#id": testEntity["@id"] }));
    expect(result).toEqual(
      expect.not.objectContaining({ "http://endhealth.info/im#im1Id": testEntity.IM_1_ID, "http://endhealth.info/im#im1Scheme": testEntity.IM_1_SCHEME })
    );
  });
});
