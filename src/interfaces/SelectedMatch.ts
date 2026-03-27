import { Match } from "vue-library/interfaces";

export interface SelectedMatch {
  selected: Match;
  parent?: Match;
  parentList?: Match[];
  index: number;
}
