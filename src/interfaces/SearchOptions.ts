import type { FilterOptions, Page, SearchBinding, TTIriRef } from "vue-library/interfaces";

export interface SearchOptions extends FilterOptions {
  isA?: TTIriRef[];
  binding?: SearchBinding[];
  page?: Page;
  textSearch?: string;
}
