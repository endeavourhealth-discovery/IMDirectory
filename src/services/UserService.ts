import { fetchAuthSession } from "aws-amplify/auth";
import Env from "./Env";
import axios from "axios";
import { RecentActivityItem } from "@/interfaces";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import PrimeVueColors from "@/enums/PrimeVueColors";
import { UserData } from "@/interfaces/UserData";
import { Graph } from "@/interfaces/AutoGen";

const API_URL = Env.API + "api/user";

const UserService = {
  async updateUserPreset(preset: PrimeVuePresetThemes): Promise<void> {
    return await axios.post(API_URL + "/preset", preset, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserPrimaryColor(color: PrimeVueColors): Promise<void> {
    return await axios.post(API_URL + "/primaryColor", color, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserSurfaceColor(color: PrimeVueColors): Promise<void> {
    return await axios.post(API_URL + "/surfaceColor", color, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserDarkMode(bool: boolean): Promise<void> {
    return await axios.post(API_URL + "/darkMode", { bool: bool });
  },
  async updateUserFontSize(fontSize: string): Promise<string> {
    return await axios.post(API_URL + "/fontSize", fontSize, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserRecentActivity(recentActivity: RecentActivityItem[]): Promise<void> {
    return await axios.post(API_URL + "/recentActivity", recentActivity);
  },
  async updateUserFavourites(favourites: string[]): Promise<void> {
    return await axios.post(API_URL + "/favourites", favourites);
  },
  async updateUserOrganisations(organisations: string[]): Promise<string[]> {
    return await axios.post(API_URL + "/organisations", organisations);
  },

  async canUserEdit(iri: string): Promise<boolean> {
    return await axios.get(API_URL + "/editAccess", {
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
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
