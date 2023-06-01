import { User } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const UserService = {
  async getUserTheme(user: string): Promise<string> {
    return await axios.get(Env.API + "api/public/user/" + user + "/theme");
  },
  async getUserMRU(user: string): Promise<any> {
    return await axios.get(Env.API + "api/public/user/" + user + "/MRU");
  },
  async getUserFavourites(user: string): Promise<any> {
    return await axios.get(Env.API + "api/public/user/" + user + "/favourites");
  },
  async updateUserTheme(user: string, theme: string): Promise<string> {
    return await axios.post(Env.API + "api/public/user/" + user + "/theme", {
      themeValue: theme
    });
  },
  async updateUserMRU(user: string, mru: any[]): Promise<any> {
    return await axios.post(Env.API + "api/public/user/" + user + "/MRU", mru);
  },
  async updateUserFavourites(user: string, favourites: any[]): Promise<any> {
    return await axios.post(Env.API + "api/public/user/" + user + "/favourites", favourites);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
