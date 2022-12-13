import { TTIriRef } from "../TTIriRef.js";
import { Compare } from "./Compare.js";

export interface Argument {
  parameter: string;
  valueData?: string;
  valueVariable?: string;
  valueIri?: TTIriRef;
  valueFrom?: Compare;
  valueList?: String[];
}
