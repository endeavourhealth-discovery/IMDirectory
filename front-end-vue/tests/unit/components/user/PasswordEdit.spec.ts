import Card from "primevue/card";
import Button from "primevue/button";
import InlineMessage from "primevue/inlinemessage";
import { flushPromises, mount } from "@vue/test-utils";
import PasswordEdit from "@/components/user/PasswordEdit.vue";
import InputText from "primevue/inputtext";
import { PasswordStrength } from "@/models/user/PasswordStrength";
import { User } from "@/models/user/User";
import { avatars } from "@/models/user/Avatars";
import AuthService from "@/services/AuthService";
import Swal from "sweetalert2";
import { CustomAlert } from "@/models/user/CustomAlert";

describe("PasswordEdit.vue with registeredUser", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  const user = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "", avatars[0]);

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.changePassword = jest.fn().mockResolvedValue({ status: 200, message: "Password change successful" });

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));
    mockStore = {
      state: { currentUser: user, isLoggedIn: true },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(new CustomAlert(200, "logout success"))
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    wrapper = mount(PasswordEdit, {
      global: {
        components: { Card, Button, InputText, InlineMessage },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("renders username from store currentUser", async () => {
    const userNameField = wrapper.find("#username");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("username");
    expect(userNameInput.value).toBe("testUser");
  });

  it("starts with all checks false", () => {
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
    expect(wrapper.vm.passwordsMatch).toBe(false);
    expect(wrapper.vm.showPassword2Message).toBe(false);
  });

  it("should check password strength __ fail", async () => {
    wrapper.vm.passwordNew1 = "1234";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordNew1).toBe("1234");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
  });

  it("should check password strength __ weak", async () => {
    wrapper.vm.passwordNew1 = "12345678";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordNew1).toBe("12345678");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.weak);
  });

  it("should check password strength __ medium", async () => {
    wrapper.vm.passwordNew1 = "1234abcd";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordNew1).toBe("1234abcd");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.medium);
  });

  it("should check password strength __ strong", async () => {
    wrapper.vm.passwordNew1 = "1234ABc%";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordNew1).toBe("1234ABc%");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.strong);
  });

  it("should check passwords match __ fail", async () => {
    wrapper.vm.passwordNew1 = "12345678";
    wrapper.vm.passwordNew2 = "12345679";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordNew1).toBe("12345678");
    expect(wrapper.vm.passwordNew2).toBe("12345679");
    expect(wrapper.vm.passwordsMatch).toBe(false);
  });

  it("should check passwords match __ pass", async () => {
    wrapper.vm.passwordNew1 = "12345678";
    wrapper.vm.passwordNew2 = "12345678";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.passwordNew1).toBe("12345678");
    expect(wrapper.vm.passwordNew2).toBe("12345678");
    expect(wrapper.vm.passwordsMatch).toBe(true);
  });

  it("should setShowPassword2Message ___ true", async () => {
    wrapper.vm.passwordNew1 = "12345678";
    wrapper.vm.passwordNew2 = "12345679";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowPassword2Message();
    expect(wrapper.vm.passwordsMatch).toBeFalsy();
    expect(wrapper.vm.showPassword2Message).toBeTruthy();
  });

  it("should setShowPassword2Message ___ false", async () => {
    wrapper.vm.passwordNew1 = "12345678";
    wrapper.vm.passwordNew2 = "12345678";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowPassword2Message();
    expect(wrapper.vm.passwordsMatch).toBeTruthy();
    expect(wrapper.vm.showPassword2Message).toBeFalsy();
  });

  it("hits authservice if all verified", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleEditSubmit();
    await wrapper.vm.$nextTick();
    expect(AuthService.changePassword).toBeCalledTimes(1);
    expect(AuthService.changePassword).toBeCalledWith("12345678", "87654321");
  });

  it("opens swal if auth success", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleEditSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "success",
      title: "Success",
      text: "Password successfully updated"
    });
  });

  it("redirects after auth success ___ 200", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleEditSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockRouter.push).toBeCalledTimes(1);
    expect(mockRouter.push).toBeCalledWith({ name: "Home" });
  });

  it("opens swal if auth fail ___ not 200", async () => {
    AuthService.changePassword = jest.fn().mockResolvedValue({ status: 403, message: "Password change error" });
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleEditSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "error",
      title: "Error",
      text: "Password change error"
    });
  });

  it("opens swal if password same as original", async () => {
    wrapper.vm.passwordOld = "87654321";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleEditSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "error",
      title: "Error",
      text: "New password can not be the same as the current password."
    });
  });

  it("opens swal on all authenticated error", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654320";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleEditSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "error",
      title: "Error",
      text: "Error updating password. Authentication error or new passwords do not match."
    });
  });

  it("checks if new password differs from old password ___ true", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    expect(wrapper.vm.passwordDifferentFromOriginal()).toBeTruthy();
  });

  it("checks if new password differs from old password ___ false", async () => {
    wrapper.vm.passwordOld = "87654321";
    wrapper.vm.passwordNew1 = "87654321";
    expect(wrapper.vm.passwordDifferentFromOriginal()).toBeFalsy();
  });

  it("returns the correct image url", async () => {
    jest.mock("@/assets/avatars/colour/013-woman.png", () => {
      return "/img/013-woman.7f32b854.png";
    });
    const url = wrapper.vm.getUrl("colour/013-woman.png");
    expect(url).toBe("/img/013-woman.7f32b854.png");
  });

  it("can check a keycode ___ correct", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.checkKey({ keyCode: 13 });
    await wrapper.vm.$nextTick();
    expect(AuthService.changePassword).toBeCalledTimes(1);
  });

  it("can check a keycode ___ incorrect", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    wrapper.vm.checkKey({ keyCode: 12 });
    await wrapper.vm.$nextTick();
    expect(AuthService.changePassword).toBeCalledTimes(0);
  });

  it("can setButtonDisabled ___ true", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654320";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.setButtonDisabled()).toBeTruthy();
  });

  it("can setButtonDisabled ___ false", async () => {
    wrapper.vm.passwordOld = "12345678";
    wrapper.vm.passwordNew1 = "87654321";
    wrapper.vm.passwordNew2 = "87654321";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.setButtonDisabled()).toBeFalsy();
  });
});
