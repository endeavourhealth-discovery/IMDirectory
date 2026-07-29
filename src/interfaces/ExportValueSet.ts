import type { TTIriRef } from "@endeavour/vue-library/models";

import { ValueSetMember } from "./ValueSetMember";

export interface ExportValueSet {
  valueSet: TTIriRef;
  limited: boolean;
  members: Array<ValueSetMember>;
}
