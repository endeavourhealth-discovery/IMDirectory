export default {
  ONTOLOGY_OVERVIEW: {
    "@id": "http://endhealth.info/im#ontologyOverview",
    "http://www.w3.org/2000/01/rdf-schema#label": "Ontology overview",
    "http://www.w3.org/2000/01/rdf-schema#comment": "A brief overview of the concepts stored in the Ontology",
    "http://endhealth.info/im#hasStatsReportEntry": [
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Value sets",
        "http://www.w3.org/2002/07/owl#hasValue": 8
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Data models",
        "http://www.w3.org/2002/07/owl#hasValue": "1973"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Ontology",
        "http://www.w3.org/2002/07/owl#hasValue": "1124984"
      }
    ]
  },
  CONCEPT_TYPES: {
    "@id": "http://endhealth.info/im#ontologyConceptTypes",
    "http://www.w3.org/2000/01/rdf-schema#label": "Ontology concept types",
    "http://www.w3.org/2000/01/rdf-schema#comment": "A brief overview of the types of data stored in the Ontology",
    "http://endhealth.info/im#hasStatsReportEntry": [
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Class",
        "http://www.w3.org/2002/07/owl#hasValue": "1030354"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Legacy concept",
        "http://www.w3.org/2002/07/owl#hasValue": "93282"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Object property",
        "http://www.w3.org/2002/07/owl#hasValue": "1811"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Set",
        "http://www.w3.org/2002/07/owl#hasValue": "1122"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Node shape",
        "http://www.w3.org/2002/07/owl#hasValue": "99"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Record type",
        "http://www.w3.org/2002/07/owl#hasValue": "94"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Data property",
        "http://www.w3.org/2002/07/owl#hasValue": "68"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "undefined",
        "http://www.w3.org/2002/07/owl#hasValue": "45"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Functional property",
        "http://www.w3.org/2002/07/owl#hasValue": "26"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Annotation property",
        "http://www.w3.org/2002/07/owl#hasValue": "23"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Symmetric property",
        "http://www.w3.org/2002/07/owl#hasValue": "11"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Transitive property",
        "http://www.w3.org/2002/07/owl#hasValue": "11"
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Folder",
        "http://www.w3.org/2002/07/owl#hasValue": 8
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Value set",
        "http://www.w3.org/2002/07/owl#hasValue": 8
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Reflexive property",
        "http://www.w3.org/2002/07/owl#hasValue": 2
      },
      {
        "http://www.w3.org/2000/01/rdf-schema#label": "Query template",
        "http://www.w3.org/2002/07/owl#hasValue": "1"
      }
    ]
  },
  ENTITY: {
    "@id": "http://snomed.info/sct#6081001",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
      {
        "@id": "http://endhealth.info/im#Concept",
        name: "Terminology Concept"
      }
    ],
    "http://www.w3.org/2000/01/rdf-schema#label": "Deformity (morphologic abnormality)"
  },
  DASHBOARD_LAYOUT: [
    {
      type: "ReportTable",
      order: 100,
      iri: "http://endhealth.info/im#ontologyOverview"
    },
    {
      type: "PieChartDashCard",
      order: 200,
      iri: "http://endhealth.info/im#ontologyConceptTypes"
    }
  ]
};
