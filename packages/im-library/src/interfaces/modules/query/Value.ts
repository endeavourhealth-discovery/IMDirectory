import { Compare } from "./Compare.js";

export interface Value {
  comparison: string;
  value: string;
  relativeTo: Compare;
}
