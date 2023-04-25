import { createTestingPinia } from "@pinia/testing";
import { useUserStore } from "@/stores/userStore";
import { AuthService } from "@/services";
import { flushPromises } from "@vue/test-utils";

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    createTestingPinia({ stubActions: false });
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("userStore should start with the correct values", () => {
    const userStore = useUserStore();
    expect(Object.keys(userStore)).toEqual(expect.arrayContaining(["currentUser"]));
    expect(userStore.currentUser).toEqual({});
  });
});

describe("getters", () => {
  it("can get isLoggedIn ___ true", () => {
    const userStore = useUserStore();
    const testUser = {
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: []
    };
    userStore.updateCurrentUser(testUser);
    expect(userStore.isLoggedIn).toEqual(true);
  });

  it("can get isLoggedIn ___ false", () => {
    const userStore = useUserStore();
    userStore.updateCurrentUser(undefined);
    expect(userStore.isLoggedIn).toEqual(false);
  });

  it("can get isLoggedIn ___ false", () => {
    const userStore = useUserStore();
    userStore.updateCurrentUser({});
    expect(userStore.isLoggedIn).toEqual(false);
  });
});

describe("mutations", () => {
  it("can updateCurrentUser", () => {
    const userStore = useUserStore();

    const testUser = {
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: []
    };
    userStore.updateCurrentUser(testUser);
    expect(userStore.currentUser).toEqual(testUser);
  });
});

describe("actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    createTestingPinia({ stubActions: false });
  });

  it("can logoutCurrentUser ___ 200", async () => {
    const userStore = useUserStore();

    AuthService.signOut = vi.fn().mockResolvedValue({ status: 200, message: "logout successful" });
    let result = {};
    await userStore.logoutCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(userStore.currentUser).toBe(null);
    expect(userStore.isLoggedIn).toBe(false);
    expect(result).toEqual({ status: 200, message: "logout successful" });
  });

  it("can logoutCurrentUser ___ 400", async () => {
    const userStore = useUserStore();
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 400, message: "logout failed 400" });
    let result = {};
    await userStore.logoutCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(result).toEqual({ status: 400, message: "logout failed 400" });
  });

  it("can authenticateCurrentUser___ 200 ___ avatar", async () => {
    const userStore = useUserStore();
    let testUser = {
      id: "8901-test",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: []
    };
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 200, message: "user authenticated", error: undefined, user: testUser });
    let result = { authenticated: false };
    await userStore.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(userStore.isLoggedIn).toBe(true);
    expect(userStore.currentUser).toEqual(testUser);
    expect(result.authenticated).toBe(true);
  });

  it("can authenticateCurrentUser___ 200 ___ no avatar", async () => {
    const userStore = useUserStore();

    let testUser = {
      id: "8901-test",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "http://testimage.jpg",
      roles: []
    };

    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 200, message: "user authenticated", error: undefined, user: testUser });
    let result = { authenticated: false };
    await userStore.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(userStore.isLoggedIn).toBe(true);
    testUser.avatar = "colour/001-man.png";
    expect(userStore.currentUser).toEqual(testUser);
    expect(result.authenticated).toBe(true);
  });

  it("can authenticateCurrentUser___ 403 ___ logout 200", async () => {
    const userStore = useUserStore();

    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 403, message: "user authenticated" });
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 200, message: "logout successful" });
    let result = { authenticated: false };
    await userStore.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(userStore.isLoggedIn).toBe(false);
    expect(userStore.currentUser).toBe(null);
    expect(result.authenticated).toBe(false);
  });

  it("can authenticateCurrentUser___ 403 ___ logout 400", async () => {
    const userStore = useUserStore();
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 403, message: "user authenticated" });
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 400, message: "logout failed" });
    let result = { authenticated: false };
    await userStore.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(userStore.isLoggedIn).toBe(false);
    expect(userStore.currentUser).toStrictEqual({});
    expect(result.authenticated).toBe(false);
  });
});
