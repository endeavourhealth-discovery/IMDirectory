import { flushPromises } from "@vue/test-utils";
import * as Auth from "aws-amplify/auth";
import { AuthService } from "@/services";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { faker } from "@faker-js/faker";

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
      signOutSpy = vi.spyOn(Auth, "signOut").mockResolvedValue();
      const result = AuthService.signOut();
      let promiseResult;
      void result.then(res => {
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
      void result.then(res => {
        err = res.error;
        promiseResult = res;
      });
      await flushPromises();
      expect(signOutSpy).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 400, message: "Error logging out from auth server", error: err });
    });
  });

  describe("getCurrentAuthenticatedUser", () => {
    let getCurrentUserSpy = vi.spyOn(Auth, "getCurrentUser").mockRejectedValue(false);
    let fetchAuthSessionSpy = vi.spyOn(Auth, "fetchAuthSession").mockRejectedValue(false);
    let fetchUserAttributesSpy = vi.spyOn(Auth, "fetchUserAttributes").mockRejectedValue(false);
    let fetchMFAPreferenceSpy = vi.spyOn(Auth, "fetchMFAPreference").mockRejectedValue(false);
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 200 with auth success, user, password empty, with id", async () => {
      const uuid = faker.string.uuid();
      const authUser = {
        username: "devtest",
        userId: uuid,
        attributes: {
          "custom:avatar": "colour/002-man.png",
          "custom:forename": "John",
          "custom:surname": "Doe",
          email: "john.doe@ergosoft.co.uk"
        }
      };
      getCurrentUserSpy = vi.spyOn(Auth, "getCurrentUser").mockResolvedValueOnce(authUser);
      fetchAuthSessionSpy = vi.spyOn(Auth, "fetchAuthSession").mockResolvedValueOnce({
        tokens: { idToken: { payload: { iss: faker.internet.jwt() } } as Auth.JWT, accessToken: { payload: { iss: faker.internet.jwt() } } as Auth.JWT }
      });
      fetchUserAttributesSpy = vi.spyOn(Auth, "fetchUserAttributes").mockResolvedValueOnce(authUser.attributes);
      fetchMFAPreferenceSpy = vi.spyOn(Auth, "fetchMFAPreference").mockResolvedValueOnce({ preferred: "TOTP" });
      const result = AuthService.getCurrentAuthenticatedUser();
      let promiseResult;
      void result.then(res => {
        promiseResult = res;
      });
      await flushPromises();
      const currentUser = {
        id: uuid,
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
      expect(fetchAuthSessionSpy).toHaveBeenCalledOnce();
      expect(fetchMFAPreferenceSpy).toHaveBeenCalledOnce();
      expect(fetchUserAttributesSpy).toHaveBeenCalledOnce();
      expect(promiseResult).toStrictEqual({ status: 200, message: "User authenticated successfully", user: currentUser });
    });

    it("returns 400 with auth fail", async () => {
      const authUser = {
        username: "devtest",
        userId: faker.string.uuid(),
        attributes: {
          "custom:avatar": "colour/002-man.png",
          "custom:forename": "John",
          "custom:surname": "Doe",
          email: "john.doe@ergosoft.co.uk"
        }
      };
      getCurrentUserSpy = vi.spyOn(Auth, "getCurrentUser").mockRejectedValueOnce(false);
      fetchAuthSessionSpy = vi.spyOn(Auth, "fetchAuthSession").mockResolvedValueOnce({
        tokens: { idToken: { payload: { iss: faker.internet.jwt() } } as Auth.JWT, accessToken: { payload: { iss: faker.internet.jwt() } } as Auth.JWT }
      });
      fetchUserAttributesSpy = vi.spyOn(Auth, "fetchUserAttributes").mockResolvedValueOnce(authUser.attributes);
      fetchMFAPreferenceSpy = vi.spyOn(Auth, "fetchMFAPreference").mockResolvedValueOnce({ preferred: "TOTP" });
      const result = AuthService.getCurrentAuthenticatedUser();
      let promiseResult;
      let err;
      void result.then(res => {
        err = res.error;
        promiseResult = res;
      });
      await flushPromises();
      expect(getCurrentUserSpy).toHaveBeenCalledTimes(1);
      expect(fetchAuthSessionSpy).not.toHaveBeenCalledOnce();
      expect(fetchMFAPreferenceSpy).not.toHaveBeenCalledOnce();
      expect(fetchUserAttributesSpy).not.toHaveBeenCalledOnce();
      expect(promiseResult).toStrictEqual({ status: 403, message: "Error authenticating current user", error: err });
    });
  });
});
