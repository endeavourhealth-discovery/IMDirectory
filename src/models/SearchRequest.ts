import z from "zod";

import { Filter, FilterSchema } from "./Filter";
import { OrderBy, OrderBySchema } from "./OrderBy";
import { SearchBinding, SearchBindingSchema } from "./SearchBinding";

// export interface SearchRequest {
//   termFilter?: string;
//   index?: string;
//   statusFilter?: string[];
//   typeFilter?: string[];
//   schemeFilter?: string[];
//   bindingFilter?: SearchBinding[];
//   markIfDescendentOf?: string[];
//   isA?: string[];
//   memberOf?: string[];
//   page?: number;
//   size?: number;
//   from?: number;
//   select?: string[];
//   orderBy?: OrderBy[];
//   filter?: Filter[];
//   timings?: { [index: string]: string }[];
// }

export const SearchRequestSchema = z.strictObject({
  termFilter: z.string().optional(),
  index: z.string().optional(),
  statusFilter: z.array(z.string()).optional(),
  typeFilter: z.array(z.string()).optional(),
  schemeFilter: z.array(z.string()).optional(),
  bindingFilter: z.array(SearchBindingSchema).optional(),
  markIfDescendantOf: z.array(z.string()).optional(),
  isA: z.array(z.string()).optional(),
  memberOf: z.array(z.string()).optional(),
  page: z.number().default(1),
  size: z.number().default(20),
  from: z.number().optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.array(OrderBySchema).optional(),
  filter: z.array(FilterSchema).optional(),
  timings: z.array(z.record(z.number(), z.string())).optional()
});

export type SearchRequest = z.output<typeof SearchRequestSchema>;

export function isSearchRequest(value: unknown): value is SearchRequest {
  return SearchRequestSchema.safeParse(value).success;
}
