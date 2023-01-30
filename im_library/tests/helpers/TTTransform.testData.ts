export const OntologiesFolderTTEntity = {
  "@id": "http://endhealth.info/im#HealthModelOntology",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://endhealth.info/im#Folder", name: "Folder" }],
  "http://www.w3.org/2000/01/rdf-schema#label": "Ontologies",
  "http://www.w3.org/2000/01/rdf-schema#comment": "A folder of ontologies, data models, and taxonomies",
  "http://endhealth.info/im#status": [{ "@id": "http://endhealth.info/im#Active", name: "Active" }],
  "http://www.w3.org/ns/shacl#order": 1,
  "http://endhealth.info/im#isContainedIn": [{ "@id": "http://endhealth.info/im#InformationModel", name: "Health Information Model" }],
  "http://endhealth.info/im#scheme": [{ "@id": "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }]
};

export const OntologiesFolderTransformed = {
  iri: "http://endhealth.info/im#HealthModelOntology",
  type: [{ iri: "http://endhealth.info/im#Folder", name: "Folder" }],
  label: "Ontologies",
  comment: "A folder of ontologies, data models, and taxonomies",
  status: [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
  order: 1,
  isContainedIn: [{ iri: "http://endhealth.info/im#InformationModel", name: "Health Information Model" }],
  scheme: [{ iri: "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }]
};
