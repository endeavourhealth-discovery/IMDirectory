import { RecentActivityItem } from "@endeavour/vue-library/models";

export interface ExtendedRecentActivityItem extends RecentActivityItem {
  name: string;
  type: string;
  color: string;
  icon: string[];
}
