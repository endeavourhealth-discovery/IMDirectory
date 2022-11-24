import { shallowMount } from "@vue/test-utils";
import Auth from "@/views/Auth.vue";
import ButtonBar from "@/components/auth/ButtonBar.vue";
import { setupServer } from "msw/node";

describe("Auth.vue", () => {
  let wrapper;

  const restHandlers = [];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  beforeEach(() => {
    wrapper = shallowMount(Auth, {
      global: {
        components: { ButtonBar },
        stubs: ["router-link", "router-view"]
      }
    });
  });

  it("should render containers", () => {
    expect(wrapper.find(".user-container")).toBeTruthy();
    expect(wrapper.find(".card-button-container")).toBeTruthy();
    expect(wrapper.find("#user-card-container")).toBeTruthy();
  });
});
