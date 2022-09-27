export default {
  SELECTED_FILTERS: {
    status: [
      {
        name: "Active",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }],
        orderNumber: 0,
        "@id": "http://endhealth.info/im#Active"
      },
      {
        name: "Draft",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }],
        orderNumber: 0,
        "@id": "http://endhealth.info/im#Draft"
      }
    ],
    schemes: [
      { iri: "http://endhealth.info/im#", prefix: "PFX2", name: "London Discovery Snomed extension code scheme and graph" },
      { iri: "http://snomed.info/sct#", prefix: "PFX3", name: "Snomed-CT code scheme and graph" }
    ],
    types: [
      { "@id": "http://endhealth.info/im#Concept", name: "Terminology Concept" },
      { "@id": "http://endhealth.info/im#ValueSet", name: "Value set" },
      { "@id": "http://endhealth.info/im#ConceptSet", name: "Concept Set" },
      { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
      { "@id": "http://endhealth.info/im#dataModelProperty", name: "data model property" },
      { "@id": "http://endhealth.info/im#Query", name: "Query" },
      { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
      { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property", name: "Property" },
      { "@id": "http://endhealth.info/im#Folder", name: "Folder" }
    ],
    sortField: "weighting",
    sortDirection: "DESC"
  }
};
