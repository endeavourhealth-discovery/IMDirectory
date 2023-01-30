import { describe } from "vitest";
import { EclService, Env } from "@/services";
import axios from "axios";

describe("EclService ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get ECLSearch", async () => {
    const controller = new AbortController();
    const result = await EclService.ECLSearch({ ecl: "testString", includeLegacy: false, limit: 1000 }, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      Env.API + "api/ecl/public/eclSearch",
      { ecl: "testString", includeLegacy: false, limit: 1000 },
      {
        signal: controller.signal
      }
    );
    expect(result).toBe("axios post return");
  });

  it("can getEcl", async () => {
    const testBundle = { entity: "testEntity", predicates: "testPredicates" };
    const result = await EclService.getEcl(testBundle);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/public/ecl", testBundle);
    expect(result).toBe("axios post return");
  });
});

describe("EclService.ts ___ axios fail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockRejectedValue(false);
    axios.post = vi.fn().mockRejectedValue(false);
  });

  it("can get ECLSearch", async () => {
    const controller = new AbortController();
    const result = await EclService.ECLSearch({ ecl: "testString", includeLegacy: false, limit: 1000 }, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      Env.API + "api/ecl/public/eclSearch",
      { ecl: "testString", includeLegacy: false, limit: 1000 },
      {
        signal: controller.signal
      }
    );
    expect(result).toStrictEqual({});
  });

  it("can getEcl", async () => {
    const testBundle = { entity: "testEntity", predicates: "testPredicates" };
    const result = await EclService.getEcl(testBundle);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/public/ecl", testBundle);
    expect(result).toBe("");
  });
});
