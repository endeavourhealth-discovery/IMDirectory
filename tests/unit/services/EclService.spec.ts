import { type ECLQueryRequest, ECLQueryRequestSchema, type Query, QuerySchema } from "@endeavour/vue-library/models";

import { beforeEach, describe, expect, it, vi } from "vitest";

import * as fakerFactory from "@/mocks/fakerFactory";
import { EclService, Env } from "@/services";

import api from "../../../src/services/api";

describe("EclService ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.get = vi.fn().mockResolvedValue("axios get return");
    api.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get ECLSearch", async () => {
    const fakerResults = [await fakerFactory.conceptSummaryRandom()];
    api.post = vi.fn().mockResolvedValue({ entities: fakerResults, count: fakerResults.length, page: 1 });
    const controller = new AbortController();
    const eclSearchRequest = ECLQueryRequestSchema.parse({ query: { is: { iri: "http://endhealth.info/im#testString" } }, includeLegacy: false, limit: 1000 });
    const result = await EclService.ECLSearch(eclSearchRequest, controller);
    expect(api.post).toBeCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(Env.API + "api/ecl/protected/eclSearch", eclSearchRequest, {
      signal: controller.signal
    });
    expect(result).toEqual({ entities: fakerResults, count: fakerResults.length, page: 1 });
  });

  it("can getEcl", async () => {
    const testQuery = QuerySchema.parse({ is: { iri: "http://endhealth.info/im#testEntity" } });
    const result = await EclService.getEcl(testQuery);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(Env.API + "api/ecl/protected/ecl", { query: testQuery });
    expect(result).toBe("axios post return");
  });
});
