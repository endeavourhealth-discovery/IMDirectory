import type { Match } from "@endeavour/vue-library/models";

export interface SelectedMatch {
  selected: Match;
  parent?: Match;
  parentList?: Match[];
  index: number;
}
