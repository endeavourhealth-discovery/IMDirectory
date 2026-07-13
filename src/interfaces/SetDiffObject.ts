import type { Concept } from "@endeavour/vue-library/models";

export interface SetDiffObject {
  membersA: Concept[];
  sharedMembers: Concept[];
  membersB: Concept[];
}
