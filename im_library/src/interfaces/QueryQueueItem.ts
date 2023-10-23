export interface QueryQueueItem {
  id: string;
  iri: string;
  queued: string;
  started: string;
  finished: string;
  killed: string;
  status: string;
  pid: number;
}
