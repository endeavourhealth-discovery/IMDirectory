import { TTAlias } from "../query/TTAlias.js";

export interface Refinement {
  property: TTAlias;
  is: TTAlias;
}
