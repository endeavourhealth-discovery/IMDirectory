import {
  iriToUrl,
  urlToIri,
  eclStringToBuilderObject,
  breakdownEcl,
  splitEclByFocusConcept,
  checkForFocusConceptConjunction,
  checkForRefinementConjunction
} from "@/helpers/Converters";
import { describe, expect, it } from "vitest";

describe("Converters", () => {
  describe("iriToUrl", () => {
    it("converts an iri to a url", () => {
      expect(iriToUrl("http://endhealth.info/im#Ontologies")).toBe("http:%2F%2Fendhealth.info%2Fim%23Ontologies");
    });
  });

  describe("urlToIri", () => {
    it("converts a url to an iri", () => {
      expect(urlToIri("http:%2F%2Fendhealth.info%2Fim%23Ontologies")).toBe("http://endhealth.info/im#Ontologies");
    });
  });

  it("splits ecl by focus concept", () => {
    const builderObject = { type: "BoolGroup", operator: "OR", items: [] };
    expect(
      splitEclByFocusConcept(
        "<  404684003 : {  363698007 = <<  39057004 , 116676008 = <<  415582006 }, {  363698007 = <<  53085002 , 116676008 = <<  56246009 } AND << 763158003",
        builderObject
      )
    ).toEqual([
      "<  404684003 : {  363698007 = <<  39057004 , 116676008 = <<  415582006 }, {  363698007 = <<  53085002 , 116676008 = <<  56246009 }",
      "<< 763158003"
    ]);
    expect(builderObject.operator).toBe("AND");
  });

  it("checksForFocusConceptConjunction ___ true", () => {
    expect(checkForFocusConceptConjunction("AND << 763158003")).toBe(true);
  });

  it("checksForFocusConceptConjunction ___ false", () => {
    expect(checkForFocusConceptConjunction("AND << 763158003 = << 415582006")).toBe(false);
  });

  it("checksForRefinementConjuncton ___ true", () => {
    expect(checkForRefinementConjunction("AND 363698007 = << 53085002 , 116676008 = <<  56246009")).toBe(true);
  });

  it("checksForRefinementConjuncton with group ___ true", () => {
    expect(checkForRefinementConjunction("AND { 363698007 = << 53085002 , 116676008 = <<  56246009 }")).toBe(true);
  });

  it("checksForRefinementConjuncton ___ false", () => {
    expect(checkForRefinementConjunction("AND << 763158003")).toBe(false);
  });

  describe.skip("eclStringToBuilderObject", () => {
    it("handles no string", () => {
      expect(eclStringToBuilderObject("")).toEqual({ type: "BoolGroup", operator: "AND", items: [] });
    });

    it("handles simple concept", () => {
      expect(eclStringToBuilderObject("<<  404684003")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            operator: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores concept names", () => {
      expect(eclStringToBuilderObject("<<  404684003 |Clinical finding|")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            operator: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores comments", () => {
      expect(eclStringToBuilderObject("/* test comment */<<  404684003 |Clinical finding|/* test comment*/")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            operator: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores newline characters", () => {
      expect(eclStringToBuilderObject("<<  404684003 |Clinical finding|\n")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            operator: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores tab characters", () => {
      expect(eclStringToBuilderObject("<<  404684003 |Clinical finding|\t")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            operator: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("handles * concept", () => {
      expect(eclStringToBuilderObject("*")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "",
            operator: "AND",
            concept: {
              iri: "*"
            },
            items: []
          }
        ]
      });
    });

    it("handles 'ANY' concept", () => {
      expect(eclStringToBuilderObject("*")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "",
            operator: "AND",
            concept: {
              iri: "*"
            },
            items: []
          }
        ]
      });
    });

    it("handles concept with refinement", () => {
      expect(eclStringToBuilderObject("    <  19829001 |Disorder of lung| : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            operator: "AND",
            concept: {
              iri: "http://snomed.info/sct#19829001"
            },
            items: [
              {
                type: "RefinementX",
                property: { descendants: "", concept: { iri: "http://snomed.info/sct#116676008" } },
                operator: "=",
                value: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#79654002"
                  }
                }
              }
            ]
          }
        ]
      });
    });

    it("handles ANY concept with refinement", () => {
      expect(eclStringToBuilderObject("    * : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "",
            operator: "AND",
            concept: {
              iri: "*"
            },
            items: [
              {
                type: "RefinementX",
                property: { descendants: "", concept: { iri: "http://snomed.info/sct#116676008" } },
                operator: "=",
                value: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#79654002"
                  }
                }
              }
            ]
          }
        ]
      });
    });

    it("handles concept with multiple refinements", () => {
      expect(
        eclStringToBuilderObject(
          "    <  404684003 |Clinical finding| : 363698007 |Finding site|  = <<  39057004 |Pulmonary valve structure| , 116676008 |Associated morphology|  = <<  415582006 |Stenosis|"
        )
      ).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            operator: "AND",
            concept: { iri: "http://snomed.info/sct#404684003" },
            items: [
              {
                type: "RefinementX",
                property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                operator: "=",
                value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#39057004" } }
              },
              {
                type: "RefinementX",
                property: { descendants: "", concept: { iri: "http://snomed.info/sct#116676008" } },
                operator: "=",
                value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#415582006" } }
              }
            ]
          }
        ]
      });
    });

    it("handles concept with grouped refinements", () => {
      const complexEclString =
        "<  404684003 |Clinical finding| : {  363698007 |Finding site|  = <<  39057004 |Pulmonary valve structure| , 116676008 |Associated morphology|  = <<  415582006 |Stenosis| }, {  363698007 |Finding site|  = <<  53085002 |Right ventricular structure| , 116676008 |Associated morphology|  = <<  56246009 |Hypertrophy| }";
      expect(eclStringToBuilderObject(complexEclString)).toEqual({
        type: "BoolGroup",
        operator: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            operator: "AND",
            concept: { iri: "http://snomed.info/sct#404684003" },
            items: [
              {
                type: "BoolGroup",
                operator: "AND",
                items: [
                  {
                    type: "RefinementX",
                    property: { descendants: "<<", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#39057004" } }
                  },
                  {
                    type: "RefinementX",
                    property: { descendants: "<<", concept: { iri: "http://snomed.info/sct#116676008" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#415582006" } }
                  }
                ]
              },
              {
                type: "BoolGroup",
                operator: "AND",
                items: [
                  {
                    type: "RefinementX",
                    property: { descendants: "<<", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#53085002" } }
                  },
                  {
                    type: "RefinementX",
                    property: { descendants: "<<", concept: { iri: "http://snomed.info/sct#116676008" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#56246009" } }
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });
});
