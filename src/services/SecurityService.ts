import { UserSchema, parseArray } from "@endeavour/vue-library";
import { UserRole } from "@endeavour/vue-library/enums";
import { User } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/security";

const SecurityService = {
  async getRegisterUrl(redirectUrl?: string): Promise<string> {
    if (!redirectUrl) redirectUrl = Env.DIRECTORY_URL + "callback";
    return await api.get(API_URL + "/public/registerUrl", { params: { redirectUrl: redirectUrl } });
  },

  async getLoginUrl(redirectUrl?: string): Promise<string> {
    if (!redirectUrl) redirectUrl = Env.DIRECTORY_URL + "callback";
    return await api.get(API_URL + "/public/loginUrl", { params: { redirectUrl: redirectUrl } });
  },

  async login(code: string, state: string): Promise<{ user: User; state: string | undefined }> {
    return await api.get(API_URL + "/public/login", { params: { code: code, state: state } });
  },

  async logout() {
    await api.get(API_URL + "/private/logout");
  },
  async adminGetUsersByGroup(group: UserRole): Promise<User[]> {
    const result = await api.get(API_URL + "/private/getUsersInGroup", { params: { group: group } });
    return parseArray(result, UserSchema);
  },
  async adminGetGroups(): Promise<UserRole[]> {
    return await api.get(API_URL + "/private/getGroups");
  },

  async getUser(raw?: boolean): Promise<User> {
    const user = await api.get(API_URL + "/private/user", { raw: raw });
    const result = user.data ? user.data : user;
    return UserSchema.parse(result);
  },

  async getProfileUrl(): Promise<string> {
    return await api.get(API_URL + "/private/user/profileUrl");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SecurityService);

export default SecurityService;
