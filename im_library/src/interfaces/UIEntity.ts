import { TTIriRef } from "./TTIriRef";

export interface UIMainEntity {
  iri: string;
  name: string;
}

export interface UIEntity extends UIMainEntity {
  scheme: TTIriRef;
  code: string;
  entityType: TTIriRef[];
  isDescendentOf: TTIriRef[];
  weighting: number;
  match: string;
  status: TTIriRef;
  description: string;
}
