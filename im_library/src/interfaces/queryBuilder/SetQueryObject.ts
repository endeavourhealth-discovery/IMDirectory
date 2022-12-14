import { TTAlias } from "../query/TTAlias";
import { Refinement } from "./Refinement";

export interface SetQueryObject {
  include: boolean;
  concept: TTAlias;
  refinements: Refinement[];
}
