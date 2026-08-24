import { SearchResultSummarySchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface ExtendedSearchResultSummary extends SearchResultSummary {
//   icon: string[];
//   color: string;
//   typeNames: string;
//   favourite: boolean;
// }

export const ExtendedSearchResultSummarySchema = z.strictObject({
  ...SearchResultSummarySchema.shape,
  icon: z.array(z.string()),
  color: z.string(),
  typeNames: z.string(),
  favourite: z.boolean().optional()
});

export type ExtendedSearchResultSummary = z.output<typeof ExtendedSearchResultSummarySchema>;

export function isExtendedSearchResultSummary(value: unknown): value is ExtendedSearchResultSummary {
  return ExtendedSearchResultSummarySchema.safeParse(value).success;
}
