import { ttValueToString, ttArrayToString, ttIriToString, ttNodeToString, bundleToText } from "@/helpers/Transforms";

const url = window.location.origin;

describe("bundleToText", () => {
  const testBundle = {
    entity: {
      "http://endhealth.info/im#isA": [
        { "@id": "http://snomed.info/sct#82354003", name: "Multiple system malformation syndrome (disorder)" },
        { "@id": "http://snomed.info/sct#85995004", name: "Autosomal recessive hereditary disorder (disorder)" },
        { "@id": "http://snomed.info/sct#89886004", name: "Congenital anomaly of skeletal muscle (disorder)" },
        { "@id": "http://snomed.info/sct#128084001", name: "Duane's syndrome, type 3 (disorder)" },
        { "@id": "http://snomed.info/sct#298382003", name: "Scoliosis deformity of spine (disorder)" },
        { "@id": "http://snomed.info/sct#363212003", name: "Hereditary disorder of musculoskeletal system (disorder)" },
        { "@id": "http://snomed.info/sct#363235000", name: "Hereditary disorder of nervous system (disorder)" },
        { "@id": "http://snomed.info/sct#363343008", name: "Hereditary disorder of the visual system (disorder)" },
        { "@id": "http://snomed.info/sct#257277002", name: "Combined disorder of muscle AND peripheral nerve (disorder)" },
        { "@id": "http://snomed.info/sct#363070008", name: "Developmental hereditary disorder (disorder)" }
      ],
      "http://endhealth.info/im#roleGroup": [
        {
          "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process (qualifier value)" },
          "http://snomed.info/sct#116676008": {
            "@id": "http://snomed.info/sct#49755003",
            name: "Morphologically abnormal structure (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#80622005", name: "Abducens nerve structure (body structure)" },
          "http://snomed.info/sct#246454002": { "@id": "http://snomed.info/sct#255399007", name: "Congenital (qualifier value)" }
        },
        {
          "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process (qualifier value)" },
          "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature (morphologic abnormality)" },
          "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine (body structure)" }
        },
        {
          "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process (qualifier value)" },
          "http://snomed.info/sct#116676008": {
            "@id": "http://snomed.info/sct#49755003",
            name: "Morphologically abnormal structure (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#127954009", name: "Skeletal muscle structure (body structure)" },
          "http://snomed.info/sct#246454002": { "@id": "http://snomed.info/sct#255399007", name: "Congenital (qualifier value)" }
        },
        {
          "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process (qualifier value)" },
          "http://snomed.info/sct#116676008": {
            "@id": "http://snomed.info/sct#49755003",
            name: "Morphologically abnormal structure (morphologic abnormality)"
          },
          "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#81745001", name: "Structure of eye proper (body structure)" },
          "http://snomed.info/sct#246454002": { "@id": "http://snomed.info/sct#255399007", name: "Congenital (qualifier value)" }
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
    '  ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '    Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</a>\n' +
    '    Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2380622005">Abducens nerve structure</a>\n' +
    '    Occurrence : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</a> )\n' +
    '  ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '    Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2331739005">Lateral abnormal curvature</a>\n' +
    '    Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23289959001">Musculoskeletal structure of spine</a> )\n' +
    '  ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '    Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</a>\n' +
    '    Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23127954009">Skeletal muscle structure</a>\n' +
    '    Occurrence : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</a> )\n' +
    '  ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '    Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</a>\n' +
    '    Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2381745001">Structure of eye proper</a>\n' +
    '    Occurrence : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</a> )\n';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("can convert a bundle to text", async () => {
    expect(bundleToText(testBundle, PREDICATES, 0, true)).toBe(expected);
  });
});

describe("ttValueToString", () => {
  it("handles ttIri", async () => {
    expect(ttValueToString({ "@id": "testIri", name: "testName" }, "object", 0, true)).toBe('<a href="http://localhost/#/concept/testIri">testName</a>');
  });

  it("handles array", async () => {
    expect(ttValueToString([{ "@id": "testIri" }], "object", 0, true)).toBe('<a href="http://localhost/#/concept/testIri">testIri</a>\n');
  });

  it("handles ttNode", async () => {
    expect(ttValueToString({ nodeIri: { "@id": "testIri" } }, "object", 0, true)).toStrictEqual(
      'nodeIri : <a href="http://localhost/#/concept/testIri">testIri</a>\n'
    );
  });

  it("handles undefined", async () => {
    expect(ttValueToString(undefined, "object", 0, true)).toBe("undefined");
  });
});

