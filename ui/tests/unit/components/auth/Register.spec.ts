import Register from "@/components/auth/Register.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import InlineMessage from "primevue/inlinemessage";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import OverlayPanel from "primevue/overlaypanel";
import Checkbox from "primevue/checkbox";
import { AuthService } from "@/services";
import { Avatars } from "@im-library/constants";
import PrimeVue from "primevue/config";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises } from "@vue/test-utils";
import waitForExpect from "wait-for-expect";

createTestingPinia({
  initialState: {
    auth: { registeredUsername: "" }
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

describe("register.vue empty", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.register = vi.fn().mockResolvedValue({ status: 201, message: "Register successful" });
    AuthService.isEmailRegistered = vi.fn().mockResolvedValue(false);

    component = render(Register, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, Checkbox },
        stubs: { "router-link": true }
      }
    });
  });

  it("should start with all checks false/fail", () => {
    component.getByTestId("register-username");
    component.getByTestId("register-email1");
    component.getByTestId("register-email2");
    component.getByTestId("register-firstname");
    component.getByTestId("register-password-new1");
    component.getByTestId("register-password-new2");
    expect(component.getByTestId("register-submit").isDisabled);
  });
});

describe("register.vue prefilled", () => {
  let component: RenderResult;

  beforeEach(async () => {
    vi.clearAllMocks();
    AuthService.register = vi.fn().mockResolvedValue({ status: 201, message: "Register successful" });
    AuthService.isEmailRegistered = vi.fn().mockResolvedValue(false);

    component = render(Register, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, InlineMessage, SelectButton, OverlayPanel, Checkbox },
        stubs: { "router-link": true }
      }
    });
    const usernameInput = component.getByTestId("register-username");
    const email1Input = component.getByTestId("register-email1");
    const email2Input = component.getByTestId("register-email2");
    const firstnameInput = component.getByTestId("register-firstname");
    const lastnameInput = component.getByTestId("register-lastname");
    const password1Input = component.getByTestId("register-password-new1");
    const password2Input = component.getByTestId("register-password-new2");
    const avatarSelector = component.getByTestId("register-avatar-select");

    await fireEvent.update(usernameInput, "DevTest");
    await fireEvent.update(email1Input, "devtest@ergo.co.uk");
    await fireEvent.update(email2Input, "devtest@ergo.co.uk");
    await fireEvent.update(firstnameInput, "John");
    await fireEvent.update(lastnameInput, "Doe");
    await fireEvent.update(password1Input, "12345678aA!");
    await fireEvent.update(password2Input, "12345678aA!");
    await fireEvent.update(avatarSelector, Avatars[0]);
  });

  it("should render data to form", async () => {
    component.getByTestId("register-username");
    component.getByTestId("register-email1");
    component.getByTestId("register-email2");
    component.getByTestId("register-firstname");
    component.getByTestId("register-lastname");
    component.getByTestId("register-password-new1");
    component.getByTestId("register-password-new2");
    component.findByDisplayValue("DevTest");
    component.findByDisplayValue("devtest@ergo.co.uk");
    component.findByDisplayValue("devtest@ergo.co.uk");
    component.findByDisplayValue("12345678aA!");
    component.findByDisplayValue("12345678aA!");
    component.findByDisplayValue("John");
    component.findByDisplayValue("Doe");
  });

  it("should pass emailVerified with correct email format", async () => {
    const email1Input = component.getByTestId("register-email1");
    await fireEvent.update(email1Input, "devtest@ergo.co.uk");
    await fireEvent.blur(email1Input);

    component.getByTestId("register-email1-verified");
    expect(component.queryByTestId("register-email1-unverified")).to.not.exist;
  });

  it.only("should check if emails match __ false", async () => {
    const email1Input = component.getByTestId("register-email1");
    await fireEvent.update(email1Input, "johndoe@jd.co.uk");
    await fireEvent.blur(email1Input);

    const email2Input = component.getByTestId("register-email2");
    await fireEvent.update(email2Input, "jdoe@jd.co.uk");
    await fireEvent.blur(email2Input);

    await flushPromises();
    component.findByDisplayValue("Email addresses do not match");
  });

  it("should check if emails match __ true", async () => {
    const email1Input = component.getByTestId("register-email1");
    await fireEvent.update(email1Input, "johndoe.co.uk");
    await fireEvent.blur(email1Input);

    const email2Input = component.getByTestId("register-email2");
    await fireEvent.update(email2Input, "johndoe.co.uk");
    await fireEvent.blur(email2Input);

    expect(component.queryByText("Email addresses do not match")).to.not.exist;
  });
});
