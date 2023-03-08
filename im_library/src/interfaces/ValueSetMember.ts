import { TTIriRef } from "../models/AutoGen";

export interface ValueSetMember {
  entity: TTIriRef;
  code: string;
  scheme: TTIriRef;
  label: string;
  type: string;
  directParent: TTIriRef;
}
