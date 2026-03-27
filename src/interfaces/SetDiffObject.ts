import { Concept } from "vue-library/interfaces";

export interface SetDiffObject {
  membersA: Concept[];
  sharedMembers: Concept[];
  membersB: Concept[];
}
