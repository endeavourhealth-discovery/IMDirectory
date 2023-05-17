import { Context } from "./Context";

export interface ContextMap {
  node: string
  value: string
  regex: string
  property: string
  context: Context[];
}
