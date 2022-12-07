import { TTIriRef } from "./TTIriRef.js";
import { PropertyGroup } from "./PropertyGroup.js";

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
