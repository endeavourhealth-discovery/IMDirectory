import { Namespace, ConceptSummary, RecentActivityItem, HistoryItem, FilterOptions, User } from "@im-library/interfaces";

export interface UserState {
  cookiesEssentialAccepted: boolean;
  cookiesOptionalAccepted: boolean;
  currentTheme: string;
  currentUser: User;
  awsUser: any;
  favourites: string[];
  history: HistoryItem[];
  recentLocalActivity: RecentActivityItem[];
  snomedLicenseAccepted: boolean;
}
