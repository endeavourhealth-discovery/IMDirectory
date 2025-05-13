export const testProperty = {
  "http://www.w3.org/ns/shacl#order": 1,
  "http://www.w3.org/ns/shacl#path": [
    {
      iri: "http://endhealth.info/im#statedGender",
      name: "stated gender"
    }
  ],
  "http://www.w3.org/ns/shacl#maxCount": 1,
  "http://www.w3.org/ns/shacl#group": [
    {
      iri: "http://endhealth.info/im#DemographicsGroup",
      name: "Demographic details"
    }
  ],
  "http://www.w3.org/ns/shacl#class": [
    {
      iri: "http://hl7.org/fhir/ValueSet/administrative-gender",
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
  icon: ["fa-duotone", "fa-pen-to-square"],
  leaf: true,
  parent: undefined,
  children: []
};
