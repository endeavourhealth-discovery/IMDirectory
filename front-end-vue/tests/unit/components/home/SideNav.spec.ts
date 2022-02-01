import { flushPromises, shallowMount } from "@vue/test-utils";
import SideNav from "@/components/home/SideNav.vue";
import Menu from "primevue/menu";
import { User } from "@/models/user/User";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { IM } from "@/vocabulary/IM";
import LoggerService from "@/services/LoggerService";

const LOGIN_ITEMS = [
  {
    label: "Login",
    icon: "fa fa-fw fa-user",
    to: "/user/login"
  },
  {
    label: "Register",
    icon: "fa fa-fw fa-user-plus",
    to: "/user/register"
  }
];

const ACCOUNT_ITEMS = [
  {
    label: "My account",
    icon: "fa fa-fw fa-user",
    to: "/user/my-account"
  },
  {
    label: "Edit account",
    icon: "fa fa-fw fa-user-edit",
    to: "/user/my-account/edit"
  },
  {
    label: "Change password",
    icon: "fa fa-fw fa-user-lock",
    to: "/user/my-account/password-edit"
  },
  {
    label: "Logout",
    icon: "fa fa-fw fa-sign-out-alt",
    to: "/user/logout"
  }
];

const MENU_ITEMS = [
  {
    icon: ["fas", "book"],
    name: "Ontology",
    fullName: "Ontologies",
    route: "Dashboard",
    iri: IM.MODULE_ONTOLOGY
  },
  {
    icon: ["fas", "layer-group"],
    name: "Sets",
    fullName: "Concept sets and value sets",
    route: "Dashboard",
    iri: IM.MODULE_SETS
  },
  {
    icon: ["fas", "archive"],
    name: "DataModel",
    fullName: "Data model",
    route: "Dashboard",
    iri: IM.MODULE_DATA_MODEL
  },
  {
    icon: ["fas", "search"],
    name: "Queries",
    fullName: "Query templates",
    route: "Dashboard",
    iri: IM.MODULE_QUERIES
  }
];

