import UserEdit from "@/components/auth/UserEdit.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import Popover from "primevue/popover";
import AvatarWithSelector from "@/components/auth/AvatarWithSelector.vue";
import { AuthService } from "@/services";
import { setupServer } from "msw/node";
import PrimeVue from "primevue/config";
import { afterAll, beforeAll, vi } from "vitest";
import { render, RenderResult } from "@testing-library/vue";
import { RequestHandler } from "msw";
import { User } from "@im-library/interfaces";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";
import { useUserStore } from "@/stores/userStore";
import TieredMenu from "primevue/tieredmenu";

createTestingPinia({
  initialState: {
    auth: { registeredUsername: "" }
  }
});
const mockUserState = useUserStore();

const mockPush = vi.fn();
const mockGo = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  })
}));

let testUser: User;

describe("userEdit.vue ___ user", () => {
  let component: RenderResult;

  const restHandlers = [] as RequestHandler[];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    testUser = {
      id: "9gkej864-l39k-9u87-4lau-w7777b3m5g09",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: [],
      mfaStatus: []
    };

    AuthService.changePassword = vi.fn().mockResolvedValue({ status: 200, message: "Password change successful" });

    AuthService.updateUser = vi.fn().mockResolvedValue({ status: 200, message: "User Update successful", user: testUser });

    mockUserState.currentUser = testUser;

    component = render(UserEdit, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, Message, SelectButton, Popover, AvatarWithSelector, TieredMenu },
        stubs: { "router-link": true }
      }
    });
  });

  it("should render details from current user to form values", async () => {
    // const usernameInput = component.getByTestId("user-edit-username");
    // const emal1Input = component.getByTestId("user-edit-email1");
    // const emal2Input = component.getByTestId("user-edit-email2");
    // const firstnameInput = component.getByTestId("user-edit-firstname");
    // const lastnameInput = component.getByTestId("user-edit-lastname");
    // const avatarSelector = component.getByTestId("register-avatar-select");

    component.getByDisplayValue("testUser");
    // component.getByDisplayValue("john.doe@ergosoft.co.uk");
    component.getByDisplayValue("John");
    component.getByDisplayValue("Doe");
  });

  // it("transfers currentUser details into editable variables", () => {
  //   expect(wrapper.vm.username).toBe(wrapper.vm.currentUser.username);
  //   expect(wrapper.vm.firstName).toBe(wrapper.vm.currentUser.firstName);
  //   expect(wrapper.vm.lastName).toBe(wrapper.vm.currentUser.lastName);
  //   expect(wrapper.vm.email1).toBe(wrapper.vm.currentUser.email);
  //   expect(wrapper.vm.email2).toBe(wrapper.vm.currentUser.email);
  // });

  // it("should start with all checks true and notices false", () => {
  //   expect(wrapper.vm.email1Verified).toBe(true);
  //   expect(wrapper.vm.emailsMatch).toBe(true);
  //   expect(wrapper.vm.firstNameVerified).toBe(true);
  //   expect(wrapper.vm.lastNameVerified).toBe(true);
  // });

  // it("should change showPasswordEdit when password edit button is clicked", () => {
  //   expect(wrapper.vm.showPasswordEdit).toBe(false);
  //   const passwordButton = wrapper.find(".password-edit");
  //   passwordButton.trigger("click");
  //   wrapper.vm.$nextTick();
  //   expect(wrapper.vm.showPasswordEdit).toBe(true);
  // });

  // it("should fail emailVerified with incorrect email format", async () => {
  //   wrapper.vm.email1 = "johndoe.co.uk";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.email1).toBe("johndoe.co.uk");
  //   expect(wrapper.vm.email1Verified).toBe(false);
  // });

  // it("should pass emailVerified with correct email format", async () => {
  //   expect(wrapper.vm.email1).toBe("john.doe@ergosoft.co.uk");
  //   expect(wrapper.vm.email1Verified).toBe(true);
  // });

  // it("should check if emails match __ false", async () => {
  //   wrapper.vm.email2 = "devtest@ergosoft.co.uk";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.email1).toBe("john.doe@ergosoft.co.uk");
  //   expect(wrapper.vm.email2).toBe("devtest@ergosoft.co.uk");
  //   expect(wrapper.vm.emailsMatch).toBe(false);
  // });

  // it("should check if emails match __ true", async () => {
  //   expect(wrapper.vm.email1).toBe("john.doe@ergosoft.co.uk");
  //   expect(wrapper.vm.email2).toBe("john.doe@ergosoft.co.uk");
  //   expect(wrapper.vm.emailsMatch).toBe(true);
  // });

  // it("should check if firstName is valid __ false", async () => {
  //   wrapper.vm.firstName = "John$";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.firstNameVerified).toBe(false);
  // });

  // it("should check if firstName is valid __ true", async () => {
  //   wrapper.vm.firstName = "John";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.firstNameVerified).toBe(true);
  // });

  // it("should check if lastName is valid __ false", async () => {
  //   wrapper.vm.lastName = "D*e";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.lastNameVerified).toBe(false);
  // });

  // it("should check if lastName is valid __ true", async () => {
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.lastNameVerified).toBe(true);
  // });

  // it("should check password strength __ fail", async () => {
  //   wrapper.vm.passwordNew1 = "1234";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordNew1).toBe("1234");
  //   expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.fail);
  // });

  // it("should check password strength __ weak", async () => {
  //   wrapper.vm.passwordNew1 = "12345678";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordNew1).toBe("12345678");
  //   expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.weak);
  // });

  // it("should check password strength __ medium", async () => {
  //   wrapper.vm.passwordNew1 = "1234abcd";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordNew1).toBe("1234abcd");
  //   expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.medium);
  // });

  // it("should check password strength __ strong", async () => {
  //   wrapper.vm.passwordNew1 = "1234ABc%";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordNew1).toBe("1234ABc%");
  //   expect(wrapper.vm.passwordStrength).toBe(PasswordStrength.strong);
  // });

  // it("should check passwords match __ fail", async () => {
  //   wrapper.vm.passwordNew1 = "12345678";
  //   wrapper.vm.passwordNew2 = "12345679";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordNew1).toBe("12345678");
  //   expect(wrapper.vm.passwordNew2).toBe("12345679");
  //   expect(wrapper.vm.passwordsMatch).toBe(false);
  // });

  // it("should check passwords match __ pass", async () => {
  //   wrapper.vm.passwordNew1 = "12345678";
  //   wrapper.vm.passwordNew2 = "12345678";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordNew1).toBe("12345678");
  //   expect(wrapper.vm.passwordNew2).toBe("12345678");
  //   expect(wrapper.vm.passwordsMatch).toBe(true);
  // });

  // it("fetches from authservice if all verified _ no password", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   expect(AuthService.updateUser).toBeCalledTimes(1);
  //   testUser.firstName = "Johnny";
  //   expect(AuthService.updateUser).toBeCalledWith(testUser);
  // });

  // it("fires swal if all verified _ no password", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "success",
  //     title: "Success",
  //     text: "Account details updated successfully."
  //   });
  // });

  // it("updates sharedStore and reroutes if all verified _ no password", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(mockCommit).toBeCalledTimes(1);
  //   expect(mockCommit).toBeCalledWith("updateCurrentUser", testUser);
  //   expect(mockPush).toBeCalledTimes(1);
  //   expect(mockPush).toBeCalledWith({ name: "UserDetails" });
  // });

  // it("fires swal if all verified _ no password __ not 200", async () => {
  //   AuthService.updateUser = vi.fn().mockResolvedValue({ status: 403, message: "User update failed" });
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "error",
  //     title: "Error",
  //     text: "User update failed"
  //   });
  // });

  // it("fires swal if not verified", async () => {
  //   AuthService.updateUser = vi.fn().mockResolvedValue({ status: 403, message: "User update failed" });
  //   testUser.firstName = "Johnny";
  //   wrapper.vm.firstName = "John(y";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "error",
  //     title: "Error",
  //     text: "Error with user form"
  //   });
  // });

  // it("fetches from authservice.updateUser if all verified ___ password edit", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   testUser.firstName = "Johnny";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   expect(AuthService.updateUser).toBeCalledTimes(1);
  //   expect(AuthService.updateUser).toBeCalledWith(testUser);
  // });

  // it("fetches from authservice.changePassword 200 received ___ password edit", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(AuthService.updateUser).toBeCalledTimes(1);
  //   expect(AuthService.changePassword).toBeCalledTimes(1);
  //   expect(AuthService.changePassword).toBeCalledWith("12345678", "87654321");
  // });

  // it("fires swal if password 200 received ___ password edit", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(AuthService.changePassword).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "success",
  //     title: "Success",
  //     text: "User details and password successfully updated."
  //   });
  // });

  // it("updates sharedStore and reroutes if password 200 received ___ password edit", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(mockCommit).toBeCalledTimes(1);
  //   expect(mockCommit).toBeCalledWith("updateCurrentUser", testUser);
  //   expect(mockPush).toBeCalledTimes(1);
  //   expect(mockPush).toBeCalledWith({ name: "UserDetails" });
  // });

  // it("fires swal if password !200 received ___ password edit", async () => {
  //   AuthService.changePassword = vi.fn().mockResolvedValue({ status: 403, message: "Password change failed" });
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(AuthService.changePassword).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "error",
  //     title: "Error",
  //     text: "Password update failed, but user details updated successfully. " + "Password change failed"
  //   });
  // });

  // it("fires swal if authservice user !200 received ___ password edit", async () => {
  //   AuthService.updateUser = vi.fn().mockResolvedValue({ status: 403, message: "User update failed" });
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(AuthService.updateUser).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "error",
  //     title: "Error",
  //     text: "User update failed"
  //   });
  // });

  // it("fires swal if password form error ___ password edit", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "8765432";
  //   wrapper.vm.passwordNew2 = "8765432";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "error",
  //     title: "Error",
  //     text: "Authentication failed. Please check your current password."
  //   });
  // });

  // it("fires swal if no changes", async () => {
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(wrapper.vm.$swal.fire).toBeCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toBeCalledWith({
  //     icon: "warning",
  //     title: "Nothing to update",
  //     text: "Your account details have not been updated."
  //   });
  // });

  // it("can check if user fields are verified ___ true", () => {
  //   expect(wrapper.vm.userFieldsVerified).toBeTruthy();
  // });

  // it("can check if user fields are verified ___ false", async () => {
  //   wrapper.vm.email1 = "john.doe.ergosoft.co.uk";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.userFieldsVerified()).toBeFalsy();
  // });

  // it("can check if password fields are verified ___ true", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordFieldsVerified()).toBeTruthy();
  // });

  // it("can check if password different from original ___ true", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordDifferentFromOriginal()).toBeTruthy();
  // });

  // it("can check if password different from original ___ false", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "87654321";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.passwordDifferentFromOriginal()).toBeFalsy();
  // });

  // it("can fire swal on reset form", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   wrapper.vm.firstName = "Bill";
  //   wrapper.vm.lastName = "Williams";
  //   wrapper.vm.email1 = "bill.williams@ergosoft.co.uk";
  //   wrapper.vm.email2 = "bill.williams@ergosoft.co.uk";
  //   wrapper.vm.selectedAvatar = "colour/004-man.png";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.resetForm();
  //   await flushPromises();
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.firstName).toBe("John");
  //   expect(wrapper.vm.lastName).toBe("Doe");
  //   expect(wrapper.vm.email1).toBe("john.doe@ergosoft.co.uk");
  //   expect(wrapper.vm.email2).toBe("john.doe@ergosoft.co.uk");
  //   expect(wrapper.vm.selectedAvatar).toStrictEqual("colour/003-man.png");
  //   expect(wrapper.vm.email1Verified).toBe(true);
  //   expect(wrapper.vm.emailsMatch).toBe(true);
  //   expect(wrapper.vm.firstNameVerified).toBe(true);
  //   expect(wrapper.vm.lastNameVerified).toBe(true);
  //   expect(wrapper.vm.showEmail1Notice).toBe(false);
  //   expect(wrapper.vm.showEmail2Notice).toBe(false);
  //   expect(wrapper.vm.showPassword2Notice).toBe(false);
  //   expect(wrapper.vm.showFirstNameNotice).toBe(false);
  //   expect(wrapper.vm.showLastNameNotice).toBe(false);
  // });

  // it("does nothing on reset form Swal cancelled", async () => {
  //   wrapper.vm.$swal.fire = vi.fn().mockImplementation(() => Promise.resolve({ isConfirmed: false }));
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   wrapper.vm.firstName = "Bill";
  //   wrapper.vm.lastName = "Williams";
  //   wrapper.vm.email1 = "bill.williams@ergosoft.co.uk";
  //   wrapper.vm.email2 = "bill.williams@ergosoft.co.uk";
  //   wrapper.vm.selectedAvatar = "colour/004-man.png";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.resetForm();
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.firstName).toBe("Bill");
  //   expect(wrapper.vm.lastName).toBe("Williams");
  //   expect(wrapper.vm.email1).toBe("bill.williams@ergosoft.co.uk");
  //   expect(wrapper.vm.email2).toBe("bill.williams@ergosoft.co.uk");
  //   expect(wrapper.vm.selectedAvatar).toStrictEqual("colour/004-man.png");
  //   expect(wrapper.vm.email1Verified).toBe(true);
  //   expect(wrapper.vm.emailsMatch).toBe(true);
  //   expect(wrapper.vm.firstNameVerified).toBe(true);
  //   expect(wrapper.vm.lastNameVerified).toBe(true);
  //   expect(wrapper.vm.showEmail1Notice).toBe(false);
  //   expect(wrapper.vm.showEmail2Notice).toBe(false);
  //   expect(wrapper.vm.showPassword2Notice).toBe(false);
  //   expect(wrapper.vm.showFirstNameNotice).toBe(false);
  //   expect(wrapper.vm.showLastNameNotice).toBe(false);
  // });

  // it("can update avatar", async () => {
  //   wrapper.vm.updateAvatar("colour/005-man.png");
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.selectedAvatar).toStrictEqual("colour/005-man.png");
  // });

  // it("can set button disable ___ false __ no password", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.setButtonDisabled()).toBeFalsy();
  // });

  // it("can set button disable ___ false __ password", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "87654321";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.setButtonDisabled()).toBeFalsy();
  // });

  // it("can set button disable ___ true __ password", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "8765432";
  //   wrapper.vm.passwordNew2 = "87654321";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.setButtonDisabled()).toBeTruthy();
  // });

  // it("can set button disable ___ true __ no password", async () => {
  //   wrapper.vm.firstName = "Johnny(";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.setButtonDisabled()).toBeTruthy();
  // });

  // it("can can check for changes ___ true", async () => {
  //   wrapper.vm.firstName = "Johnny";
  //   wrapper.vm.lastName = "Dorian";
  //   wrapper.vm.email = "johnny.dorian@ergosoft.co.uk";
  //   wrapper.vm.selectedAvatar = "colour/005-man.png";
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.checkForChanges()).toBeTruthy();
  // });

  // it("can can check for changes ___ false", async () => {
  //   expect(wrapper.vm.checkForChanges()).toBeFalsy();
  // });

  // it("can handle editPasswordClicked ___ false", () => {
  //   wrapper.vm.editPasswordClicked(false);
  //   expect(wrapper.vm.passwordOld).toBe("");
  //   expect(wrapper.vm.passwordNew1).toBe("");
  //   expect(wrapper.vm.passwordNew2).toBe("");
  // });

  // it("fires swal if password different from original check failed", async () => {
  //   wrapper.vm.showPasswordEdit = true;
  //   wrapper.vm.passwordOld = "12345678";
  //   wrapper.vm.passwordNew1 = "12345678";
  //   wrapper.vm.passwordNew2 = "12345678";
  //   testUser.firstName = "Johnny";
  //   testUser.password = "12345678";
  //   wrapper.vm.firstName = "Johnny";
  //   await wrapper.vm.$nextTick();
  //   wrapper.vm.handleEditSubmit();
  //   await flushPromises();
  //   expect(wrapper.vm.$swal.fire).toHaveBeenCalledTimes(1);
  //   expect(wrapper.vm.$swal.fire).toHaveBeenCalledWith({
  //     icon: "error",
  //     title: "Error",
  //     text: "New password can not be the same as the current password."
  //   });
  // });
});
