import { flushPromises } from "@vue/test-utils";
import { Auth } from "aws-amplify";
import AuthService from "@/services/AuthService";
import { Models } from "im-library";
const { User, CustomAlert } = Models;

const testUser = new User("devtest", "John", "Doe", "john.doe@ergosoft.co.uk", "12345678", "colour/002-man.png");

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
    expect(promiseResult).toStrictEqual(new CustomAlert(200, "Logged out successfully"));
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
    expect(promiseResult).toStrictEqual(new CustomAlert(400, "Error logging out from auth server", err));
  });
});

describe("getCurrentAuthenticatedUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with auth success, user, password empty, with id", async () => {
    Auth.currentAuthenticatedUser = vi.fn().mockResolvedValueOnce({
      username: "devtest",
      attributes: {
        "custom:avatar": "colour/002-man.png",
        "custom:forename": "John",
        "custom:surname": "Doe",
        email: "john.doe@ergosoft.co.uk",
        email_verified: true,
        sub: "9gkej864-l39k-9u87-4lau-w7777b3m5g09"
      }
    });
    const result = AuthService.getCurrentAuthenticatedUser();
    let promiseResult;
    result.then(res => {
      promiseResult = res;
    });
    await flushPromises();
    const currentUser = new User("devtest", "John", "Doe", "john.doe@ergosoft.co.uk", "", "colour/002-man.png");
    currentUser.setId("9gkej864-l39k-9u87-4lau-w7777b3m5g09");
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(promiseResult).toStrictEqual(new CustomAlert(200, "User authenticated successfully", undefined, currentUser));
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
    expect(promiseResult).toStrictEqual(new CustomAlert(403, "Error authenticating current user", err));
  });
});
