import type { ExtendedTTEntity } from "vue-library/interfaces";

export interface ConceptAggregate {
  children: ExtendedTTEntity[];
  concept: ExtendedTTEntity;
  parents: ExtendedTTEntity[];
}
