import type { TTIriRef } from "vue-library/interfaces";
import { ValueSetMember } from "./ValueSetMember";

export interface ExportValueSet {
  valueSet: TTIriRef;
  limited: boolean;
  members: Array<ValueSetMember>;
}
