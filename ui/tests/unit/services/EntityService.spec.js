import { EntityService, Env } from "@/services";
import axios from "axios";

const api = Env.API;

describe("EntityService.ts ___ axios success", () => {
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

  it("can getMatchedFrom", async () => {
    const result = await EntityService.getMatchedFrom("testString");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/entity/public/matchedFrom", { params: { iri: "testString" } });
    expect(result).toBe("axios get return");
  });
});
