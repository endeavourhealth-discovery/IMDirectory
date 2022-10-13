import { render, fireEvent, within } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InfoSideBar from "../../../../src/components/home/InfoSideBar.vue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import testData from "./InfoSideBar.testData";
import { Services } from "im-library";
import { flushPromises } from "@vue/test-utils";
import { createStore } from "vuex";
const { EntityService, ConfigService } = Services;

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

describe("InfoSideBar.vue ___ selectedConceptIri", () => {
  let component;
  let getComponentLayoutSpy;
  let getDefinitionBundleSpy;
  let getPartialEntitySpy;
  let getPagedChildrenSpy;
  let getEntityTermCodesSpy;
  let mockStore;
  let commitSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockStore = createStore({
      state: {
        conceptIri: "http://endhealth.info/im#testConceptIri",
        selectedConceptIri: "http://endhealth.info/im#testSelectedConceptIri",
        locateOnNavTree: "http://endhealth.info/im#testLocateConceptIri"
      },
      mutations: {
        updateSelectedConceptIri(state, value) {
          state.selectedConceptIri = value;
        }
      }
    });
    commitSpy = vi.spyOn(mockStore, "commit");
    getComponentLayoutSpy = vi
      .spyOn(ConfigService.prototype, "getComponentLayout")
      .mockResolvedValueOnce(testData.DEFINITION)
      .mockResolvedValueOnce(testData.SUMMARY);
    getPartialEntitySpy = vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue(testData.ENTITY);
    getPagedChildrenSpy = vi.spyOn(EntityService.prototype, "getPagedChildren").mockResolvedValue(testData.CHILDREN);
    getEntityTermCodesSpy = vi.spyOn(EntityService.prototype, "getEntityTermCodes").mockResolvedValue([]);
    getDefinitionBundleSpy = vi.spyOn(EntityService.prototype, "getDefinitionBundle").mockResolvedValue({ ...testData.INFERRED_BUNDLE });

    component = render(InfoSideBar, {
      props: { visible: true },
      global: {
        components: { Button, ProgressSpinner, TabPanel, TabView },
        stubs: { Definition: true, SecondaryTree: true, TermCodeTable: true },
        plugins: [PrimeVue, mockStore],
        directives: { tooltip: Tooltip }
      }
    });

    await flushPromises();
  });

  it("doesnt saves conceptIri to store if selectedConceptIri not found", async () => {
    expect(commitSpy).not.toHaveBeenCalledOnce();
    expect(commitSpy).not.toHaveBeenCalledWith("updateSelectedConceptIri", "http://endhealth.info/im#testConceptIri");
  });

  it("gets config, concept, inferred and terms on mount", () => {
    expect(getComponentLayoutSpy).toHaveBeenCalledTimes(2);
    expect(getComponentLayoutSpy).toHaveBeenCalledWith("definition");
    expect(getComponentLayoutSpy).toHaveBeenCalledWith("summary");
    expect(getPartialEntitySpy).toHaveBeenCalledTimes(2);
    expect(getPartialEntitySpy).toHaveBeenCalledWith("http://endhealth.info/im#testSelectedConceptIri", [
      "http://www.w3.org/2000/01/rdf-schema#label",
      "http://endhealth.info/im#code",
      "http://endhealth.info/im#status",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://www.w3.org/2000/01/rdf-schema#comment",
      "http://endhealth.info/im#definition",
      "http://endhealth.info/im#isChildOf",
      "http://endhealth.info/im#hasChildren",
      "http://endhealth.info/im#definition"
    ]);
    expect(getPartialEntitySpy).toHaveBeenCalledWith("http://endhealth.info/im#testSelectedConceptIri", ["http://endhealth.info/im#hasTermCode"]);
    expect(getPagedChildrenSpy).toHaveBeenCalledOnce();
  });
});

