import { Bool } from "../AutoGen";
import { ClauseUI } from "./ClauseUI";
export interface ITextQuery {
  key: string;
  display: string;
  data: any;
  parent: ITextQuery;
  type: string;
  bool: Bool;
  children: ITextQuery[];
}
