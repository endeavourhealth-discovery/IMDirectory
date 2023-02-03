import { TTAlias } from "../../models/AutoGen";
import { Refinement } from "./Refinement";

export interface SetQueryObject {
  include: boolean;
  concept: TTAlias;
  refinements: Refinement[];
  isType?: boolean;
}
