import { EntityReferenceNode } from "./EntityReferenceNode";
import { TTIriRef } from "./TTIriRef";

export interface FilterOptions {
  status: TTIriRef[];
  schemes: TTIriRef[];
  types: TTIriRef[];
  sortFields: TTIriRef[];
  sortDirections: TTIriRef[];
}
