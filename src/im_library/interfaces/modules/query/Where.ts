import { Argument } from "./Argument";
import { TTAlias } from "./TTAlias";
import { Value } from "./Value";

export interface Where {
  alias: string;
  description: string;
  from: TTAlias[];
  graph: string;
  not: boolean;
  path: string;
  property: TTAlias;
  in: TTAlias[];
  is: TTAlias;
  range: Range;
  argument: Argument[];
  and: Where[];
  or: Where[];
  notExist: Where;
  function: Function;
  where: Where;
  value: Value;
  orderBy: TTAlias[];
  direction: string;
  limit: number;
}
