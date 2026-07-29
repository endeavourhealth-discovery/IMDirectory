import type { TTIriRef } from "@endeavour/vue-library/models";

export interface ValueSetMember {
  entity: TTIriRef;
  code: string;
  scheme: TTIriRef;
  label: string;
  type: string;
  directParent: TTIriRef;
}
