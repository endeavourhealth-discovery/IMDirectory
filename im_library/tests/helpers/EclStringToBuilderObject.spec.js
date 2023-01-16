import {
  eclStringToBuilderObject,
  breakdownEcl,
  splitEclByFocusConcept,
  splitEclByRefinement,
  isFocusConceptConjunction,
  isRefinementConjunction,
  isRefinement,
  isFocusConcept,
  processDescendantAndCode,
  extractConcept,
  extractRefinement
} from "@/helpers/EclStringToBuilderObject";
import { describe } from "vitest";

describe("eclStringToBuilderObject", () => {
  describe("splitEclByFocusConcept", () => {
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
  });

  describe("isFocusConcept", () => {
    it("matches simple focus concept", () => {
      expect(isFocusConcept("<< 763158003")).toBe(true);
    });
  });

  describe("isFocusConceptConjunction", () => {
    it("isFocusConceptConjunction ___ true", () => {
      expect(isFocusConceptConjunction("AND << 763158003")).toBe(true);
    });

    it("isFocusConceptConjunction ___ false", () => {
      expect(isFocusConceptConjunction("AND << 763158003 = << 415582006")).toBe(false);
    });
  });

  describe("isRefinementGroup", () => {
    it("isRefinementConjuncton ___ true", () => {
      expect(isRefinementConjunction("363698007 = << 53085002 , 116676008 = <<  56246009")).toBe(true);
    });

    it("isRefinementConjuncton with group ___ true", () => {
      expect(isRefinementConjunction("{ 363698007 = << 53085002 , 116676008 = <<  56246009 }")).toBe(true);
    });

    it("isRefinementConjuncton ___ false", () => {
      expect(isRefinementConjunction("<< 763158003")).toBe(false);
    });
  });

  describe("isRefinement", () => {
    it("handles refinement ___ true", () => {
      expect(isRefinement("363698007 = << 53085002")).toBe(true);
    });

    it("handles refinement no << extra spaces ___ true", () => {
      expect(isRefinement("116676008   =  79654002")).toBe(true);
    });

    it("handles refinement ___ false", () => {
      expect(isRefinement("<< 53085002")).toBe(false);
    });

    it("handles groups", () => {
      expect(isRefinement("{ 363698007 = << 53085002, 116676008 = <<  56246009 }")).toBe(true);
    });
  });

  describe("precessDescendantAndCode", () => {
    it("handles simple code descendant pair", () => {
      const parentObject = { descendants: "", concept: { iri: "" } };
      processDescendantAndCode("<<  56246009", parentObject);
      expect(parentObject).toEqual({ descendants: "<<", concept: { iri: "http://snomed.info/sct#56246009" } });
    });
  });

  describe("extractConcept", () => {
    it("handles concept with refinements", () => {
      expect(extractConcept("    <  404684003 : 363698007 = <<  39057004 , 116676008 = <<  415582006")).toEqual({
        extract: "<  404684003",
        remainder: ": 363698007 = <<  39057004 , 116676008 = <<  415582006"
      });
    });
  });

  describe("extractRefinement", () => {
    it("handles simple refinement", () => {
      expect(extractRefinement("363698007 = <<  39057004 , 116676008 = <<  415582006")).toEqual({
        extract: "363698007 = <<  39057004",
        remainder: ", 116676008 = <<  415582006"
      });
    });
  });

  describe("splitEclByRefinement", () => {
    it("splits ecl by refinementConjunction", () => {
      const parentObject = { type: "Concept", descendants: "", operator: "OR", concept: { iri: "" }, items: [] };
      expect(
        splitEclByRefinement("363698007 = <<  39057004 , 116676008 = <<  415582006 , 363698007 = <<  53085002 , 116676008 = <<  56246009 ", parentObject)
      ).toEqual(["363698007 = <<  39057004", "116676008 = <<  415582006", "363698007 = <<  53085002", "116676008 = <<  56246009"]);
      expect(parentObject.operator).toBe("AND");
    });

    it("splits ecl by refinementConjunction ___ group", () => {
      const parentObject = { type: "Concept", descendants: "", operator: "OR", concept: { iri: "" }, items: [] };
      expect(
        splitEclByRefinement(
          "{  363698007 = <<  39057004 , 116676008 = <<  415582006 }, {  363698007 = <<  53085002 , 116676008 = <<  56246009 }, {  363698007 = <<  39057004 , 116676008 = <<  415582006 }",
          parentObject
        )
      ).toEqual([
        "{  363698007 = <<  39057004 , 116676008 = <<  415582006 }",
        "{  363698007 = <<  53085002 , 116676008 = <<  56246009 }",
        "{  363698007 = <<  39057004 , 116676008 = <<  415582006 }"
      ]);
      expect(parentObject.operator).toBe("AND");
    });
  });

  describe("eclStringToBuilderObject", () => {
    it("handles no string", () => {
      expect(eclStringToBuilderObject("")).toEqual({ type: "BoolGroup", operator: "AND", items: [] });
    });

    it("errors with member", () => {
      expect(() => eclStringToBuilderObject("^ 700043003 |Example problem list concepts reference set|")).toThrowError();
    });

    it("errors with cardinality", () => {
      expect(() =>
        eclStringToBuilderObject(" <  373873005 |Pharmaceutical / biologic product| : [1..3]  127489000 |Has active ingredient|  = <  105590001 |Substance|")
      ).toThrowError();
    });

    it("errors with reverse", () => {
      expect(() => {
        eclStringToBuilderObject("    <  91723000 |Anatomical structure| : R  363698007 |Finding site|  = <  125605004 |Fracture of bone|").toThrowError();
      });
    });

    it("errors with NOT", () => {
      expect(() => {
        eclStringToBuilderObject(
          "   descendantOf  404684003 |Clinical finding| : 116676008 |Associated morphology|  NOT = descendantOrSelfOf  26036001 |Obstruction|"
        ).toThrowError();
      });
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

    it("handles long format", () => {
      expect(eclStringToBuilderObject("descendantOf  19829001 |Disorder of lung| : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
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

    it("handles concept with refinement", () => {
      expect(eclStringToBuilderObject("<  19829001 |Disorder of lung| : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
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
        "<  404684003 |Clinical finding| : { 363698007 |Finding site| = <<  39057004 |Pulmonary valve structure| , 116676008 |Associated morphology| = <<  415582006 |Stenosis| } , {  363698007 |Finding site| = <<  53085002 |Right ventricular structure| , 116676008 |Associated morphology| = <<  56246009 |Hypertrophy| }";
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
              },
              {
                type: "BoolGroup",
                operator: "AND",
                items: [
                  {
                    type: "RefinementX",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#53085002" } }
                  },
                  {
                    type: "RefinementX",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#116676008" } },
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
