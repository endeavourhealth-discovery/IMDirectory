vi.resetModules();

import Card from "primevue/card";
import Button from "primevue/button";
import ConfirmCode from "@/components/auth/ConfirmCode.vue";
import InputText from "primevue/inputtext";
import InputOtp from "primevue/inputotp";
import Dialog from "primevue/dialog";
import { AuthService } from "@/services";
import { vi } from "vitest";
import { fireEvent, render, RenderResult } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { createTestingPinia } from "@pinia/testing";

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
    const codeInput = component.getAllByTestId("otp-input");
    if (code[0]) await fireEvent.update(codeInput[0], code[0]);
    if (code[1]) await fireEvent.update(codeInput[1], code[1]);
    if (code[2]) await fireEvent.update(codeInput[2], code[2]);
    if (code[3]) await fireEvent.update(codeInput[3], code[3]);
    if (code[4]) await fireEvent.update(codeInput[4], code[4]);
    if (code[5]) await fireEvent.update(codeInput[5], code[5]);
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
        components: { Card, Button, InputText, Dialog, InputOtp }
      }
    });
  });

  it("renders the component", async () => {
    await component.findByTestId("confirm-code-input");
    await component.findByTestId("confirm-code-username-input");
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
