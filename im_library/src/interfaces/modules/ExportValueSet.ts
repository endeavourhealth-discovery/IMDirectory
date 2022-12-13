import { TTIriRef } from "./TTIriRef.js";
import { ValueSetMember } from "./ValueSetMember.js";

export interface ExportValueSet {
  valueSet: TTIriRef;
  limited: boolean;
  members: Array<ValueSetMember>;
}
