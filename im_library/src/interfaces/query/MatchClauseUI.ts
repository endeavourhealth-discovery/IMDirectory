import { ConceptSummary } from "../ConceptSummary";
import { WhereClauseUI } from "./WhereClauseUI";

export interface MatchClauseUI {
  include: boolean;
  matchType: { name: string; prop: string };
  matchValue: ConceptSummary;
  matchEntailment: string[];
  where: WhereClauseUI[];
}
