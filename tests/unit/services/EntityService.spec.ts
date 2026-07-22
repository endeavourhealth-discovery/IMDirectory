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
    const result = await EntityService.getPartialEntity("http://endhealth.info/im#testIri", ["pred_1", "pred_2", "pred_3"]);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/partial", {
      params: { iri: "http://endhealth.info/im#testIri", predicates: "pred_1,pred_2,pred_3" }
    });
    console.log(result);
    expect(result).toBe("axios get return");
  });

  it("can get entity parents", async () => {
    const result = await EntityService.getEntityParents("http://endhealth.info/im#testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/parents", { params: { iri: "http://endhealth.info/im#testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity children", async () => {
    const controller = new AbortController();
    const result = await EntityService.getEntityChildren("http://endhealth.info/im#testIri", undefined, controller);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/children", {
      params: { iri: "http://endhealth.info/im#testIri" },
      signal: controller.signal
    });
    expect(result).toBe("axios get return");
  });

  it("can get entity usages", async () => {
    const result = await EntityService.getEntityUsages("http://endhealth.info/im#testIri", 1, 25);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/usages", { params: { iri: "http://endhealth.info/im#testIri", page: 1, size: 25 } });
    expect(result).toBe("axios get return");
  });

  it("can get usages total records", async () => {
    const result = await EntityService.getUsagesTotalRecords("http://endhealth.info/im#testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/usagesTotalRecords", { params: { iri: "http://endhealth.info/im#testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity graph", async () => {
    const result = await EntityService.getEntityGraph("http://endhealth.info/im#testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/graph", { params: { iri: "http://endhealth.info/im#testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity term codes", async () => {
    const result = await ConceptService.getEntityTermCodes("http://endhealth.info/im#testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/concept/protected/termCode", { params: { iri: "http://endhealth.info/im#testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get partial bundle", async () => {
    const result = await EntityService.getPartialEntityBundle("http://endhealth.info/im#testIri", ["testPredicate1", "testPredicate2"]);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/partialBundle", {
      params: { iri: "http://endhealth.info/im#testIri", predicates: "testPredicate1,testPredicate2" }
    });
    expect(result).toBe("axios get return");
  });

  it("can get entity summary", async () => {
    const result = await EntityService.getEntitySummary("http://endhealth.info/im#testIri");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/protected/summary", { params: { iri: "http://endhealth.info/im#testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get namespaces", async () => {
    const result = await EntityService.getNamespaces();
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/entity/public/namespaces");
    expect(result).toBe("axios get return");
  });

  it("can getMatchedFrom", async () => {
    const result = await ConceptService.getMatchedFrom("http://endhealth.info/im#testString");
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(apiUrl + "api/concept/protected/matchedFrom", { params: { iri: "testString" } });
    expect(result).toBe("axios get return");
  });
});
