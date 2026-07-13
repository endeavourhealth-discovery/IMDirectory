import type { FilterOptions, Page, SearchBinding, TTIriRef } from "@endeavour/vue-library/models";

export interface SearchOptions extends FilterOptions {
  isA?: TTIriRef[];
  binding?: SearchBinding[];
  page?: Page;
  textSearch?: string;
}
