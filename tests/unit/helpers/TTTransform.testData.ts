import { XSD } from "@/vocabulary";

export const OntologiesFolderTTEntity = {
  iri: "http://endhealth.info/im#HealthModelOntology",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ iri: "http://endhealth.info/im#Folder", name: "Folder" }],
  "http://www.w3.org/2000/01/rdf-schema#label": "Ontologies",
  "http://www.w3.org/2000/01/rdf-schema#comment": "A folder of ontologies, data models, and taxonomies",
  "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
  "http://www.w3.org/ns/shacl#order": 1,
  "http://endhealth.info/im#isContainedIn": [{ iri: "http://endhealth.info/im#InformationModel", name: "Health Information Model" }],
  "http://endhealth.info/im#scheme": [{ iri: "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }]
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

export const customMap = {
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "rdfType",
  "http://www.w3.org/2000/01/rdf-schema#label": "name",
  "http://www.w3.org/2000/01/rdf-schema#comment": "description"
};

export const OntologiesFolderCustomTransformed = {
  iri: "http://endhealth.info/im#HealthModelOntology",
  rdfType: [{ iri: "http://endhealth.info/im#Folder", name: "Folder" }],
  name: "Ontologies",
  description: "A folder of ontologies, data models, and taxonomies",
  status: [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
  order: 1,
  isContainedIn: [{ iri: "http://endhealth.info/im#InformationModel", name: "Health Information Model" }],
  scheme: [{ iri: "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }]
};

export const EventTTEntity = {
  iri: "http://endhealth.info/im#Event",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
    { iri: "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
    { iri: "http://www.w3.org/ns/shacl#NodeShape", name: "Data model/Node shape " }
  ],
  "http://www.w3.org/2000/01/rdf-schema#label": "Event",
  "http://www.w3.org/2000/01/rdf-schema#comment":
    "An entry for something that is deemed to be valid at a point in time and may or may not be valid over time. In other words an entry with an effective date/time that does not have a property of end date/time defined",
  "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
  "http://endhealth.info/im#isA": [
    { iri: "http://endhealth.info/im#Event", name: "Event" },
    { iri: "http://endhealth.info/im#Entity", name: "Entity" },
    { iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }
  ],
  "http://www.w3.org/2000/01/rdf-schema#subClassOf": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
  "http://endhealth.info/im#isContainedIn": [{ iri: "http://endhealth.info/im#HealthDataModelClasses", name: "Health Data model classes" }],
  "http://endhealth.info/im#weighting": 9998,
  "http://www.w3.org/ns/shacl#property": [
    {
      "http://www.w3.org/2000/01/rdf-schema#comment": "The preferred full name of the entity",
      "http://www.w3.org/ns/shacl#datatype": [{ iri: XSD.STRING, name: "string" }],
      "http://www.w3.org/ns/shacl#order": 1,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://www.w3.org/2000/01/rdf-schema#label", name: "label" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      "http://www.w3.org/ns/shacl#minCount": 1
    },
    {
      "http://www.w3.org/2000/01/rdf-schema#comment": "The description of the entity",
      "http://www.w3.org/ns/shacl#datatype": [{ iri: XSD.STRING, name: "string" }],
      "http://www.w3.org/ns/shacl#order": 2,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://www.w3.org/2000/01/rdf-schema#comment", name: "comment" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }]
    },
    {
      "http://www.w3.org/2000/01/rdf-schema#comment": "The base type of the entity i.e. one of the high level entity types",
      "http://www.w3.org/ns/shacl#order": 3,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", name: "type" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      "http://www.w3.org/ns/shacl#minCount": 1,
      "http://www.w3.org/ns/shacl#class": [{ iri: "http://www.w3.org/2000/01/rdf-schema#Resource", name: "Resource" }]
    },
    {
      "http://www.w3.org/2000/01/rdf-schema#comment": "The status of the entity being active, inactive, draft or unassigned",
      "http://www.w3.org/ns/shacl#order": 4,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#status", name: "status" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      "http://www.w3.org/ns/shacl#minCount": 1,
      "http://www.w3.org/ns/shacl#class": [{ iri: "http://endhealth.info/im#Status", name: "Activity status" }]
    },
    {
      "http://www.w3.org/2000/01/rdf-schema#comment": "The code scheme or graph which the entity belongs to",
      "http://www.w3.org/ns/shacl#order": 5,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#scheme", name: "scheme" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      "http://www.w3.org/ns/shacl#minCount": 1,
      "http://www.w3.org/ns/shacl#class": [{ iri: "http://endhealth.info/im#Graph", name: "Graph or code scheme" }]
    },
    {
      "http://www.w3.org/2000/01/rdf-schema#comment":
        "An entity that this entity inherits from, both semantically and structurally, this is also used for sub properties as properties are classes of properties",
      "http://www.w3.org/ns/shacl#order": 6,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#isContainedIn", name: "Is contained in" }],
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      "http://www.w3.org/ns/shacl#class": [{ iri: "http://endhealth.info/im#Folder", name: "Folder" }]
    },
    {
      "http://www.w3.org/2000/01/rdf-schema#comment": "When a status is inactive, the entity that replaces this entity (if any)",
      "http://www.w3.org/ns/shacl#order": 7,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://snomed.info/sct#370124000", name: "REPLACED BY (attribute)" }],
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      "http://www.w3.org/ns/shacl#class": [{ iri: "http://endhealth.info/im#Entity", name: "Entity" }]
    },
    {
      "http://www.w3.org/ns/shacl#order": 8,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#recordOwner", name: "record owner" }],
      "http://www.w3.org/ns/shacl#node": [{ iri: "http://endhealth.info/im#Organisation", name: "Organisation" }],
      "http://endhealth.info/im#inheritedFrom": [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }]
    },
    {
      "http://www.w3.org/ns/shacl#order": 9,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#concept", name: "concept" }],
      "http://www.w3.org/ns/shacl#class": [{ iri: "http://endhealth.info/im#Concept", name: "Terminology concept" }]
    },
    {
      "http://www.w3.org/ns/shacl#datatype": [{ iri: "http://endhealth.info/im#DateTime", name: "Date time" }],
      "http://www.w3.org/ns/shacl#order": 10,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#effectiveDate", name: "effective date" }]
    },
    {
      "http://www.w3.org/ns/shacl#datatype": [{ iri: "http://endhealth.info/im#DateTime", name: "Date time" }],
      "http://www.w3.org/ns/shacl#order": 11,
      "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#endDate", name: "end date" }]
    }
  ],
  "http://endhealth.info/im#scheme": [{ iri: "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }]
};

export const EventTTEntityTransformed = {
  iri: "http://endhealth.info/im#Event",
  type: [
    { iri: "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
    { iri: "http://www.w3.org/ns/shacl#NodeShape", name: "Data model/Node shape " }
  ],
  label: "Event",
  comment:
    "An entry for something that is deemed to be valid at a point in time and may or may not be valid over time. In other words an entry with an effective date/time that does not have a property of end date/time defined",
  status: [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
  isA: [
    { iri: "http://endhealth.info/im#Event", name: "Event" },
    { iri: "http://endhealth.info/im#Entity", name: "Entity" },
    { iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }
  ],
  subClassOf: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
  isContainedIn: [{ iri: "http://endhealth.info/im#HealthDataModelClasses", name: "Health Data model classes" }],
  weighting: 9998,
  property: [
    {
      comment: "The preferred full name of the entity",
      datatype: [{ iri: XSD.STRING, name: "string" }],
      order: 1,
      path: [{ iri: "http://www.w3.org/2000/01/rdf-schema#label", name: "label" }],
      maxCount: 1,
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      minCount: 1
    },
    {
      comment: "The description of the entity",
      datatype: [{ iri: XSD.STRING, name: "string" }],
      order: 2,
      path: [{ iri: "http://www.w3.org/2000/01/rdf-schema#comment", name: "comment" }],
      maxCount: 1,
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }]
    },
    {
      comment: "The base type of the entity i.e. one of the high level entity types",
      order: 3,
      path: [{ iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", name: "type" }],
      maxCount: 1,
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      minCount: 1,
      class: [{ iri: "http://www.w3.org/2000/01/rdf-schema#Resource", name: "Resource" }]
    },
    {
      comment: "The status of the entity being active, inactive, draft or unassigned",
      order: 4,
      path: [{ iri: "http://endhealth.info/im#status", name: "status" }],
      maxCount: 1,
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      minCount: 1,
      class: [{ iri: "http://endhealth.info/im#Status", name: "Activity status" }]
    },
    {
      comment: "The code scheme or graph which the entity belongs to",
      order: 5,
      path: [{ iri: "http://endhealth.info/im#scheme", name: "scheme" }],
      maxCount: 1,
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      minCount: 1,
      class: [{ iri: "http://endhealth.info/im#Graph", name: "Graph or code scheme" }]
    },
    {
      comment:
        "An entity that this entity inherits from, both semantically and structurally, this is also used for sub properties as properties are classes of properties",
      order: 6,
      path: [{ iri: "http://endhealth.info/im#isContainedIn", name: "Is contained in" }],
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      class: [{ iri: "http://endhealth.info/im#Folder", name: "Folder" }]
    },
    {
      comment: "When a status is inactive, the entity that replaces this entity (if any)",
      order: 7,
      path: [{ iri: "http://snomed.info/sct#370124000", name: "REPLACED BY (attribute)" }],
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }],
      class: [{ iri: "http://endhealth.info/im#Entity", name: "Entity" }]
    },
    {
      order: 8,
      path: [{ iri: "http://endhealth.info/im#recordOwner", name: "record owner" }],
      node: [{ iri: "http://endhealth.info/im#Organisation", name: "Organisation" }],
      inheritedFrom: [{ iri: "http://endhealth.info/im#RecordEntry", name: "Record entry" }]
    },
    {
      order: 9,
      path: [{ iri: "http://endhealth.info/im#concept", name: "concept" }],
      class: [{ iri: "http://endhealth.info/im#Concept", name: "Terminology concept" }]
    },
    {
      datatype: [{ iri: "http://endhealth.info/im#DateTime", name: "Date time" }],
      order: 10,
      path: [{ iri: "http://endhealth.info/im#effectiveDate", name: "effective date" }]
    },
    {
      datatype: [{ iri: "http://endhealth.info/im#DateTime", name: "Date time" }],
      order: 11,
      path: [{ iri: "http://endhealth.info/im#endDate", name: "end date" }]
    }
  ],
  scheme: [{ iri: "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }]
};
