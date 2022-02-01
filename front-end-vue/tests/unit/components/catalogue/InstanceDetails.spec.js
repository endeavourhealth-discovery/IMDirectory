import InstanceDetails from "@/components/catalogue/InstanceDetails.vue";
import ProgressSpinner from "primevue/progressspinner";
import Panel from "primevue/panel";
import Button from "primevue/button";
import Tree from "primevue/tree";
import Tooltip from "primevue/tooltip";
import { shallowMount } from "@vue/test-utils";

describe("InstanceDetails.vue", () => {
  let wrapper;
  let mockRouter;
  let mockStore;

  const INSTANCE = {
    entity: {
      "@id": "http://org.endhealth.info/im#8KH73",
      "http://endhealth.info/im#address": { "@id": "http://loc.endhealth.info/im#8KH73" },
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": { "@id": "http://endhealth.info/im#Organisation", name: "Organisation  (record type)" },
      "http://www.w3.org/2000/01/rdf-schema#label": "BARTS CRUK CENTRE IT"
    },
    predicates: [
      { name: "address", "@id": "http://endhealth.info/im#address" },
      { name: "status", "@id": "http://endhealth.info/im#status" },
      { name: "type", "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
      { name: "label", "@id": "http://www.w3.org/2000/01/rdf-schema#label" }
    ]
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    mockRouter = { push: jest.fn() };
    mockStore = { commit: jest.fn() };

    wrapper = shallowMount(InstanceDetails, {
      global: { components: { ProgressSpinner, Panel, Button, Tree }, directives: { Tooltip: Tooltip }, mocks: { $store: mockStore, $router: mockRouter } },
      props: { instance: INSTANCE, instanceIri: INSTANCE.entity["@id"], loading: false }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.instance).toStrictEqual(INSTANCE);
    expect(wrapper.vm.instanceIri).toBe(INSTANCE.entity["@id"]);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.instanceName).toBe(INSTANCE.entity["http://www.w3.org/2000/01/rdf-schema#label"]);
    expect(wrapper.vm.instanceData).toStrictEqual([
      { key: 0, label: "http://org.endhealth.info/im#8KH73", children: [] },
      { key: 1, label: "address : ", data: { "@id": "http://loc.endhealth.info/im#8KH73" }, type: "address", children: [] },
      { key: 2, label: "status : ", data: "Active", children: [] },
      { key: 3, label: "type : ", data: "Organisation  (record type)", children: [] },
      { key: 4, label: "label : ", data: "BARTS CRUK CENTRE IT", children: [] }
    ]);
  });

  it("processInstance on instance change", () => {
    wrapper.vm.processInstance = jest.fn();
    wrapper.vm.$options.watch.instance.call(wrapper.vm, true);
    expect(wrapper.vm.processInstance).toHaveBeenCalledTimes(1);
  });

  it("can navigate", () => {
    wrapper.vm.navigate("http://loc.endhealth.info/im#8KH73");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Individual", params: { selectedIri: "http://loc.endhealth.info/im#8KH73" } });
  });

  it("can getPredicateName", () => {
    expect(wrapper.vm.getPredicateName("http://endhealth.info/im#address")).toBe("address");
  });

  it("can showDashboard", () => {
    wrapper.vm.showDashboard();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateInstanceIri", "");
  });
});
