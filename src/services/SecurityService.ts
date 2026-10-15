import { UserRole } from "@endeavour/vue-library/enums";
import { parseApiResponse, parseArray } from "@endeavour/vue-library/helpers";
import { User, UserSchema } from "@endeavour/vue-library/models";

import z from "zod";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/security";

const SecurityService = {
  async adminGetUsersByGroup(group: UserRole): Promise<User[]> {
    const result = await api.get(API_URL + "/private/getUsersInGroup", { params: { group: group } });
    return parseApiResponse(result, z.array(UserSchema));
  },
  async adminGetGroups(): Promise<UserRole[]> {
    return await api.get(API_URL + "/private/getGroups");
  },

  async getUser(raw?: boolean): Promise<User> {
    const user = await api.get(API_URL + "/private/user", { raw: raw });
    const result = user.data ? user.data : user;
    return parseApiResponse(result, UserSchema);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SecurityService);

export default SecurityService;
