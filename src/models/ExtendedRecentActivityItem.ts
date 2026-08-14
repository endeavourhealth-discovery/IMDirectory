import { RecentActivityItem, RecentActivityItemSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface ExtendedRecentActivityItem extends RecentActivityItem {
//   name: string;
//   type: string;
//   color: string;
//   icon: string[];
// }

export const ExtendedRecentActivityItemSchema = RecentActivityItemSchema.extend({
  name: z.string(),
  type: z.string(),
  color: z.string(),
  icon: z.array(z.string())
});

export type ExtendedRecentActivityItem = z.output<typeof ExtendedRecentActivityItemSchema>;

export function isExtendedRecentActivityItem(value: unknown): value is ExtendedRecentActivityItem {
  return ExtendedRecentActivityItemSchema.safeParse(value).success;
}
