import { createTestingPinia } from "@pinia/testing";
import { useUserStore } from "@/stores/userStore";
import { flushPromises } from "@vue/test-utils";
import { afterAll, it, expect, beforeEach, describe } from "vitest";
import { User } from "@/interfaces";
import { uniqueId } from "lodash-es";

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
    expect(userStore.currentUser).toEqual(undefined);
  });
});

describe("getters", () => {
  it("can get isLoggedIn ___ true", async () => {
    const userStore = useUserStore();
    const testUser: User = {
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: [],
      id: uniqueId(),
      mfaStatus: ["TOTP"]
    };
    userStore.getAllFromUserDatabase = vi.fn();
    userStore.updateCurrentUser(testUser);
    await flushPromises();
    expect(userStore.isLoggedIn).toEqual(true);
  });

  it("can get isLoggedIn ___ false", async () => {
    const userStore = useUserStore();
    userStore.getAllFromUserDatabase = vi.fn();
    userStore.updateCurrentUser(undefined);
    await flushPromises();
    expect(userStore.isLoggedIn).toEqual(false);
  });

  it("can get isLoggedIn ___ false", async () => {
    const userStore = useUserStore();
    userStore.getAllFromUserDatabase = vi.fn();
    userStore.updateCurrentUser(undefined);
    await flushPromises();
    expect(userStore.isLoggedIn).toEqual(false);
  });
});

describe("mutations", () => {
  it("can updateCurrentUser", async () => {
    const userStore = useUserStore();

    const testUser: User = {
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: [],
      id: uniqueId(),
      mfaStatus: ["TOTP"]
    };
    userStore.getAllFromUserDatabase = vi.fn();
    userStore.updateCurrentUser(testUser);
    await flushPromises();
    expect(userStore.currentUser).toEqual(testUser);
  });
});
