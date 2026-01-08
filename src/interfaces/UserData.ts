import PrimeVueColors from "@/enums/PrimeVueColors";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import { RecentActivityItem } from "./RecentActivityItem";
import { FontSize } from "@/enums";

export interface UserData {
  preset: PrimeVuePresetThemes | undefined;
  primaryColor: PrimeVueColors | undefined;
  darkMode: boolean;
  fontSize: FontSize;
  organisations: string[];
  favourites: string[];
  mru: RecentActivityItem[];
}
