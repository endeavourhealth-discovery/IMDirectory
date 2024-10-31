export interface EclConcept {
  type: string;
  descendants: string;
  conjunction: string;
  items: any[];
  concept: { iri: string; name?: string } | { conjunction: string; items: any[]; type: string; ecl?: string } | undefined;
  ecl?: string;
  exclude?: boolean;
}
