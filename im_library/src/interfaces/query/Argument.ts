import { TTIriRef } from "../TTIriRef";
import { Compare } from "./Compare";

export interface Argument {
  parameter: string;
  valueData?: string;
  valueVariable?: string;
  valueIri?: TTIriRef;
  valueFrom?: Compare;
  valueList?: String[];
}
