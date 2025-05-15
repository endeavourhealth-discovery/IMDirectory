import { TTEntity } from "./ExtendedAutoGen";

export interface ConceptAggregate {
  children: TTEntity[];
  concept: TTEntity;
  parents: TTEntity[];
}
