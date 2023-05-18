import { User } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const UserService = {
  async getUserTheme(user: string): Promise<string> {
    return await axios.get(Env.VITE_NODE_API + "node_api/user/public/getUserTheme", {
      params: {
        user: user
      }
    });
  },

  async getUserMRU(user: string): Promise<any> {
    return await axios.get(Env.VITE_NODE_API + "node_api/user/public/getUserMRU", {
      params: {
        user: user
      }
    });
  },
  async updateUserTheme(user: string, theme: string): Promise<string> {
    console.log("a");
    return await axios.post(Env.VITE_NODE_API + "node_api/user/public/updateUserTheme", {
      user: user,
      theme: theme
    });
  },

  async updateUserMRU(user: string, mru: any): Promise<any> {
    return await axios.post(Env.VITE_NODE_API + "node_api/user/public/updateUserMRU");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
