import Card from "primevue/card";
import Button from "primevue/button";
import ForgotPassword from "@/components/auth/ForgotPassword.vue";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { AuthService } from "@/services";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia({
  initialState: {
    user: { registeredUsername: "" },
    auth: { updateRegisteredUsername: vi.fn() }
  }
});

const mockPush = vi.fn();
const mockGo = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  })
}));

describe("ForgotPassword.vue", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.forgotPassword = vi.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });

    component = render(ForgotPassword, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, Message }
      },
      props: {
        username: "testUser"
      }
    });
  });

  it("updates username on user entry", async () => {
    component.getByTestId("forgot-password-username-input");
  });

  it("fires swal before auth service call", async () => {
    const usernameInput = await component.findByTestId("forgot-password-username-input");
    await fireEvent.update(usernameInput, "testUser");
    const submitButton = await component.findByTestId("forgot-password-user-submit");
    await fireEvent.click(submitButton);
    await component.findByText("Warning");
    await component.findByText("Reset password for account: testUser");
  });

  it("calls auth service forgotPassword", async () => {
    const usernameInput = await component.findByTestId("forgot-password-username-input");
    await fireEvent.update(usernameInput, "testUser");
    const submitButton = await component.findByTestId("forgot-password-user-submit");
    await fireEvent.click(submitButton);
    const resetButton = await component.findByText("Reset Password");
    await fireEvent.click(resetButton);
    await component.findByText("Success");
    await component.findByText("Password has been reset for account: testUser. An email has been sent with a recovery code.");
  });

  it.skip("calls swal after unsuccessful auth service forgotPassword call", async () => {
    AuthService.forgotPassword = vi.fn().mockResolvedValue({ status: 400, message: "Password reset failed" });
    const usernameInput = await component.findByTestId("forgot-password-username-input");
    await fireEvent.update(usernameInput, "testUser");
    const submitButton = await component.findByTestId("forgot-password-user-submit");
    await fireEvent.click(submitButton);
    const resetButton = await component.findByText("Reset Password");
    await fireEvent.click(resetButton);
    await component.findByText("Error");
    await component.findByText("Password reset failed. Check username is correct.");
  });
});
