import ConceptShape from "@/constants/editorShapes/Concept";

export default {
  testShape: ConceptShape,
  validationCheckStatus: [
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#Concept"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#isContainedIn"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#roleGroup"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#matchedTo"
    },
    { checkCompleted: false, key: "http://endhealth.info/im#hasTermCode" },
    { checkCompleted: false, key: "http://endhealth.info/im#isChildOf" }
  ],
  testEntity: {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Adverse reaction to Testogel",
    "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Draft", name: "Draft" },
    "http://endhealth.info/im#isA": [
      { "@id": "http://endhealth.info/im#24951000252112", name: "Adverse reaction to Testogel" },
      { "@id": "http://snomed.info/sct#281647001", name: "Adverse reaction (disorder)" },
      { "@id": "http://snomed.info/sct#64572001", name: "Disease (disorder)" },
      { "@id": "http://snomed.info/sct#404684003", name: "Clinical finding (finding)" }
    ],
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": [{ "@id": "http://snomed.info/sct#281647001", name: "Adverse reaction (disorder)" }],
    "http://endhealth.info/im#definitionalStatus": [{ "@id": "http://endhealth.info/im#1251000252106", name: "Necessary and sufficient" }],
    "http://endhealth.info/im#code": "24951000252112",
    "http://endhealth.info/im#roleGroup": [
      {
        "http://endhealth.info/im#groupNumber": 1,
        "http://snomed.info/sct#246075003": [{ "@id": "http://snomed.info/sct#9364701000001104", name: "Testogel (product)" }]
      }
    ],
    "http://endhealth.info/im#scheme": [{ "@id": "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }],
    "http://endhealth.info/im#id": "http://endhealth.info/im#24951000252112"
  },
  testValueVariableMap: new Map<string, any>()
    .set("conceptIri", "http://endhealth.info/im#24951000252112")
    .set("subClassOf", [{ "@id": "http://snomed.info/sct#281647001", name: "Adverse reaction (disorder)" }])
    .set("propertyIri1", { "@id": "http://snomed.info/sct#246075003", name: "Causative agent (attribute)" })
};
