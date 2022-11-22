import { Argument } from "./Argument";
import { TTAlias } from "./TTAlias";
import { Where } from "./Where";

export interface Select {
  property: TTAlias;
  path: string;
  sum: boolean;
  average: boolean;
  max: boolean;
  argument: Argument[];
  function: Function;
  select: Select[];
  where: Where;
  orderBy: TTAlias[];
  direction: string;
  limit: number;
  groupBy: TTAlias[];
}
