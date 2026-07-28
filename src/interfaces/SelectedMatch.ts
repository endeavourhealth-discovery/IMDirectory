import type { Query } from "@endeavour/vue-library/models";

export interface SelectedMatch {
  selected: Query;
  parent?: Query;
  parentList?: Query[];
  index: number;
}
