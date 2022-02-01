import { TTIriRef } from "../TripleTree";

export class ConceptSummary {
  name = "";
  iri = "";
  scheme = {} as TTIriRef;
  code = "";
  entityType = [] as TTIriRef[];
  isDescendentOf = [] as TTIriRef[];
  weighting = 0;
  match = "";
  status = {} as TTIriRef;
}
