import { EntityReferenceNode } from "./EntityReferenceNode";

export interface FilterOptions {
  status: EntityReferenceNode[];
  schemes: EntityReferenceNode[];
  types: EntityReferenceNode[];
  sortFields: EntityReferenceNode[];
  sortDirections: EntityReferenceNode[];
}
