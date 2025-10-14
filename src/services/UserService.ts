import { fetchAuthSession } from "aws-amplify/auth";
import Env from "./Env";
import axios from "axios";
import { RecentActivityItem } from "@/interfaces";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import PrimeVueColors from "@/enums/PrimeVueColors";
import { UserData } from "@/interfaces/UserData";
import { Graph } from "@/interfaces/AutoGen";

const UserService = {
  async getUserData(): Promise<UserData> {
    return await axios.get(Env.API + "api/user/data");
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
  async getUserPreset(): Promise<PrimeVuePresetThemes> {
    return await axios.get(Env.API + "api/user/preset");
  },
  async getUserPrimaryColor(): Promise<PrimeVueColors> {
    return await axios.get(Env.API + "api/user/primaryColor");
  },
  async getUserSurfaceColor(): Promise<PrimeVueColors> {
    return await axios.get(Env.API + "api/user/surfaceColor");
  },
  async getUserDarkMode(): Promise<boolean> {
    return await axios.get(Env.API + "api/user/darkMode");
  },
  async updateUserPreset(preset: PrimeVuePresetThemes): Promise<void> {
    return await axios.post(Env.API + "api/user/preset", preset, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserPrimaryColor(color: PrimeVueColors): Promise<void> {
    return await axios.post(Env.API + "api/user/primaryColor", color, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserSurfaceColor(color: PrimeVueColors): Promise<void> {
    return await axios.post(Env.API + "api/user/surfaceColor", color, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserDarkMode(bool: boolean): Promise<void> {
    return await axios.post(Env.API + "api/user/darkMode", { bool: bool });
  },
  async updateUserScale(scale: string): Promise<string> {
    return await axios.post(Env.API + "api/user/scale", scale, { headers: { "Content-Type": "text/plain" } });
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
        Authorization: "Bearer " + (await fetchAuthSession()).tokens?.idToken?.toString()
      }
    });
  },

  async updateEmailVerified(verified: boolean): Promise<void> {
    return await axios.post(Env.API + "api/cognito/updateEmailVerified", { value: verified });
  },

  async getUserGraphs(): Promise<Graph[]> {
    return await axios.get(Env.API + "api/user/graphs");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
