import { AppEnum } from "./AppEnum";

export interface RecentActivityItem {
  iri: string;
  name: string;
  type: string;
  dateTime: Date;
  app: AppEnum;
}
