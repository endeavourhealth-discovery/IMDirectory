import { TTIriRef } from "./AutoGen";

export interface SetDiffObject {
  membersA: TTIriRef[];
  sharedMembers: TTIriRef[];
  membersB: TTIriRef[];
}
