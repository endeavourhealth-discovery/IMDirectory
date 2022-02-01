import { shallowMount } from "@vue/test-utils";
import ButtonBar from "@/components/user/ButtonBar.vue";
import Button from "primevue/button";

describe("ButtonBar.vue", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  beforeAll(() => {
    jest.clearAllMocks();
  })
  beforeEach(() => {
    jest.resetAllMocks();
    mockStore = {
      state: { historyCount: 0, snomedLicenseAccepted: true },
      commit: jest.fn()
    }
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    }
    wrapper = shallowMount(ButtonBar, {
      global: {
        components: { Button },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("should route to home on home button click", async () => {
    const homeButton = wrapper.find(".home-button");
    homeButton.trigger("click");
    await wrapper.vm.$nextTick();
    expect(mockRouter.push).toBeCalled();
    expect(mockRouter.push).toBeCalledWith({ name: "Home" });
  });

  it("should route to dashboard on back button click ___ historyCount != history ", async () => {
    const backButton = wrapper.find(".back-button");
    backButton.trigger("click");
    await wrapper.vm.$nextTick();
    expect(mockRouter.go).toBeCalled();
    expect(mockRouter.go).toBeCalledWith(-1);
  });

  it("should route to dashboard on back button click ___ historyCount = history ", async () => {
    mockStore.state.historyCount = 1;
    const backButton = wrapper.find(".back-button");
    backButton.trigger("click");
    await wrapper.vm.$nextTick();
    expect(mockRouter.push).toBeCalled();
    expect(mockRouter.push).toBeCalledWith({ name: "Dashboard" });
  });
})
