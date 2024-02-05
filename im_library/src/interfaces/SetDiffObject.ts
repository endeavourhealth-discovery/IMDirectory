import { Concept } from "./AutoGen";

export interface SetDiffObject {
  membersA: Concept[];
  sharedMembers: Concept[];
  membersB: Concept[];
}
