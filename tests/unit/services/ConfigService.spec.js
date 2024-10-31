import axios from "axios";
import { vi } from "vitest";
import { ConfigService, Env } from "@/services";

describe("ConfigService.ts ___ axios success", () => {
  const api = Env.API;

  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue(["test config"]);
  });

  it("can get component layout", async () => {
    const result = await ConfigService.getComponentLayout("definition");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/componentLayout", { params: { name: "definition" } });
    expect(result).toStrictEqual(["test config"]);
  });
});
