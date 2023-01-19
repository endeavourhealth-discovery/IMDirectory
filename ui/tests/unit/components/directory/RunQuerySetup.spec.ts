import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntityService, QueryService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { fakerFactory } from "@/mocks/factory";
import { createTestStore, createTestRouter, mountComposable } from "../../TestMethods";
import testData from "./RunQuerySetup.testData";
import setupRunQuery from "@/composables/setupRunQuery";

describe("setupRunQuery", () => {
  let getPartialEntitySpy;
  let queryIMSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    getPartialEntitySpy = vi.spyOn(EntityService, "getPartialEntity");
    queryIMSpy = vi.spyOn(QueryService, "queryIM");
  });

  it("does nothing if no definition", async () => {
    const mockState = { conceptIri: undefined };
    const mockCommit = vi.fn();
    const mockDispatch = vi.fn();
    const wrapper = mountComposable(setupRunQuery, createTestStore(mockState, mockCommit, mockDispatch));
    await wrapper.vm.getQueryFromIri();
    expect(wrapper.vm.imquery).toEqual({});
    expect(wrapper.vm.showTestQueryResults).toEqual(false);
  });

  it("getQueryFromIri __ parses definition string to query object", async () => {
    const testEntity = fakerFactory.entity.create();
    testEntity[IM.DEFINITION] = testData.stringDefinition;
    getPartialEntitySpy.mockResolvedValue(testEntity);
    const mockState = { conceptIri: "http://endhealth.info/im#VSET_Attendedornotattended" };
    const mockCommit = vi.fn();
    const mockDispatch = vi.fn();
    const wrapper = mountComposable(setupRunQuery, createTestStore(mockState, mockCommit, mockDispatch));
    await wrapper.vm.getQueryFromIri();
    expect(getPartialEntitySpy).toHaveBeenCalled();
    expect(wrapper.vm.imquery).toEqual(JSON.parse(testData.stringDefinition));
  });

  it("runQueryFromIri __ runs query and returns", async () => {
    const testEntity = fakerFactory.entity.create();
    testEntity[IM.DEFINITION] = testData.stringDefinition;
    getPartialEntitySpy.mockResolvedValue(testEntity);
    queryIMSpy.mockResolvedValue(testData.queryResults);
    const mockState = { conceptIri: "http://endhealth.info/im#VSET_Attendedornotattended" };
    const mockCommit = vi.fn();
    const mockDispatch = vi.fn();
    const wrapper = mountComposable(setupRunQuery, createTestStore(mockState, mockCommit, mockDispatch));
    await wrapper.vm.runQueryFromIri();
    expect(getPartialEntitySpy).toHaveBeenCalled();
    expect(queryIMSpy).toHaveBeenCalled();
    expect(wrapper.vm.imquery).toEqual(JSON.parse(testData.stringDefinition));
    expect(wrapper.vm.queryResults).toEqual(testData.queryResults);
  });
});
