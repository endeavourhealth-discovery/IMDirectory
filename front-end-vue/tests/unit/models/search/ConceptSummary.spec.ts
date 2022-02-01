import { ConceptSummary } from "@/models/search/ConceptSummary";

describe("ConceptSummary.ts", () => {
  it("has the correct fields", () => {
    let summary = new ConceptSummary();
    summary = {
      name: "TestName",
      iri: "TestIri",
      scheme: { name: "schemeName", "@id": "schemeIri" },
      code: "testCode",
      entityType: [{ name: "typeName", "@id": "typeIri" }],
      isDescendentOf: [],
      weighting: 8,
      match: "testMatch",
      status: { name: "statusName", "@id": "statusIri" }
    };
    expect(summary.name).toBe("TestName");
    expect(summary.iri).toBe("TestIri");
    expect(summary.scheme).toStrictEqual({ name: "schemeName", "@id": "schemeIri" });
    expect(summary.code).toBe("testCode");
    expect(summary.entityType).toStrictEqual([{ name: "typeName", "@id": "typeIri" }]);
    expect(summary.isDescendentOf).toStrictEqual([]);
    expect(summary.weighting).toBe(8);
    expect(summary.match).toBe("testMatch");
    expect(summary.status).toStrictEqual({ name: "statusName", "@id": "statusIri" });
  });
});
