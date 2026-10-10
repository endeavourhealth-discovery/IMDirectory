import { beforeEach, describe, expect, it, vi } from "vitest";

type AuthServiceModule = typeof import("@/services/AuthService");

const manager = {
  getUser: vi.fn(),
  signinSilent: vi.fn(),
  signinRedirect: vi.fn(),
  signinRedirectCallback: vi.fn(),
  signoutRedirect: vi.fn(),
  removeUser: vi.fn()
};
const oidcClient = { createSigninRequest: vi.fn() };

/** The service builds its UserManager lazily and reads Env once, so each test loads a fresh copy. */
async function loadAuthService(clientId = "client-id"): Promise<AuthServiceModule> {
  vi.resetModules();
  vi.stubEnv("VITE_CASDOOR_CLIENT_ID", clientId);
  vi.doMock("oidc-client-ts", () => ({
    UserManager: vi.fn(function () {
      return manager;
    }),
    OidcClient: vi.fn(function () {
      return oidcClient;
    }),
    WebStorageStateStore: vi.fn(function () {
      return {};
    })
  }));
  return await import("@/services/AuthService");
}

beforeEach(() => {
  vi.resetAllMocks();
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("getAccessToken", () => {
  it("is undefined when nobody is signed in", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.getUser.mockResolvedValue(null);
    expect(await AuthService.getAccessToken()).toBeUndefined();
  });

  it("returns the token of a signed-in user without renewing it", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.getUser.mockResolvedValue({ expired: false, access_token: "valid" });
    expect(await AuthService.getAccessToken()).toBe("valid");
    expect(manager.signinSilent).not.toHaveBeenCalled();
  });

  it("renews an expired token", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.getUser.mockResolvedValue({ expired: true, access_token: "old" });
    manager.signinSilent.mockResolvedValue({ access_token: "renewed" });
    expect(await AuthService.getAccessToken()).toBe("renewed");
  });

  it("shares one renewal between concurrent callers", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.getUser.mockResolvedValue({ expired: true, access_token: "old" });
    manager.signinSilent.mockResolvedValue({ access_token: "renewed" });
    const tokens = await Promise.all([AuthService.getAccessToken(), AuthService.getAccessToken(), AuthService.getAccessToken()]);
    expect(tokens).toEqual(["renewed", "renewed", "renewed"]);
    expect(manager.signinSilent).toHaveBeenCalledTimes(1);
  });

  it("signs the user out locally when renewal fails", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.getUser.mockResolvedValue({ expired: true, access_token: "old" });
    manager.signinSilent.mockRejectedValue(new Error("refresh token expired"));
    expect(await AuthService.getAccessToken()).toBeUndefined();
    expect(manager.removeUser).toHaveBeenCalled();
  });

  it("is undefined, without touching Casdoor, when sign-in is not configured", async () => {
    const { default: AuthService } = await loadAuthService("");
    expect(await AuthService.getAccessToken()).toBeUndefined();
    expect(manager.getUser).not.toHaveBeenCalled();
  });
});

describe("login", () => {
  it("remembers where to come back to", async () => {
    const { default: AuthService } = await loadAuthService();
    await AuthService.login("/directory/folder/xyz");
    expect(manager.signinRedirect).toHaveBeenCalledWith({ state: { returnTo: "/directory/folder/xyz" } });
  });

  it("defaults to the page the user is on", async () => {
    const { default: AuthService } = await loadAuthService();
    window.history.replaceState({}, "", "/#/editor/abc");
    await AuthService.login();
    expect(manager.signinRedirect).toHaveBeenCalledWith({ state: { returnTo: "/editor/abc" } });
  });

  it("refuses to start when the client id is not configured", async () => {
    const { default: AuthService } = await loadAuthService("");
    await expect(AuthService.login()).rejects.toThrow("VITE_CASDOOR_CLIENT_ID");
  });
});

describe("toSignupUrl", () => {
  it("swaps the authorize page for the sign-up page and keeps the request", async () => {
    const { toSignupUrl } = await loadAuthService();
    expect(toSignupUrl("https://auth.example.org/login/oauth/authorize?client_id=c&state=s&code_challenge=x")).toBe(
      "https://auth.example.org/signup/oauth/authorize?client_id=c&state=s&code_challenge=x"
    );
  });
});

describe("completeSigninIfRedirected", () => {
  it("does nothing on an ordinary page load", async () => {
    const { default: AuthService } = await loadAuthService();
    window.history.replaceState({}, "", "/#/directory");
    await AuthService.completeSigninIfRedirected();
    expect(manager.signinRedirectCallback).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("#/directory");
  });

  it("ignores a code that did not come from the sign-in flow (no state)", async () => {
    const { default: AuthService } = await loadAuthService();
    window.history.replaceState({}, "", "/?code=abc#/directory");
    await AuthService.completeSigninIfRedirected();
    expect(manager.signinRedirectCallback).not.toHaveBeenCalled();
  });

  it("finishes the sign-in, drops the code and restores the page the user was on", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.signinRedirectCallback.mockResolvedValue({ state: { returnTo: "/editor/abc" } });
    window.history.replaceState({}, "", "/?code=abc&state=xyz");

    await AuthService.completeSigninIfRedirected();

    expect(window.location.search).toBe("");
    expect(window.location.hash).toBe("#/editor/abc");
    expect(AuthService.consumeSigninError()).toBeUndefined();
  });

  it("records a failure once, so the app can show it instead of looping back to Casdoor", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.signinRedirectCallback.mockRejectedValue(new Error("No matching state found in storage"));
    window.history.replaceState({}, "", "/?error=access_denied&state=xyz#/directory");

    await AuthService.completeSigninIfRedirected();

    expect(window.location.search).toBe("");
    expect(AuthService.consumeSigninError()).toBe("No matching state found in storage");
    expect(AuthService.consumeSigninError()).toBeUndefined();
  });
});

describe("logout", () => {
  it("signs out of Casdoor", async () => {
    const { default: AuthService } = await loadAuthService();
    await AuthService.logout();
    expect(manager.signoutRedirect).toHaveBeenCalled();
  });

  it("falls back to clearing the local session when Casdoor offers no end-session endpoint", async () => {
    const { default: AuthService } = await loadAuthService();
    manager.signoutRedirect.mockRejectedValue(new Error("No end session endpoint"));
    await AuthService.logout();
    expect(manager.removeUser).toHaveBeenCalled();
  });
});

describe("profileUrl", () => {
  it("points at the Casdoor account page", async () => {
    const { default: AuthService } = await loadAuthService();
    expect(AuthService.profileUrl()).toMatch(/\/account$/);
  });
});
