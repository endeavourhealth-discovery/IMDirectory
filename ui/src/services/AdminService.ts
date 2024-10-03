import axios from "axios";
import Env from "./Env";
import { User } from "@im-library/interfaces";

const AdminService = {
  async getUsers(): Promise<string[]> {
    return await axios.get(Env.API + "api/admin/cognito/users");
  },

  async getGroups(): Promise<string[]> {
    return await axios.get(Env.API + "api/admin/cognito/groups");
  },

  async getUsersInGroup(group: string): Promise<string[]> {
    return await axios.get(Env.API + "api/admin/cognito/usersInGroup", { params: { group: group } });
  },

  async getUser(username: string): Promise<User> {
    return await axios.get(Env.API + "api/admin/cognito/user", { params: { username: username } });
  },

  async addRoleToUser(username: string, role: string) {
    return await axios.post(Env.API + "api/admin/cognito/addUserToGroup", { username: username, groupName: role });
  },

  async removeRoleFromUser(username: string, role: string) {
    return await axios.post(Env.API + "api/admin/cognito/removeUserFromGroup", { username: username, groupName: role });
  },

  async deleteUser(username: string): Promise<void> {
    return await axios.post(Env.API + "api/admin/cognito/deleteUser", { username: username });
  },

  async createUser(user: User): Promise<User> {
    return await axios.post(Env.API + "api/admin/cognito/createUser", user);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(AdminService);

export default AdminService;
