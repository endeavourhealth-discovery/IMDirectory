export interface QueryQueueItem {
  id: string;
  iri: string;
  baseType: string;
  queued: string;
  started: string;
  finished: string;
  stopped: string;
  time: string;
  status: string;
  pid: number;
}
