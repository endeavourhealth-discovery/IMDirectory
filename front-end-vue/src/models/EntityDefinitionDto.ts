import { TTIriRef } from "./TripleTree";

export interface EntityDefinitionDto {
  iri: string;
  name: string;
  description: string;
  status: string;
  types: TTIriRef[];
  isa: TTIriRef[];
  subtypes: TTIriRef[];
}
