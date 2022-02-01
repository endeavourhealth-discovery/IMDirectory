import { shallowMount } from "@vue/test-utils";
import User from "@/views/User.vue";
import ButtonBar from "@/components/user/ButtonBar.vue";

describe("User.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallowMount(User, {
      global: {
        components: { ButtonBar },
        stubs: ["router-link", "router-view"]
      },
    });
  });

  it("should render containers", () => {
    expect(wrapper.find(".user-container")).toBeTruthy();
    expect(wrapper.find(".card-button-container")).toBeTruthy();
    expect(wrapper.find("#user-card-container")).toBeTruthy();
  })
});
