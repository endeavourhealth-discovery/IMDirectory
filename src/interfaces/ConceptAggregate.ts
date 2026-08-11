import type { ExtendedEntityReferenceNode, TTEntity } from "@endeavour/vue-library/models";

export interface ConceptAggregate {
  children: ExtendedEntityReferenceNode[];
  concept: ExtendedEntityReferenceNode;
  parents: ExtendedEntityReferenceNode[];
}
