import { TTIriRef } from "./TTIriRef";

export interface ConceptSummary {
  name: string;
  iri: string;
  scheme: TTIriRef;
  code: string;
  entityType: TTIriRef[];
  isDescendentOf: TTIriRef[];
  weighting: number;
  match: string;
  status: TTIriRef;
}
