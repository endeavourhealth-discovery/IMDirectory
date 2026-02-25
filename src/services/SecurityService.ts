import axios from "axios";
import Env from "./Env";
import { UserRole } from "@/interfaces/AutoGen";
import { User } from "@/interfaces";

const API_URL = Env.API + "api/security";

const SecurityService = {
  async getRegisterUrl(redirectUrl?: string): Promise<string> {
    if (!redirectUrl) redirectUrl = Env.DIRECTORY_URL + "callback";
    return await axios.get(API_URL + "/public/registerUrl", { params: { redirectUrl: redirectUrl } });
  },

  async getLoginUrl(redirectUrl?: string): Promise<string> {
    if (!redirectUrl) redirectUrl = Env.DIRECTORY_URL + "callback";
    return await axios.get(API_URL + "/public/loginUrl", { params: { redirectUrl: redirectUrl } });
  },

  async login(code: string, state: string): Promise<{ user: User; state: string | undefined }> {
    return await axios.get(API_URL + "/public/login", { params: { code: code, state: state } });
  },

  async logout() {
    await axios.get(API_URL + "/private/logout");
  },
  async adminGetUsersByGroup(group: UserRole): Promise<User[]> {
    return await axios.get(API_URL + "/private/getUsersInGroup", { params: { group: group } });
  },
  async adminGetGroups(): Promise<UserRole[]> {
    return await axios.get(API_URL + "/private/getGroups");
  },

  async getUser(raw?: boolean): Promise<User> {
    return await axios.get(API_URL + "/private/user", { raw: raw });
  },

  async getProfileUrl(): Promise<string> {
    return await axios.get(API_URL + "/private/user/profileUrl");
  },

};

if (process.env.NODE_ENV !== "test") Object.freeze(SecurityService);

export default SecurityService;
