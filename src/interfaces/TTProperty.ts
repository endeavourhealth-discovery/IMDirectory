import { TTIriRef } from "./AutoGen";

export interface TTProperty {
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
  [key: string]: any;
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
}
