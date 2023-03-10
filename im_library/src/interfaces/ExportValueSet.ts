import { TTIriRef } from "../interfaces/AutoGen";
import { ValueSetMember } from "./ValueSetMember";

export interface ExportValueSet {
  valueSet: TTIriRef;
  limited: boolean;
  members: Array<ValueSetMember>;
}
