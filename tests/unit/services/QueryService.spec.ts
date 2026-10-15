import { beforeEach, describe, expect, it, vi } from "vitest";

import { EclService, QueryService } from "@/services";

import api from "../../../src/services/api";

describe("cancelled searches", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the abort signal on to the request", async () => {
    api.post = vi.fn().mockResolvedValue({ entities: [] });
    const controller = new AbortController();
    await QueryService.queryIMSearch({} as any, controller);
    expect(api.post).toHaveBeenCalledWith(expect.stringContaining("queryIMSearch"), {}, expect.objectContaining({ signal: controller.signal }));
  });

  it.each([
    ["queryIM", (controller: AbortController) => QueryService.queryIM({} as any, controller)],
    ["queryIMSearch", (controller: AbortController) => QueryService.queryIMSearch({} as any, controller)],
    ["ECLSearch", (controller: AbortController) => EclService.ECLSearch({} as any, controller)]
  ])("%s resolves quietly to nothing when cancelled", async (_name, call) => {
    // the api interceptor resolves a cancelled request to undefined
    api.post = vi.fn().mockResolvedValue(undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const controller = new AbortController();
    controller.abort();
    expect(await call(controller)).toBeUndefined();
    expect(error).not.toHaveBeenCalled();
  });
});
