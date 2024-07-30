import PresetThemes from "@/enums/presetThemes";
import { Namespace, RecentActivityItem, HistoryItem, FilterOptions, User } from "@im-library/interfaces";

export interface UserState {
  cookiesEssentialAccepted: boolean;
  cookiesOptionalAccepted: boolean;
  currentPreset: PresetThemes | undefined;
  currentPrimaryColor: string;
  currentSurfaceColor: string;
  darkMode: boolean;
  currentScale: string;
  currentUser: User | undefined;
  favourites: string[];
  history: HistoryItem[];
  recentLocalActivity: RecentActivityItem[];
  snomedLicenseAccepted: boolean;
  uprnAgreementAccepted: boolean;
  organisations: string[];
}
