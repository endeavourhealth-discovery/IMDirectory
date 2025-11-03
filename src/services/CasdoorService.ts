import axios from "axios";
import Env from "./Env";
import { UserRole } from "@/interfaces/AutoGen";
import { User } from "@/interfaces";

const API_URL = Env.API + "api/casdoor";

const CasdoorService = {
  async login(code: string, state: string) {
    await axios.get(API_URL + "/public/login", { params: { code: code, state: state } });
  },

  async logout() {
    await axios.get(API_URL + "/logout");
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
