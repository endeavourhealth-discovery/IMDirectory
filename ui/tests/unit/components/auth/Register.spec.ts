import Register from "@/components/auth/Register.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import InlineMessage from "primevue/inlinemessage";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import OverlayPanel from "primevue/overlaypanel";
import AvatarWithSelector from "@/components/auth/AvatarWithSelector.vue";
import { AuthService } from "@/services";
import { Avatars } from "@im-library/constants";
import { User } from "@im-library/models";
import PrimeVue from "primevue/config";
import { describe, vi, beforeEach, it, expect } from "vitest";
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

describe("register.vue empty", () => {
  let component: RenderResult;
  let testUser;

  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.register = vi.fn().mockResolvedValue({ status: 201, message: "Register successful" });
    AuthService.isEmailRegistered = vi.fn().mockResolvedValue(false);

    testUser = {
      username: "DevTest",
      firstName: "John",
      lastName: "Doe",
      email: "devtest@ergo.co.uk",
      password: "12345678",
      avatar: Avatars[0],
      roles: []
    };
    component = render(Register, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, AvatarWithSelector }
      }
    });
  });

  it("should start with all checks false/fail", () => {
    component.getByTestId("register-username");
    component.getByTestId("register-email1");
    component.getByTestId("register-email2");
    component.getByTestId("register-firstname");
    component.getByTestId("register-password1");
    component.getByTestId("register-password2");
    component.getByTestId("register-submit-disabled");
  });
});

