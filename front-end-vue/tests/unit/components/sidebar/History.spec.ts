import { mount } from "@vue/test-utils";
import History from "@/components/sidebar/History.vue";
import Listbox from "primevue/listbox";
import Divider from "primevue/divider";

describe("History.vue", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStore = {
      state: {
        history: [{ conceptName: "Test history item 1" }, { conceptName: "Test history item 2" }]
      }
    };
    mockRouter = {
      push: jest.fn()
    };
    wrapper = mount(History, {
      global: {
        components: { Listbox, Divider },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("starts unselected", () => {
    expect(wrapper.vm.selectedHistoryItem).toStrictEqual({});
  });

  it("returns a history item ___ all pass", () => {
    expect(wrapper.vm.getHistory()).toStrictEqual(mockStore.state.history);
  });

  it("can navigate ___ url", async () => {
    wrapper.vm.selectedHistoryItem = { url: "Test url" };
    wrapper.vm.navigate();
    await wrapper.vm.$nextTick();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenLastCalledWith("Test url");
  });

  it("can navigate ___ no url", async () => {
    wrapper.vm.selectedHistoryItem = { usp: "Test url" };
    wrapper.vm.navigate();
    await wrapper.vm.$nextTick();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe("History.vue ___ missing name store", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStore = {
      state: {
        history: [{ iri: "TestIri" }, { conceptName: "Test history item 2" }]
      }
    };
    mockRouter = {
      push: jest.fn()
    };
    wrapper = mount(History, {
      global: {
        components: { Listbox, Divider },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("returns a history items ___ missing names", () => {
    expect(wrapper.vm.getHistory()).toStrictEqual([mockStore.state.history[1]]);
  });
});
