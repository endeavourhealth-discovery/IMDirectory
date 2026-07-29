import { PrimeVueColors, PrimeVuePresetThemes } from "@endeavour/vue-library/enums";
import type { RecentActivityItemDto } from "@endeavour/vue-library/models";
import { NamespacePermission, User, UserSchema } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/user/private";

const UserService = {
  async updateUserPreset(preset: PrimeVuePresetThemes): Promise<User> {
    const result = await api.post(API_URL + "/preset", preset, { headers: { "Content-Type": "text/plain" } });
    return UserSchema.parse(result);
  },
  async updateUserPrimaryColor(color: PrimeVueColors): Promise<User> {
    const result = await api.post(API_URL + "/primaryColor", color, { headers: { "Content-Type": "text/plain" } });
    return UserSchema.parse(result);
  },
  async updateUserSurfaceColor(color: PrimeVueColors): Promise<User> {
    const result = await api.post(API_URL + "/surfaceColor", color, { headers: { "Content-Type": "text/plain" } });
    return UserSchema.parse(result);
  },
  async updateUserDarkMode(bool: boolean): Promise<User> {
    const result = await api.post(API_URL + "/darkMode", { bool: bool });
    return UserSchema.parse(result);
  },
  async updateUserFontSize(fontSize: string): Promise<User> {
    const result = await api.post(API_URL + "/fontSize", fontSize, { headers: { "Content-Type": "text/plain" } });
    return UserSchema.parse(result);
  },
  async updateUserRecentActivity(recentActivity: RecentActivityItemDto[]): Promise<User> {
    const result = await api.post(API_URL + "/recentActivity", recentActivity);
    return UserSchema.parse(result);
  },
  async updateUserFavourites(favourites: string[]): Promise<User> {
    const result = await api.post(API_URL + "/favourites", favourites);
    return UserSchema.parse(result);
  },
  async updateUserOrganisations(organisations: string[]): Promise<User> {
    const result = await api.post(API_URL + "/organisations", organisations);
    return UserSchema.parse(result);
  },
  async updateUserNamespaces(namespaces: NamespacePermission[]): Promise<User> {
    const result = await api.post(API_URL + "/namespaces", namespaces);
    return UserSchema.parse(result);
  },

  async updateEmailVerified(verified: boolean): Promise<void> {
    return await api.post(Env.API + "api/cognito/updateEmailVerified", { value: verified });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UserService);

export default UserService;
