import { mount } from "@vue/test-utils";
import UserDetails from "@/components/auth/UserDetails.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { Avatars } from "@im-library/constants";
import { User } from "@im-library/models";
import PrimeVue from "primevue/config";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";

const mockDispatch = vi.fn();
const mockState = {} as any;
const mockCommit = vi.fn();

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    state: mockState,
    commit: mockCommit
  })
}));

const mockPush = vi.fn();
const mockGo = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  })
}));

describe("userDetails.vue", () => {
  let component: RenderResult;

  beforeEach(() => {
    const user = {
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: Avatars[0],
      roles: []
    };
    vi.clearAllMocks();
    mockState.currentUser = user;
    mockState.isLoggedIn = true;
    component = render(UserDetails, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText }
      }
    });
  });

  it("correctly renders User details from store", () => {
    component.getByTestId("user-details-username");
    component.getByTestId("user-details-email");
    component.getByTestId("user-details-firstname");
    component.getByTestId("user-details-lastname");

    component.getByDisplayValue("testUser");
    component.getByDisplayValue("John");
    component.getByDisplayValue("Doe");
    component.getByDisplayValue("john.doe@ergosoft.co.uk");
  });

  it("returns the correct image url", async () => {
    const avatarImage = component.getByTestId("user-details-avatar");
    expect(avatarImage.getAttribute("src")).to.contain("colour/001-man.png");
  });
});
