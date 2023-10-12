import { User } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const UserService = {
  async getUserTheme(): Promise<string> {
    return await axios.get(Env.API + "api/user/theme");
  },
  async getUserMRU(): Promise<any> {
    return await axios.get(Env.API + "api/user/MRU");
  },
  async getUserFavourites(): Promise<any> {
    return await axios.get(Env.API + "api/user/favourites");
  },
  async getUserOrganisations(): Promise<string[]> {
    return await axios.get(Env.API + "api/user/organisations");
  },
  async updateUserTheme(theme: string): Promise<string> {
    return await axios.post(Env.API + "api/user/theme", {
      themeValue: theme
    });
  },
  async updateUserMRU(mru: any[]): Promise<any> {
    return await axios.post(Env.API + "api/user/MRU", mru);
  },
  async updateUserFavourites(favourites: any[]): Promise<any> {
    return await axios.post(Env.API + "api/user/favourites", favourites);
  },
  async updateUserOrganisations(organisations: string[]): Promise<string[]> {
    return await axios.post(Env.API + "api/user/organisations", organisations);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
