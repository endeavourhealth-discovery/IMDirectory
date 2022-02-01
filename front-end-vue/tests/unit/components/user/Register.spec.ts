import { flushPromises, mount } from "@vue/test-utils";
import Register from "@/components/user/Register.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import InlineMessage from "primevue/inlinemessage";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import OverlayPanel from "primevue/overlaypanel";
import AvatarWithSelector from "@/components/user/AvatarWithSelector.vue";
import { PasswordStrength } from "@/models/user/PasswordStrength";
import { avatars } from "@/models/user/Avatars";
import AuthService from "@/services/AuthService";
import Swal from "sweetalert2";
import { User } from "@/models/user/User";

describe("register.vue empty", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let testUser: User;

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.register = jest.fn().mockResolvedValue({ status: 201, message: "Register successful" });

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));

    testUser = new User("DevTest", "John", "Doe", "devtest@ergo.co.uk", "12345678", avatars[0]);
    mockStore = {
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    wrapper = mount(Register, {
      global: {
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, AvatarWithSelector },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("should start with all checks false/fail", () => {
    expect(wrapper.vm.email1Verified).toBe(false);
    expect(wrapper.vm.emailsMatch).toBe(false);
    expect(wrapper.vm.firstNameVerified).toBe(false);
    expect(wrapper.vm.lastNameVerified).toBe(false);
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
    expect(wrapper.vm.passwordsMatch).toBe(false);
    expect(wrapper.vm.showEmail1Notice).toBe(false);
    expect(wrapper.vm.showEmail2Notice).toBe(false);
    expect(wrapper.vm.showPassword2Notice).toBe(false);
    expect(wrapper.vm.showFirstNameNotice).toBe(false);
    expect(wrapper.vm.showLastNameNotice).toBe(false);
  });
});

describe("register.vue prefilled", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let testUser: User;

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.register = jest.fn().mockResolvedValue({ status: 201, message: "Register successful" });

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));

    testUser = new User("DevTest", "John", "Doe", "devtest@ergo.co.uk", "12345678", avatars[0]);
    mockStore = {
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    wrapper = mount(Register, {
      global: {
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, AvatarWithSelector },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
    wrapper.vm.username = "DevTest";
    wrapper.vm.email1 = "devtest@ergo.co.uk";
    wrapper.vm.email2 = "devtest@ergo.co.uk";
    wrapper.vm.password1 = "12345678";
    wrapper.vm.password2 = "12345678";
    wrapper.vm.firstName = "John";
    wrapper.vm.lastName = "Doe";
    wrapper.vm.selectedAvatar = avatars[0];
  });

  it("should render data to form", async () => {
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    const emailField = wrapper.find("#fieldEmail1");
    const email1Input = emailField.element as HTMLInputElement;
    const email2Field = wrapper.find("#fieldEmail2");
    const email2Input = email2Field.element as HTMLInputElement;
    const firstNameField = wrapper.find("#fieldFirstName");
    const firstNameInput = firstNameField.element as HTMLInputElement;
    const lastNameField = wrapper.find("#fieldLastName");
    const lastNameInput = lastNameField.element as HTMLInputElement;
    const password1Field = wrapper.find("#fieldPassword1");
    const password1Input = password1Field.element as HTMLInputElement;
    const password2Field = wrapper.find("#fieldPassword2");
    const password2Input = password2Field.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("DevTest");
    expect(emailField.exists()).toBe(true);
    expect(emailField.element.id).toBe("fieldEmail1");
    expect(email1Input.value).toBe("devtest@ergo.co.uk");
    expect(email2Field.exists()).toBe(true);
    expect(email2Field.element.id).toBe("fieldEmail2");
    expect(email2Input.value).toBe("devtest@ergo.co.uk");
    expect(firstNameField.exists()).toBe(true);
    expect(firstNameField.element.id).toBe("fieldFirstName");
    expect(firstNameInput.value).toBe("John");
    expect(lastNameField.exists()).toBe(true);
    expect(lastNameField.element.id).toBe("fieldLastName");
    expect(lastNameInput.value).toBe("Doe");
    expect(password1Field.exists()).toBe(true);
    expect(password1Field.element.id).toBe("fieldPassword1");
    expect(password1Input.value).toBe("12345678");
    expect(password2Field.exists()).toBe(true);
    expect(password2Field.element.id).toBe("fieldPassword2");
    expect(password2Input.value).toBe("12345678");
  });

  it("should fail emailVerified with incorrect email format", async () => {
    wrapper.vm.email1 = "johndoe.co.uk";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.email1).toBe("johndoe.co.uk");
    expect(wrapper.vm.email1Verified).toBe(false);
  });

  it("should pass emailVerified with correct email format", async () => {
    expect(wrapper.vm.email1).toBe("devtest@ergo.co.uk");
    expect(wrapper.vm.email1Verified).toBe(true);
  });

  it("should check if emails match __ false", async () => {
    wrapper.vm.email2 = "devtest.co.uk";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.email1).toBe("devtest@ergo.co.uk");
    expect(wrapper.vm.email2).toBe("devtest.co.uk");
    expect(wrapper.vm.emailsMatch).toBe(false);
  });

  it("should check if emails match __ true", async () => {
    expect(wrapper.vm.email1).toBe("devtest@ergo.co.uk");
    expect(wrapper.vm.email2).toBe("devtest@ergo.co.uk");
    expect(wrapper.vm.emailsMatch).toBe(true);
  });

  it("should check if firstName is valid __ false", async () => {
    wrapper.vm.firstName = "John$";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.firstNameVerified).toBe(false);
  });

  it("should check if firstName is valid __ true", async () => {
    wrapper.vm.firstName = "John";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.firstNameVerified).toBe(true);
  });

  it("should check if lastName is valid __ false", async () => {
    wrapper.vm.lastName = "D*e";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.lastNameVerified).toBe(false);
  });

  it("should check if lastName is valid __ true", async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.lastNameVerified).toBe(true);
  });

  it("should check password strength __ fail", async () => {
    wrapper.vm.password1 = "1234";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.password1).toBe("1234");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
  });

  it("should check password strength __ weak", async () => {
    wrapper.vm.password1 = "12345678";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.password1).toBe("12345678");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.weak);
  });

  it("should check password strength __ medium", async () => {
    wrapper.vm.password1 = "1234abcd";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.password1).toBe("1234abcd");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.medium);
  });

  it("should check password strength __ strong", async () => {
    wrapper.vm.password1 = "1234ABc%";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.password1).toBe("1234ABc%");
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.strong);
  });

  it("should check passwords match __ fail", async () => {
    wrapper.vm.password2 = "12345679";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.password1).toBe("12345678");
    expect(wrapper.vm.password2).toBe("12345679");
    expect(wrapper.vm.passwordsMatch).toBe(false);
  });

  it("should check passwords match __ pass", async () => {
    expect(wrapper.vm.password1).toBe("12345678");
    expect(wrapper.vm.password2).toBe("12345678");
    expect(wrapper.vm.passwordsMatch).toBe(true);
  });

  it("should clear form", async () => {
    wrapper.vm.clearForm();
    await wrapper.vm.$nextTick();
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    const emailField = wrapper.find("#fieldEmail1");
    const email1Input = emailField.element as HTMLInputElement;
    const email2Field = wrapper.find("#fieldEmail2");
    const email2Input = email2Field.element as HTMLInputElement;
    const firstNameField = wrapper.find("#fieldFirstName");
    const firstNameInput = firstNameField.element as HTMLInputElement;
    const lastNameField = wrapper.find("#fieldLastName");
    const lastNameInput = lastNameField.element as HTMLInputElement;
    const password1Field = wrapper.find("#fieldPassword1");
    const password1Input = password1Field.element as HTMLInputElement;
    const password2Field = wrapper.find("#fieldPassword2");
    const password2Input = password2Field.element as HTMLInputElement;
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("");
    expect(emailField.exists()).toBe(true);
    expect(emailField.element.id).toBe("fieldEmail1");
    expect(email1Input.value).toBe("");
    expect(email2Field.exists()).toBe(true);
    expect(email2Field.element.id).toBe("fieldEmail2");
    expect(email2Input.value).toBe("");
    expect(firstNameField.exists()).toBe(true);
    expect(firstNameField.element.id).toBe("fieldFirstName");
    expect(firstNameInput.value).toBe("");
    expect(lastNameField.exists()).toBe(true);
    expect(lastNameField.element.id).toBe("fieldLastName");
    expect(lastNameInput.value).toBe("");
    expect(password1Field.exists()).toBe(true);
    expect(password1Field.element.id).toBe("fieldPassword1");
    expect(password1Input.value).toBe("");
    expect(password2Field.exists()).toBe(true);
    expect(password2Field.element.id).toBe("fieldPassword2");
    expect(password2Input.value).toBe("");
    expect(wrapper.vm.email1Verified).toBe(false);
    expect(wrapper.vm.emailsMatch).toBe(false);
    expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
    expect(wrapper.vm.passwordsMatch).toBe(false);
    expect(wrapper.vm.showEmail1Notice).toBe(false);
    expect(wrapper.vm.showEmail2Notice).toBe(false);
    expect(wrapper.vm.showPassword2Notice).toBe(false);
    expect(wrapper.vm.showFirstNameNotice).toBe(false);
    expect(wrapper.vm.showLastNameNotice).toBe(false);
    expect(wrapper.vm.usernameVerified).toBe(false);
    expect(wrapper.vm.showUsernameNotice).toBe(false);
  });

  it("should verify form ready to submit __ username ___ fail", async () => {
    wrapper.vm.username = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ email1 ___ fail", async () => {
    wrapper.vm.email1 = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ email2 ___ fail", async () => {
    wrapper.vm.email2 = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ firstName ___ fail", async () => {
    wrapper.vm.firstName = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ lastname ___ fail", async () => {
    wrapper.vm.lastName = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ password1 ___ fail", async () => {
    wrapper.vm.password1 = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ password2 ___ fail", async () => {
    wrapper.vm.username = "";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ emailVerified ___ fail", async () => {
    wrapper.vm.email1 = "devtest.ergo.co.uk";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ emailsMatch ___ fail", async () => {
    wrapper.vm.email2 = "devtest@ergo.com";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ passwordStrength ___ fail", async () => {
    wrapper.vm.password1 = "1234";
    wrapper.vm.password2 = "1234";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ passwordsmatch ___ fail", async () => {
    wrapper.vm.password2 = "1234";
    await wrapper.vm.$nextTick();
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(false);
  });

  it("should verify form ready to submit __ pass", async () => {
    const allVerifiedResult = wrapper.vm.allVerified();
    expect(allVerifiedResult).toBe(true);
  });

  it("should updateAvatar", async () => {
    expect(wrapper.vm.selectedAvatar).toStrictEqual(avatars[0]);
    wrapper.vm.updateAvatar("colour/003-man.png");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedAvatar).toStrictEqual("colour/003-man.png");
  });

  it("can check a keycode ___ correct", async () => {
    await wrapper.vm.$nextTick();
    wrapper.vm.checkKey({ keyCode: 13 });
    await wrapper.vm.$nextTick();
    expect(AuthService.register).toBeCalledTimes(1);
  });

  it("can check a keycode ___ incorrect", async () => {
    await wrapper.vm.$nextTick();
    wrapper.vm.checkKey({ keyCode: 12 });
    await wrapper.vm.$nextTick();
    expect(AuthService.register).toBeCalledTimes(0);
  });

  it("hits authservice if all verified", async () => {
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    expect(AuthService.register).toBeCalledTimes(1);
    expect(AuthService.register).toBeCalledWith(testUser);
  });

  it("fires swal on auth success", async () => {
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "success",
      title: "Success",
      text: "Register successful",
      showCancelButton: true,
      confirmButtonText: "Continue"
    });
  });

  it("fires emit on auth success", async () => {
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.emitted()).toBeTruthy();
    expect(wrapper.emitted("userCreated")[0]).toStrictEqual([testUser]);
  });

  it("updates store and reroutes on auth success and swal confirmed", async () => {
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockStore.commit).toBeCalledTimes(1);
    expect(mockStore.commit).toBeCalledWith("updateRegisteredUsername", "DevTest");
    expect(mockRouter.push).toBeCalledTimes(1);
    expect(mockRouter.push).toBeCalledWith({ name: "ConfirmCode" });
  });

  it("clears form on auth success and swal cancelled", async () => {
    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: false }));
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.vm.username).toBe("");
  });

  it("fires swal on auth success ___ 409", async () => {
    AuthService.register = jest.fn().mockResolvedValue({ status: 409, message: "Username taken" });
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "error",
      title: "Error",
      text: "Username already taken. Please pick another username",
      confirmButtonText: "Close"
    });
  });

  it("fires swal on auth success ___ other", async () => {
    AuthService.register = jest.fn().mockResolvedValue({ status: 400, message: "Register failed" });
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "error",
      title: "Error",
      text: "Register failed",
      confirmButtonText: "Close"
    });
  });

  it("fires swal on verified fail", async () => {
    wrapper.vm.password1 = "1234";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({
      icon: "error",
      title: "Error",
      text: "User creation failed. Check input data.",
      confirmButtonText: "Close"
    });
  });

  it("can setShowUsernameNotice ___ false", async () => {
    wrapper.vm.setShowUsernameNotice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showUsernameNotice).toBe(false);
  });

  it("can setShowUsernameNotice ___ true", async () => {
    wrapper.vm.username = "Big Bob";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowUsernameNotice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showUsernameNotice).toBe(true);
  });

  it("can setShowEmail1Notice ___ false", async () => {
    wrapper.vm.setShowEmail1Notice(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showEmail1Notice).toBe(false);
  });

  it("can setShowEmail1Notice ___ true", async () => {
    wrapper.vm.setShowEmail1Notice(true);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showEmail1Notice).toBe(true);
  });

  it("can setShowEmail2Notice ___ false", async () => {
    wrapper.vm.setShowEmail2Notice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showEmail2Notice).toBe(false);
  });

  it("can setShowEmail2Notice ___ true", async () => {
    wrapper.vm.email2 = "test@ergo.co.uk";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowEmail2Notice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showEmail2Notice).toBe(true);
  });

  it("can setShowPassword2Notice ___ false", async () => {
    wrapper.vm.setShowPassword2Notice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showPassword2Notice).toBe(false);
  });

  it("can setShowPassword2Notice ___ true", async () => {
    wrapper.vm.password2 = "abcdefghi";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowPassword2Notice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showPassword2Notice).toBe(true);
  });

  it("can setShowFirstNameNotice ___ false", async () => {
    wrapper.vm.setShowFirstNameNotice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showFirstNameNotice).toBe(false);
  });

  it("can setShowFirstNameNotice ___ true", async () => {
    wrapper.vm.firstName = "$%B0b";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowFirstNameNotice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showFirstNameNotice).toBe(true);
  });

  it("can setShowLastNameNotice ___ false", async () => {
    wrapper.vm.setShowLastNameNotice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showLastNameNotice).toBe(false);
  });

  it("can setShowLastNameNotice ___ true", async () => {
    wrapper.vm.lastName = "$%B0b";
    await wrapper.vm.$nextTick();
    wrapper.vm.setShowLastNameNotice();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showLastNameNotice).toBe(true);
  });
});

describe("AuthService fail", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let testUser: User;

  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.register = jest.fn().mockRejectedValue({ status: 500, message: "Register test failed" });
    console.error = jest.fn();

    Swal.fire = jest.fn().mockImplementation(() => Promise.resolve({ isConfirmed: true }));

    testUser = new User("DevTest", "John", "Doe", "devtest@ergo.co.uk", "12345678", avatars[0]);
    mockStore = {
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    };
    wrapper = mount(Register, {
      global: {
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, AvatarWithSelector },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
    wrapper.vm.username = "DevTest";
    wrapper.vm.email1 = "devtest@ergo.co.uk";
    wrapper.vm.email2 = "devtest@ergo.co.uk";
    wrapper.vm.password1 = "12345678";
    wrapper.vm.password2 = "12345678";
    wrapper.vm.firstName = "John";
    wrapper.vm.lastName = "Doe";
    wrapper.vm.selectedAvatar = avatars[0];
  });
  it("logs AuthService error to console", async () => {
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith({ status: 500, message: "Register test failed" });
  });
});
