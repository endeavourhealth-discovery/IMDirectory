import SetService from "@/services/SetService";
import axios from "axios";

const api = process.env.VUE_APP_API;

describe("SetService.ts ___ axios success", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    axios.get = jest.fn().mockResolvedValue("axios get return");
    axios.post = jest.fn().mockResolvedValue("axios post return");
  });

  it("can download", async () => {
    const result = await SetService.download("testIri", false, false);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/set/public/download", {
      params: { iri: "testIri", expandMembers: false, v1: false, format: "excel" },
      responseType: "blob"
    });
    expect(result).toBe("axios get return");
  });

  it("can get ECLSearch", async () => {
    const cancelToken = axios.CancelToken.source().token;
    const result = await SetService.ECLSearch("testString", false, 1000, cancelToken);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/set/public/eclSearch", "testString", {
      headers: { "Content-Type": "text/plain" },
      params: { includeLegacy: false, limit: 1000 },
      cancelToken: cancelToken
    });
    expect(result).toBe("axios post return");
  });
});

describe("SetService.ts ___ axios fail", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    axios.get = jest.fn().mockRejectedValue(false);
    axios.post = jest.fn().mockRejectedValue(false);
  });

  it("can get ECLSearch", async () => {
    const cancelToken = axios.CancelToken.source().token;
    const result = await SetService.ECLSearch("testString", false, 1000, cancelToken);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/set/public/eclSearch", "testString", {
      headers: { "Content-Type": "text/plain" },
      params: { includeLegacy: false, limit: 1000 },
      cancelToken: cancelToken
    });
    expect(result).toStrictEqual({});
  });
});
