import { flushPromises } from "@vue/test-utils";
import { Auth } from "aws-amplify";
import { AuthService } from "@/services";
import { describe } from "vitest";

describe("AuthService", () => {
  describe("signOut", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 200 with auth success", async () => {
      Auth.signOut = vi.fn().mockResolvedValue({ code: 200 });
      const result = AuthService.signOut();
      let promiseResult;
      result.then(res => {
        promiseResult = res;
      });
      await flushPromises();
      expect(Auth.signOut).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 200, message: "Logged out successfully" });
    });

    it("returns 400 with auth fail", async () => {
      Auth.signOut = vi.fn().mockRejectedValue({ code: "Logout", name: "testError", message: "Logout error test" });
      const result = AuthService.signOut();
      let promiseResult;
      let err;
      result.then(res => {
        err = res.error;
        promiseResult = res;
      });
      await flushPromises();
      expect(Auth.signOut).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 400, message: "Error logging out from auth server", error: err });
    });
  });

  describe("getCurrentAuthenticatedUser", () => {
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
      Auth.currentAuthenticatedUser = vi.fn().mockResolvedValueOnce(authUser);
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
        mfaStatus: []
      };

      expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 200, message: "User authenticated successfully", error: undefined, user: currentUser, userRaw: authUser });
    });

    it("returns 400 with auth fail", async () => {
      Auth.currentAuthenticatedUser = vi.fn().mockRejectedValue({ code: "currentUserFail", message: "get current user error" });
      const result = AuthService.getCurrentAuthenticatedUser();
      let promiseResult;
      let err;
      result.then(res => {
        err = res.error;
        promiseResult = res;
      });
      await flushPromises();
      expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
      expect(promiseResult).toStrictEqual({ status: 403, message: "Error authenticating current user", error: err });
    });
  });
});
