import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "@/views/Home.vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

describe("Home.vue", () => {
  let wrapper;
  let mockStore;

  beforeEach(() => {
    mockStore = {
      state: {
        filterOptions: {
          status: [
            {
              name: "Active",
              parents: [],
              hasChildren: false,
              type: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
              "@id": "http://endhealth.info/im#Active"
            },
            {
              name: "Draft",
              parents: [],
              hasChildren: false,
              type: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
              "@id": "http://endhealth.info/im#Draft"
            },
            {
              name: "Inactive",
              parents: [],
              hasChildren: false,
              type: [{ name: "Terminology Concept", "@id": "http://endhealth.info/im#Concept" }],
              "@id": "http://endhealth.info/im#Inactive"
            }
          ],
          schemes: [
            { iri: "http://endhealth.info/bc#", prefix: "PFX12", name: "Barts Cerner code scheme and graph" },
            { iri: "http://endhealth.info/emis#", prefix: "PFX5", name: "EMIS code scheme and graph" },
            { iri: "http://endhealth.info/icd10#", prefix: "PFX8", name: "ICD10  code scheme and graph" },
            { iri: "http://endhealth.info/kpax#", prefix: "PFX10", name: "Kings Apex pathology code scheme and graph" },
            { iri: "http://endhealth.info/kwp#", prefix: "PFX11", name: "Kings Winpath pathology code scheme and graph" },
            { iri: "http://endhealth.info/im#", prefix: "PFX2", name: "London Discovery Snomed extension code scheme and graph" },
            { iri: "http://endhealth.info/nhstfc#", prefix: "PFX13", name: "NHS Data Dictionary Speciality and Treatment function codes" },
            { iri: "http://endhealth.info/ods#", prefix: "PFX3", name: "ODS Organisational code scheme and graph" },
            { iri: "http://endhealth.info/opcs4#", prefix: "PFX7", name: "OPCS4 code scheme and graph" },
            { iri: "http://www.w3.org/2002/07/owl#", prefix: "owl", name: "OWL Graph" },
            { iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefix: "rdf", name: "RDF Graph" },
            { iri: "http://www.w3.org/2000/01/rdf-schema#", prefix: "rdfs", name: "RDFS Graph" },
            { iri: "http://www.w3.org/ns/shacl#", prefix: "PFX1", name: "SHACL Graph" },
            { iri: "http://snomed.info/sct#", prefix: "PFX4", name: "Snomed-CT code scheme and graph" },
            { iri: "http://endhealth.info/tpp#", prefix: "PFX6", name: "TPP CTV3 code scheme and graph" },
            { iri: "http://endhealth.info/vis#", prefix: "PFX9", name: "Vision Read2 code scheme and graph" },
            { iri: "http://rdf4j.org/schema/rdf4j#", prefix: "rdf4j", name: "http://rdf4j.org/schema/rdf4j#" },
            { iri: "http://www.geonames.org/ontology#", prefix: "gn", name: "http://www.geonames.org/ontology#" },
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
            { "@id": "http://endhealth.info/im#DataModelEntity", name: "Data model entity" },
            { "@id": "http://endhealth.info/im#dataModelProperty", name: "data model property" },
            { "@id": "http://endhealth.info/im#Query", name: "Query definition" }
          ]
        },
        filterDefaults: {
          schemeOptions: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
          statusOptions: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
          typeOptions: [
            "http://endhealth.info/im#Concept",
            "http://endhealth.info/im#ValueSet",
            "http://endhealth.info/im#ConceptSet",
            "http://endhealth.info/im#DataModelEntity",
            "http://endhealth.info/im#dataModelProperty",
            "http://endhealth.info/im#Query"
          ]
        }
      }
    };

    localStorage.setItem("directoryMainSplitterHorizontal", JSON.stringify([52, 48]));

    wrapper = shallowMount(Home, {
      global: { components: { Splitter, SplitterPanel }, mocks: { $store: mockStore }, stubs: ["router-view"] }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.visibleRight).toBe(false);
    expect(wrapper.vm.selectedIri).toBe("");
    expect(wrapper.vm.splitterContentWidth).toBe("width: calc(48vw - 0.5rem);max-width: calc(48vw - 0.5rem);");
  });

  it("can setSplitterContainerHoriz", () => {
    wrapper.vm.splitterContentWidth = "";
    wrapper.vm.setSplitterContainerHoriz({ sizes: [25, 75] });
    expect(wrapper.vm.splitterContentWidth).toBe("width: calc(75vw - 0.5rem);max-width: calc(75vw - 0.5rem);");
  });
});
