import { Page, SearchBinding, TTIriRef } from "./AutoGen";
import { FilterOptions } from "./FilterOptions";

export interface SearchOptions extends FilterOptions {
  isA?: TTIriRef[];
  binding?: SearchBinding[];
  page?: Page;
  textSearch?: string;
}
