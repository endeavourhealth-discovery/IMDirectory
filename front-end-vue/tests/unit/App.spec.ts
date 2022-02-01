import { flushPromises, shallowMount } from "@vue/test-utils";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ProgressSpinner from "primevue/progressspinner";

describe("App.vue", () => {
  let wrapper: any;
  let mockStore: any;

  beforeEach(() => {
    jest.resetAllMocks();
    mockStore = {
      state: { historyCount: 1 },
      commit: jest.fn(),
      dispatch: jest.fn()
    };
    wrapper = shallowMount(App, {
      global: {
        components: { Toast, ProgressSpinner },
        stubs: ["router-link", "router-view"],
        mocks: { $store: mockStore }
      }
    });
  });

  it("should check auth and update store history count on mount", async () => {
    await flushPromises();
    expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
    expect(mockStore.dispatch).toHaveBeenCalledWith("authenticateCurrentUser");
    expect(mockStore.dispatch).toHaveBeenCalledWith("fetchBlockedIris");
    expect(mockStore.commit).toBeCalledTimes(1);
  });
});
