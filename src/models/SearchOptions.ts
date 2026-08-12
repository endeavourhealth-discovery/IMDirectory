import { FilterOptionsSchema, PageSchema, SearchBindingSchema, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface SearchOptions extends FilterOptions {
//   isA?: TTIriRef[];
//   binding?: SearchBinding[];
//   page?: Page;
//   textSearch?: string;
// }

export const SearchOptionsSchema = FilterOptionsSchema.extend({
  isA: z.array(TTIriRefSchema).optional(),
  binding: z.array(SearchBindingSchema).optional(),
  page: PageSchema.optional(),
  textSearch: z.string().optional()
});

export type SearchOptions = z.output<typeof SearchOptionsSchema>;

export function isSearchOptions(value: unknown): value is SearchOptions {
  return SearchOptionsSchema.safeParse(value).success;
}
