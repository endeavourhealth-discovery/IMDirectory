import { Namespace, RecentActivityItem, HistoryItem, FilterOptions, User } from "@im-library/interfaces";

export interface UserState {
  cookiesEssentialAccepted: boolean;
  cookiesOptionalAccepted: boolean;
  currentTheme: string;
  currentScale: string;
  currentUser: User;
  awsUser: any;
  favourites: string[];
  history: HistoryItem[];
  recentLocalActivity: RecentActivityItem[];
  snomedLicenseAccepted: boolean;
  uprnAgreementAccepted: boolean;
  organisations: string[];
}