describe("ttIriToString", () => {
  it("handles iri with name", () => {
    expect(ttIriToString({ "@id": "testIri", name: "testName" }, "object", 0, true, false)).toBe('<a href="http://localhost/#/concept/testIri">testName</a>');
  });

  it("handles iri no name", () => {
    expect(ttIriToString({ "@id": "testIri", name: "" }, "object", 0, true, false)).toBe('<a href="http://localhost/#/concept/testIri">testIri</a>');
  });

  it("handles not inline", () => {
    expect(ttIriToString({ "@id": "testIri", name: "testName" }, "object", 2, true, false)).toBe(
      '    <a href="http://localhost/#/concept/testIri">testName</a>'
    );
  });

  it("handles inline", () => {
    expect(ttIriToString({ "@id": "testIri", name: "testName" }, "object", 2, true, true)).toBe('<a href="http://localhost/#/concept/testIri">testName</a>');
  });

  it("handles previous array", () => {
    expect(ttIriToString({ "@id": "testIri", name: "testName" }, "array", 2, true, true)).toBe('<a href="http://localhost/#/concept/testIri">testName</a>\n');
  });
});

describe("ttNodeToString ___ isa rolegroup", () => {
  const NODE = {
    "http://endhealth.info/im#isA": [
      { "@id": "http://snomed.info/sct#82354003", name: "Multiple system malformation syndrome" },
      { "@id": "http://snomed.info/sct#85995004", name: "Autosomal recessive hereditary disorder" },
      { "@id": "http://snomed.info/sct#89886004", name: "Congenital anomaly of skeletal muscle" },
      { "@id": "http://snomed.info/sct#128084001", name: "Duane's syndrome, type 3" },
      { "@id": "http://snomed.info/sct#298382003", name: "Scoliosis deformity of spine" },
      { "@id": "http://snomed.info/sct#363212003", name: "Hereditary disorder of musculoskeletal system" },
      { "@id": "http://snomed.info/sct#363235000", name: "Hereditary disorder of nervous system" },
      { "@id": "http://snomed.info/sct#363343008", name: "Hereditary disorder of the visual system" },
      { "@id": "http://snomed.info/sct#257277002", name: "Combined disorder of muscle AND peripheral nerve (disorder)" },
      { "@id": "http://snomed.info/sct#363070008", name: "Developmental hereditary disorder" },
      {
        "http://endhealth.info/im#roleGroup": [
          {
            "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process" },
            "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#49755003", name: "Morphologically abnormal structure" },
            "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#80622005", name: "Abducens nerve structure" },
            "http://snomed.info/sct#246454002": { "@id": "http://snomed.info/sct#255399007", name: "Congenital" }
          },
          {
            "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process" },
            "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature" },
            "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine" }
          },
          {
            "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process" },
            "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#49755003", name: "Morphologically abnormal structure" },
            "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#127954009", name: "Skeletal muscle structure" },
            "http://snomed.info/sct#246454002": { "@id": "http://snomed.info/sct#255399007", name: "Congenital" }
          },
          {
            "http://snomed.info/sct#370135005": { "@id": "http://snomed.info/sct#308490002", name: "Pathological developmental process" },
            "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#49755003", name: "Morphologically abnormal structure" },
            "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#81745001", name: "Structure of eye proper" },
            "http://snomed.info/sct#246454002": { "@id": "http://snomed.info/sct#255399007", name: "Congenital" }
          }
        ]
      }
    ]
  };
  const EXPECTED =
    "http://endhealth.info/im#isA : \n" +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2382354003">Multiple system malformation syndrome</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2385995004">Autosomal recessive hereditary disorder</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2389886004">Congenital anomaly of skeletal muscle</a>\n' +
    '  <a href="' +
    url +
    "/#/concept/http:%2F%2Fsnomed.info%2Fsct%23128084001\">Duane's syndrome, type 3</a>\n" +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23298382003">Scoliosis deformity of spine</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363212003">Hereditary disorder of musculoskeletal system</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363235000">Hereditary disorder of nervous system</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363343008">Hereditary disorder of the visual system</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23257277002">Combined disorder of muscle AND peripheral nerve</a>\n' +
    '  <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23363070008">Developmental hereditary disorder</a>\n' +
    "  Where : \n" +
    '    ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '      Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</a>\n' +
    '      Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2380622005">Abducens nerve structure</a>\n' +
    '      Occurrence : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</a> )\n' +
    '    ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '      Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2331739005">Lateral abnormal curvature</a>\n' +
    '      Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23289959001">Musculoskeletal structure of spine</a> )\n' +
    '    ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '      Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</a>\n' +
    '      Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23127954009">Skeletal muscle structure</a>\n' +
    '      Occurrence : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</a> )\n' +
    '    ( Pathological process : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23308490002">Pathological developmental process</a>\n' +
    '      Associated morphology : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2349755003">Morphologically abnormal structure</a>\n' +
    '      Finding site : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%2381745001">Structure of eye proper</a>\n' +
    '      Occurrence : <a href="' +
    url +
    '/#/concept/http:%2F%2Fsnomed.info%2Fsct%23255399007">Congenital</a> )\n';

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
    jest.resetAllMocks();
  });

  it("handles node ___ missing iriMap", async () => {
    expect(ttNodeToString(NODE, "object", 0, true, PREDICATES)).toBe(EXPECTED);
  });
});
