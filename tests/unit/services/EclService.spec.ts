import type { ECLQueryRequest, Query } from "vue-library/interfaces";

import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as fakerFactory from "@/mocks/fakerFactory";
import { EclService, Env } from "@/services";

describe("EclService ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get ECLSearch", async () => {
    const fakerResults = [await fakerFactory.conceptSummaryRandom()];
    axios.post = vi.fn().mockResolvedValue({ entities: fakerResults, count: fakerResults.length, page: 1 });
    const controller = new AbortController();
    const eclSearchRequest: ECLQueryRequest = { query: { is: [{ iri: "testString" }] }, includeLegacy: false, limit: 1000 };
    const result = await EclService.ECLSearch(eclSearchRequest, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/protected/eclSearch", eclSearchRequest, {
      signal: controller.signal
    });
    expect(result).toEqual({ entities: fakerResults, count: fakerResults.length, page: 1 });
  });

  it("can getEcl", async () => {
    const testQuery: Query = { is: [{ iri: "testEntity" }] };
    const result = await EclService.getEcl(testQuery);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/protected/ecl", { query: testQuery });
    expect(result).toBe("axios post return");
  });
});
