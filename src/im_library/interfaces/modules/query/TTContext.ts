export interface TTContext {
  byIri: { [key: string]: string };
  byPrefix: { [key: string]: string };
  toName: { [key: string]: string };
}
