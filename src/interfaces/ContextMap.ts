import { Context } from "./Context";

export interface ContextMap {
  id: string;
  node: string;
  value: string;
  regex: string;
  property: string;
  context: Context[];
}
