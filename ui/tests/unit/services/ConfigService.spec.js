import axios from "axios";
import { vi } from "vitest";
import { ConfigService, Env } from "@/services";

describe("ConfigService.ts ___ axios success", () => {
  const node_api = Env.VITE_NODE_API;

  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue(["test config"]);
  });

  it("can get component layout", async () => {
    const result = await ConfigService.getComponentLayout("definition");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(node_api + "node_api/config/public/componentLayout", { params: { name: "definition" } });
    expect(result).toStrictEqual(["test config"]);
  });

  it("can get dashboard layout", async () => {
    const result = await ConfigService.getDashboardLayout("conceptDashboard");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(node_api + "node_api/config/public/dashboardLayout", { params: { name: "conceptDashboard" } });
    expect(result).toStrictEqual(["test config"]);
  });
});

describe("ConfigService.ts ___ axios fail", () => {
  const node_api = Env.VITE_NODE_API;

  beforeEach(() => {
    vi.resetAllMocks();
    const mockError = new Error("axios test error");
    axios.get = vi.fn().mockRejectedValue(mockError);
  });

  it("can get component layout", async () => {
    const result = await ConfigService.getComponentLayout("definition");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(node_api + "node_api/config/public/componentLayout", { params: { name: "definition" } });
    expect(result).toStrictEqual([]);
  });

  it("can get dashboardLayout", async () => {
    const result = await ConfigService.getDashboardLayout("conceptDashboard");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(node_api + "node_api/config/public/dashboardLayout", { params: { name: "conceptDashboard" } });
    expect(result).toStrictEqual([]);
  });
});
