import { TTIriRef } from "../models/AutoGen";

export default interface AllowableChildProperty {
  "@id": string;
  "http://www.w3.org/2000/01/rdf-schema#label": string;
  "http://www.w3.org/ns/shacl#property": { "http://www.w3.org/ns/shacl#path": TTIriRef[] }[];
}
