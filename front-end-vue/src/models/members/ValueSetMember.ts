import { TTIriRef } from "../TripleTree";

export interface ValueSetMember {
  entity: TTIriRef;
  code: string;
  scheme: TTIriRef;
  label: string;
  type: string;
  directParent: TTIriRef;
}
