import { describe } from "vitest";
import { EclService, Env } from "@/services";
import axios from "axios";
import { fakerFactory } from "@im-library/mocks/fakerFactory";

describe("EclService ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can get ECLSearch", async () => {
    const fakerResults = [fakerFactory.conceptSummary.create()];
    axios.post.mockResolvedValue(fakerResults);
    const controller = new AbortController();
    const result = await EclService.ECLSearch({ eclQuery: { from: { "@id": "testString" } }, includeLegacy: false, limit: 1000 }, controller);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      Env.VITE_NODE_API + "node_api/ecl/public/eclSearch",
      { eclQuery: { from: { "@id": "testString" } }, includeLegacy: false, limit: 1000 },
      {
        signal: controller.signal
      }
    );
    expect(result).toBe(fakerResults);
  });

  it("can getEcl", async () => {
    const testBundle = { entity: "testEntity", predicates: "testPredicates" };
    const result = await EclService.getEcl(testBundle);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.API + "api/ecl/public/ecl", testBundle);
    expect(result).toBe("axios post return");
  });
});
