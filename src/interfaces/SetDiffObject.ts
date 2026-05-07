import type { Concept } from "@endeavour/vue-library/interfaces";

export interface SetDiffObject {
  membersA: Concept[];
  sharedMembers: Concept[];
  membersB: Concept[];
}
