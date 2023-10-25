export interface QueryQueueItem {
  id: string;
  iri: string;
  queued: string;
  started: string;
  finished: string;
  stopped: string;
  time: string;
  status: string;
  pid: number;
}
