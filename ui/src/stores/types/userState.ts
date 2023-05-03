import { Namespace, ConceptSummary, RecentActivityItem, HistoryItem, FilterOptions, User } from "@im-library/interfaces";

export interface UserState {
  currentUser: User;
  favourites: string[];
  history: HistoryItem[];
  recentLocalActivity: RecentActivityItem[];
  currentTheme: string;
}