describe("InfoSideBar.vue ___ no selectedConceptIri", () => {
  let component;
  let getComponentLayoutSpy;
  let getDefinitionBundleSpy;
  let getPartialEntitySpy;
  let getPagedChildrenSpy;
  let getEntityTermCodesSpy;
  let mockStore;
  let commitSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockStore = createStore({
      state: {
        conceptIri: "http://endhealth.info/im#testConceptIri",
        selectedConceptIri: "",
        locateOnNavTree: "http://endhealth.info/im#testLocateConceptIri"
      },
      mutations: {
        updateSelectedConceptIri(state, value) {
          state.selectedConceptIri = value;
        }
      }
    });
    commitSpy = vi.spyOn(mockStore, "commit");
    getComponentLayoutSpy = vi
      .spyOn(ConfigService.prototype, "getComponentLayout")
      .mockResolvedValueOnce(testData.DEFINITION)
      .mockResolvedValueOnce(testData.SUMMARY)
      .mockResolvedValueOnce(testData.DEFINITION)
      .mockResolvedValueOnce(testData.SUMMARY);
    getPartialEntitySpy = vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue(testData.ENTITY);
    getPagedChildrenSpy = vi.spyOn(EntityService.prototype, "getPagedChildren").mockResolvedValue(testData.CHILDREN);
    getEntityTermCodesSpy = vi.spyOn(EntityService.prototype, "getEntityTermCodes").mockResolvedValue([]);
    getDefinitionBundleSpy = vi.spyOn(EntityService.prototype, "getDefinitionBundle").mockResolvedValue({ ...testData.INFERRED_BUNDLE });

    component = render(InfoSideBar, {
      props: { visible: true },
      global: {
        components: { Button, ProgressSpinner, TabPanel, TabView },
        stubs: { Definition: true, SecondaryTree: true, TermCodeTable: true },
        plugins: [PrimeVue, mockStore],
        directives: { tooltip: Tooltip }
      }
    });

    await flushPromises();
  });

  it("saves conceptIri to store if selectedConceptIri not found", async () => {
    expect(commitSpy).toHaveBeenCalledOnce();
    expect(commitSpy).toHaveBeenCalledWith("updateSelectedConceptIri", "http://endhealth.info/im#testConceptIri");
  });
});

describe("InfoSideBar.vue ___ favourites", () => {
  let component;
  let getComponentLayoutSpy;
  let getDefinitionBundleSpy;
  let getPartialEntitySpy;
  let getPagedChildrenSpy;
  let getEntityTermCodesSpy;
  let mockStore;
  let commitSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockStore = createStore({
      state: {
        conceptIri: "http://endhealth.info/im#Favourites",
        selectedConceptIri: "",
        locateOnNavTree: "http://endhealth.info/im#testLocateConceptIri"
      },
      mutations: {
        updateSelectedConceptIri(state, value) {
          state.selectedConceptIri = value;
        }
      }
    });
    commitSpy = vi.spyOn(mockStore, "commit");
    getComponentLayoutSpy = vi
      .spyOn(ConfigService.prototype, "getComponentLayout")
      .mockResolvedValueOnce(testData.DEFINITION)
      .mockResolvedValueOnce(testData.SUMMARY)
      .mockResolvedValueOnce(testData.DEFINITION)
      .mockResolvedValueOnce(testData.SUMMARY);
    getPartialEntitySpy = vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue(testData.ENTITY);
    getPagedChildrenSpy = vi.spyOn(EntityService.prototype, "getPagedChildren").mockResolvedValue(testData.CHILDREN);
    getEntityTermCodesSpy = vi.spyOn(EntityService.prototype, "getEntityTermCodes").mockResolvedValue([]);
    getDefinitionBundleSpy = vi.spyOn(EntityService.prototype, "getDefinitionBundle").mockResolvedValue({ ...testData.INFERRED_BUNDLE });

    component = render(InfoSideBar, {
      props: { visible: true },
      global: {
        components: { Button, ProgressSpinner, TabPanel, TabView },
        stubs: { Definition: true, SecondaryTree: true, TermCodeTable: true },
        plugins: [PrimeVue, mockStore],
        directives: { tooltip: Tooltip }
      }
    });

    await flushPromises();
  });

  it("handles favourites", async () => {
    component.getByTestId("favourites-message");
  });
});
