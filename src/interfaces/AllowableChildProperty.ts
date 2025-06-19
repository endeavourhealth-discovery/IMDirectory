import { TTIriRef } from "./AutoGen";

export default interface AllowableChildProperty {
  iri: string;
  "http://www.w3.org/2000/01/rdf-schema#label": string;
  "http://www.w3.org/ns/shacl#property": { "http://www.w3.org/ns/shacl#path": TTIriRef }[];
}
