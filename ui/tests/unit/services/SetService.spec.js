import { SetService, Env } from "@/services";
import axios from "axios";

describe("SetService.ts ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
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
