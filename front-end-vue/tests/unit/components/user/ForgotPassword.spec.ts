import Card from "primevue/card";
import Button from "primevue/button";
import { mount, flushPromises } from "@vue/test-utils";
import ForgotPassword from "@/components/user/ForgotPassword.vue";
import InputText from "primevue/inputtext";
import Swal from "sweetalert2";
import AuthService from "@/services/AuthService";

describe("ForgotPassword.vue", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.forgotPassword = jest.fn().mockResolvedValue({ status: 200, message: "Password reset successful" });

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));
    mockStore = {
      state: {registeredUsername: "testUser"},
      commit: jest.fn()
    }
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    }
    wrapper = mount(ForgotPassword, {
      global: {
        components: { Card, Button, InputText },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
    wrapper.vm.username = "testUser";
  });

  it("updates username on user entry", async () => {
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("testUser");
  });

  it("fires swal before auth service call", async() => {
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({ icon: "warning", title: "Warning", text: "Reset password for account: testUser", showCancelButton: true, confirmButtonColor: "#3085d6", confirmButtonText: "Reset Password" });
  });

  it("calls auth service forgotPassword", async() => {
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(AuthService.forgotPassword).toBeCalledTimes(1);
    expect(AuthService.forgotPassword).toBeCalledWith("testUser");
  });

  it("does nothing on swal cancel", async() => {
    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: false }));
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(AuthService.forgotPassword).toBeCalledTimes(0);
  });

  it("calls swal after successful auth service forgotPassword call", async() => {
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(2);
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "success", title: "Success", text: "Password has been reset for account: testUser. An email has been sent with a recovery code." });
  });

  it("updates store and reroutes after successful auth service forgotPassword call", async() => {
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockStore.commit).toBeCalledTimes(1);
    expect(mockStore.commit).toBeCalledWith("updateRegisteredUsername", "testUser");
    expect(mockRouter.push).toBeCalledTimes(1);
    expect(mockRouter.push).toBeCalledWith({ name: "ForgotPasswordSubmit" });
  });

  it("calls swal after unsuccessful auth service forgotPassword call", async() => {
    AuthService.forgotPassword = jest.fn().mockResolvedValue({ status: 400, message: "Password reset failed" });
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(2);
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "error", title: "Error", text: "Password reset failed. Check username is correct." });
  });
});
