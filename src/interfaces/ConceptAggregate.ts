import type { ExtendedTTEntity } from "@endeavour/vue-library/models";

export interface ConceptAggregate {
  children: ExtendedTTEntity[];
  concept: ExtendedTTEntity;
  parents: ExtendedTTEntity[];
}
