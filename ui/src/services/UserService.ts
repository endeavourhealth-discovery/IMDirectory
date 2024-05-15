import { Auth } from "aws-amplify";
import Env from "./Env";
import axios from "axios";
import { RecentActivityItem } from "@im-library/interfaces";

const UserService = {
  async getUserTheme(): Promise<string> {
    return await axios.get(Env.API + "api/user/theme");
  },
  async getUserScale(): Promise<string> {
    return await axios.get(Env.API + "api/user/scale");
  },
  async getUserMRU(): Promise<RecentActivityItem[]> {
    return await axios.get(Env.API + "api/user/MRU");
  },
  async getUserFavourites(): Promise<string[]> {
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
  async updateUserScale(scale: string): Promise<string> {
    return await axios.post(Env.API + "api/user/scale", {
      scaleValue: scale
    });
  },
  async updateUserMRU(mru: RecentActivityItem[]): Promise<void> {
    return await axios.post(Env.API + "api/user/MRU", mru);
  },
  async updateUserFavourites(favourites: string[]): Promise<void> {
    return await axios.post(Env.API + "api/user/favourites", favourites);
  },
  async updateUserOrganisations(organisations: string[]): Promise<string[]> {
    return await axios.post(Env.API + "api/user/organisations", organisations);
  },

  async canUserEdit(iri: string): Promise<boolean> {
    return await axios.get(Env.API + "api/user/editAccess", {
      params: {
        iri: iri
      },
      headers: {
        Authorization: "Bearer " + (await Auth.currentSession()).getIdToken().getJwtToken()
      }
    });
  },

  async updateEmailVerified(verified: boolean): Promise<void> {
    return await axios.post(Env.VITE_NODE_API + "node_api/cognito/updateEmailVerified", { verified: verified });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
