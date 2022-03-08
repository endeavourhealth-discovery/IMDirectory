import { flushPromises, shallowMount } from "@vue/test-utils";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";

describe("App.vue", () => {
  let wrapper;
  let mockStore;

  beforeEach(() => {
    vi.resetAllMocks();
    mockStore = {
      state: { historyCount: 1 },
      commit: vi.fn(),
      dispatch: vi.fn()
    };
    wrapper = shallowMount(App, {
      global: {
        components: { Toast, ProgressSpinner, ConfirmDialog },
        stubs: ["router-link", "router-view"],
        mocks: { $store: mockStore }
      }
    });
  });

  it("should check auth and update store history count on mount", async () => {
    await flushPromises();
    expect(mockStore.dispatch).toHaveBeenCalledTimes(3);
    expect(mockStore.dispatch).toHaveBeenCalledWith("authenticateCurrentUser");
    expect(mockStore.dispatch).toHaveBeenCalledWith("fetchBlockedIris");
  });
});
