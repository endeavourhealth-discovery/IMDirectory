import type { Match } from "@endeavour/vue-library/interfaces";

export interface SelectedMatch {
  selected: Match;
  parent?: Match;
  parentList?: Match[];
  index: number;
}
