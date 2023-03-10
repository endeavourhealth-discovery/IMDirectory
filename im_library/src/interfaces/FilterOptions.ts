import { EntityReferenceNode } from "./EntityReferenceNode";
import { TTIriRef } from "../models/AutoGen";

export interface FilterOptions {
  status: TTIriRef[];
  schemes: TTIriRef[];
  types: TTIriRef[];
  sortFields: TTIriRef[];
  sortDirections: TTIriRef[];
}
