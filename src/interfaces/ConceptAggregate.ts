import type { TTEntity } from "@endeavour/vue-library/models";

export interface ConceptAggregate {
  children: TTEntity[];
  concept: TTEntity;
  parents: TTEntity[];
}
