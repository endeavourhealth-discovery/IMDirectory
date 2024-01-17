import { v4 } from "uuid";

export class NLOBase {
  id: string = v4();
}

export class Concept extends NLOBase {
  entailment?: "<<" | "<" | ">" | ">>";
  iri?: string;
  term?: string;
}

export class ConceptGroup extends NLOBase {
  bool: "AND" | "OR" = "OR";
  concepts?: (Concept | ConceptGroup)[] = [];
}

export class Refinement extends NLOBase {
  property?: Concept;
  operator: "=" | "!=" = "=";
  value?: Concept;
}

export class RefinementGroup extends NLOBase {
  bool: "AND" | "OR" = "OR";
  refinements: (Refinement | RefinementGroup)[] = [];
}

export class RefinedConcept extends NLOBase {
  concept?: Concept;
  refinement?: RefinementGroup;
}
