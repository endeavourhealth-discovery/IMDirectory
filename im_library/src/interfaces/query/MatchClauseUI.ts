import { ConceptSummary } from "../ConceptSummary";
import { WhereClauseUI } from "./WhereClauseUI";

export interface MatchClauseUI {
  matchType: { name: string; prop: string };
  matchValue: ConceptSummary;
  matchEntailment: string[];
  where: WhereClauseUI[];
}
