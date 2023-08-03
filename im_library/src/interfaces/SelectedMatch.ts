import { Match } from "./AutoGen";

export interface SelectedMatch {
  selected: Match;
  parent?: Match;
  memberOfList?: Match[];
  index: number;
}
