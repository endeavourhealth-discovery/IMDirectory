import { TTIriRef } from "./TTIriRef";

export interface TTProperty {
  "http://www.w3.org/ns/shacl#order": number;
  "http://www.w3.org/ns/shacl#path": TTIriRef[];
  "http://www.w3.org/ns/shacl#class": TTIriRef[];
  "http://www.w3.org/ns/shacl#datatype": TTIriRef[];
  "http://www.w3.org/ns/shacl#node": TTIriRef[];
  "http://www.w3.org/ns/shacl#maxCount": number;
  "http://www.w3.org/ns/shacl#minCount": number;
}
