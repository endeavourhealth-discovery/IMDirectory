import { PrimeVueColors, PrimeVuePresetThemes } from "@endeavour/vue-library/enums";
import { parseApiResponse } from "@endeavour/vue-library/helpers";
import type { RecentActivityItemDto } from "@endeavour/vue-library/models";
import { NamespacePermission, User, UserSchema } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/user/private";

const UserService = {
  async updateUserPreset(preset: PrimeVuePresetThemes): Promise<User> {
    const result = await api.post(API_URL + "/preset", preset, { headers: { "Content-Type": "text/plain" } });
    return parseApiResponse(result, UserSchema);
  },
  async updateUserPrimaryColor(color: PrimeVueColors): Promise<User> {
    const result = await api.post(API_URL + "/primaryColor", color, { headers: { "Content-Type": "text/plain" } });
    return parseApiResponse(result, UserSchema);
  },
  async updateUserSurfaceColor(color: PrimeVueColors): Promise<User> {
    const result = await api.post(API_URL + "/surfaceColor", color, { headers: { "Content-Type": "text/plain" } });
    return parseApiResponse(result, UserSchema);
  },
  async updateUserDarkMode(bool: boolean): Promise<User> {
    const result = await api.post(API_URL + "/darkMode", { bool: bool });
    return parseApiResponse(result, UserSchema);
  },
  async updateUserFontSize(fontSize: string): Promise<User> {
    const result = await api.post(API_URL + "/fontSize", fontSize, { headers: { "Content-Type": "text/plain" } });
    return parseApiResponse(result, UserSchema);
  },
  async updateUserRecentActivity(recentActivity: RecentActivityItemDto[]): Promise<User> {
    const result = await api.post(API_URL + "/recentActivity", recentActivity);
    return parseApiResponse(result, UserSchema);
  },
  async updateUserFavourites(favourites: string[]): Promise<User> {
    const result = await api.post(API_URL + "/favourites", favourites);
    return parseApiResponse(result, UserSchema);
  },
  async updateUserOrganisations(organisations: string[]): Promise<User> {
    const result = await api.post(API_URL + "/organisations", organisations);
    return parseApiResponse(result, UserSchema);
  },
  async updateUserNamespaces(namespaces: NamespacePermission[]): Promise<User> {
    const result = await api.post(API_URL + "/namespaces", namespaces);
    return parseApiResponse(result, UserSchema);
  },

  async updateEmailVerified(verified: boolean): Promise<void> {
    return await api.post(Env.API + "api/cognito/updateEmailVerified", { value: verified });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
