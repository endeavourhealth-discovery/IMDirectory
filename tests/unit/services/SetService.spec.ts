import { beforeEach, describe, expect, it, vi } from "vitest";

import { Env, SetService } from "@/services";

import api from "../../../src/services/api";

describe("SetService.ts ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.get = vi.fn().mockResolvedValue("axios get return");
    api.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can publish", async () => {
    const result = await SetService.publish("testIri");
    expect(api.get).toBeCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(Env.API + "api/set/private/publish", {
      params: { iri: "testIri" }
    });
    expect(result).toBe("axios get return");
  });

  it("can get IMV1", async () => {
    const result = await SetService.IMV1("testIri");
    expect(api.get).toBeCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(Env.API + "api/set/protected/export", { params: { iri: "testIri" }, responseType: "blob" });
    expect(result).toBe("axios get return");
  });
});
