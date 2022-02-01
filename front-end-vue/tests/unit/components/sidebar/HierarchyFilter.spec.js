import HierarchyFilter from "@/components/sidebar/HierarchyFilter.vue";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";
import Tooltip from "primevue/tooltip";
import { flushPromises, shallowMount } from "@vue/test-utils";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";

const SCHEME_DEFAULTS = ["http://endhealth.info/im#", "http://snomed.info/sct#"];
const NAMESPACES = [
  { iri: "http://endhealth.info/bc#", prefix: "bc", name: "Barts Cerner namespace" },
  { iri: "http://endhealth.info/ceg16#", prefix: "ceg13", name: "CEG ethnicity 16+ category" },
  { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
  { iri: "http://endhealth.info/emis#", prefix: "emis", name: "EMIS (inc. Read2 like) namespace" },
  { iri: "http://endhealth.info/icd10#", prefix: "icd10", name: "ICD10 namespace" },
  { iri: "http://endhealth.info/reports#", prefix: "reports", name: "IM internal reports" },
  { iri: "http://endhealth.info/kchapex#", prefix: "kchapex", name: "KCH Apex codes" },
  { iri: "http://endhealth.info/kchwinpath#", prefix: "kchwinpath", name: "KCH Winpath codes" },
  { iri: "http://endhealth.info/nhsethnic2001#", prefix: "nhse2001", name: "NHS Ethnicitity categories 2001 census" },
  { iri: "http://endhealth.info/ods#", prefix: "ods", name: "ODS code scheme" },
  { iri: "http://endhealth.info/opcs4#", prefix: "opcs4", name: "OPCS4 namespace" },
  { iri: "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRole-1#", prefix: "orole", name: "OPS roles namespace" },
  { iri: "http://www.w3.org/2002/07/owl#", prefix: "owl", name: "OWL2 namespace" },
  { iri: "http://www.w3.org/ns/prov#", prefix: "prov", name: "PROV namespace" },
  { iri: "http://endhealth.info/prsb#", prefix: "prsb", name: "PRSB namespace" },
  { iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefix: "rdf", name: "RDF namespace" },
  { iri: "http://www.w3.org/2000/01/rdf-schema#", prefix: "rdfs", name: "RDFS namespace" },
  { iri: "http://www.w3.org/ns/shacl#", prefix: "sh", name: "SHACL namespace" },
  { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" },
  { iri: "http://endhealth.info/tpp#", prefix: "tpp", name: "TPP (inc.CTV3) namespace" },
  { iri: "http://endhealth.info/vision#", prefix: "vis", name: "Vision (incl. Read2) namespace" },
  { iri: "http://www.w3.org/2001/XMLSchema#", prefix: "xsd", name: "xsd namespace" }
];

describe("HierarchyFilter.vue ___ empty store", () => {
  let wrapper;
  let mockStore;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockStore = {
      state: { filterOptions: { schemes: NAMESPACES }, hierarchySelectedFilters: [], filterDefaults: { schemeOptions: SCHEME_DEFAULTS } },
      commit: jest.fn()
    };

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(HierarchyFilter, { global: { components: { Button, MultiSelect }, directives: { Tooltip: Tooltip }, mocks: { $store: mockStore } } });

    console.warn = warn;
    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
      { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
      { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" }
    ]);
  });

  it("can setDefaults", () => {
    wrapper.vm.resetFilters = jest.fn();
    wrapper.vm.setDefaults();
    expect(wrapper.vm.resetFilters).toHaveBeenCalledTimes(1);
  });

  it("can updateStoreSelectedFilters", () => {
    wrapper.vm.updateStoreSelectedFilters();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateHierarchySelectedFilters", [
      { iri: "http://endhealth.info/im#", name: "Discovery namespace", prefix: "im" },
      { iri: "http://snomed.info/sct#", name: "Snomed-CT namespace", prefix: "sn" }
    ]);
  });

  it("can resetFilters", () => {
    wrapper.vm.selectedSchemes = [];
    wrapper.vm.updateStoreSelectedFilters = jest.fn();
    wrapper.vm.resetFilters();
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      },
      {
        iri: "http://snomed.info/sct#",
        name: "Snomed-CT namespace",
        prefix: "sn"
      }
    ]);
    expect(wrapper.vm.updateStoreSelectedFilters).toHaveBeenCalledTimes(1);
  });
});

describe("HierarchyFilter.vue ___ full store", () => {
  let wrapper;
  let mockStore;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockStore = {
      state: {
        filterOptions: { schemes: NAMESPACES },
        hierarchySelectedFilters: [
          {
            iri: "http://endhealth.info/im#",
            name: "Discovery namespace",
            prefix: "im"
          }
        ],
        filterDefaults: { schemeOptions: SCHEME_DEFAULTS }
      },
      commit: jest.fn()
    };

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(HierarchyFilter, { global: { components: { Button, MultiSelect }, directives: { Tooltip: Tooltip }, mocks: { $store: mockStore } } });
    
    console.warn = warn;
    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.selectedSchemes).toStrictEqual([{ iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" }]);
  });

  it("can setDefaults", () => {
    wrapper.vm.resetFilters = jest.fn();
    wrapper.vm.setDefaults();
    expect(wrapper.vm.resetFilters).not.toHaveBeenCalled();
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      }
    ]);
  });
});
