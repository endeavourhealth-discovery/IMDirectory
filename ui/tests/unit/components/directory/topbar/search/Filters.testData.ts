export default {
  FILTER_DEFAULTS: {
    status: [
      { "@id": "http://endhealth.info/im#Active", name: "Active" },
      { "@id": "http://endhealth.info/im#Draft", name: "Draft" }
    ],
    schemes: [
      { "@id": "http://endhealth.info/im#", name: "Endeavour code scheme and graph" },
      { "@id": "http://snomed.info/sct#", name: "Snomed-CT code scheme and graph" }
    ],
    types: [
      { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
      { "@id": "http://endhealth.info/im#ConceptSet", name: "Concept Set" },
      { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Data model/Node shape " },
      { "@id": "http://endhealth.info/im#Folder", name: "Folder" },
      { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property", name: "Property" },
      { "@id": "http://endhealth.info/im#Query", name: "Query" },
      { "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" },
      { "@id": "http://endhealth.info/im#ValueSet", name: "Value set" },
      { "@id": "http://endhealth.info/im#dataModelProperty", name: "data model property" }
    ],
    sortFields: [{ "@id": "http://endhealth.info/im#SortFieldUsage", name: "Usage" }],
    sortDirections: [{ "@id": "http://endhealth.info/im#SortDirectionDescending", name: "Descending" }]
  },
  FILTER_OPTIONS: {
    status: [
      { "@id": "http://endhealth.info/im#Active", name: "Active" },
      { "@id": "http://endhealth.info/im#Draft", name: "Draft" },
      { "@id": "http://endhealth.info/im#Inactive", name: "Inactive" },
      { "@id": "http://endhealth.info/im#Unassigned", name: "Unassigned" }
    ],
    schemes: [
      { "@id": "http://endhealth.info/bhrutm#", name: "BHRUT Medway code scheme and graph" },
      { "@id": "http://endhealth.info/bc#", name: "Barts Cerner code scheme and graph" },
      { "@id": "http://endhealth.info/ceg/qry#", name: "CEG (QMUL) graph" },
      { "@id": "http://endhealth.info/cwhcc#", name: "CWHC Cerner code scheme and graph" },
      { "@id": "http://endhealth.info/emis#", name: "EMIS (including Read) codes" },
      { "@id": "http://endhealth.info/enc#", name: "Encounter code scheme and graph" },
      { "@id": "http://endhealth.info/im#", name: "Endeavour code scheme and graph" },
      { "@id": "http://hl7.org/fhir/", name: "FHIR graph" },
      { "@id": "http://endhealth.info/hc#", name: "Homerton Cerner code" },
      { "@id": "http://endhealth.info/icd10#", name: "ICD10  code scheme and graph" },
      { "@id": "http://endhealth.info/ic#", name: "Imperial Cerner code scheme and graph" },
      { "@id": "http://endhealth.info/impc#", name: "Imperial Cerner code scheme and graph" },
      { "@id": "http://endhealth.info/kingsp#", name: "KCH PIMS code scheme and graph" },
      { "@id": "http://endhealth.info/kpax#", name: "Kings Apex pathology code scheme and graph" },
      { "@id": "http://endhealth.info/kwp#", name: "Kings Winpath pathology code scheme and graph" },
      { "@id": "http://endhealth.info/lnwhsl#", name: "LNWH Silverlink code scheme and graph" },
      { "@id": "http://endhealth.info/nhstfc#", name: "NHS Data Dictionary Speciality and Treatment function codes" },
      { "@id": "http://endhealth.info/ods#", name: "ODS  code scheme and graph" },
      { "@id": "http://endhealth.info/ods#", name: "ODS Organisational code scheme and graph" },
      { "@id": "http://endhealth.info/opcs4#", name: "OPCS4 code scheme and graph" },
      { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#", name: "RDF Graph" },
      { "@id": "http://www.w3.org/2000/01/rdf-schema#", name: "RDFS Graph" },
      { "@id": "http://snomed.info/sct#", name: "Snomed-CT code scheme and graph" },
      { "@id": "http://endhealth.info/thhsl#", name: "THH Silverlink code scheme and graph" },
      { "@id": "http://endhealth.info/tpp#", name: "TPP (including CTV3) codes" },
      { "@id": "http://endhealth.info/enc#", name: "Term based code" },
      { "@id": "http://endhealth.info/vis#", name: "Vision (including Read) codes" }
    ],
    types: [
      { "@id": "http://endhealth.info/im#ConceptSet", name: "Concept Set" },
      { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Data model/Node shape " },
      { "@id": "http://endhealth.info/im#EntitySelector", name: "Entity selector" },
      { "@id": "http://endhealth.info/im#Folder", name: "Folder" },
      { "@id": "http://endhealth.info/im#Property", name: "Property" },
      { "@id": "http://endhealth.info/im#Query", name: "Query" },
      { "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" },
      { "@id": "http://endhealth.info/im#ValueSet", name: "Value set" }
    ],
    sortFields: [{ "@id": "http://endhealth.info/im#SortFieldUsage", name: "Usage" }],
    sortDirections: [
      { "@id": "http://endhealth.info/im#SortDirectionAscending", name: "Ascending" },
      { "@id": "http://endhealth.info/im#SortDirectionDescending", name: "Descending" }
    ]
  },
  SELECTED_FILTERS: {
    status: [
      { "@id": "http://endhealth.info/im#Active", name: "Active" },
      { "@id": "http://endhealth.info/im#Draft", name: "Draft" }
    ],
    schemes: [
      { "@id": "http://endhealth.info/im#", name: "Endeavour code scheme and graph" },
      { "@id": "http://snomed.info/sct#", name: "Snomed-CT code scheme and graph" }
    ],
    types: [
      { "@id": "http://endhealth.info/im#ConceptSet", name: "Concept Set" },
      { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Data model/Node shape " },
      { "@id": "http://endhealth.info/im#Folder", name: "Folder" },
      { "@id": "http://endhealth.info/im#Query", name: "Query" },
      { "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" },
      { "@id": "http://endhealth.info/im#ValueSet", name: "Value set" }
    ],
    sortFields: [{ "@id": "http://endhealth.info/im#SortFieldUsage", name: "Usage" }],
    sortDirections: [{ "@id": "http://endhealth.info/im#SortDirectionDescending", name: "Descending" }]
  },
  QUICK_FILTER_STATUS: []
};
