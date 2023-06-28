vi.resetModules();

import Card from "primevue/card";
import Button from "primevue/button";
import ConfirmCode from "@/components/auth/ConfirmCode.vue";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { AuthService } from "@/services";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { createTestingPinia } from "@pinia/testing";

window.scrollTo = vi.fn() as any;

createTestingPinia({
  initialState: {
    auth: { registeredUsername: "testUser" }
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

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

function mockResponse(method: string, response: any) {
  const authService = AuthService as any;
  authService[method] = vi.fn().mockResolvedValue(response);
}

function mockError(method: string) {
  const authService = AuthService as any;
  authService[method] = vi.fn().mockImplementation(() => {
    console.log("an error was thrown by AuthService");
    throw new Error();
  });
}

async function setUsernameAndOptCode(component: RenderResult, username: string, code?: string) {
  const usernameInput = await component.findByTestId("confirm-code-username-input");
  await fireEvent.update(usernameInput, username);
  if (code) {
    const codeInput = await component.findByTestId("confirm-code-input");
    await fireEvent.update(codeInput, code);
  }
}

describe("ConfirmCode.vue with registeredUser", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.clearAllMocks();

    mockResponse("confirmRegister", { status: 200, message: "Register confirmation successful" });
    mockResponse("resendConfirmationCode", { status: 200, message: "Resend confirmation code successful" });

    component = render(ConfirmCode, {
      global: {
        plugins: [PrimeVue],
        components: { Card, Button, InputText, Dialog }
      }
    });
  });

  it("renders the component", async () => {
    await component.findByTestId("confirm-code-input");
    await component.findByTestId("confirm-code-username-input");
  });

  it("validates username and code before sending request __ input is invalid", async () => {
    const handleSubmit = await component.findByTestId("confirm-code-submit-button");
    await fireEvent.click(handleSubmit);
    await component.findByText("Invalid Credentials");
    await component.findByText("Username or Confirmation Code incorrect.");
    const newButtons = await component.findAllByRole("button");
    await fireEvent.click(newButtons[0]);
  });

  it("fails registration confirmation with wrong username", async () => {
    mockResponse("confirmRegister", { status: 400, message: "Failed register confirmation" });
    await setUsernameAndOptCode(component, "wrongUser", "123456");
    const handleSubmit = await component.findByTestId("confirm-code-submit-button");
    await fireEvent.click(handleSubmit);
    await component.findByText("Error");
    await component.findByText("Failed register confirmation");
    const newButtons = await component.findAllByRole("button");
    await fireEvent.click(newButtons[0]);
  });

  it("fails registration confirmation with wrong code", async () => {
    mockResponse("confirmRegister", { status: 400, message: "Failed register confirmation" });
    await setUsernameAndOptCode(component, "testUser", "654321");
    const handleSubmit = await component.findByTestId("confirm-code-submit-button");
    await fireEvent.click(handleSubmit);
    await component.findByText("Error");
    await component.findByText("Failed register confirmation");
    const newButtons = await component.findAllByRole("button");
    await fireEvent.click(newButtons[0]);
  });

  it("closes dialog when trying to resend a request code confirmation with invalid credentials", async () => {
    const notReceivedButton = await component.findByTestId("confirm-code-not-received-button");
    await fireEvent.click(notReceivedButton);
    const resendButton = await component.findByTestId("confirm-code-resend-code-button");
    await fireEvent.click(resendButton);
    expect(await component.queryByTestId("confirm-code-resend-code-button")).to.be.null;
  });

  it("resends a request code confirmation with correct credentials", async () => {
    await setUsernameAndOptCode(component, "testUser");
    const notReceivedButton = await component.findByTestId("confirm-code-not-received-button");
    await fireEvent.click(notReceivedButton);
    const resendButton = await component.findByTestId("confirm-code-resend-code-button");
    await fireEvent.click(resendButton);
  });

  it("confirms registration successfully registration confirmation with correct credentials", async () => {
    const username = await component.findByTestId("confirm-code-username-input");
    await fireEvent.update(username, "testUser");
    const code = await component.findByTestId("confirm-code-input");
    await fireEvent.update(code, "123456");
    const handleSubmit = await component.findByTestId("confirm-code-submit-button");
    await fireEvent.click(handleSubmit);
    await component.findByText("Success");
  });
});
