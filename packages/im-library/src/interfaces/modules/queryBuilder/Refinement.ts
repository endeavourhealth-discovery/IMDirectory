import { TTAlias } from "../query/TTAlias";

export interface Refinement {
  property: TTAlias;
  is: TTAlias;
}
