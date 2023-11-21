export const testProperty = {
  "http://www.w3.org/ns/shacl#order": 1,
  "http://www.w3.org/ns/shacl#path": [
    {
      "@id": "http://endhealth.info/im#statedGender",
      name: "stated gender"
    }
  ],
  "http://www.w3.org/ns/shacl#maxCount": 1,
  "http://www.w3.org/ns/shacl#group": [
    {
      "@id": "http://endhealth.info/im#DemographicsGroup",
      name: "Demographic details"
    }
  ],
  "http://www.w3.org/ns/shacl#class": [
    {
      "@id": "http://hl7.org/fhir/ValueSet/administrative-gender",
      name: "FHIR Administrative Gender"
    }
  ]
};

export const testTreeNode = {
  key: "0",
  label: "stated gender",
  iri: "http://endhealth.info/im#statedGender",
  data: testProperty,
  type: "class",
  icon: ["fa-solid", "fa-pen-to-square"],
  leaf: true,
  parent: undefined,
  children: []
};
