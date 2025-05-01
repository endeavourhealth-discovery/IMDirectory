import { EntityReferenceNode } from "./EntityReferenceNode";
import { TTEntity } from "./ExtendedAutoGen";

export interface ConceptAggregate {
  children: EntityReferenceNode[];
  concept: TTEntity;
  parents: EntityReferenceNode[];
}
