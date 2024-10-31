import { SearchResultSummary } from "./AutoGen";

export interface EclRefinement {
  type: string;
  operator: string;
  property: { concept: { iri: string; name?: string } | SearchResultSummary; descendants: string };
  value: { concept: { iri: string; name?: string } | SearchResultSummary; descendants: string };
  ecl?: string;
}
