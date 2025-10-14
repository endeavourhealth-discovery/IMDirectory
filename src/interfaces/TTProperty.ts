import { TTIriRef } from "./AutoGen";
import { GenericObject } from "./GenericObject";

export interface TTProperty extends GenericObject {
  "http://www.w3.org/ns/shacl#order": number;
  "http://www.w3.org/ns/shacl#path": TTIriRef[];
  "http://www.w3.org/ns/shacl#group"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#class"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#datatype"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#node"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#function"?: TTIriRef[];
  "http://endhealth.info/im#inversePath"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#maxCount"?: number;
  "http://www.w3.org/ns/shacl#minCount"?: number;
}

export interface UIProperty {
  iri: string;
  name: string;
  propertyType: "class" | "datatype" | "node";
  valueType: string;
  maxCount: number;
  minCount: number;
  valueLabel: string;
  intervalUnitIri: string;
  intervalUnitOptions: TTIriRef[];
  unitIri: string;
  unitOptions: TTIriRef[];
  operatorIri: string;
  operatorOptions: string[];
  qualifierOptions: TTIriRef[];
  setMemberCount: number;
}
