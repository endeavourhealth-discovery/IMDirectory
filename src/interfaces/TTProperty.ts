import type { GenericObject, TTIriRef } from "@endeavour/vue-library/interfaces";

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