describe("SideNav.spec ___ not logged in", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockRef: any;

  beforeEach(async () => {
    mockStore = {
      state: {
        currentUser: null,
        isLoggedIn: false,
        sideNavHierarchyFocus: { name: "Ontology", fullName: "Ontologies", route: "Dashboard", iri: "http://endhealth.info/im#DiscoveryOntology" },
        selectedEntityType: "Class",
        moduleSelectedEntities: new Map([
          ["Ontology", IM.MODULE_ONTOLOGY],
          ["Sets", IM.MODULE_SETS],
          ["DataModel", IM.MODULE_DATA_MODEL],
          ["Catalogue", IM.MODULE_CATALOGUE],
          ["Queries", IM.MODULE_QUERIES]
        ]),
        focusHierarchy: false
      },
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    mockRef = { render: () => {}, methods: { toggle: jest.fn() } };
    wrapper = shallowMount(SideNav, {
      global: {
        components: { Menu, FontAwesomeIcon },
        mocks: { $store: mockStore, $route: mockRoute, $router: mockRouter },
        stubs: { Menu: mockRef }
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("starts with the correct data", () => {
    expect(wrapper.vm.loginItems).toStrictEqual(LOGIN_ITEMS);
    expect(wrapper.vm.accountItems).toStrictEqual(ACCOUNT_ITEMS);
    expect(wrapper.vm.menuItems).toStrictEqual(MENU_ITEMS);
  });

  it("can determine isActive ___ true", () => {
    expect(wrapper.vm.isActive("Ontology")).toBeTruthy();
  });

  it("can determine isActive ___ false", () => {
    expect(wrapper.vm.isActive("Concept")).toBeFalsy();
  });

  it("can getItems ___ not logged in", () => {
    expect(wrapper.vm.getItems()).toStrictEqual([
      {
        label: "Login",
        icon: "fa fa-fw fa-user",
        to: "/user/login"
      },
      {
        label: "Register",
        icon: "fa fa-fw fa-user-plus",
        to: "/user/register"
      }
    ]);
  });

  it("returns the correct image url", async () => {
    jest.mock("@/assets/avatars/colour/013-woman.png", () => {
      return "/img/013-woman.7f32b854.png";
    });
    const url = wrapper.vm.getUrl("colour/013-woman.png");
    expect(url).toBe("/img/013-woman.7f32b854.png");
  });

  it("can reset to home", async () => {
    wrapper.vm.handleCenterIconClick = jest.fn();
    wrapper.vm.resetToHome();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(5);
    expect(mockStore.commit).toHaveBeenNthCalledWith(1, "updateModuleSelectedEntities", {
      iri: "http://endhealth.info/im#DiscoveryOntology",
      module: "Ontology"
    });
    expect(mockStore.commit).toHaveBeenNthCalledWith(2, "updateModuleSelectedEntities", { iri: "http://endhealth.info/im#Sets", module: "Sets" });
    expect(mockStore.commit).toHaveBeenNthCalledWith(3, "updateModuleSelectedEntities", {
      iri: "http://endhealth.info/im#DiscoveryCommonDataModel",
      module: "DataModel"
    });
    expect(mockStore.commit).toHaveBeenNthCalledWith(4, "updateModuleSelectedEntities", {
      iri: "http://endhealth.info/im#QT_QueryTemplates",
      module: "Queries"
    });
    await flushPromises();
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenCalled();
    expect(mockStore.commit).toHaveBeenLastCalledWith("updateResetTree", true);
  });

  it("can iconClick", () => {
    wrapper.vm.handleCenterIconClick = jest.fn();
    wrapper.vm.iconClick(MENU_ITEMS[1]);
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSidebarControlActivePanel", 0);
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenLastCalledWith(MENU_ITEMS[1]);
  });

  it("can handleCenterIconClick", async () => {
    wrapper.vm.handleCenterIconClick({
      name: "Ontology",
      iri: "http://endhealth.info/im#Discoveryontology",
      fullName: "Ontologies",
      route: "Dashboard"
    });
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenNthCalledWith(1, "updateSideNavHierarchyFocus", {
      name: "Ontology",
      fullName: "Ontologies",
      iri: "http://endhealth.info/im#Discoveryontology",
      route: "Dashboard"
    });
    expect(mockStore.commit).toHaveBeenNthCalledWith(2, "updateConceptIri", "http://endhealth.info/im#DiscoveryOntology");
    expect(mockStore.commit).toHaveBeenNthCalledWith(3, "updateActiveModule", "Ontology");
    expect(mockStore.commit).toHaveBeenNthCalledWith(4, "updateFocusHierarchy", true);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Dashboard" });
  });

  it("can handleCenterIconClick ___ not entityFocus", async () => {
    wrapper.vm.handleCenterIconClick({ name: "Workflow", fullName: "Workflow", iri: "http://endhealth.info/im#Workflow", route: "Workflow" });
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSideNavHierarchyFocus", {
      name: "Workflow",
      fullName: "Workflow",
      iri: "http://endhealth.info/im#Workflow",
      route: "Workflow"
    });
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Workflow" });
  });

  it("can watch selectedEntityType ___ Ontology", async () => {
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "Ontology");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSideNavHierarchyFocus", {
      fullName: "Ontologies",
      iri: "http://endhealth.info/im#DiscoveryOntology",
      name: "Ontology",
      route: "Dashboard"
    });
  });

  it("can watch selectedEntityType ___ Sets", async () => {
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "Sets");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSideNavHierarchyFocus", {
      fullName: "Concept sets and value sets",
      iri: "http://endhealth.info/im#Sets",
      name: "Sets",
      route: "Dashboard"
    });
  });

  it("can watch selectedEntityType ___ DataModel", async () => {
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "DataModel");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSideNavHierarchyFocus", {
      fullName: "Data model",
      iri: "http://endhealth.info/im#DiscoveryCommonDataModel",
      name: "DataModel",
      route: "Dashboard"
    });
  });

  it("can watch selectedEntityType ___ Property", async () => {
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "Property");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSideNavHierarchyFocus", {
      fullName: "Data model",
      iri: "http://endhealth.info/im#DiscoveryCommonDataModel",
      name: "DataModel",
      route: "Dashboard"
    });
  });

  it("can watch selectedEntityType ___ Queries", async () => {
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "Queries");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSideNavHierarchyFocus", {
      fullName: "Query templates",
      iri: "http://endhealth.info/im#QT_QueryTemplates",
      name: "Queries",
      route: "Dashboard"
    });
  });

  it("can watch selectedEntityType ___ folder", async () => {
    wrapper.vm.handleCenterIconClick = jest.fn();
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "Folder");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).not.toHaveBeenCalled();
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenCalledWith({
      fullName: "Ontologies",
      iri: "http://endhealth.info/im#DiscoveryOntology",
      name: "Ontology",
      route: "Dashboard"
    });
  });

  it("can watch selectedEntityType ___ unknown", async () => {
    LoggerService.warn = jest.fn();
    wrapper.vm.handleCenterIconClick = jest.fn();
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "Test");
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).not.toHaveBeenCalled();
    expect(wrapper.vm.handleCenterIconClick).not.toHaveBeenCalled();
    expect(LoggerService.warn).toHaveBeenCalledTimes(1);
    expect(LoggerService.warn).toHaveBeenCalledWith(undefined, 'Unknown selectedEntityType detected in sidenav watcher. Type: "Test"');
  });

  it("can watch sideNavHierarchyFocus ___ not equal", () => {
    wrapper.vm.handleCenterIconClick = jest.fn();
    wrapper.vm.$options.watch.sideNavHierarchyFocus.call(wrapper.vm, { name: "test1" }, { name: "test2" });
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.handleCenterIconClick).toHaveBeenCalledWith({ name: "test1" });
  });

  it("can watch sideNavHierarchyFocus ___ equal", () => {
    wrapper.vm.handleCenterIconClick = jest.fn();
    wrapper.vm.$options.watch.sideNavHierarchyFocus.call(wrapper.vm, { name: "test1" }, { name: "test1" });
    expect(wrapper.vm.handleCenterIconClick).not.toHaveBeenCalled();
  });

  it("can toggle", () => {
    wrapper.vm.toggle("testEvent");
    expect(mockRef.methods.toggle).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.toggle).toHaveBeenCalledWith("testEvent");
  });
});

