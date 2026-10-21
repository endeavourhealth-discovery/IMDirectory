import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, showError, login, userStore } = vi.hoisted(() => ({
  push: vi.fn(),
  showError: vi.fn(),
  login: vi.fn(),
  userStore: { isLoggedIn: true, includeUserGraph: false }
}));

vi.mock("@/router", () => ({ default: { push, currentRoute: { value: { path: "/" } } } }));
vi.mock("@/services/toast", () => ({ showError }));
vi.mock("@/services/AuthService", () => ({ default: { login, getAccessToken: vi.fn() } }));
vi.mock("@endeavour/vue-library", async importOriginal => ({ ...(await importOriginal<object>()), useUserStore: () => userStore }));

import api from "@/services/api";

/** Runs an error through the response interceptor the way axios would. */
async function respondWith(error: object) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (api.interceptors.response as any).handlers[0].rejected;
  return await handler(error);
}

const error = (status: number, extra: object = {}) => ({ response: { status, data: {} }, config: { url: "https://im/api/entity/protected/partial" }, ...extra });

describe("api error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userStore.isLoggedIn = true;
  });

  it.each([401, 403])("a %i for a signed-in user says which resource is off limits and shows access denied", async status => {
    await respondWith(error(status));
    expect(showError).toHaveBeenCalledWith("Access denied", expect.stringContaining("Insufficient clearance to access partial."));
    expect(push).toHaveBeenCalledWith({ name: "AccessDenied" });
  });

  it("a 403 for someone not signed in asks them to sign in", async () => {
    userStore.isLoggedIn = false;
    await respondWith(error(403, { response: { status: 403 } }));
    expect(showError).toHaveBeenCalledWith("Access denied", "Login required for partial.");
    expect(login).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("a server error goes to the offline page", async () => {
    await respondWith({ code: "ERR_BAD_RESPONSE", response: { status: 500, data: {} } });
    expect(push).toHaveBeenCalledWith({ name: "ServerOffline" });
  });

  it("a cancelled request resolves quietly", async () => {
    expect(await respondWith({ code: "ERR_CANCELED" })).toBeUndefined();
    expect(showError).not.toHaveBeenCalled();
  });
});
