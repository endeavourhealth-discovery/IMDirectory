import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConceptService, EntityService, Env } from "@/services";

import api from "../../../src/services/api";

const apiUrl = Env.API;

describe("EntityService.ts ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.get = vi.fn().mockResolvedValue("axios get return");
    api.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get partial entity", async () => {
    const result = await EntityService.getPartialEntity("testIri", ["pred_1", "pred_2", "pred_3"]);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/partial", { params: { iri: "testIri", predicates: "pred_1,pred_2,pred_3" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity parents", async () => {
    const result = await EntityService.getEntityParents("testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/parents", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity children", async () => {
    const controller = new AbortController();
    const result = await EntityService.getEntityChildren("testIri", undefined, controller);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/children", { params: { iri: "testIri" }, signal: controller.signal });
    expect(result).toBe("axios get return");
  });

  it("can get entity usages", async () => {
    const result = await EntityService.getEntityUsages("testIri", 1, 25);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/usages", { params: { iri: "testIri", page: 1, size: 25 } });
    expect(result).toBe("axios get return");
  });

  it("can get usages total records", async () => {
    const result = await EntityService.getUsagesTotalRecords("testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/usagesTotalRecords", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity graph", async () => {
    const result = await EntityService.getEntityGraph("testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/graph", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity term codes", async () => {
    const result = await ConceptService.getEntityTermCodes("testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/concept/protected/termCode", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get partial bundle", async () => {
    const result = await EntityService.getPartialEntityBundle("testIri", ["testPredicate1", "testPredicate2"]);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/partialBundle", {
      params: { iri: "testIri", predicates: "testPredicate1,testPredicate2" }
    });
    expect(result).toBe("axios get return");
  });

  it("can get entity summary", async () => {
    const result = await EntityService.getEntitySummary("testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/summary", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get namespaces", async () => {
    const result = await EntityService.getNamespaces();
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/public/namespaces");
    expect(result).toBe("axios get return");
  });

  it("can getMatchedFrom", async () => {
    const result = await ConceptService.getMatchedFrom("testString");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/concept/protected/matchedFrom", { params: { iri: "testString" } });
    expect(result).toBe("axios get return");
  });
});