describe("SideNav.spec ___ logged in", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let mockRoute: any;

  beforeEach(() => {
    mockStore = {
      state: {
        currentUser: new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "12345678", "colour/001-man.png"),
        isLoggedIn: true,
        sideNavHierarchyFocus: { name: "Ontology", iri: "http://endhealth.info/im#DiscoveryOntology" },
        selectedEntityType: "Class",
        moduleSelectedEntities: new Map([
          ["Ontology", IM.MODULE_ONTOLOGY],
          ["Sets", IM.MODULE_SETS],
          ["DataModel", IM.MODULE_DATA_MODEL],
          ["Catalogue", IM.MODULE_CATALOGUE],
          ["Queries", IM.MODULE_QUERIES]
        ]),
        focusHierarchy: false
      },
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    wrapper = shallowMount(SideNav, {
      global: {
        components: { Menu, FontAwesomeIcon },
        mocks: { $store: mockStore, $route: mockRoute, $router: mockRouter }
      }
    });
  });

  it("can getItems ___ logged in", async () => {
    expect(wrapper.vm.getItems()).toStrictEqual([
      {
        label: "My account",
        icon: "fa fa-fw fa-user",
        to: "/user/my-account" //+ this.user.id
      },
      {
        label: "Edit account",
        icon: "fa fa-fw fa-user-edit",
        to: "/user/my-account/edit"
      },
      {
        label: "Change password",
        icon: "fa fa-fw fa-user-lock",
        to: "/user/my-account/password-edit"
      },
      {
        label: "Logout",
        icon: "fa fa-fw fa-sign-out-alt",
        to: "/user/logout" //+ this.user.id
      }
    ]);
  });
});

describe("SideNav.spec ___ not module iris", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let mockRoute: any;

  beforeEach(async () => {
    mockStore = {
      state: {
        currentUser: null,
        isLoggedIn: false,
        sideNavHierarchyFocus: { name: "Ontology", fullName: "Ontologies", route: "Dashboard", iri: "http://endhealth.info/im#DiscoveryOntology" },
        selectedEntityType: "Class",
        moduleSelectedEntities: new Map([
          ["Ontology", "http://snomed.info/sct#298382003"],
          ["Sets", "http://endhealth.info/im#CSET_Covid5"],
          ["DataModel", "http://endhealth.info/im#StatsReport"],
          ["Catalogue", IM.MODULE_CATALOGUE],
          ["Queries", "http://endhealth.info/im#1000051000252106"]
        ]),
        focusHierarchy: false
      },
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    mockRoute = {
      params: { selectedIri: "test Iri" },
      name: "Home"
    };
    wrapper = shallowMount(SideNav, {
      global: {
        components: { Menu, FontAwesomeIcon },
        mocks: { $store: mockStore, $route: mockRoute, $router: mockRouter }
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("can handleCenterIconClick", async () => {
    wrapper.vm.handleCenterIconClick({
      name: "Ontology",
      iri: "http://endhealth.info/im#Discoveryontology",
      fullName: "Ontologies",
      route: "Dashboard"
    });
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenNthCalledWith(1, "updateSideNavHierarchyFocus", {
      name: "Ontology",
      fullName: "Ontologies",
      iri: "http://endhealth.info/im#Discoveryontology",
      route: "Dashboard"
    });
    expect(mockStore.commit).toHaveBeenNthCalledWith(2, "updateConceptIri", "http://snomed.info/sct#298382003");
    expect(mockStore.commit).toHaveBeenNthCalledWith(3, "updateActiveModule", "Ontology");
    expect(mockStore.commit).toHaveBeenNthCalledWith(4, "updateFocusHierarchy", true);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "http://snomed.info/sct#298382003" } });
  });
});
