import { EntityReferenceNode } from "./EntityReferenceNode";

export interface ConceptAggregate {
  children: EntityReferenceNode[];
  concept: any;
  parents: EntityReferenceNode[];
}
