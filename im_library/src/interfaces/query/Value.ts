import { Compare } from "./Compare";

export interface Value {
  comparison: string;
  value: string;
  relativeTo: Compare;
}
