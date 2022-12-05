import Card from "primevue/card";
import Button from "primevue/button";
import InlineMessage from "primevue/inlinemessage";
import { flushPromises, mount } from "@vue/test-utils";
import PasswordEdit from "@/components/auth/PasswordEdit.vue";
import InputText from "primevue/inputtext";
import { AuthService } from "@/services";
import { Avatars } from "im-library/constants";
import { PasswordStrength } from "im-library/enums";
import { User, CustomAlert } from "im-library/models";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import PrimeVue from "primevue/config";

const mockDispatch = vi.fn();
const mockState = { registeredUsername: "" } as any;
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

describe("PasswordEdit.vue with registeredUser", () => {
  let component: RenderResult;
  const user = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "", Avatars[0], []);

  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.changePassword = vi.fn().mockResolvedValue({ status: 200, message: "Password change successful" });
    mockState.currentUser = user;
    mockState.isLoggedIn = true;
    mockDispatch.mockResolvedValue(new CustomAlert(200, "logout success"));
    component = render(PasswordEdit, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, InlineMessage }
      }
    });
  });

  it("renders username from store currentUser", async () => {
    component.getByTestId("password-edit-username");
    component.getByDisplayValue("testUser");
  });

  it("should check password strength __ fail", async () => {
    const passwordInput = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput, "12345678");
    component.getByDisplayValue("12345678");
    component.getByText("Password strength: Weak");
  });

  it("should check password strength __ medium", async () => {
    const passwordInput = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput, "1234abcd");
    component.getByDisplayValue("1234abcd");
    component.getByText("Password strength: Medium");
  });

  it("should check password strength __ strong", async () => {
    const passwordInput = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput, "1234ABc%");
    component.getByDisplayValue("1234ABc%");
    component.getByText("Password strength: Strong");
  });

  it("should check passwords match __ fail", async () => {
    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "1234ABc%a");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "1234ABc%b");
    await fireEvent.blur(passwordInput2);

    component.getByDisplayValue("1234ABc%a");
    component.getByDisplayValue("1234ABc%b");
    component.getByText("New passwords do not match!");
  });

  it("should check passwords match __ pass", async () => {
    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "1234ABc%a");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "1234ABc%a");
    await fireEvent.blur(passwordInput2);

    expect(component.queryByText("New passwords do not match!")).to.not.exist;
  });

  it("opens swal if auth success", async () => {
    const passwordInputOld = component.getByTestId("password-edit-password-old");
    await fireEvent.update(passwordInputOld, "12345678");

    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "87654321");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "87654321");
    await fireEvent.blur(passwordInput2);

    const submit = component.getByTestId("password-edit-submit");

    await fireEvent.click(submit);
    await flushPromises();
    component.getByText("Success");
    component.getByText("Password successfully updated");
  });

  it("opens swal if auth fail ___ not 200", async () => {
    AuthService.changePassword = vi.fn().mockResolvedValue({ status: 403, message: "Password change error" });

    const passwordInputOld = component.getByTestId("password-edit-password-old");
    await fireEvent.update(passwordInputOld, "12345678");

    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "87654321");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "87654321");
    await fireEvent.blur(passwordInput2);

    const submit = component.getByTestId("password-edit-submit");

    await fireEvent.click(submit);
    await flushPromises();
    component.getByText("Error");
    component.getByText("Password change error");
  });

  it("opens swal if password same as original", async () => {
    const passwordInputOld = component.getByTestId("password-edit-password-old");
    await fireEvent.update(passwordInputOld, "87654321");

    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "87654321");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "87654321");
    await fireEvent.blur(passwordInput2);

    const submit = component.getByTestId("password-edit-submit");

    await fireEvent.click(submit);
    await flushPromises();

    component.getByText("Error");
    component.getByText("New password can not be the same as the current password.");
  });

  it("is button disabled ___ true", async () => {
    const passwordInputOld = component.getByTestId("password-edit-password-old");
    await fireEvent.update(passwordInputOld, "12345678");

    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "87654321");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "87654320");
    await fireEvent.blur(passwordInput2);

    await flushPromises();

    expect(component.queryByTestId("password-edit-submit")).to.not.exist;
    component.getByTestId("password-edit-submit-disabled");
  });

  it("is button disabled ___ false", async () => {
    const passwordInputOld = component.getByTestId("password-edit-password-old");
    await fireEvent.update(passwordInputOld, "12345678");

    const passwordInput1 = component.getByTestId("password-edit-password-new1");
    await fireEvent.update(passwordInput1, "87654321");

    const passwordInput2 = component.getByTestId("password-edit-password-new2");
    await fireEvent.update(passwordInput2, "87654321");
    await fireEvent.blur(passwordInput2);

    expect(component.queryByTestId("password-edit-submit-disabled")).to.not.exist;
    component.getByTestId("password-edit-submit");
  });
});
