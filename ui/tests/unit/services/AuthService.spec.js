import { flushPromises } from "@vue/test-utils";
import * as Auth from "aws-amplify/auth";
import { AuthService } from "@/services";
import { describe } from "vitest";
import { vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";

vi.mock("aws-amplify/auth", () => ({
  __esModule: true,
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
  fetchMFAPreference: vi.fn(),
  fetchUserAttributes: vi.fn()
}));

createTestingPinia();

describe("AuthService", () => {
  describe("signOut", () => {
    let signOutSpy;
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 200 with auth success", async () => {
      signOutSpy = vi.spyOn(Auth, "signOut").mockResolvedValue({ code: 200 });
      const result = AuthService.signOut();
      let promiseResult;
      result.then(res => {
        promiseResult = res;
      });
      await flushPromises();
      expect(signOutSpy).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 200, message: "Logged out successfully" });
    });

    it("returns 400 with auth fail", async () => {
      signOutSpy = vi.spyOn(Auth, "signOut").mockRejectedValue({ code: "Logout", name: "testError", message: "Logout error test" });
      const result = AuthService.signOut();
      let promiseResult;
      let err;
      result.then(res => {
        err = res.error;
        promiseResult = res;
      });
      await flushPromises();
      expect(signOutSpy).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 400, message: "Error logging out from auth server", error: err });
    });
  });

  describe("getCurrentAuthenticatedUser", () => {
    let getCurrentUserSpy;
    let fetchAuthSessionSpy;
    let fetchUserAttributesSpy;
    let fetchMFAPreferenceSpy;
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 200 with auth success, user, password empty, with id", async () => {
      const authUser = {
        username: "devtest",
        attributes: {
          "custom:avatar": "colour/002-man.png",
          "custom:forename": "John",
          "custom:surname": "Doe",
          email: "john.doe@ergosoft.co.uk",
          email_verified: true,
          sub: "9gkej864-l39k-9u87-4lau-w7777b3m5g09"
        }
      };
      getCurrentUserSpy = vi.spyOn(Auth, "getCurrentUser").mockResolvedValueOnce({ username: authUser.username, userId: authUser.attributes.sub });
      fetchAuthSessionSpy = vi.spyOn(Auth, "fetchAuthSession").mockResolvedValueOnce({ tokens: { idToken: "testToken" } });
      fetchUserAttributesSpy = vi.spyOn(Auth, "fetchUserAttributes").mockResolvedValueOnce(authUser.attributes);
      fetchMFAPreferenceSpy = vi.spyOn(Auth, "fetchMFAPreference").mockResolvedValueOnce({ preferred: "TOTP" });
      const result = AuthService.getCurrentAuthenticatedUser();
      let promiseResult;
      result.then(res => {
        promiseResult = res;
      });
      await flushPromises();
      const currentUser = {
        id: "9gkej864-l39k-9u87-4lau-w7777b3m5g09",
        username: "devtest",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@ergosoft.co.uk",
        password: "",
        avatar: "colour/002-man.png",
        roles: [],
        mfaStatus: ["TOTP"]
      };

      expect(getCurrentUserSpy).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 200, message: "User authenticated successfully", user: currentUser });
    });

    it("returns 400 with auth fail", async () => {
      const authUser = {
        username: "devtest",
        attributes: {
          "custom:avatar": "colour/002-man.png",
          "custom:forename": "John",
          "custom:surname": "Doe",
          email: "john.doe@ergosoft.co.uk",
          email_verified: true,
          sub: "9gkej864-l39k-9u87-4lau-w7777b3m5g09"
        }
      };
      getCurrentUserSpy = vi.spyOn(Auth, "getCurrentUser").mockResolvedValueOnce(false);
      fetchAuthSessionSpy = vi.spyOn(Auth, "fetchAuthSession").mockResolvedValueOnce({ tokens: { idToken: "testToken" } });
      fetchUserAttributesSpy = vi.spyOn(Auth, "fetchUserAttributes").mockResolvedValueOnce(authUser.attributes);
      fetchMFAPreferenceSpy = vi.spyOn(Auth, "fetchMFAPreference").mockResolvedValueOnce({ preferred: "TOTP" });
      const result = AuthService.getCurrentAuthenticatedUser();
      let promiseResult;
      let err;
      result.then(res => {
        err = res.error;
        promiseResult = res;
      });
      await flushPromises();
      expect(getCurrentUserSpy).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 403, message: "Error authenticating current user", error: err });
    });
  });
});
