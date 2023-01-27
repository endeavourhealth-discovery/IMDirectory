import { TTIriRef } from "./TTIriRef";

export interface AliasEntity {
  iri?: string;
  name?: string;
  code?: string;
  description?: string;
  status?: TTIriRef;
  scheme?: TTIriRef;
  entityType?: TTIriRef[];
}
