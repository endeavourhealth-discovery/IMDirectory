import { Query } from "./Query";
import { TTIriRef } from "../TTIriRef";
import { Argument } from "./Argument";

export interface QueryRequest {
  name: string;
  page: { pageNumber: number; pageSize: number };
  textSearch: string;
  argument: Argument[];
  query: Query;
  pathQuery: { source: TTIriRef; target: TTIriRef; depth: number; name: string; iri: string };
  referenceDate: string;
}
