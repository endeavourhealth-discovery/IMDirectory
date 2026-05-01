import type { TTIriRef } from "@endeavour/vue-library/interfaces";

export default interface TangledTreeData {
  id: string;
  parents?: TangledTreeData[];
  name: string;
  type: string;
  cardinality?: string;
  isOr?: boolean;
  range?: TTIriRef[];
}
