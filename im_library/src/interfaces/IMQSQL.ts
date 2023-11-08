export interface IMQSQL {
  sql: string;
  error?: string;
  sets: string[];
  queries: Map<string, { iri: string; alias: string; sql: string }>;
}
