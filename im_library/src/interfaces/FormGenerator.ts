import { PropertyGroup } from "../models/AutoGen";
import { TTIriRef } from "./TTIriRef";

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
