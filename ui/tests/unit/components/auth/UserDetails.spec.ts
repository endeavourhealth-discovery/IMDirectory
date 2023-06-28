import UserDetails from "@/components/auth/UserDetails.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { Avatars } from "@im-library/constants";
import PrimeVue from "primevue/config";
import { vi, describe, beforeEach, it, expect } from "vitest";
import { render, RenderResult } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";
import { User } from "@im-library/interfaces";
import { useUserStore } from "@/stores/userStore";

createTestingPinia();
const mockState = useSharedStore();
const mockUserState = useUserStore();

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
      id: "1234",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: Avatars[0],
      roles: []
    } as User;
    vi.clearAllMocks();
    mockUserState.currentUser = user;
    component = render(UserDetails, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText }
      }
    });
  });

  it("correctly renders User details from sharedStore", () => {
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
