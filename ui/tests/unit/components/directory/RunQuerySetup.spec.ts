import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityService, QueryService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { createTestStore, mountComposable } from "../../TestMethods";
import testData from "./RunQuerySetup.testData";
import setupRunQuery from "@/composables/setupRunQuery";

describe("setupRunQuery", () => {
  let hasPredicatesSpy: any;
  let queryIMSpy: any;

  beforeEach(async () => {
    vi.resetAllMocks();
    hasPredicatesSpy = vi.spyOn(EntityService, "hasPredicates");
    queryIMSpy = vi.spyOn(QueryService, "queryIM");
  });

  it("runQueryFromIri __ runs query and returns", async () => {
    const testEntity: any = fakerFactory.entity.create();
    testEntity[IM.DEFINITION] = testData.stringDefinition;
    hasPredicatesSpy.mockResolvedValue(false);
    queryIMSpy.mockResolvedValue(testData.queryResults);
    const mockState = { conceptIri: "http://endhealth.info/im#VSET_Attendedornotattended" };
    const mockCommit = vi.fn();
    const mockDispatch = vi.fn();
    const wrapper = mountComposable(setupRunQuery, createTestStore(mockState, mockCommit, mockDispatch));
    await wrapper.vm.runQueryFromIri();
    expect(queryIMSpy).toHaveBeenCalled();
    expect(wrapper.vm.queryResults).toEqual(testData.queryResults);
  });
});
