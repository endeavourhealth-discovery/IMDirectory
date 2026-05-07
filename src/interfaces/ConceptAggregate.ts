import type { ExtendedTTEntity } from "@endeavour/vue-library/interfaces";

export interface ConceptAggregate {
  children: ExtendedTTEntity[];
  concept: ExtendedTTEntity;
  parents: ExtendedTTEntity[];
}
