import axios from "axios";
import { vi } from "vitest";
import { setupServer } from "msw/node";
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

  it("can get dashboard layout", async () => {
    const result = await ConfigService.getDashboardLayout("conceptDashboard");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/dashboardLayout", { params: { name: "conceptDashboard" } });
    expect(result).toStrictEqual(["test config"]);
  });
});

describe("ConfigService.ts ___ axios fail", () => {
  const api = Env.API;

  beforeEach(() => {
    vi.resetAllMocks();
    const mockError = new Error("axios test error");
    axios.get = vi.fn().mockRejectedValue(mockError);
  });

  it("can get component layout", async () => {
    const result = await ConfigService.getComponentLayout("definition");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/componentLayout", { params: { name: "definition" } });
    expect(result).toStrictEqual([]);
  });

  it("can get dashboardLayout", async () => {
    const result = await ConfigService.getDashboardLayout("conceptDashboard");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/dashboardLayout", { params: { name: "conceptDashboard" } });
    expect(result).toStrictEqual([]);
  });
});
