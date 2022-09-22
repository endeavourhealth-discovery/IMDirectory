import { render, fireEvent, within } from "@testing-library/vue";
import SearchResultsTable from "@/views/SearchResultsTable.vue";
import DataTable from "primevue/datatable";
import ProgressSpinner from "primevue/progressspinner";
import Column from "primevue/column";
import OverlayPanel from "primevue/overlaypanel";
import Tooltip from "primevue/tooltip";
import ContextMenu from "primevue/contextmenu";
import VueClipboard from "vue3-clipboard";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";
import PrimeVue from "primevue/config";
import { Services } from "im-library";
import { expect, it } from "vitest";
const { DirectService } = Services;

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
});

const mockDispatch = vi.fn();
const mockState = {
  searchLoading: false,
  filterDefaults: {
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
  filterOptions: {
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
  selectedFilters: {
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
      {
        type: "reactive",
        objectType: "Reactive",
        value: { iri: "http://endhealth.info/im#", prefix: "PFX2", name: "London Discovery Snomed extension code scheme and graph" }
      },
      {
        type: "reactive",
        objectType: "Reactive",
        value: { iri: "http://snomed.info/sct#", prefix: "PFX3", name: "Snomed-CT code scheme and graph" }
      }
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
  searchResults: [
    {
      name: "Scoliosis myelogram (procedure)",
      iri: "http://snomed.info/sct#241193003",
      code: "241193003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Scoliosis myelogram (procedure)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis survey X-ray (procedure)",
      iri: "http://snomed.info/sct#241094007",
      code: "241094007",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 1,
      match: "Scoliosis survey X-ray (procedure)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis of lumbar spine (disorder)",
      iri: "http://snomed.info/sct#298591003",
      code: "298591003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 86,
      match: "Scoliosis of lumbar spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis of thoracic spine (disorder)",
      iri: "http://snomed.info/sct#298494008",
      code: "298494008",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 552,
      match: "Scoliosis of thoracic spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis of cervical spine (disorder)",
      iri: "http://snomed.info/sct#298392006",
      code: "298392006",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 4,
      match: "Scoliosis of cervical spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 1933,
      match: "Scoliosis deformity of spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis caused by radiation (disorder)",
      iri: "http://snomed.info/sct#47518006",
      code: "47518006",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Scoliosis caused by radiation (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis in neurofibromatosis (disorder)",
      iri: "http://snomed.info/sct#203663000",
      code: "203663000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 3,
      match: "Scoliosis in neurofibromatosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis in skeletal dysplasia (disorder)",
      iri: "http://snomed.info/sct#203661003",
      code: "203661003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 11,
      match: "Scoliosis in skeletal dysplasia (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis in connective tissue anomalies (disorder)",
      iri: "http://snomed.info/sct#203664006",
      code: "203664006",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 2,
      match: "Scoliosis in connective tissue anomalies (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Scoliosis-treatment electrical stimulation system (physical object)",
      iri: "http://snomed.info/sct#465370003",
      code: "465370003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Scoliosis-treatment electrical stimulation system (physical object)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Postural scoliosis (disorder)",
      iri: "http://snomed.info/sct#203645000",
      code: "203645000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 1180,
      match: "Postural scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Acquired scoliosis (disorder)",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 173,
      match: "Acquired scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Idiopathic scoliosis (disorder)",
      iri: "http://snomed.info/sct#203639008",
      code: "203639008",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 2403,
      match: "Idiopathic scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Bertolotti's syndrome (disorder)",
      iri: "http://snomed.info/sct#86345004",
      code: "86345004",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 2,
      match: "Bertolotti's syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Thoracogenic scoliosis (disorder)",
      iri: "http://snomed.info/sct#72992003",
      code: "72992003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 301,
      match: "Thoracogenic scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Neuromuscular scoliosis (disorder)",
      iri: "http://snomed.info/sct#203662005",
      code: "203662005",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 78,
      match: "Neuromuscular scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Post-surgical scoliosis (disorder)",
      iri: "http://snomed.info/sct#203647008",
      code: "203647008",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 14,
      match: "Post-surgical scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Acrodysplasia scoliosis (disorder)",
      iri: "http://snomed.info/sct#773773006",
      code: "773773006",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Acrodysplasia scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Correction of scoliosis (procedure)",
      iri: "http://snomed.info/sct#275249009",
      code: "275249009",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 149,
      match: "Correction of scoliosis (procedure)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Kyphoscoliosis and scoliosis (disorder)",
      iri: "http://snomed.info/sct#203638000",
      code: "203638000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 3110,
      match: "Kyphoscoliosis and scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Distal arthrogryposis type 4 (disorder)",
      iri: "http://snomed.info/sct#715575001",
      code: "715575001",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Distal arthrogryposis type 4 (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Spinal fusion for scoliosis (procedure)",
      iri: "http://snomed.info/sct#428547005",
      code: "428547005",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Spinal fusion for scoliosis (procedure)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Congenital postural scoliosis (disorder)",
      iri: "http://snomed.info/sct#20944008",
      code: "20944008",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 384,
      match: "Congenital postural scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Congenital lordosis/scoliosis (disorder)",
      iri: "http://snomed.info/sct#287087003",
      code: "287087003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 7,
      match: "Congenital lordosis/scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Adolescent idiopathic scoliosis (disorder)",
      iri: "http://snomed.info/sct#203646004",
      code: "203646004",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 660,
      match: "Adolescent idiopathic scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Idiopathic scoliosis of lumbar spine (disorder)",
      iri: "http://snomed.info/sct#712581001",
      code: "712581001",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Idiopathic scoliosis of lumbar spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Triple curvature idiopathic scoliosis (disorder)",
      iri: "http://snomed.info/sct#713709009",
      code: "713709009",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Triple curvature idiopathic scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Idiopathic scoliosis of thoracic spine (disorder)",
      iri: "http://snomed.info/sct#712580000",
      code: "712580000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Idiopathic scoliosis of thoracic spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Spondylocarpotarsal synostosis syndrome (disorder)",
      iri: "http://snomed.info/sct#702351004",
      code: "702351004",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Spondylocarpotarsal synostosis syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "History of spinal fusion for scoliosis (situation)",
      iri: "http://snomed.info/sct#428548000",
      code: "428548000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "History of spinal fusion for scoliosis (situation)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Resolving infantile idiopathic scoliosis (disorder)",
      iri: "http://snomed.info/sct#28801006",
      code: "28801006",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 8,
      match: "Resolving infantile idiopathic scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Progressive infantile idiopathic scoliosis (disorder)",
      iri: "http://snomed.info/sct#20980008",
      code: "20980008",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 11,
      match: "Progressive infantile idiopathic scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Idiopathic scoliosis AND/OR kyphoscoliosis (disorder)",
      iri: "http://snomed.info/sct#30611007",
      code: "30611007",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Idiopathic scoliosis AND/OR kyphoscoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
      iri: "http://snomed.info/sct#722432000",
      code: "722432000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Congenital scoliosis due to bony malformation (disorder)",
      iri: "http://snomed.info/sct#205045003",
      code: "205045003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      weighting: 60,
      match: "Congenital scoliosis due to bony malformation (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Blindness, scoliosis, arachnodactyly syndrome (disorder)",
      iri: "http://snomed.info/sct#717920004",
      code: "717920004",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Blindness, scoliosis, arachnodactyly syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Family history of scoliosis deformity of spine (situation)",
      iri: "http://snomed.info/sct#430544007",
      code: "430544007",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Family history of scoliosis deformity of spine (situation)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)",
      iri: "http://snomed.info/sct#302011000119105",
      code: "302011000119105",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Adolescent idiopathic scoliosis of lumbar spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Horizontal gaze palsy with progressive scoliosis (disorder)",
      iri: "http://snomed.info/sct#702381007",
      code: "702381007",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Horizontal gaze palsy with progressive scoliosis (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Infantile idiopathic scoliosis of cervical spine (disorder)",
      iri: "http://snomed.info/sct#310421000119106",
      code: "310421000119106",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Infantile idiopathic scoliosis of cervical spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)",
      iri: "http://snomed.info/sct#302031000119100",
      code: "302031000119100",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Adolescent idiopathic scoliosis of thoracic spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Idiopathic scoliosis of thoracic and lumbar spine (disorder)",
      iri: "http://snomed.info/sct#713711000",
      code: "713711000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Idiopathic scoliosis of thoracic and lumbar spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)",
      iri: "http://snomed.info/sct#302041000119109",
      code: "302041000119109",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Macrocephaly, alopecia, cutis laxa, scoliosis syndrome (disorder)",
      iri: "http://snomed.info/sct#723367005",
      code: "723367005",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Macrocephaly, alopecia, cutis laxa, scoliosis syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Idiopathic scoliosis of thoracic spine with double curve (disorder)",
      iri: "http://snomed.info/sct#713716005",
      code: "713716005",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Idiopathic scoliosis of thoracic spine with double curve (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Tall stature, scoliosis, macrodactyly of great toe syndrome (disorder)",
      iri: "http://snomed.info/sct#770788000",
      code: "770788000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Tall stature, scoliosis, macrodactyly of great toe syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
      iri: "http://snomed.info/sct#719162001",
      code: "719162001",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Neuromuscular scoliosis co-occurrent and due to cerebral palsy (disorder)",
      iri: "http://snomed.info/sct#330471000119101",
      code: "330471000119101",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Neuromuscular scoliosis co-occurrent and due to cerebral palsy (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Camptodactyly and tall stature with scoliosis and hearing loss syndrome (disorder)",
      iri: "http://snomed.info/sct#720601000",
      code: "720601000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Camptodactyly and tall stature with scoliosis and hearing loss syndrome (disorder)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    },
    {
      name: "Diagnostic radiography of thoracolumbar spine, supine and erect for scoliosis (procedure)",
      iri: "http://snomed.info/sct#35443000",
      code: "35443000",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code scheme and graph", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
      match: "Diagnostic radiography of thoracolumbar spine, supine and erect for scoliosis (procedure)",
      termCode: null,
      icon: ["fa-solid", "fa-lightbulb"],
      colour: "#c3ba4588",
      typeNames: "Terminology Concept",
      favourite: false
    }
  ],
  favourites: ["http://snomed.info/sct#241193003"]
};
const mockCommit = vi.fn();

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    state: mockState,
    commit: mockCommit
  })
}));

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

describe("SearchResultsTable.vue", () => {
  let component;
  let directToSpy;
  let clipboardSpy;
  let docSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    clipboardSpy = vi.spyOn(navigator.clipboard, "writeText");
    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);
    directToSpy = vi.spyOn(DirectService.prototype, "directTo");

    component = render(SearchResultsTable, {
      global: {
        components: { DataTable, ProgressSpinner, Column, OverlayPanel, ContextMenu, Button, MultiSelect },
        directives: { tooltip: Tooltip, clipboard: VueClipboard },
        plugins: [PrimeVue]
      }
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("displays first page of search results", () => {
    component.getByText(mockState.searchResults[0].name);
    component.getByText(mockState.searchResults[19].name);
    const aboveLimit = component.queryByText(mockState.searchResults[20].name);
    expect(aboveLimit).toBeFalsy();
  });

  it("pages additional results", () => {
    const buttons = component.getAllByRole("button");
    const paginatorButtons = buttons.filter(button => button.classList.contains("p-paginator-page"));
    expect(paginatorButtons.length).toBeGreaterThan(1);
  });

  it("identifies favourites", () => {
    const rows = component.getAllByRole("row");
    const favourite = rows.filter(item => within(item).queryByText(mockState.searchResults[0].name))[0];
    const buttons = within(favourite).getAllByRole("button");
    const favButton = buttons.filter(button => button.classList.contains("row-button-fav"));
    expect(favButton).toBeTruthy();
  });

  it("shows page 2", async () => {
    const buttons = component.getAllByRole("button");
    const paginatorButtons = buttons.filter(button => button.classList.contains("p-paginator-page"));
    await fireEvent.click(paginatorButtons[1]);
    component.getByText(mockState.searchResults[20].name);
  });
});
