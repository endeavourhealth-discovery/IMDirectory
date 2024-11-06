import { TTIriRef } from "./AutoGen";

export interface Property {
  "http://www.w3.org/ns/shacl#path": TTIriRef[];
  "http://www.w3.org/ns/shacl#order": number;
  "http://www.w3.org/ns/shacl#node"?: any[];
  "http://www.w3.org/ns/shacl#datatype"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#class"?: TTIriRef[];
  "http://endhealth.info/im#inheritedFrom"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#minCount"?: number;
  "http://www.w3.org/ns/shacl#maxCount"?: number;
}
