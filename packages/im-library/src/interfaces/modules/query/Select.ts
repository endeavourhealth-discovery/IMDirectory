import { Argument } from "./Argument.js";
import { TTAlias } from "./TTAlias.js";
import { Where } from "./Where.js";

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
