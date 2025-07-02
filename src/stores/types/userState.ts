import PrimeVueColors from "@/enums/PrimeVueColors";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import { RecentActivityItem, HistoryItem, User } from "@/interfaces";

export interface UserState {
  cookiesEssentialAccepted: boolean;
  cookiesOptionalAccepted: boolean;
  currentPreset: PrimeVuePresetThemes | undefined;
  currentPrimaryColor: PrimeVueColors | undefined;
  currentSurfaceColor: PrimeVueColors | undefined;
  darkMode: boolean;
  currentScale: string;
  currentUser: User | undefined;
  favourites: string[];
  history: HistoryItem[];
  recentLocalActivity: RecentActivityItem[];
  snomedLicenseAccepted: boolean;
  uprnAgreementAccepted: boolean;
  organisations: string[];
  includeUserGraph: boolean;
}
