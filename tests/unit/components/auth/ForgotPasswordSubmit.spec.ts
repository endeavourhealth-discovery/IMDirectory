import Card from "primevue/card";
import Button from "primevue/button";
import InlineMessage from "primevue/inlinemessage";
import { flushPromises, mount } from "@vue/test-utils";
import ForgotPasswordSubmit from "@/components/auth/ForgotPasswordSubmit.vue";
import InputText from "primevue/inputtext";
import { AuthService } from "@/im_library/services";
import { PasswordStrength } from "@/im_library/enums";
import { SpyInstance, vi } from "vitest";
import PrimeVue from "primevue/config";
import { fireEvent, render, RenderResult } from "@testing-library/vue";

const mockDispatch = vi.fn();
const mockState = { registeredUsername: "" };
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

vi.mock("sweetalert2", () => {
  return {
    default: { fire: vi.fn() }
  };
});

describe("ForgotPasswordSubmit.vue no registeredUser", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();
    // AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });
    component = render(ForgotPasswordSubmit, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, InlineMessage }
      }
    });
  });

  it("starts empty if no store registeredUsername", async () => {
    component.getByTestId("forgot-password-submit-username");
    component.getByTestId("forgot-password-submit-code");
    component.getByTestId("forgot-password-submit-password1");
    component.getByTestId("forgot-password-submit-password2");
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
        components: { Card, Button, InputText, InlineMessage }
      }
    });
  });

  it("starts with username if store has registeredUsername", async () => {
    component.getByDisplayValue("testUser");
  });

  it("can verify a confirmation code __ false", async () => {
    const codeInput = component.getByTestId("forgot-password-submit-code");
    await fireEvent.update(codeInput, "1256");
    component.getByTestId("forgot-password-submit-unverified");
  });

  it("can verify a confirmation code __ true", async () => {
    const codeInput = component.getByTestId("forgot-password-submit-code");
    await fireEvent.update(codeInput, "123456");
    component.getByTestId("forgot-password-submit-verified");
  });

  it("should check password strength __ fail", async () => {
    const passwordInput = component.getByTestId("forgot-password-submit-password1");
    await fireEvent.update(passwordInput, "12345678");
    component.getByDisplayValue("12345678");
    component.getByText("Password Strength: Weak");
  });

  it("should check password strength __ medium", async () => {
    const passwordInput = component.getByTestId("forgot-password-submit-password1");
    await fireEvent.update(passwordInput, "1234abcd");
    component.getByDisplayValue("1234abcd");
    component.getByText("Password Strength: Medium");
  });

  it("should check password strength __ strong", async () => {
    const passwordInput = component.getByTestId("forgot-password-submit-password1");
    await fireEvent.update(passwordInput, "1234ABc%");
    component.getByDisplayValue("1234ABc%");
    component.getByText("Password Strength: Strong");
  });

  it("should check passwords match __ fail", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-password1");
    await fireEvent.update(passwordInput1, "1234ABc%a");

    const passwordInput2 = component.getByTestId("forgot-password-submit-password2");
    await fireEvent.update(passwordInput2, "1234ABc%b");
    await fireEvent.blur(passwordInput2);

    component.getByDisplayValue("1234ABc%a");
    component.getByDisplayValue("1234ABc%b");
    component.getByText("Passwords do not match!");
  });

  it("calls swal on auth success", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-password1");
    const passwordInput2 = component.getByTestId("forgot-password-submit-password2");
    const codeInput = component.getByTestId("forgot-password-submit-code");
    const resetButton = component.getByTestId("forgot-password-submit-reset");

    await fireEvent.update(passwordInput1, "1234ABc%a");
    await fireEvent.update(passwordInput2, "1234ABc%a");
    await fireEvent.update(codeInput, "123456");
    await fireEvent.click(resetButton);

    await flushPromises();

    component.getByText("Success");
    component.getByText("Password successfully reset");
  });

  it("reroutes on auth success", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-password1");
    const passwordInput2 = component.getByTestId("forgot-password-submit-password2");
    const codeInput = component.getByTestId("forgot-password-submit-code");
    const resetButton = component.getByTestId("forgot-password-submit-reset");

    await fireEvent.update(passwordInput1, "1234ABc%a");
    await fireEvent.update(passwordInput2, "1234ABc%a");
    await fireEvent.update(codeInput, "123456");
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
        components: { Card, Button, InputText, InlineMessage }
      }
    });
  });

  it("calls swal on auth 403", async () => {
    const passwordInput1 = component.getByTestId("forgot-password-submit-password1");
    const passwordInput2 = component.getByTestId("forgot-password-submit-password2");
    const codeInput = component.getByTestId("forgot-password-submit-code");
    const resetButton = component.getByTestId("forgot-password-submit-reset");

    await fireEvent.update(passwordInput1, "12345678");
    await fireEvent.update(passwordInput2, "12345678");
    await fireEvent.update(codeInput, "123456");
    await fireEvent.click(resetButton);

    await flushPromises();

    component.getByText("Code Expired");
    component.getByText("Password reset code has expired. Please request a new code");
  });

  // it("reroutes on auth 403", async () => {
  //   AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 403, message: "Password reset successful" });
  //   wrapper.vm.newPassword1 = "12345678";
  //   wrapper.vm.newPassword2 = "12345678";
  //   wrapper.vm.code = "123456";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleSubmit();
  //   await wrapper.vm.$nextTick();
  //   await flushPromises();
  //   expect(mockPush).toBeCalledTimes(1);
  //   expect(mockPush).toBeCalledWith({ name: "ForgotPassword" });
  // });

  // it("doesn't reroute on auth 403 swal cancelled", async () => {
  //   AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 403, message: "Password reset successful" });
  //   mockSwal.fire = vi.fn().mockImplementation(() => Promise.resolve({ isConfirmed: false }));
  //   wrapper.vm.newPassword1 = "12345678";
  //   wrapper.vm.newPassword2 = "12345678";
  //   wrapper.vm.code = "123456";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleSubmit();
  //   await wrapper.vm.$nextTick();
  //   await flushPromises();
  //   expect(mockPush).toBeCalledTimes(0);
  // });

  // it("shows error swal on auth error not 403", async () => {
  //   AuthService.forgotPasswordSubmit = vi.fn().mockResolvedValue({ status: 500, message: "Password reset auth failed" });
  //   wrapper.vm.newPassword1 = "12345678";
  //   wrapper.vm.newPassword2 = "12345678";
  //   wrapper.vm.code = "123456";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleSubmit();
  //   await wrapper.vm.$nextTick();
  //   await flushPromises();
  //   expect(mockSwal.fire).toBeCalledTimes(1);
  //   expect(mockSwal.fire).toBeCalledWith({ icon: "error", title: "Error", text: "Password reset auth failed. Check input data." });
  // });
});
