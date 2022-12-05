import { TTIriRef } from "./TTIriRef";
import { PropertyGroup } from "./PropertyGroup";

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
