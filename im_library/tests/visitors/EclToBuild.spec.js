import { eclToBuild } from "../../src/helpers/Ecl/EclToBuild";
import eclTestData from "./ecl.testData";
import buildTestData from "./build.testData";

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
    expect(() => eclToBuild("    <  91723000 |Anatomical structure| : R  363698007 |Finding site|  = <  125605004 |Fracture of bone|")).toThrowError(
      "Reverse is not currently supported"
    );
  });

  it("handles long syntax NOT", () => {
    expect(
      eclToBuild("   descendantOf  404684003 |Clinical finding| : 116676008 |Associated morphology|  NOT = descendantOrSelfOf  26036001 |Obstruction|")
    ).toEqual({
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#404684003"
          },
          conjunction: "AND",
          descendants: "<",
          items: [
            {
              operator: "!=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#116676008"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#26036001"
                },
                descendants: "<<"
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    });
  });

  it("converts allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
    expect(eclToBuild(eclTestData.allergyToPenicillinsOrCephasporinsWithCausativeLactams)).toEqual(
      buildTestData.allergyToPenicillinsOrCephasporinsWithCausativeLactams
    );
  });

  it("converts andGroupedWithSubsumptionAttributeValue", () => {
    expect(eclToBuild(eclTestData.andGroupedWithSubsumptionAttributeValue)).toEqual(buildTestData.andGroupedWithSubsumptionAttributeValue);
  });

  it("converts andNoAttributeGroup", () => {
    expect(eclToBuild(eclTestData.andNoAttributeGroup)).toEqual(buildTestData.andNoAttributeGroup);
  });

  it("converts andWithRefinementOfSecondConcept", () => {
    expect(eclToBuild(eclTestData.andWithRefinementOfSecondConcept)).toEqual(buildTestData.andWithRefinementOfSecondConcept);
  });

  it("converts andWithSubsumptionPropertyValue", () => {
    expect(eclToBuild(eclTestData.andWithSubsumptionPropertyValue)).toEqual(buildTestData.andWithSubsumptionPropertyValue);
  });

  it("converts bracketedAnd", () => {
    expect(eclToBuild(eclTestData.bracketedAnd)).toEqual(buildTestData.bracketedAnd);
  });

  it("converts descendantsAndSelf", () => {
    expect(eclToBuild(eclTestData.descendantsAndSelf)).toEqual(buildTestData.descendantsAndSelf);
  });

  it("converts descendantsNotSelf", () => {
    expect(eclToBuild(eclTestData.descendantsNotSelf)).toEqual(buildTestData.descendantsNotSelf);
  });

  it("converts mergedGroupError", () => {
    expect(eclToBuild(eclTestData.mergedGroupError)).toEqual(buildTestData.mergedGroupError);
  });

  it("converts minusAConcept", () => {
    expect(eclToBuild(eclTestData.minusAConcept)).toEqual(buildTestData.minusAConcept);
  });

  it("converts minusAWildCardRefined", () => {
    expect(eclToBuild(eclTestData.minusAWildCardRefined)).toEqual(buildTestData.minusAWildCardRefined);
  });

  it("converts orGroupMinusOrGroup", () => {
    expect(eclToBuild(eclTestData.orGroupMinusOrGroup)).toEqual(buildTestData.orGroupMinusOrGroup);
  });

  it("converts oralNsaids", () => {
    expect(eclToBuild(eclTestData.oralNsaids)).toEqual(buildTestData.oralNsaids);
  });

  it("converts simpleAndDescendants", () => {
    expect(eclToBuild(eclTestData.simpleAndDescendants)).toEqual(buildTestData.simpleAndDescendants);
  });

  it("converts simpleAndShouldBe0", () => {
    expect(eclToBuild(eclTestData.simpleAndShouldBe0)).toEqual(buildTestData.simpleAndShouldBe0);
  });

  it("converts singleConcept", () => {
    expect(eclToBuild(eclTestData.singleConcept)).toEqual(buildTestData.singleConcept);
  });

  it("converts twoAttributeGroups", () => {
    expect(eclToBuild(eclTestData.twoAttributeGroups)).toEqual(buildTestData.twoAttributeGroups);
  });

  it("converts ungroupedButSeparateGroups", () => {
    expect(eclToBuild(eclTestData.ungroupedButSeparateGroups)).toEqual(buildTestData.ungroupedButSeparateGroups);
  });

  it("converts unionWithRefinement", () => {
    expect(eclToBuild(eclTestData.unionWithRefinement)).toEqual(buildTestData.unionWithRefinement);
  });

  it("converts minusWithGroups", () => {
    expect(eclToBuild(eclTestData.minusWithGroups)).toEqual(buildTestData.minusWithGroups);
  });

  it("converts orRefinement", () => {
    expect(eclToBuild(eclTestData.orRefinement)).toEqual(buildTestData.orRefinement);
  });

  it("converts multipleOrRefinement", () => {
    expect(eclToBuild(eclTestData.multipleOrRefinement)).toEqual(buildTestData.multipleOrRefinement);
  });

  it("converts groupedAnd", () => {
    expect(eclToBuild(eclTestData.groupedAnd)).toEqual(buildTestData.groupedAnd);
  });

  it("converts startGroupedConceptWithRefinement", () => {
    expect(eclToBuild(eclTestData.startGroupedConceptWithRefinement)).toEqual({
      type: "BoolGroup",
      conjunction: "AND",
      items: [
        {
          concept: {
            type: "BoolGroup",
            items: [
              {
                type: "Concept",
                descendants: "<<",
                concept: {
                  iri: "http://snomed.info/sct#763158003"
                }
              }
            ],
            conjunction: "AND"
          },
          descendants: "",
          conjunction: "AND",
          type: "Concept",
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
            }
          ]
        }
      ]
    });
  });

  it("converts refinementConjunctionWithGroup", () => {
    expect(eclToBuild(eclTestData.refinementConjunctionWithGroup)).toEqual({
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
              conjunction: "OR",
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
              type: "BoolGroup"
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
              attributeGroup: true,
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
              attributeGroup: true,
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
              attributeGroup: true,
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
              attributeGroup: true,
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

  it("converts chis", () => {
    expect(eclToBuild(eclTestData.chis)).toEqual(buildTestData.chis);
  });

  it("only allows numerical codes ___ number", () => {
    expect(eclToBuild("<< 12345678")).toEqual({
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#12345678"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    });
  });

  it("only allows numerical codes ___ string", () => {
    expect(() => eclToBuild("<< Ontology")).toThrow("Invalid ecl");
  });

  it("only allows numerical codes ___ url", () => {
    expect(() => eclToBuild("<< http://endhealth.info/im#Ontology")).toThrow("Invalid ecl");
  });

  it("works", () => {
    expect(
      eclToBuild(
        "(<< 10363801000001108 OR << 10363901000001102 ): ((<< 127489000  = << 116601002 OR << 10363001000001101  = << 116601002 ) , {<< 411116001  = << 385268001 OR << 13088501000001100  = << 21000001106 OR << 13088401000001104  = << 26643006 OR << 10362901000001105  = << 385268001 })"
      )
    ).toEqual(buildTestData.works);
  });
});
