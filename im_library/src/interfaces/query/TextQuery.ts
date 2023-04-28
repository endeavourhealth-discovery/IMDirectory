import { Bool } from "../AutoGen";
import { MatchClauseUI } from "./MatchClauseUI";
export interface ITextQuery {
  key: string;
  display: string;
  data: any;
  uiData: MatchClauseUI[];
  parent: ITextQuery;
  type: string;
  bool: Bool;
  children: ITextQuery[];
}
