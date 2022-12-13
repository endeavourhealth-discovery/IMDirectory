import { Select } from "./Select.js";
import { TTAlias } from "./TTAlias.js";
import { TTContext } from "./TTContext.js";
import { Where } from "./Where.js";

export interface Query extends TTAlias {
  description: string;
  from: TTAlias[];
  select: Select[];
  where: Where;
  orderBy: TTAlias[];
  direction: String;
  limit: number;
  groupBy: TTAlias[];
  prefix: TTContext;
  subQuery: Query[];
  activeOnly: boolean;
  usePrefixes: boolean;
}
