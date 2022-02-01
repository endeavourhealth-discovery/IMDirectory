import { shallowMount } from "@vue/test-utils";
import Home from "@/views/Home.vue";
import SidebarControl from "@/components/home/SidebarControl.vue";
import SideNav from "@/components/home/SideNav.vue";

describe("Home.vue ___ route = Home", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: {
        sideNavHierarchyFocus: {
          name: "Ontology",
          iri: "http://endhealth.info/im#DiscoveryOntology"
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(true)
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    wrapper = shallowMount(Home, {
      global: {
        components: { SidebarControl, SideNav },
        mocks: { $route: mockRoute, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("should updateRoute ___ Home ___ Ontology", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(2);
    expect(mockStore.commit).toBeCalledWith("updateConceptIri", "http://endhealth.info/im#DiscoveryOntology");
  });
});

describe("Home.vue ___ route = Concept", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: { sideNavHierarchyFocus: { name: "Ontology", iri: "http://endhealth.info/im#DiscoveryOntology" } },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(true)
    };
    mockRoute = {
      params: { selectedIri: "test concept Iri" },
      name: "Concept"
    };
    wrapper = shallowMount(Home, {
      global: {
        components: { SidebarControl, SideNav },
        mocks: { $route: mockRoute, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("should updateRoute ___ Concept", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(2);
    expect(mockStore.commit).toBeCalledWith("updateConceptIri", "test concept Iri");
  });
});

describe("Home.vue ___ route = Home ___ InformationModel", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: {
        sideNavHierarchyFocus: { name: "InformationModel", iri: "http://endhealth.info/im#InformationModel" }
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(true)
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    wrapper = shallowMount(Home, {
      global: {
        components: { SidebarControl, SideNav },
        mocks: { $route: mockRoute, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("should updateRoute ___ Home ___ InformationModel", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(2);
    expect(mockStore.commit).toBeCalledWith("updateConceptIri", "http://endhealth.info/im#InformationModel");
  });
});

describe("Home.vue ___ route = Home ___ ValueSets", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: {
        sideNavHierarchyFocus: { name: "ValueSets", iri: "http://endhealth.info/im#Sets" }
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(true)
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    wrapper = shallowMount(Home, {
      global: {
        components: { SidebarControl, SideNav },
        mocks: { $route: mockRoute, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("should updateRoute ___ Home ___ ValueSets", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(2);
    expect(mockStore.commit).toBeCalledWith("updateConceptIri", "http://endhealth.info/im#Sets");
  });
});

describe("Home.vue ___ route = Home ___ Queries", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: {
        sideNavHierarchyFocus: { name: "Queries", iri: "http://endhealth.info/im#QT_QueryTemplates" }
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(true)
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    wrapper = shallowMount(Home, {
      global: {
        components: { SidebarControl, SideNav },
        mocks: { $route: mockRoute, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("should updateRoute ___ Home ___ Queries", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(2);
    expect(mockStore.commit).toBeCalledWith("updateConceptIri", "http://endhealth.info/im#QT_QueryTemplates");
  });
});

describe("Home.vue ___ route = Other", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: { sideNavHierarchyFocus: { name: "Ontology", iri: "http://endhealth.info/im#DiscoveryOntology" } },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(true)
    };
    mockRoute = {
      params: { selectedIri: "test concept Iri" },
      name: "Workflow"
    };
    wrapper = shallowMount(Home, {
      global: {
        components: { SidebarControl, SideNav },
        mocks: { $route: mockRoute, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("updateRoute does nothing on other routes", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(0);
  });
});
