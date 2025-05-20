import { ttValueToString, ttIriToString, ttNodeToString, bundleToText } from "@/helpers/Transforms";

const url = window.location.origin;

describe("bundleToText", () => {
  const testBundle = {
    entity: {
      "http://endhealth.info/im#isA": [
        {
          iri: "http://snomed.info/sct#82354003",
          name: "Multiple system malformation syndrome (disorder)"
        },
        {
          iri: "http://snomed.info/sct#85995004",
          name: "Autosomal recessive hereditary disorder (disorder)"
        },
        {
          iri: "http://snomed.info/sct#89886004",
          name: "Congenital anomaly of skeletal muscle (disorder)"
        },
        {
          iri: "http://snomed.info/sct#128084001",
          name: "Duane's syndrome, type 3 (disorder)"
        },
        {
          iri: "http://snomed.info/sct#298382003",
          name: "Scoliosis deformity of spine (disorder)"
        },
        {
          iri: "http://snomed.info/sct#363212003",
          name: "Hereditary disorder of musculoskeletal system (disorder)"
        },
        {
          iri: "http://snomed.info/sct#363235000",
          name: "Hereditary disorder of nervous system (disorder)"
        },
        {
          iri: "http://snomed.info/sct#363343008",
          name: "Hereditary disorder of the visual system (disorder)"
        },
        {
          iri: "http://snomed.info/sct#257277002",
          name: "Combined disorder of muscle AND peripheral nerve (disorder)"
        },
        {
          iri: "http://snomed.info/sct#363070008",
          name: "Developmental hereditary disorder (disorder)"
        }
      ],
      "http://endhealth.info/im#roleGroup": [
        {
          "http://snomed.info/sct#370135005": {
            iri: "http://snomed.info/sct#308490002",
            name: "Pathological developmental process (qualifier value)"
          },
          "http://snomed.info/sct#116676008": {
            iri: "http://snomed.info/sct#49755003",
            name: "Morphologically abnormal structure (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": {
            iri: "http://snomed.info/sct#80622005",
            name: "Abducens nerve structure (body structure)"
          },
          "http://snomed.info/sct#246454002": {
            iri: "http://snomed.info/sct#255399007",
            name: "Congenital (qualifier value)"
          }
        },
        {
          "http://snomed.info/sct#370135005": {
            iri: "http://snomed.info/sct#308490002",
            name: "Pathological developmental process (qualifier value)"
          },
          "http://snomed.info/sct#116676008": {
            iri: "http://snomed.info/sct#31739005",
            name: "Lateral abnormal curvature (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": {
            iri: "http://snomed.info/sct#289959001",
            name: "Musculoskeletal structure of spine (body structure)"
          }
        },
        {
          "http://snomed.info/sct#370135005": {
            iri: "http://snomed.info/sct#308490002",
            name: "Pathological developmental process (qualifier value)"
          },
          "http://snomed.info/sct#116676008": {
            iri: "http://snomed.info/sct#49755003",
            name: "Morphologically abnormal structure (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": {
            iri: "http://snomed.info/sct#127954009",
            name: "Skeletal muscle structure (body structure)"
          },
          "http://snomed.info/sct#246454002": {
            iri: "http://snomed.info/sct#255399007",
            name: "Congenital (qualifier value)"
          }
        },
        {
          "http://snomed.info/sct#370135005": {
            iri: "http://snomed.info/sct#308490002",
            name: "Pathological developmental process (qualifier value)"
          },
          "http://snomed.info/sct#116676008": {
            iri: "http://snomed.info/sct#49755003",
            name: "Morphologically abnormal structure (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": {
            iri: "http://snomed.info/sct#81745001",
            name: "Structure of eye proper (body structure)"
          },
          "http://snomed.info/sct#246454002": {
            iri: "http://snomed.info/sct#255399007",
            name: "Congenital (qualifier value)"
          }
        }
      ]
    },
    predicates: {
      "http://snomed.info/sct#370135005": "Pathological process (attribute)",
      "http://endhealth.info/im#roleGroup": "Where",
      "http://snomed.info/sct#116676008": "Associated morphology (attribute)",
      "http://snomed.info/sct#363698007": "Finding site (attribute)",
      "http://snomed.info/sct#246454002": "Occurrence (attribute)",
      "http://endhealth.info/im#isA": "Is a",
      "http://www.w3.org/2002/07/owl#onProperty": "On property",
      "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
      "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
      "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
    }
  };

  const PREDICATES = {
    "http://endhealth.info/im#isA": "Is a",
    "http://endhealth.info/im#roleGroup": "Where",
    "http://www.w3.org/2002/07/owl#onProperty": "On property",
    "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
    "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
    "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
  };

  const expected =
    "Where : \n" +
    '  ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '    Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</Button>\n' +
    '    Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2380622005">Abducens nerve structure</Button>\n' +
    '    Occurrence : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</Button> )\n' +
    '  ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '    Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2331739005">Lateral abnormal curvature</Button>\n' +
    '    Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23289959001">Musculoskeletal structure of spine</Button> )\n' +
    '  ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '    Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</Button>\n' +
    '    Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23127954009">Skeletal muscle structure</Button>\n' +
    '    Occurrence : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</Button> )\n' +
    '  ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '    Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</Button>\n' +
    '    Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2381745001">Structure of eye proper</Button>\n' +
    '    Occurrence : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</Button> )\n';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("can convert a bundle to text", async () => {
    expect(bundleToText("", testBundle, PREDICATES, 0, true)).toBe(expected);
  });
});

describe("ttValueToString", () => {
  it("handles ttIri", async () => {
    expect(ttValueToString("", { iri: "testIri", name: "testName" }, "object", 0, true)).toBe(
      '<Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testName</Button>'
    );
  });

  it("handles array", async () => {
    expect(ttValueToString("", [{ iri: "testIri" }], "object", 0, true)).toBe(
      '<Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testIri</Button>\n'
    );
  });

  it("handles ttNode", async () => {
    expect(ttValueToString("", { nodeIri: { iri: "testIri" } }, "object", 0, true)).toStrictEqual(
      'nodeIri : <Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testIri</Button>\n'
    );
  });

  it("handles undefined", async () => {
    expect(ttValueToString("", undefined, "object", 0, true)).toBe("undefined");
  });
});

describe("ttIriToString", () => {
  it("handles iri with name", () => {
    expect(ttIriToString("", { iri: "testIri", name: "testName" }, "object", 0, true, false)).toBe(
      '<Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testName</Button>'
    );
  });

  it("handles iri no name", () => {
    expect(ttIriToString("", { iri: "testIri", name: "" }, "object", 0, true, false)).toBe(
      '<Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testIri</Button>'
    );
  });

  it("handles not inline", () => {
    expect(ttIriToString("", { iri: "testIri", name: "testName" }, "object", 2, true, false)).toBe(
      '    <Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testName</Button>'
    );
  });

  it("handles inline", () => {
    expect(ttIriToString("", { iri: "testIri", name: "testName" }, "object", 2, true, true)).toBe(
      '<Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testName</Button>'
    );
  });

  it("handles previous array", () => {
    expect(ttIriToString("", { iri: "testIri", name: "testName" }, "array", 2, true, true)).toBe(
      '<Button link as="a" target="_blank" href="http://localhost/#/concept/testIri">testName</Button>\n'
    );
  });
});

describe("ttNodeToString ___ isa rolegroup", () => {
  const NODE = {
    "http://endhealth.info/im#isA": [
      {
        iri: "http://snomed.info/sct#82354003",
        name: "Multiple system malformation syndrome"
      },
      {
        iri: "http://snomed.info/sct#85995004",
        name: "Autosomal recessive hereditary disorder"
      },
      {
        iri: "http://snomed.info/sct#89886004",
        name: "Congenital anomaly of skeletal muscle"
      },
      {
        iri: "http://snomed.info/sct#128084001",
        name: "Duane's syndrome, type 3"
      },
      {
        iri: "http://snomed.info/sct#298382003",
        name: "Scoliosis deformity of spine"
      },
      {
        iri: "http://snomed.info/sct#363212003",
        name: "Hereditary disorder of musculoskeletal system"
      },
      {
        iri: "http://snomed.info/sct#363235000",
        name: "Hereditary disorder of nervous system"
      },
      {
        iri: "http://snomed.info/sct#363343008",
        name: "Hereditary disorder of the visual system"
      },
      {
        iri: "http://snomed.info/sct#257277002",
        name: "Combined disorder of muscle AND peripheral nerve (disorder)"
      },
      {
        iri: "http://snomed.info/sct#363070008",
        name: "Developmental hereditary disorder"
      },
      {
        "http://endhealth.info/im#roleGroup": [
          {
            "http://snomed.info/sct#370135005": {
              iri: "http://snomed.info/sct#308490002",
              name: "Pathological developmental process"
            },
            "http://snomed.info/sct#116676008": {
              iri: "http://snomed.info/sct#49755003",
              name: "Morphologically abnormal structure"
            },
            "http://snomed.info/sct#363698007": {
              iri: "http://snomed.info/sct#80622005",
              name: "Abducens nerve structure"
            },
            "http://snomed.info/sct#246454002": {
              iri: "http://snomed.info/sct#255399007",
              name: "Congenital"
            }
          },
          {
            "http://snomed.info/sct#370135005": {
              iri: "http://snomed.info/sct#308490002",
              name: "Pathological developmental process"
            },
            "http://snomed.info/sct#116676008": {
              iri: "http://snomed.info/sct#31739005",
              name: "Lateral abnormal curvature"
            },
            "http://snomed.info/sct#363698007": {
              iri: "http://snomed.info/sct#289959001",
              name: "Musculoskeletal structure of spine"
            }
          },
          {
            "http://snomed.info/sct#370135005": {
              iri: "http://snomed.info/sct#308490002",
              name: "Pathological developmental process"
            },
            "http://snomed.info/sct#116676008": {
              iri: "http://snomed.info/sct#49755003",
              name: "Morphologically abnormal structure"
            },
            "http://snomed.info/sct#363698007": {
              iri: "http://snomed.info/sct#127954009",
              name: "Skeletal muscle structure"
            },
            "http://snomed.info/sct#246454002": {
              iri: "http://snomed.info/sct#255399007",
              name: "Congenital"
            }
          },
          {
            "http://snomed.info/sct#370135005": {
              iri: "http://snomed.info/sct#308490002",
              name: "Pathological developmental process"
            },
            "http://snomed.info/sct#116676008": {
              iri: "http://snomed.info/sct#49755003",
              name: "Morphologically abnormal structure"
            },
            "http://snomed.info/sct#363698007": {
              iri: "http://snomed.info/sct#81745001",
              name: "Structure of eye proper"
            },
            "http://snomed.info/sct#246454002": {
              iri: "http://snomed.info/sct#255399007",
              name: "Congenital"
            }
          }
        ]
      }
    ]
  };
  const EXPECTED =
    "http://endhealth.info/im#isA : \n" +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2382354003">Multiple system malformation syndrome</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2385995004">Autosomal recessive hereditary disorder</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2389886004">Congenital anomaly of skeletal muscle</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    "/#/concept/http:%2F%2Fsnomed.info%2Fsct%23128084001\">Duane's syndrome, type 3</Button>\n" +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23298382003">Scoliosis deformity of spine</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363212003">Hereditary disorder of musculoskeletal system</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363235000">Hereditary disorder of nervous system</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363343008">Hereditary disorder of the visual system</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23257277002">Combined disorder of muscle AND peripheral nerve</Button>\n' +
    '  <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363070008">Developmental hereditary disorder</Button>\n' +
    "  Where : \n" +
    '    ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '      Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</Button>\n' +
    '      Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2380622005">Abducens nerve structure</Button>\n' +
    '      Occurrence : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</Button> )\n' +
    '    ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '      Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2331739005">Lateral abnormal curvature</Button>\n' +
    '      Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23289959001">Musculoskeletal structure of spine</Button> )\n' +
    '    ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '      Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</Button>\n' +
    '      Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23127954009">Skeletal muscle structure</Button>\n' +
    '      Occurrence : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</Button> )\n' +
    '    ( Pathological process : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</Button>\n' +
    '      Associated morphology : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</Button>\n' +
    '      Finding site : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2381745001">Structure of eye proper</Button>\n' +
    '      Occurrence : <Button link as="a" target="_blank" href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</Button> )\n';

  const PREDICATES = {
    "http://endhealth.info/im#roleGroup": "Where",
    "http://snomed.info/sct#116676008": "Associated morphology",
    "http://snomed.info/sct#363698007": "Finding site",
    "http://endhealth.info/im#mapAdvice": "mapping advice",
    "http://endhealth.info/im#hasMap": "has map",
    "http://endhealth.info/im#mapPriority": "mapPriority",
    "http://endhealth.info/im#matchedTo": "matched To",
    "http://endhealth.info/im#assuranceLevel": "assurance level",
    "http://snomed.info/sct#246454002": "Occurrence",
    "http://snomed.info/sct#370135005": "Pathological process (attribute)",
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Is subclass of",
    "http://endhealth.info/im#someOf": "some of",
    "http://www.w3.org/2002/07/owl#onProperty": "On property",
    "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
    "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
    "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
  };
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("handles node ___ missing iriMap", async () => {
    expect(ttNodeToString("", NODE, "object", 0, true, PREDICATES)).toBe(EXPECTED);
  });
});
