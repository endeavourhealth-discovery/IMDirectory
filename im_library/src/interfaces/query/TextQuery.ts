import { Bool } from "../AutoGen";
import { MatchClauseUI } from "./MatchClauseUI";
export interface ITextQuery {
  key: string;
  display: string;
  data: any;
  uiData: MatchClauseUI[];
  type: string;
  bool: Bool;
  children: ITextQuery[];
}
