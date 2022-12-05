import { Query } from "./Query";
import { TTIriRef } from "../TTIriRef";

export interface QueryRequest {
  name: string;
  page: { pageNumber: number; pageSize: number };
  textSearch: string;
  argument: any;
  query: Query;
  pathQuery: { source: TTIriRef; target: TTIriRef; depth: number; name: string; iri: string };
  referenceDate: string;
}
