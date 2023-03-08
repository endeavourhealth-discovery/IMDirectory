import { describe, it, expect } from "vitest";
import { eclToBuild, eclToIMQ } from "../../../src/logic/eclLogic";
import testData from "./eclLogic.testData";

describe("eclLogic", () => {
  describe("eclToIMQ", () => {
    it("converts orGroupMinusOrGroup", () => {
      expect(eclToIMQ(testData.ecl.orGroupMinusOrGroup)).toEqual(testData.query.orGroupMinusOrGroup);
    });

    it("converts allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
      expect(eclToIMQ(testData.ecl.allergyToPenicillinsOrCephasporinsWithCausativeLactams)).toEqual(
        testData.query.allergyToPenicillinsOrCephasporinsWithCausativeLactams
      );
    });

    it("converts andGroupedWithSubsumptionAttributeValue", () => {
      expect(eclToIMQ(testData.ecl.andGroupedWithSubsumptionAttributeValue)).toEqual(testData.query.andGroupedWithSubsumptionAttributeValue);
    });

    it("converts andNoAttributeGroup", () => {
      expect(eclToIMQ(testData.ecl.andNoAttributeGroup)).toEqual(testData.query.andNoAttributeGroup);
    });

    it("converts andWithRefinementOfSecondConcept", () => {
      expect(eclToIMQ(testData.ecl.andWithRefinementOfSecondConcept)).toEqual(testData.query.andWithRefinementOfSecondConcept);
    });

    it("converts andWithSubsumptionPropertyValue", () => {
      expect(eclToIMQ(testData.ecl.andWithSubsumptionPropertyValue)).toEqual(testData.query.andWithSubsumptionPropertyValue);
    });

    it("converts bracketedAnd", () => {
      expect(eclToIMQ(testData.ecl.bracketedAnd)).toEqual(testData.query.bracketedAnd);
    });

    it("converts descendantsAndSelf", () => {
      expect(eclToIMQ(testData.ecl.descendantsAndSelf)).toEqual(testData.query.descendantsAndSelf);
    });

    it("converts descendantsNotSelf", () => {
      expect(eclToIMQ(testData.ecl.descendantsNotSelf)).toEqual(testData.query.descendantsNotSelf);
    });

    it("converts mergedGroupError", () => {
      expect(eclToIMQ(testData.ecl.mergedGroupError)).toEqual(testData.query.mergedGroupError);
    });

    it("converts minusAConcept", () => {
      expect(eclToIMQ(testData.ecl.minusAConcept)).toEqual(testData.query.minusAConcept);
    });

    it("converts minusAWildCardRefined", () => {
      expect(eclToIMQ(testData.ecl.minusAWildCardRefined)).toEqual(testData.query.minusAWildCardRefined);
    });

    it("converts oral nsaids", () => {
      expect(eclToIMQ(testData.ecl.oralNsaids)).toEqual(testData.query.oralNsaids);
    });

    it("converts simple and descendants", () => {
      expect(eclToIMQ(testData.ecl.simpleAndDescendants)).toEqual(testData.query.simpleAndDescendants);
    });

    it("converts simple and should be 0", () => {
      expect(eclToIMQ(testData.ecl.simpleAndShouldBe0)).toEqual(testData.query.simpleAndShouldBe0);
    });

    it("converts singleConcept", () => {
      expect(eclToIMQ(testData.ecl.singleConcept)).toEqual(testData.query.singleConcept);
    });

    it("converts twoAttributeGroups", () => {
      expect(eclToIMQ(testData.ecl.twoAttributeGroups)).toEqual(testData.query.twoAttributeGroups);
    });

    it("converts ungroupedButSeparateGroups", () => {
      expect(eclToIMQ(testData.ecl.ungroupedButSeparateGroups)).toEqual(testData.query.ungroupedButSeparateGroups);
    });

    it("converts unionWithRefinement", () => {
      expect(eclToIMQ(testData.ecl.unionWithRefinement)).toEqual(testData.query.unionWithRefinement);
    });

    it("converts minusWithGroups", () => {
      expect(eclToIMQ(testData.ecl.minusWithGroups)).toEqual(testData.query.minusWithGroups);
    });

    it("converts orRefinement", () => {
      expect(eclToIMQ(testData.ecl.orRefinement)).toEqual(testData.query.orRefinement);
    });

    it("converts multipleOrRefinement", () => {
      expect(eclToIMQ(testData.ecl.multipleOrRefinement)).toEqual(testData.query.multipeOrRefinement);
    });

    it("converts refinementConjunctionWithGroup", () => {
      expect(eclToIMQ(testData.ecl.refinementConjunctionWithGroup)).toEqual(testData.query.refinementConjunctionWithGroup);
    });
  });

  describe("eclToBuild", () => {
    it("handles no string", () => {
      expect(() => eclToBuild("")).toThrowError();
    });

    it("errors with member", () => {
      expect(() => eclToBuild("^ 700043003 |Example problem list concepts reference set|")).toThrowError("'^/memberOf' is not currently supported");
    });

    it("errors with cardinality", () => {
      expect(() =>
        eclToBuild(" <  373873005 |Pharmaceutical / biologic product| : [1..3]  127489000 |Has active ingredient|  = <  105590001 |Substance|")
      ).toThrowError("Cardinality is not currently supported");
    });

    it("errors with reverse", () => {
      expect(() => {
        eclToBuild("    <  91723000 |Anatomical structure| : R  363698007 |Finding site|  = <  125605004 |Fracture of bone|").toThrowError(
          "'R/reverseOf/.' is not currently supported"
        );
      });
    });

    it("errors with NOT", () => {
      expect(() => {
        eclToBuild(
          "   descendantOf  404684003 |Clinical finding| : 116676008 |Associated morphology|  NOT = descendantOrSelfOf  26036001 |Obstruction|"
        ).toThrowError("'NOT' is currently not supported. Please use '!=' notation instead");
      });
    });

    it("converts allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
      expect(eclToBuild(testData.ecl.allergyToPenicillinsOrCephasporinsWithCausativeLactams)).toEqual(
        testData.builder.allergyToPenicillinsOrCephasporinsWithCausativeLactams
      );
    });

    it("converts andGroupedWithSubsumptionAttributeValue", () => {
      expect(eclToBuild(testData.ecl.andGroupedWithSubsumptionAttributeValue)).toEqual(testData.builder.andGroupedWithSubsumptionAttributeValue);
    });

    it("converts andNoAttributeGroup", () => {
      expect(eclToBuild(testData.ecl.andNoAttributeGroup)).toEqual(testData.builder.andNoAttributeGroup);
    });

    it("converts andWithRefinementOfSecondConcept", () => {
      expect(eclToBuild(testData.ecl.andWithRefinementOfSecondConcept)).toEqual(testData.builder.andWithRefinementOfSecondConcept);
    });

    it("converts andWithSubsumptionPropertyValue", () => {
      expect(eclToBuild(testData.ecl.andWithSubsumptionPropertyValue)).toEqual(testData.builder.andWithSubsumptionPropertyValue);
    });

    it("converts bracketedAnd", () => {
      expect(eclToBuild(testData.ecl.bracketedAnd)).toEqual(testData.builder.bracketedAnd);
    });

    it("converts descendantsAndSelf", () => {
      expect(eclToBuild(testData.ecl.descendantsAndSelf)).toEqual(testData.builder.descendantsAndSelf);
    });

    it("converts descendantsNotSelf", () => {
      expect(eclToBuild(testData.ecl.descendantsNotSelf)).toEqual(testData.builder.descendantsNotSelf);
    });

    it("converts mergedGroupError", () => {
      expect(eclToBuild(testData.ecl.mergedGroupError)).toEqual(testData.builder.mergedGroupError);
    });

    it("converts minusAConcept", () => {
      expect(eclToBuild(testData.ecl.minusAConcept)).toEqual(testData.builder.minusAConcept);
    });

    it("converts minusAWildCardRefined", () => {
      expect(eclToBuild(testData.ecl.minusAWildCardRefined)).toEqual(testData.builder.minusAWildCardRefined);
    });

    it("converts orGroupMinusOrGroup", () => {
      expect(eclToBuild(testData.ecl.orGroupMinusOrGroup)).toEqual(testData.builder.orGroupMinusOrGroup);
    });

    it("converts oralNsaids", () => {
      expect(eclToBuild(testData.ecl.oralNsaids)).toEqual(testData.builder.oralNsaids);
    });

    it("converts simpleAndDescendants", () => {
      expect(eclToBuild(testData.ecl.simpleAndDescendants)).toEqual(testData.builder.simpleAndDescendants);
    });

    it("converts simpleAndShouldBe0", () => {
      expect(eclToBuild(testData.ecl.simpleAndShouldBe0)).toEqual(testData.builder.simpleAndShouldBe0);
    });

    it("converts singleConcept", () => {
      expect(eclToBuild(testData.ecl.singleConcept)).toEqual(testData.builder.singleConcept);
    });

    it("converts twoAttributeGroups", () => {
      expect(eclToBuild(testData.ecl.twoAttributeGroups)).toEqual(testData.builder.twoAttributeGroups);
    });

    it("converts ungroupedButSeparateGroups", () => {
      expect(eclToBuild(testData.ecl.ungroupedButSeparateGroups)).toEqual(testData.builder.ungroupedButSeparateGroups);
    });

    it("converts unionWithRefinement", () => {
      expect(eclToBuild(testData.ecl.unionWithRefinement)).toEqual(testData.builder.unionWithRefinement);
    });

    it("converts minusWithGroups", () => {
      expect(eclToBuild(testData.ecl.minusWithGroups)).toEqual(testData.builder.minusWithGroups);
    });

    it("converts orRefinement", () => {
      expect(eclToBuild(testData.ecl.orRefinement)).toEqual(testData.builder.orRefinement);
    });

    it("converts multipleOrRefinement", () => {
      expect(eclToBuild(testData.ecl.multipleOrRefinement)).toEqual(testData.builder.multipleOrRefinement);
    });

    it("converts", () => {
      expect(eclToBuild(testData.ecl.refinementConjunctionWithGroup)).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            concept: {
              iri: "http://snomed.info/sct#763158003"
            },
            conjunction: "AND",
            items: [
              {
                type: "Refinement",
                property: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#127489000"
                  }
                },
                value: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#387207008"
                  }
                },
                operator: "="
              },

              {
                type: "BoolGroup",
                items: [
                  {
                    type: "Refinement",
                    property: {
                      descendants: "<<",
                      concept: {
                        iri: "http://snomed.info/sct#411116001"
                      }
                    },
                    value: {
                      descendants: "<<",
                      concept: {
                        iri: "http://snomed.info/sct#763820000"
                      }
                    },
                    operator: "="
                  },
                  {
                    type: "Refinement",
                    property: {
                      descendants: "<<",
                      concept: {
                        iri: "http://snomed.info/sct#411116001"
                      }
                    },
                    value: {
                      descendants: "<<",
                      concept: {
                        iri: "http://snomed.info/sct#421701006"
                      }
                    },
                    operator: "="
                  }
                ],
                conjunction: "OR"
              }
            ]
          }
        ]
      });
    });

    it("handles simple concept", () => {
      expect(eclToBuild("<<  404684003")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores concept names", () => {
      expect(eclToBuild("<<  404684003 |Clinical finding|")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores comments", () => {
      expect(eclToBuild("/* test comment */<<  404684003 |Clinical finding|/* test comment*/")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores newline characters", () => {
      expect(eclToBuild("<<  404684003 |Clinical finding|\n")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("ignores tab characters", () => {
      expect(eclToBuild("<<  404684003 |Clinical finding|\t")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#404684003"
            },
            items: []
          }
        ]
      });
    });

    it("handles * concept", () => {
      expect(eclToBuild("*")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "",
            conjunction: "AND",
            concept: {
              iri: "*"
            },
            items: []
          }
        ]
      });
    });

    it("handles 'ANY' concept", () => {
      expect(eclToBuild("*")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "",
            conjunction: "AND",
            concept: {
              iri: "*"
            },
            items: []
          }
        ]
      });
    });

    it("handles long format", () => {
      expect(eclToBuild("descendantOf  19829001 |Disorder of lung| : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#19829001"
            },
            items: [
              {
                type: "Refinement",
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
      expect(eclToBuild("<  19829001 |Disorder of lung| : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            conjunction: "AND",
            concept: {
              iri: "http://snomed.info/sct#19829001"
            },
            items: [
              {
                type: "Refinement",
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
      expect(eclToBuild("    * : 116676008 |Associated morphology|  =  79654002 |Edema|")).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "",
            conjunction: "AND",
            concept: {
              iri: "*"
            },
            items: [
              {
                type: "Refinement",
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
        eclToBuild(
          "    <  404684003 |Clinical finding| : 363698007 |Finding site|  = <<  39057004 |Pulmonary valve structure| , 116676008 |Associated morphology|  = <<  415582006 |Stenosis|"
        )
      ).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            conjunction: "AND",
            concept: { iri: "http://snomed.info/sct#404684003" },
            items: [
              {
                type: "Refinement",
                property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                operator: "=",
                value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#39057004" } }
              },
              {
                type: "Refinement",
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
        "<  404684003 |Clinical finding| : { 363698007 |Finding site| = <<  39057004 |Pulmonary valve structure| , 116676008 |Associated morphology| = <<  415582006 |Stenosis| } AND {  363698007 |Finding site| = <<  53085002 |Right ventricular structure| , 116676008 |Associated morphology| = <<  56246009 |Hypertrophy| }";
      expect(eclToBuild(complexEclString)).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            conjunction: "AND",
            concept: { iri: "http://snomed.info/sct#404684003" },
            items: [
              {
                type: "BoolGroup",
                conjunction: "AND",
                items: [
                  {
                    type: "Refinement",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#39057004" } }
                  },
                  {
                    type: "Refinement",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#116676008" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#415582006" } }
                  }
                ]
              },
              {
                type: "BoolGroup",
                conjunction: "AND",
                items: [
                  {
                    type: "Refinement",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#53085002" } }
                  },
                  {
                    type: "Refinement",
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

    it("handles refinements with groups including or's", () => {
      const ecl =
        "<  404684003 |Clinical finding| : { 363698007 |Finding site| = <<  39057004 |Pulmonary valve structure| OR 116676008 |Associated morphology| = <<  415582006 |Stenosis| } AND {  363698007 |Finding site| = <<  53085002 |Right ventricular structure| OR 116676008 |Associated morphology| = <<  56246009 |Hypertrophy| }";
      expect(eclToBuild(ecl)).toEqual({
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            type: "Concept",
            descendants: "<",
            conjunction: "AND",
            concept: { iri: "http://snomed.info/sct#404684003" },
            items: [
              {
                type: "BoolGroup",
                conjunction: "OR",
                items: [
                  {
                    type: "Refinement",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#39057004" } }
                  },
                  {
                    type: "Refinement",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#116676008" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#415582006" } }
                  }
                ]
              },
              {
                type: "BoolGroup",
                conjunction: "OR",
                items: [
                  {
                    type: "Refinement",
                    property: { descendants: "", concept: { iri: "http://snomed.info/sct#363698007" } },
                    operator: "=",
                    value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#53085002" } }
                  },
                  {
                    type: "Refinement",
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
