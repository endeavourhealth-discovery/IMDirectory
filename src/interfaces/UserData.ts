import PrimeVueColors from "@/enums/PrimeVueColors";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import { RecentActivityItem } from "./RecentActivityItem";

export interface UserData {
  preset: PrimeVuePresetThemes | undefined;
  primaryColor: PrimeVueColors | undefined;
  darkMode: boolean;
  scale: string;
  organisations: string[];
  favourites: string[];
  mru: RecentActivityItem[];
}
