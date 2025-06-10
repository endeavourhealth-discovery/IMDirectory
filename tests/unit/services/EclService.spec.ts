import { describe, beforeEach, it, expect, vi } from "vitest";
import { EclService, Env } from "@/services";
import axios from "axios";
import { fakerFactory } from "@/mocks/fakerFactory";
import { EclSearchRequest, Query } from "@/interfaces/AutoGen";

describe("EclService ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get ECLSearch", async () => {
    const fakerResults = [fakerFactory.conceptSummary.create()];
    axios.post = vi.fn().mockResolvedValue({ entities: fakerResults, count: fakerResults.length, page: 1 });
    const controller = new AbortController();
    const eclSearchRequest: EclSearchRequest = { eclQuery: { instanceOf: [{ iri: "testString" }] }, includeLegacy: false, limit: 1000 };
    const result = await EclService.ECLSearch(eclSearchRequest, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/public/eclSearch", eclSearchRequest, {
      signal: controller.signal
    });
    expect(result).toEqual({ entities: fakerResults, count: fakerResults.length, page: 1 });
  });

  it("can getEcl", async () => {
    const testQuery: Query = { instanceOf: [{ iri: "testEntity" }] };
    const result = await EclService.getEcl(testQuery);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/public/ecl", testQuery);
    expect(result).toBe("axios post return");
  });
});
