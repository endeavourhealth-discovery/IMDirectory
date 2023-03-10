import { PropertyGroup, TTIriRef } from "../interfaces/AutoGen";

export interface FormGenerator {
  iri: string;
  status: TTIriRef;
  scheme: TTIriRef;
  label: string;
  comment: string;
  type: TTIriRef[];
  targetShape: TTIriRef;
  isContainedIn: TTIriRef[];
  subClassOf: TTIriRef[];
  group: PropertyGroup[];
}
