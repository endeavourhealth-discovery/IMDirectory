import { Query } from "./Query.js";
import { TTIriRef } from "../TTIriRef.js";
import { Argument } from "./Argument.js";

export interface QueryRequest {
  name: string;
  page: { pageNumber: number; pageSize: number };
  textSearch: string;
  argument: Argument[];
  query: Query;
  pathQuery: { source: TTIriRef; target: TTIriRef; depth: number; name: string; iri: string };
  referenceDate: string;
}
