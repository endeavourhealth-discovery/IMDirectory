import axios from "axios";
import Env from "./Env";
import { UserRole } from "@/interfaces/AutoGen";
import { User } from "@/interfaces";

const API_URL = Env.API + "api/casdoor";

const CasdoorService = {
  async getLoginUrl(redirectUrl?: string): Promise<string> {
    if (!redirectUrl) redirectUrl = Env.DIRECTORY_URL + "callback";
    return await axios.get(API_URL + "/public/loginUrl", { params: { redirectUrl: redirectUrl } });
  },

  async getRegisterUrl(redirectUrl?: string): Promise<string> {
    if (!redirectUrl) redirectUrl = Env.DIRECTORY_URL + "callback";
    return await axios.get(API_URL + "/public/registerUrl", { params: { redirectUrl: redirectUrl } });
  },

  async login(code: string, state: string, redirectUrl?: string) {
    await axios.get(API_URL + "/public/login", { params: { code: code, state: state, redirectUrl: redirectUrl ? redirectUrl : Env.DIRECTORY_URL } });
  },

  async logout() {
    await axios.get(API_URL + "/public/logout");
  },

  async getUser(raw?: boolean): Promise<User> {
    return await axios.get(API_URL + "/user", { raw: raw });
  },

  async getProfileUrl(): Promise<string> {
    return await axios.get(API_URL + "/user/profileUrl");
  },

  async adminGetUsersByGroup(group: UserRole): Promise<User[]> {
    return await axios.get(API_URL + "/getUsersInGroup", { params: { group: group } });
  },

  async adminGetGroups(): Promise<UserRole[]> {
    return await axios.get(API_URL + "/getGroups");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CasdoorService);

export default CasdoorService;
