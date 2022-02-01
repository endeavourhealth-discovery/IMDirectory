import Card from "primevue/card";
import Button from "primevue/button";
import InlineMessage from "primevue/inlinemessage";
import { flushPromises, mount } from "@vue/test-utils";
import ForgotPasswordSubmit from "@/components/user/ForgotPasswordSubmit.vue";
import InputText from "primevue/inputtext";
import { PasswordStrength } from "@/models/user/PasswordStrength";
import AuthService from "@/services/AuthService";
import Swal from "sweetalert2";

describe("ForgotPasswordSubmit.vue no registeredUser", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.forgotPasswordSubmit = jest.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));
    mockStore = {
      state: {registeredUsername: null},
      commit: jest.fn()
    }
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    }
    wrapper = mount(ForgotPasswordSubmit, {
      global: {
        components: { Card, Button, InputText, InlineMessage },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("starts empty if no store registeredUsername", async () => {
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("");
  });
});

describe("ForgotPasswordSubmit.vue with registeredUser", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.forgotPasswordSubmit = jest.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));
    mockStore = {
      state: {registeredUsername: "testUser"},
      commit: jest.fn()
    }
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    }
    wrapper = mount(ForgotPasswordSubmit, {
      global: {
        components: { Card, Button, InputText, InlineMessage },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("starts with username if store has registeredUsername", async () => {
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("testUser");
  });

  it("start with all checks false", () => {
    expect(wrapper.vm.codeVerified).toBe(false);
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
    expect(wrapper.vm.passwordsMatch).toBe(false);
    expect(wrapper.vm.showPassword2Notice).toBe(false);
  });

  it("can verify a confirmation code __ false", async () => {
    wrapper.vm.code = "12345";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.codeVerified).toBe(false);
  });

  it("can verify a confirmation code __ true", async () => {
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.codeVerified).toBe(true);
  });

  it("should check password strength __ fail", async () => {
    wrapper.vm.newPassword1 = "1234";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newPassword1).toBe("1234");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
  });

  it("should check password strength __ weak", async () => {
    wrapper.vm.newPassword1 = "12345678";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newPassword1).toBe("12345678");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.weak);
  });

  it("should check password strength __ medium", async () => {
    wrapper.vm.newPassword1 = "1234abcd";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newPassword1).toBe("1234abcd");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.medium);
  });

  it("should check password strength __ strong", async () => {
    wrapper.vm.newPassword1 = "1234ABc%";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newPassword1).toBe("1234ABc%");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.strong);
  });

  it("should check passwords match __ fail", async () => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345679";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newPassword1).toBe("12345678");
    expect(wrapper.vm.newPassword2).toBe("12345679");
    expect(wrapper.vm.passwordsMatch).toBe(false);
  });

  it("should check passwords match __ pass", async () => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newPassword1).toBe("12345678");
    expect(wrapper.vm.newPassword2).toBe("12345678");
    expect(wrapper.vm.passwordsMatch).toBe(true);
  });

  it("can set showpassword2notice ___ true", async() => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345679";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowPassword2Notice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordsMatch).toBeFalsy();
    expect(wrapper.vm.showPassword2Notice).toBeTruthy();
  });

  it("can set showpassword2notice ___ false", async() => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowPassword2Notice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordsMatch).toBeTruthy();
    expect(wrapper.vm.showPassword2Notice).toBeFalsy();
  });

  it("calls authservice if all verified", async () => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    expect(AuthService.forgotPasswordSubmit).toBeCalledTimes(1);
    expect(AuthService.forgotPasswordSubmit).toBeCalledWith("testUser", "123456", "12345678");
  });

  it("does nothing if not all verified", async () => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345689";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    expect(AuthService.forgotPasswordSubmit).toBeCalledTimes(0);
  });

  it("calls swal on auth success", async () => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({ icon: "success", title: "Success", text: "Password successfully reset", confirmButtonText: "Continue" });
  });

  it("reroutes on auth success", async () => {
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockRouter.push).toBeCalledTimes(1);
    expect(mockRouter.push).toBeCalledWith({ name: "Login" });
  });

  it("calls swal on auth 403", async () => {
    AuthService.forgotPasswordSubmit = jest.fn().mockResolvedValue({ status: 403, message: "Password reset successful" });
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({ icon: "error", title: "Code Expired", text: "Password reset code has expired. Please request a new code", showCancelButton: true, confirmButtonText: "Request new code" });
  });

  it("reroutes on auth 403", async () => {
    AuthService.forgotPasswordSubmit = jest.fn().mockResolvedValue({ status: 403, message: "Password reset successful" });
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockRouter.push).toBeCalledTimes(1);
    expect(mockRouter.push).toBeCalledWith({ name: "ForgotPassword" });
  });

  it("doesn't reroute on auth 403 swal cancelled", async () => {
    AuthService.forgotPasswordSubmit = jest.fn().mockResolvedValue({ status: 403, message: "Password reset successful" });
    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: false }));
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockRouter.push).toBeCalledTimes(0);
  });

  it("shows error swal on auth error not 403", async () => {
    AuthService.forgotPasswordSubmit = jest.fn().mockResolvedValue({ status: 500, message: "Password reset auth failed" });
    wrapper.vm.newPassword1 = "12345678";
    wrapper.vm.newPassword2 = "12345678";
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({ icon: "error", title: "Error", text: "Password reset auth failed. Check input data." });
  });
});
