import { TTAlias } from "../query/TTAlias.js";
import { Refinement } from "./Refinement.js";

export interface SetQueryObject {
  include: boolean;
  concept: TTAlias;
  refinements: Refinement[];
}
