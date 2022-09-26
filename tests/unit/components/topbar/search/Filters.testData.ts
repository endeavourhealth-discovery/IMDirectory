export default {
  FILTER_DEFAULTS: {
    schemeOptions: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
    statusOptions: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
    typeOptions: [
      "http://endhealth.info/im#Concept",
      "http://endhealth.info/im#ValueSet",
      "http://endhealth.info/im#ConceptSet",
      "http://www.w3.org/ns/shacl#NodeShape",
      "http://endhealth.info/im#dataModelProperty",
      "http://endhealth.info/im#Query",
      "http://www.w3.org/2000/01/rdf-schema#Class",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
      "http://endhealth.info/im#Folder"
    ],
    sortField: "weighting",
    sortDirection: "DESC"
  },
  FILTER_OPTIONS: {
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
      },
      {
        name: "Inactive",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }],
        orderNumber: 0,
        "@id": "http://endhealth.info/im#Inactive"
      },
      {
        name: "Unassigned",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }],
        orderNumber: 0,
        "@id": "http://endhealth.info/im#Unassigned"
      }
    ],
    schemes: [
      { iri: "http://endhealth.info/bc#", prefix: "PFX9", name: "Barts Cerner code scheme and graph" },
      { iri: "http://endhealth.info/ceg/qry#", prefix: "PFX13", name: "CEG (QMUL) graph" },
      { iri: "http://endhealth.info/emis#", prefix: "PFX4", name: "EMIS (including Read) codes" },
      { iri: "http://endhealth.info/icd10#", prefix: "PFX7", name: "ICD10  code scheme and graph" },
      { iri: "http://endhealth.info/kpax#", prefix: "PFX11", name: "Kings Apex pathology code scheme and graph" },
      { iri: "http://endhealth.info/kwp#", prefix: "PFX12", name: "Kings Winpath pathology code scheme and graph" },
      { iri: "http://endhealth.info/im#", prefix: "PFX2", name: "London Discovery Snomed extension code scheme and graph" },
      { iri: "http://endhealth.info/nhstfc#", prefix: "PFX10", name: "NHS Data Dictionary Speciality and Treatment function codes" },
      { iri: "http://endhealth.info/opcs4#", prefix: "PFX6", name: "OPCS4 code scheme and graph" },
      { iri: "http://www.w3.org/2002/07/owl#", prefix: "owl", name: "OWL Graph" },
      { iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefix: "rdf", name: "RDF Graph" },
      { iri: "http://www.w3.org/2000/01/rdf-schema#", prefix: "rdfs", name: "RDFS Graph" },
      { iri: "http://www.w3.org/ns/shacl#", prefix: "PFX1", name: "SHACL Graph" },
      { iri: "http://snomed.info/sct#", prefix: "PFX3", name: "Snomed-CT code scheme and graph" },
      { iri: "http://endhealth.info/tpp#", prefix: "PFX5", name: "TPP (including CTV3) codes" },
      { iri: "http://endhealth.info/vis#", prefix: "PFX8", name: "Vision (including Read) codes" },
      { iri: "http://rdf4j.org/schema/rdf4j#", prefix: "rdf4j", name: "http://rdf4j.org/schema/rdf4j#" },
      { iri: "http://www.geonames.org/ontology#", prefix: "gn", name: "http://www.geonames.org/ontology#" },
      { iri: "http://www.ontotext.com/connectors/lucene#", prefix: "con", name: "http://www.ontotext.com/connectors/lucene#" },
      { iri: "http://www.ontotext.com/connectors/lucene/instance#", prefix: "con-inst", name: "http://www.ontotext.com/connectors/lucene/instance#" },
      { iri: "http://www.ontotext.com/path#", prefix: "path", name: "http://www.ontotext.com/path#" },
      { iri: "http://www.openrdf.org/schema/sesame#", prefix: "sesame", name: "http://www.openrdf.org/schema/sesame#" },
      { iri: "http://www.w3.org/2001/XMLSchema#", prefix: "xsd", name: "http://www.w3.org/2001/XMLSchema#" },
      { iri: "http://www.w3.org/2003/01/geo/wgs84_pos#", prefix: "wgs", name: "http://www.w3.org/2003/01/geo/wgs84_pos#" },
      { iri: "http://www.w3.org/2005/xpath-functions#", prefix: "fn", name: "http://www.w3.org/2005/xpath-functions#" }
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
    sortFields: undefined,
    sortDirections: undefined
  },
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
  },
  QUICK_FILTER_STATUS: []
};
