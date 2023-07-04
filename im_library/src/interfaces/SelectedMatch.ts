import { Match } from "./AutoGen";

export interface SelectedMatch {
  selected: Match;
  parent: Match;
  index: number;
}
