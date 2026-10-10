import { beforeEach, describe, expect, it, vi } from "vitest";

import { RDFS } from "@endeavour/vue-library/enums";

import { EntityService } from "@/services";

import api from "../../../src/services/api";

describe("EntityService.getLabels", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.post = vi.fn();
  });

  it("fetches every label in a single request", async () => {
    api.post = vi.fn().mockResolvedValue([
      { iri: "http://endhealth.info/im#a", [RDFS.LABEL]: "A" },
      { iri: "http://endhealth.info/im#b", [RDFS.LABEL]: "B" }
    ]);
    const labels = await EntityService.getLabels(["http://endhealth.info/im#a", "http://endhealth.info/im#b", "http://endhealth.info/im#a"]);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(labels.get("http://endhealth.info/im#a")).toBe("A");
    expect(labels.get("http://endhealth.info/im#b")).toBe("B");
  });

  it("omits iris that have no label", async () => {
    api.post = vi.fn().mockResolvedValue([{ iri: "http://endhealth.info/im#a" }]);
    const labels = await EntityService.getLabels(["http://endhealth.info/im#a"]);
    expect(labels.size).toBe(0);
  });

  it("makes no request for an empty list", async () => {
    const labels = await EntityService.getLabels([]);
    expect(api.post).not.toHaveBeenCalled();
    expect(labels.size).toBe(0);
  });
});
