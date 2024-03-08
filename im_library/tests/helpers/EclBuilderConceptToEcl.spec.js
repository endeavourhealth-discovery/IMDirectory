import { builderConceptToEcl } from "../../src/helpers/EclBuilderConceptToEcl";

describe("builderConceptToEcl", () => {
  it("handles missing concept", () => {
    expect(builderConceptToEcl({})).toEqual("[ UNKNOWN CONCEPT ]");
  });

  it("handles minus", () => {
    expect(builderConceptToEcl({ exclude: true, concept: { code: "12345678" } })).toEqual("MINUS 12345678");
  });

  it("handles descendants", () => {
    expect(builderConceptToEcl({ concept: { code: "12345678" }, descendants: ">>" })).toEqual(">> 12345678");
  });

  it("handles any", () => {
    expect(builderConceptToEcl({ concept: { code: "any" } })).toEqual("*");
  });

  it("handles iri no code", () => {
    expect(builderConceptToEcl({ concept: { iri: "http://endhealth.info/im#12345678" } })).toEqual("12345678");
  });

  it("handles includeTerms", () => {
    expect(builderConceptToEcl({ concept: { code: "12345678", name: "test iri" } }, undefined, true)).toEqual("12345678 | test iri | ");
  });

  it("handles includeTerms ___ any", () => {
    expect(builderConceptToEcl({ concept: { code: "any", name: "test iri" } }, undefined, true)).toEqual("* | ANY | ");
  });

  it("handles includeTerms ___ missing name", () => {
    expect(builderConceptToEcl({ concept: { code: "12345678" } }, undefined, true)).toEqual("12345678");
  });
});
