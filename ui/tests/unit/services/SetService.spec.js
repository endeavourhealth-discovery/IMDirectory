import { SetService, Env } from "@/services";
import axios from "axios";
import { setupServer } from "msw/node";

describe("SetService.ts ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get ECLSearch", async () => {
    const controller = new AbortController();
    const result = await SetService.ECLSearch({ ecl: "testString", includeLegacy: false, limit: 1000 }, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      Env.API + "api/set/public/eclSearch",
      { ecl: "testString", includeLegacy: false, limit: 1000 },
      {
        signal: controller.signal
      }
    );
    expect(result).toBe("axios post return");
  });

  it("can publish", async () => {
    const result = await SetService.publish("testIri");
    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(Env.API + "api/set/publish", {
      params: { iri: "testIri" }
    });
    expect(result).toBe("axios get return");
  });

  it("can get IMV1", async () => {
    const result = await SetService.IMV1("testIri");
    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(Env.API + "api/set/public/export", { params: { iri: "testIri" }, responseType: "blob" });
    expect(result).toBe("axios get return");
  });
});

describe("SetService.ts ___ axios fail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockRejectedValue(false);
    axios.post = vi.fn().mockRejectedValue(false);
  });

  it("can get ECLSearch", async () => {
    const controller = new AbortController();
    const result = await SetService.ECLSearch({ ecl: "testString", includeLegacy: false, limit: 1000 }, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      Env.API + "api/set/public/eclSearch",
      { ecl: "testString", includeLegacy: false, limit: 1000 },
      {
        signal: controller.signal
      }
    );
    expect(result).toStrictEqual({});
  });
});
