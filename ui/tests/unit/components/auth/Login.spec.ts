import { flushPromises } from "@vue/test-utils";
import Login from "@/components/auth/Login.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { AuthService } from "@/services";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { User } from "@im-library/interfaces";
import { createTestingPinia } from "@pinia/testing";
import { useAuthStore } from "@/stores/authStore";

createTestingPinia({
  initialState: {
    auth: { registeredUsername: "testUser" }
  }
});
const mockState = useAuthStore();

const mockPush = vi.fn();
const mockGo = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  })
}));

describe("login.vue no registeredUser", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();
    component = render(Login, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText }
      }
    });
  });

  it("starts empty if no sharedStore registeredUsername", async () => {
    component.getByTestId("login-username");
  });
});

describe("login.vue with registeredUser", () => {
  let component: RenderResult;
  let testUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    testUser = {
      id: "9gkej864-l39k-9u87-4lau-w7777b3m5g09",
      username: "devtest",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/001-man.png",
      roles: []
    };

    AuthService.signIn = vi.fn().mockResolvedValue({ status: 200, message: "Login successful", user: testUser });

    mockState.registeredUsername = "testUser";
    component = render(Login, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText }
      }
    });
  });

  it("starts with registeredUsername if in sharedStore", async () => {
    component.getByTestId("login-username");
    component.getByDisplayValue("testUser");
  });

  it("hits the Authservice on handleSubmit", async () => {
    const usernameInput = component.getByTestId("login-username");
    await fireEvent.update(usernameInput, "Devtest");
    const passwordInput = component.getByTestId("login-password");
    await fireEvent.update(passwordInput, "12345678");
    const submitButton = component.getByTestId("login-submit");
    await fireEvent.click(submitButton);

    await flushPromises();

    component.getByText("Success");
    component.getByText("Login successful");
  });

  it("fires swal on auth error ___ 401", async () => {
    AuthService.signIn = vi.fn().mockResolvedValue({ status: 401, message: "Login successful", user: testUser });
    const usernameInput = component.getByTestId("login-username");
    await fireEvent.update(usernameInput, "Devtest");
    const passwordInput = component.getByTestId("login-password");
    await fireEvent.update(passwordInput, "12345678");
    const submitButton = component.getByTestId("login-submit");
    await fireEvent.click(submitButton);

    await flushPromises();

    component.getByText("User Unconfirmed");
    component.getByText("Account has not been confirmed. Please confirm account to continue.");
  });

  it("fires swal on auth error ___ other", async () => {
    AuthService.signIn = vi.fn().mockResolvedValue({ status: 400, message: "Login failed", user: testUser });
    const usernameInput = component.getByTestId("login-username");
    await fireEvent.update(usernameInput, "Devtest");
    const passwordInput = component.getByTestId("login-password");
    await fireEvent.update(passwordInput, "12345678");
    const submitButton = component.getByTestId("login-submit");
    await fireEvent.click(submitButton);

    await flushPromises();

    component.getByText("Error");
    component.getByText("Login failed");
  });
});
