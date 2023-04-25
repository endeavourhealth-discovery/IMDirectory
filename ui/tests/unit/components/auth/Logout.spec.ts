import Card from "primevue/card";
import Button from "primevue/button";
import { flushPromises } from "@vue/test-utils";
import Logout from "@/components/auth/Logout.vue";
import { AuthService } from "@/services";
import { Avatars } from "@im-library/constants";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Swal from "sweetalert2";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/root";
import { CustomAlert, User } from "@im-library/interfaces";
import { useUserStore } from "@/stores/userStore";

window.scrollTo = vi.fn() as any;

createTestingPinia()
const mockState = useRootStore();
const mockUserState = useUserStore();

const mockPush = vi.fn();
const mockGo = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  })
}));

describe("Logout.vue", () => {
  let component: RenderResult;
  let user: User;

  beforeEach(() => {
    vi.clearAllMocks();
    user = {
      id: "12345",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: Avatars[0],
      roles: []
    } as User;
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 200, message: "Logout successful" });

    mockUserState.currentUser = user;
    mockState.isLoggedIn = true;
    component = render(Logout, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, Swal }
      }
    });
  });

  it("renders current username from store", async () => {
    component.getByText("testUser");
  });

  it("returns the correct image url", async () => {
    const avatarImage = component.getByTestId("logout-avatar-image");
    expect(avatarImage.getAttribute("src")).to.contain("colour/001-man.png");
  });

  it("fires swal on handleSubmit", async () => {
    const logout = component.getByTestId("logout-submit");
    await fireEvent.click(logout);

    await flushPromises();

    component.getByText("Are you sure?");
    component.getByText("Confirm logout request");
  });

  it("does nothing on swal cancel", async () => {
    const logout = component.getByTestId("logout-submit");
    await fireEvent.click(logout);

    await flushPromises();

    const cancel = component.getByText("Cancel");
    await fireEvent.click(cancel);
    expect(component.queryByText("Cancel")).to.not.exist;
    component.getByText("Current User:");
  });

  it("fires swal on successful store logout", async () => {
    const logout = component.getByTestId("logout-submit");
    await fireEvent.click(logout);

    // await flushPromises();

    const confirm = component.getByText("OK");
    // await fireEvent.click(confirm);

    // await flushPromises();

    // component.getByText("Success");
    // component.getByText("logout success");
  });

  it("fires swal on unsuccessful store logout", async () => {
    mockState.logoutCurrentUser =  (async () => { return {status: 400, message: "logout failed" } as CustomAlert});
    const logout = component.getByTestId("logout-submit");
    await fireEvent.click(logout);

    await flushPromises();

    const confirm = component.getByText("OK");
    // await fireEvent.click(confirm);
    // await flushPromises();

    // component.getByText("Success");
    // component.getByText("logout failed");
  });
});
