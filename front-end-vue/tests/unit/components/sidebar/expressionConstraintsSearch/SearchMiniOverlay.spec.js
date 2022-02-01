import SearchMiniOverlay from "@/components/sidebar/expressionConstraintsSearch/SearchMiniOverlay.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import OverlayPanel from "primevue/overlaypanel";
import { shallowMount } from "@vue/test-utils";
import { IM } from "@/vocabulary/IM";

describe("SearchMiniOverlay.vue", () => {
  let wrapper;
  let mockRef;
  let docSpy;

  const SEARCH_RESULTS = [
    {
      name: "UK product",
      iri: "http://snomed.info/sct#10363601000001109",
      code: "10363601000001109",
      description: "UK product (product)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      weighting: 3,
      match: "UK product"
    },
    {
      name: "Egg product",
      iri: "http://snomed.info/sct#414074006",
      code: "414074006",
      description: "Egg product (substance)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      weighting: 4,
      match: "Egg product"
    },
    {
      name: "GF Products",
      iri: "http://snomed.info/sct#9364611000001106",
      code: "9364611000001106",
      description: "GF Products (qualifier value)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [{ name: "Concept", "@id": "http://endhealth.info/im#Concept" }],
      isDescendentOf: [],
      weighting: 4,
      match: "GF Products"
    }
  ];

  beforeEach(async () => {
    jest.resetAllMocks();

    mockRef = { render: () => {}, methods: { show: jest.fn(), hide: jest.fn() } };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    wrapper = shallowMount(SearchMiniOverlay, {
      global: { components: { DataTable, Column, OverlayPanel }, stubs: { OverlayPanel: mockRef, FontAwesomeIcon: true } },
      props: { searchTerm: "product", searchResults: SEARCH_RESULTS, loading: false }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.searchTerm).toBe("product");
    expect(wrapper.vm.searchResults).toStrictEqual(SEARCH_RESULTS);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.selectedResult).toStrictEqual({});
    expect(wrapper.vm.hoveredResult).toStrictEqual({});
  });

  it("can get perspective by concept type", () => {
    const testConceptType = [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }];
    expect(wrapper.vm.getPerspectiveByConceptType(testConceptType)).toStrictEqual(["far", "lightbulb"]);
  });

  it("can get colour by concept type", () => {
    const testConceptType = [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }];
    expect(wrapper.vm.getColorByConceptType(testConceptType)).toBe("color:#e39a3688");
  });

  it("routes onNodeSelect", async () => {
    wrapper.vm.selectedResult = SEARCH_RESULTS[0];
    wrapper.vm.onNodeSelect();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().searchResultSelected).toBeTruthy();
    expect(wrapper.emitted().searchResultSelected[0]).toStrictEqual([SEARCH_RESULTS[0]]);
  });

  it("can scroll to top", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(0);
  });

  it("can scroll to top ___ container fail", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(undefined);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });

  it("can hideDetailsOverlay ___ any", () => {
    wrapper.vm.hideDetailsOverlay();
    expect(mockRef.methods.hide).toHaveBeenCalledTimes(1);
  });

  it("can showDetailsOverlay ___ ANY", () => {
    const testData = {
      code: "",
      name: "ANY",
      iri: "",
      isDescendentOf: [],
      weighting: 0,
      scheme: {},
      status: {},
      match: "ANY",
      entityType: [{ "@id": IM.CONCEPT, name: "Concept" }]
    };
    wrapper.vm.showDetailsOverlay("testEvent", testData);
    expect(mockRef.methods.show).not.toHaveBeenCalled();
    expect(wrapper.vm.hoveredResult).toStrictEqual(testData);
  });

  it("can showDetailsOverlay ___ not any", () => {
    wrapper.vm.showDetailsOverlay({ name: "testEvent", target: "testTarget" }, SEARCH_RESULTS[0]);
    expect(mockRef.methods.show).toHaveBeenCalled();
    expect(mockRef.methods.show).toHaveBeenCalledWith({ name: "testEvent", target: "testTarget" }, "testTarget");
    expect(wrapper.vm.hoveredResult).toStrictEqual(SEARCH_RESULTS[0]);
  });

  it("can get concept types", () => {
    expect(
      wrapper.vm.getConceptTypes({
        entityType: [
          { name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" },
          { name: "NodeShape", "@id": "hppt://www.w3.org/2002/07/owl#NodeShape" }
        ]
      })
    ).toBe("Class, NodeShape");
  });
});
