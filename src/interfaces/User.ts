import { FontSize, PrimeVueColors, PrimeVuePresetThemes } from "@/enums";
import { NamespacePermission,UserRole } from "./AutoGen";
import { RecentActivityItem } from "./RecentActivityItem";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatar: string;
  roles: UserRole[];
  theme: PrimeVuePresetThemes;
  primaryColor: PrimeVueColors;
  surfaceColor: PrimeVueColors;
  darkMode: boolean;
  fontSize: FontSize;
  favourites: string[];
  recentActivity: RecentActivityItem[];
  organisations: string[];
  namespaces: NamespacePermission[]
}
