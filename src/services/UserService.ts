import { PrimeVueColors, PrimeVuePresetThemes } from "@endeavour/vue-library/enums";
import type { RecentActivityItemDto } from "@endeavour/vue-library/models";
import { NamespacePermission, User } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/user/private";

const UserService = {
  async updateUserPreset(preset: PrimeVuePresetThemes): Promise<User> {
    return await api.post(API_URL + "/preset", preset, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserPrimaryColor(color: PrimeVueColors): Promise<User> {
    return await api.post(API_URL + "/primaryColor", color, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserSurfaceColor(color: PrimeVueColors): Promise<User> {
    return await api.post(API_URL + "/surfaceColor", color, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserDarkMode(bool: boolean): Promise<User> {
    return await api.post(API_URL + "/darkMode", { bool: bool });
  },
  async updateUserFontSize(fontSize: string): Promise<User> {
    return await api.post(API_URL + "/fontSize", fontSize, { headers: { "Content-Type": "text/plain" } });
  },
  async updateUserRecentActivity(recentActivity: RecentActivityItemDto[]): Promise<User> {
    return await api.post(API_URL + "/recentActivity", recentActivity);
  },
  async updateUserFavourites(favourites: string[]): Promise<User> {
    return await api.post(API_URL + "/favourites", favourites);
  },
  async updateUserOrganisations(organisations: string[]): Promise<User> {
    return await api.post(API_URL + "/organisations", organisations);
  },
  async updateUserNamespaces(namespaces: NamespacePermission[]): Promise<User> {
    return await api.post(API_URL + "/namespaces", namespaces);
  },

  async updateEmailVerified(verified: boolean): Promise<void> {
    return await api.post(Env.API + "api/cognito/updateEmailVerified", { value: verified });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
