import { EntityReferenceNode } from "./EntityReferenceNode.js";

export interface ConceptAggregate {
  children: EntityReferenceNode[];
  concept: any;
  parents: EntityReferenceNode[];
}
