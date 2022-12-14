import { Select } from "./Select";
import { TTAlias } from "./TTAlias";
import { TTContext } from "./TTContext";
import { Where } from "./Where";

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