describe("register.vue prefilled", () => {
  let component: RenderResult;
  let testUser: User;

  beforeEach(async () => {
    vi.clearAllMocks();
    AuthService.register = vi.fn().mockResolvedValue({ status: 201, message: "Register successful" });
    AuthService.isEmailRegistered = vi.fn().mockResolvedValue(false);
    testUser = {
      username: "DevTest",
      firstName: "John",
      lastName: "Doe",
      email: "devtest@ergo.co.uk",
      password: "12345678",
      avatar: Avatars[0],
      roles: []
    };
    component = render(Register, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, AvatarWithSelector }
      }
    });
    const usernameInput = component.getByTestId("register-username");
    const emal1Input = component.getByTestId("register-email1");
    const emal2Input = component.getByTestId("register-email2");
    const firstnameInput = component.getByTestId("register-firstname");
    const lastnameInput = component.getByTestId("register-lastname");
    const password1Input = component.getByTestId("register-password1");
    const password2Input = component.getByTestId("register-password2");
    const avatarSelector = component.getByTestId("register-avatar-select");

    await fireEvent.update(usernameInput, "DevTest");
    await fireEvent.update(emal1Input, "devtest@ergo.co.uk");
    await fireEvent.update(emal2Input, "devtest@ergo.co.uk");
    await fireEvent.update(firstnameInput, "John");
    await fireEvent.update(lastnameInput, "Doe");
    await fireEvent.update(password1Input, "12345678");
    await fireEvent.update(password2Input, "12345678");
    await fireEvent.update(avatarSelector, Avatars[0]);
  });

  it("should render data to form", async () => {
    component.getByTestId("register-username");
    component.getByTestId("register-email1");
    component.getByTestId("register-email2");
    component.getByTestId("register-firstname");
    component.getByTestId("register-lastname");
    component.getByTestId("register-password1");
    component.getByTestId("register-password2");
    component.findByDisplayValue("DevTest");
    component.findByDisplayValue("devtest@ergo.co.uk");
    component.findByDisplayValue("devtest@ergo.co.uk");
    component.findByDisplayValue("12345678");
    component.findByDisplayValue("12345678");
    component.findByDisplayValue("John");
    component.findByDisplayValue("Doe");
  });

  it("should fail emailVerified with incorrect email format", async () => {
    const emal1Input = component.getByTestId("register-email1");
    await fireEvent.update(emal1Input, "johndoe.co.uk");
    await fireEvent.blur(emal1Input);

    component.getByTestId("register-email1-unverified");
    expect(component.queryByTestId("register-email1-verified")).to.not.exist;
  });

  it("should pass emailVerified with correct email format", async () => {
    const emal1Input = component.getByTestId("register-email1");
    await fireEvent.update(emal1Input, "devtest@ergo.co.uk");
    await fireEvent.blur(emal1Input);

    component.getByTestId("register-email1-verified");
    expect(component.queryByTestId("register-email1-unverified")).to.not.exist;
  });

  it("should check if emails match __ false", async () => {
    const emal1Input = component.getByTestId("register-email1");
    await fireEvent.update(emal1Input, "johndoe.co.uk");
    await fireEvent.blur(emal1Input);

    const emal2Input = component.getByTestId("register-email2");
    await fireEvent.update(emal2Input, "jdoe.co.uk");
    await fireEvent.blur(emal2Input);

    component.getByText("Email addresses do not match!");
  });

  it("should check if emails match __ true", async () => {
    const emal1Input = component.getByTestId("register-email1");
    await fireEvent.update(emal1Input, "johndoe.co.uk");
    await fireEvent.blur(emal1Input);

    const emal2Input = component.getByTestId("register-email2");
    await fireEvent.update(emal2Input, "johndoe.co.uk");
    await fireEvent.blur(emal2Input);

    expect(component.queryByText("Email addresses do not match!")).to.not.exist;
  });

  //   it("should check if firstName is valid __ false", async () => {
  //     wrapper.vm.firstName = "John$";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.firstNameVerified).toBe(false);
  //   });

  //   it("should check if firstName is valid __ true", async () => {
  //     wrapper.vm.firstName = "John";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.firstNameVerified).toBe(true);
  //   });

  //   it("should check if lastName is valid __ false", async () => {
  //     wrapper.vm.lastName = "D*e";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.lastNameVerified).toBe(false);
  //   });

  //   it("should check if lastName is valid __ true", async () => {
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.lastNameVerified).toBe(true);
  //   });

  //   it("should check password strength __ fail", async () => {
  //     wrapper.vm.password1 = "1234";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.password1).toBe("1234");
  //     expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
  //   });

  //   it("should check password strength __ weak", async () => {
  //     wrapper.vm.password1 = "12345678";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.password1).toBe("12345678");
  //     expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.weak);
  //   });

  //   it("should check password strength __ medium", async () => {
  //     wrapper.vm.password1 = "1234abcd";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.password1).toBe("1234abcd");
  //     expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.medium);
  //   });

  //   it("should check password strength __ strong", async () => {
  //     wrapper.vm.password1 = "1234ABc%";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.password1).toBe("1234ABc%");
  //     expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.strong);
  //   });

  //   it("should check passwords match __ fail", async () => {
  //     wrapper.vm.password2 = "12345679";
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.password1).toBe("12345678");
  //     expect(wrapper.vm.password2).toBe("12345679");
  //     expect(wrapper.vm.passwordsMatch).toBe(false);
  //   });

  //   it("should check passwords match __ pass", async () => {
  //     expect(wrapper.vm.password1).toBe("12345678");
  //     expect(wrapper.vm.password2).toBe("12345678");
  //     expect(wrapper.vm.passwordsMatch).toBe(true);
  //   });

  //   it("should clear form", async () => {
  //     wrapper.vm.clearForm();
  //     await wrapper.vm.$nextTick();
  //     const userNameField = wrapper.find("#fieldUsername");
  //     const userNameInput = userNameField.element;
  //     const emailField = wrapper.find("#fieldEmail1");
  //     const email1Input = emailField.element;
  //     const email2Field = wrapper.find("#fieldEmail2");
  //     const email2Input = email2Field.element;
  //     const firstNameField = wrapper.find("#fieldFirstName");
  //     const firstNameInput = firstNameField.element;
  //     const lastNameField = wrapper.find("#fieldLastName");
  //     const lastNameInput = lastNameField.element;
  //     const password1Field = wrapper.find("#fieldPassword1");
  //     const password1Input = password1Field.element;
  //     const password2Field = wrapper.find("#fieldPassword2");
  //     const password2Input = password2Field.element;
  //     expect(userNameField.exists()).toBe(true);
  //     expect(userNameField.element.id).toBe("fieldUsername");
  //     expect(userNameInput.value).toBe("");
  //     expect(emailField.exists()).toBe(true);
  //     expect(emailField.element.id).toBe("fieldEmail1");
  //     expect(email1Input.value).toBe("");
  //     expect(email2Field.exists()).toBe(true);
  //     expect(email2Field.element.id).toBe("fieldEmail2");
  //     expect(email2Input.value).toBe("");
  //     expect(firstNameField.exists()).toBe(true);
  //     expect(firstNameField.element.id).toBe("fieldFirstName");
  //     expect(firstNameInput.value).toBe("");
  //     expect(lastNameField.exists()).toBe(true);
  //     expect(lastNameField.element.id).toBe("fieldLastName");
  //     expect(lastNameInput.value).toBe("");
  //     expect(password1Field.exists()).toBe(true);
  //     expect(password1Field.element.id).toBe("fieldPassword1");
  //     expect(password1Input.value).toBe("");
  //     expect(password2Field.exists()).toBe(true);
  //     expect(password2Field.element.id).toBe("fieldPassword2");
  //     expect(password2Input.value).toBe("");
  //     expect(wrapper.vm.email1Verified).toBe(false);
  //     expect(wrapper.vm.emailsMatch).toBe(false);
  //     expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
  //     expect(wrapper.vm.passwordsMatch).toBe(false);
  //     expect(wrapper.vm.usernameVerified).toBe(false);
  //   });

  //   it("should verify form ready to submit __ username ___ fail", async () => {
  //     wrapper.vm.username = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ email1 ___ fail", async () => {
  //     wrapper.vm.email1 = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ email2 ___ fail", async () => {
  //     wrapper.vm.email2 = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ firstName ___ fail", async () => {
  //     wrapper.vm.firstName = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ lastname ___ fail", async () => {
  //     wrapper.vm.lastName = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ password1 ___ fail", async () => {
  //     wrapper.vm.password1 = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ password2 ___ fail", async () => {
  //     wrapper.vm.username = "";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ emailVerified ___ fail", async () => {
  //     wrapper.vm.email1 = "devtest.ergo.co.uk";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ emailsMatch ___ fail", async () => {
  //     wrapper.vm.email2 = "devtest@ergo.com";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ passwordStrength ___ fail", async () => {
  //     wrapper.vm.password1 = "1234";
  //     wrapper.vm.password2 = "1234";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ passwordsmatch ___ fail", async () => {
  //     wrapper.vm.password2 = "1234";
  //     await wrapper.vm.$nextTick();
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(false);
  //   });

  //   it("should verify form ready to submit __ pass", async () => {
  //     const allVerifiedResult = wrapper.vm.allVerified();
  //     expect(allVerifiedResult).toBe(true);
  //   });

  //   it("should updateAvatar", async () => {
  //     expect(wrapper.vm.selectedAvatar).toStrictEqual(Avatars[0]);
  //     wrapper.vm.updateAvatar("colour/003-man.png");
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.selectedAvatar).toStrictEqual("colour/003-man.png");
  //   });

  //   it("can check a keycode ___ correct", async () => {
  //     await wrapper.vm.$nextTick();
  //     wrapper.vm.checkKey({ keyCode: 13 });
  //     await wrapper.vm.$nextTick();
  //     expect(AuthService.register).toBeCalledTimes(1);
  //   });

  //   it("can check a keycode ___ incorrect", async () => {
  //     await wrapper.vm.$nextTick();
  //     wrapper.vm.checkKey({ keyCode: 12 });
  //     await wrapper.vm.$nextTick();
  //     expect(AuthService.register).toBeCalledTimes(0);
  //   });

  //   it("hits authservice if all verified", async () => {
  //     await wrapper.vm.$nextTick();
  //     wrapper.vm.handleSubmit();
  //     await wrapper.vm.$nextTick();
  //     expect(AuthService.register).toBeCalledTimes(1);
  //     expect(AuthService.register).toBeCalledWith(testUser);
  //   });

  //   // it("fires swal on auth success", async () => {
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //   //     icon: "success",
  //   //     title: "Success",
  //   //     text: "Register successful",
  //   //     showCancelButton: true,
  //   //     confirmButtonText: "Continue"
  //   //   });
  //   // });

  //   // it("fires emit on auth success", async () => {
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(wrapper.emitted()).toBeTruthy();
  //   //   expect(wrapper.emitted("userCreated")[0]).toStrictEqual([testUser]);
  //   // });

  //   // it("updates store and reroutes on auth success and swal confirmed", async () => {
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(mockCommit).toBeCalledTimes(1);
  //   //   expect(mockCommit).toBeCalledWith("updateRegisteredUsername", "DevTest");
  //   //   expect(mockPush).toBeCalledTimes(1);
  //   //   expect(mockPush).toBeCalledWith({ name: "ConfirmCode" });
  //   // });

  //   // it("clears form on auth success and swal cancelled", async () => {
  //   //   wrapper.vm.$swal.fire = vi.fn().mockImplementation(() => Promise.resolve({ isConfirmed: false }));
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(wrapper.vm.username).toBe("");
  //   // });

  //   // it("fires swal on auth success ___ 409", async () => {
  //   //   AuthService.register = vi.fn().mockResolvedValue({ status: 409, message: "Username taken" });
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //   //     icon: "error",
  //   //     title: "Error",
  //   //     text: "Username already taken. Please pick another username",
  //   //     confirmButtonText: "Close"
  //   //   });
  //   // });

  //   // it("fires swal on auth success ___ other", async () => {
  //   //   AuthService.register = vi.fn().mockResolvedValue({ status: 400, message: "Register failed" });
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //   //     icon: "error",
  //   //     title: "Error",
  //   //     text: "Register failed",
  //   //     confirmButtonText: "Close"
  //   //   });
  //   // });

  //   // it("fires swal on verified fail", async () => {
  //   //   wrapper.vm.password1 = "1234";
  //   //   await wrapper.vm.$nextTick();
  //   //   wrapper.vm.handleSubmit();
  //   //   await wrapper.vm.$nextTick();
  //   //   await flushPromises();
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //   //     icon: "error",
  //   //     title: "Error",
  //   //     text: "User creation failed. Check input data.",
  //   //     confirmButtonText: "Close"
  //   //   });
  //   // });
  // });

  // describe("AuthService fail", () => {
  //   let wrapper;
  //   let testUser;

  //   beforeEach(() => {
  //     vi.clearAllMocks();
  //     AuthService.register = vi.fn().mockRejectedValue({ status: 500, message: "Register test failed" });
  //     console.error = vi.fn();

  //     testUser = new User("DevTest", "John", "Doe", "devtest@ergo.co.uk", "12345678", Avatars[0]);
  //     wrapper = mount(Register, {
  //       global: {
  //         components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, AvatarWithSelector }
  //       }
  //     });
  //     wrapper.vm.username = "DevTest";
  //     wrapper.vm.email1 = "devtest@ergo.co.uk";
  //     wrapper.vm.email2 = "devtest@ergo.co.uk";
  //     wrapper.vm.password1 = "12345678";
  //     wrapper.vm.password2 = "12345678";
  //     wrapper.vm.firstName = "John";
  //     wrapper.vm.lastName = "Doe";
  //     wrapper.vm.selectedAvatar = Avatars[0];
  //   });
  //   it("logs AuthService error to console", async () => {
  //     wrapper.vm.handleSubmit();
  //     await wrapper.vm.$nextTick();
  //     await flushPromises();
  //     expect(console.error).toHaveBeenCalledTimes(1);
  //     expect(console.error).toHaveBeenCalledWith({ status: 500, message: "Register test failed" });
  //   });
});
