import axios from "axios";
import Env from "./Env";
import { AccessRequest, UserRole } from "@/interfaces/AutoGen";
import { User } from "@/interfaces";
import { useCookies } from "@vueuse/integrations";

const API_URL = Env.API + "api/casdoor";

const cookies = useCookies();

const CasdoorService = {
  async login(code: string, state: string) {
    await axios.get(API_URL + "/public/login", { params: { code: code, state: state } });
  },

  async logout() {
    await axios.get(API_URL + "/logout");
  },

  async getUser() {
    await axios.get(API_URL + "/user");
    return cookies.get("casdoorUser");
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
