import { Page, SearchBinding, TTIriRef } from "vue-library/interfaces";
import { FilterOptions } from "./FilterOptions";

export interface SearchOptions extends FilterOptions {
  isA?: TTIriRef[];
  binding?: SearchBinding[];
  page?: Page;
  textSearch?: string;
}
