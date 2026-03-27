import { RecentActivityItem } from "vue-library/models";

export interface ExtendedRecentActivityItem extends RecentActivityItem {
  name: string;
  type: string;
  color: string;
  icon: string[];
}
