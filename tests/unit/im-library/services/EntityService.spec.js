import { EntityService, Env } from "../../../../src/im_library/services";
import axios from "axios";
import { setupServer } from "msw/node";

const api = Env.API;

describe("EntityService.ts ___ axios success", () => {
  const restHandlers = [];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can downloadConcept", async () => {
    const result = await EntityService.downloadConcept("testIri", "testFormat");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/exportConcept", { params: { iri: "testIri", format: "testFormat" }, responseType: "blob" });
    expect(result).toBe("axios get return");
  });

  it("can get partial entity", async () => {
    const result = await EntityService.getPartialEntity("testIri", ["pred_1", "pred_2", "pred_3"]);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/partial", { params: { iri: "testIri", predicates: "pred_1,pred_2,pred_3" } });
    expect(result).toBe("axios get return");
  });

  it("can post advancedSearch", async () => {
    const request = {};
    request.page = 1;
    request.schemeFilter = ["http://snomed.info/sct#", "http://endhealth.info/im#"];
    request.size = 100;
    request.sortBy = 0;
    request.statusFilter = ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"];
    request.termFilter = "scolios";
    request.typeFilter = [
      "http://www.w3.org/ns/shacl#NodeShape",
      "http://endhealth.info/im#Concept",
      "http://endhealth.info/im#ConceptSet",
      "http://endhealth.info/im#Folder",
      "http://endhealth.info/im#ConceptSetGroup",
      "http://endhealth.info/im#QueryTemplate",
      "http://endhealth.info/im#ValueSet"
    ];
    const controller = new AbortController();
    const result = await EntityService.advancedSearch(request, controller);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/entity/public/search", request, { signal: controller.signal });
    expect(result).toBe("axios post return");
  });

  it("can get entity parents", async () => {
    const result = await EntityService.getEntityParents("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/parents", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity children", async () => {
    const controller = new AbortController();
    const result = await EntityService.getEntityChildren("testIri", undefined, controller);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/children", { params: { iri: "testIri" }, signal: controller.signal });
    expect(result).toBe("axios get return");
  });

  it("can get entity usages", async () => {
    const result = await EntityService.getEntityUsages("testIri", 1, 25);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/usages", { params: { iri: "testIri", page: 1, size: 25 } });
    expect(result).toBe("axios get return");
  });

  it("can get usages total records", async () => {
    const result = await EntityService.getUsagesTotalRecords("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/usagesTotalRecords", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity graph", async () => {
    const result = await EntityService.getEntityGraph("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/graph", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity term codes", async () => {
    const result = await EntityService.getEntityTermCodes("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/termCode", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get partial bundle", async () => {
    const result = await EntityService.getPartialEntityBundle("testIri", ["testPredicate1", "testPredicate2"]);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/partialBundle", {
      params: { iri: "testIri", predicates: "testPredicate1,testPredicate2" }
    });
    expect(result).toBe("axios get return");
  });

  it("can getInferredBundle", async () => {
    const result = await EntityService.getDefinitionBundle("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/inferredBundle", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get entity summary", async () => {
    const result = await EntityService.getEntitySummary("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/summary", { params: { iri: "testIri" } });
    expect(result).toBe("axios get return");
  });

  it("can get namespaces", async () => {
    const result = await EntityService.getNamespaces();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/namespaces");
    expect(result).toBe("axios get return");
  });

  it("can getEcl", async () => {
    const testBundle = { entity: "testEntity", predicates: "testPredicates" };
    const result = await EntityService.getEcl(testBundle);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/entity/public/ecl", testBundle);
    expect(result).toBe("axios post return");
  });

  it("can getMatchedFrom", async () => {
    const result = await EntityService.getMatchedFrom("testString");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/matchedFrom", { params: { iri: "testString" } });
    expect(result).toBe("axios get return");
  });
});

describe("EntityService.ts ___ axios fail", () => {
  const api = Env.API;

  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockRejectedValue(false);
    axios.post = vi.fn().mockRejectedValue(false);
  });

  it("can downloadConcept", async () => {
    const result = await EntityService.downloadConcept("testIri", "testFormat");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/exportConcept", { params: { iri: "testIri", format: "testFormat" }, responseType: "blob" });
    expect(result).toStrictEqual({});
  });

  it("can get partial entity", async () => {
    const result = await EntityService.getPartialEntity("testIri", ["pred_1", "pred_2", "pred_3"]);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/partial", { params: { iri: "testIri", predicates: "pred_1,pred_2,pred_3" } });
    expect(result).toStrictEqual({});
  });

  it("can post advancedSearch", async () => {
    const request = {};
    request.page = 1;
    request.schemeFilter = ["http://snomed.info/sct#", "http://endhealth.info/im#"];
    request.size = 100;
    request.sortBy = 0;
    request.statusFilter = ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"];
    request.termFilter = "scolios";
    request.typeFilter = [
      "http://www.w3.org/ns/shacl#NodeShape",
      "http://endhealth.info/im#Concept",
      "http://endhealth.info/im#ConceptSet",
      "http://endhealth.info/im#Folder",
      "http://endhealth.info/im#ConceptSetGroup",
      "http://endhealth.info/im#QueryTemplate",
      "http://endhealth.info/im#ValueSet"
    ];
    const controller = new AbortController();
    const result = await EntityService.advancedSearch(request, controller);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/entity/public/search", request, { signal: controller.signal });
    expect(result).toStrictEqual([]);
  });

  it("can get entity parents", async () => {
    const result = await EntityService.getEntityParents("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/parents", { params: { iri: "testIri" } });
    expect(result).toStrictEqual([]);
  });

  it("can get entity children", async () => {
    const controller = new AbortController();
    const result = await EntityService.getEntityChildren("testIri", undefined, controller);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/children", { params: { iri: "testIri" }, signal: controller.signal });
    expect(result).toStrictEqual([]);
  });

  it("can get entity usages", async () => {
    const result = await EntityService.getEntityUsages("testIri", 1, 25);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/usages", { params: { iri: "testIri", page: 1, size: 25 } });
    expect(result).toStrictEqual([]);
  });

  it("can get usages total records", async () => {
    const result = await EntityService.getUsagesTotalRecords("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/usagesTotalRecords", { params: { iri: "testIri" } });
    expect(result).toBe(0);
  });

  it("can get entity graph", async () => {
    const result = await EntityService.getEntityGraph("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/graph", { params: { iri: "testIri" } });
    expect(result).toStrictEqual({});
  });

  it("can get entity term codes", async () => {
    const result = await EntityService.getEntityTermCodes("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/termCode", { params: { iri: "testIri" } });
    expect(result).toStrictEqual({});
  });

  it("can get partial bundle", async () => {
    const result = await EntityService.getPartialEntityBundle("testIri", ["testPredicate1", "testPredicate2"]);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/partialBundle", {
      params: { iri: "testIri", predicates: "testPredicate1,testPredicate2" }
    });
    expect(result).toStrictEqual({});
  });

  it("can getInferredBundle", async () => {
    const result = await EntityService.getDefinitionBundle("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/inferredBundle", { params: { iri: "testIri" } });
    expect(result).toStrictEqual({});
  });

  it("can get entity summary", async () => {
    const result = await EntityService.getEntitySummary("testIri");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/summary", { params: { iri: "testIri" } });
    expect(result).toStrictEqual({});
  });

  it("can get get namespaces", async () => {
    const result = await EntityService.getNamespaces();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/namespaces");
    expect(result).toStrictEqual([]);
  });

  it("can getEcl", async () => {
    const testBundle = { entity: "testEntity", predicates: "testPredicates" };
    const result = await EntityService.getEcl(testBundle);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/entity/public/ecl", testBundle);
    expect(result).toBe("");
  });
});
