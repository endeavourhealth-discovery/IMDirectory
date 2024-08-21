import Card from "primevue/card";
import Button from "primevue/button";
import Message from "primevue/message";
import InputOtp from "primevue/inputotp";
import { flushPromises } from "@vue/test-utils";
import ForgotPasswordSubmit from "@/components/auth/ForgotPasswordSubmit.vue";
import InputText from "primevue/inputtext";
import { AuthService } from "@/services";
import { SpyInstance, vi } from "vitest";
import PrimeVue from "primevue/config";
import { fireEvent, render, RenderResult, within, screen } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { useAuthStore } from "@/stores/authStore";

createTestingPinia({
  stubActions: false,
  initialState: {
    auth: { registeredUsername: "" }
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

describe("ForgotPasswordSubmit.vue no registeredUser", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();
    // AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });
    component = render(ForgotPasswordSubmit, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, Message, InputOtp }
      }
    });
  });

  it("starts empty if no sharedStore registeredUsername", async () => {
    component.getByTestId("forgot-password-submit-username");
    component.getByTestId("forgot-password-submit-code");
    component.getByTestId("forgot-password-submit-new1");
    component.getByTestId("forgot-password-submit-new2");
    component.getByTestId("forgot-password-submit-reset");
  });
});

describe("ForgotPasswordSubmit.vue with registeredUser", () => {
  let component: RenderResult;
  let forgotPasswordSubmitSpy: SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });
    mockState.registeredUsername = "testUser";
    component = render(ForgotPasswordSubmit, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, Message, InputOtp }
      }
    });
  });

  it("starts with username if sharedStore has registeredUsername", async () => {
    component.getByDisplayValue("testUser");
  });

  it("can verify a confirmation code __ false", async () => {
    const codeInput = component.getAllByTestId("otp-input");
    await fireEvent.update(codeInput[0], "1");
    await fireEvent.update(codeInput[1], "2");
    await fireEvent.update(codeInput[2], "5");
    await fireEvent.update(codeInput[3], "6");
    await fireEvent.focus(component.getByTestId("forgot-password-submit-username"));
    await component.findByText("code must be exactly 6 characters");
  });

  it("can verify a confirmation code __ true", async () => {
    const codeInput = component.getAllByTestId("otp-input");
    await fireEvent.update(codeInput[0], "1");
    await fireEvent.update(codeInput[1], "2");
    await fireEvent.update(codeInput[2], "3");
    await fireEvent.update(codeInput[3], "4");
    await fireEvent.update(codeInput[4], "5");
    await fireEvent.update(codeInput[5], "6");
    expect(() => component.getByRole("alert")).toThrowError();
  });

  it("should check password strength __ fail", async () => {
    const passwordInput = component.getByTestId("forgot-password-submit-new1");
    await fireEvent.update(passwordInput, "12345678");
    await flushPromises();
    component.getByDisplayValue("12345678");
    component.queryByTestId("inline-error-message");
  });

  it("should check password strength __ medium", async () => {
    const passwordInput = component.getByTestId("forgot-password-submit-new1");
    await fireEvent.update(passwordInput, "1234abcD");
    component.getByDisplayValue("1234abcD");
    expect(component.queryByDisplayValue("Password too weak")).to.not.exist;
  });

  it("should check password strength __ strong", async () => {
    const passwordInput = component.getByTestId("forgot-password-submit-new1");
    await fireEvent.update(passwordInput, "1234ABcd!!");
    component.getByDisplayValue("1234ABcd!!");
    expect(component.queryByDisplayValue("Password too weak")).to.not.exist;
  });

  it("should check passwords match __ fail", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-new1");
    await fireEvent.update(passwordInput1, "1234ABc!a");

    const passwordInput2 = component.getByTestId("forgot-password-submit-new2");
    await fireEvent.update(passwordInput2, "1234ABc!b");
    await fireEvent.blur(passwordInput2);

    component.getByDisplayValue("1234ABc!a");
    component.getByDisplayValue("1234ABc!b");
    component.queryByTestId("inline-error-message");
  });

  it("calls swal on auth success", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-new1");
    const passwordInput2 = component.getByTestId("forgot-password-submit-new2");
    const codeInput = component.getAllByTestId("otp-input");
    const resetButton = component.getByTestId("forgot-password-submit-reset");

    await fireEvent.update(passwordInput1, "1234ABc!a");
    await fireEvent.update(passwordInput2, "1234ABc!a");
    await fireEvent.update(codeInput[0], "1");
    await fireEvent.update(codeInput[1], "2");
    await fireEvent.update(codeInput[2], "3");
    await fireEvent.update(codeInput[3], "4");
    await fireEvent.update(codeInput[4], "5");
    await fireEvent.update(codeInput[5], "6");
    await fireEvent.click(resetButton);

    await flushPromises();

    component.getByText("Success");
    component.getByText("Password successfully reset");
  });

  it("reroutes on auth success", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-new1");
    const passwordInput2 = component.getByTestId("forgot-password-submit-new2");
    const codeInput = component.getAllByTestId("otp-input");
    const resetButton = component.getByTestId("forgot-password-submit-reset");

    await fireEvent.update(passwordInput1, "1234ABc!a");
    await fireEvent.update(passwordInput2, "1234ABc!a");
    await fireEvent.update(codeInput[0], "1");
    await fireEvent.update(codeInput[1], "2");
    await fireEvent.update(codeInput[2], "3");
    await fireEvent.update(codeInput[3], "4");
    await fireEvent.update(codeInput[4], "5");
    await fireEvent.update(codeInput[5], "6");
    await fireEvent.click(resetButton);
    // expect(mockPush).to.be.calledOnce;
    // expect(mockPush).to.be.calledWith({ name: "Login" });
  });
});

describe("ForgotPasswordSubmit.vue 403 response", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 403, message: "Password reset code has expired. Please request a new code" });
    component = render(ForgotPasswordSubmit, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, Message, InputOtp }
      }
    });
  });

  it("calls swal on auth 403", async () => {
    const usernameInput = component.getByTestId("forgot-password-submit-username");
    const passwordInput1 = component.getByTestId("forgot-password-submit-new1");
    const passwordInput2 = component.getByTestId("forgot-password-submit-new2");
    const resetButton = component.getByTestId("forgot-password-submit-reset");

    await fireEvent.update(usernameInput, "testusername");
    await fireEvent.update(passwordInput1, "12345678aA!");
    await fireEvent.update(passwordInput2, "12345678aA!");
    const codeInput = component.getAllByTestId("otp-input");
    await fireEvent.update(codeInput[0], "1");
    await fireEvent.update(codeInput[1], "2");
    await fireEvent.update(codeInput[2], "3");
    await fireEvent.update(codeInput[3], "4");
    await fireEvent.update(codeInput[4], "5");
    await fireEvent.update(codeInput[5], "6");
    await fireEvent.click(resetButton);

    await flushPromises();
    await component.findByText("Code Expired");
    await component.findByText("Password reset code has expired. Please request a new code");
  });
});
