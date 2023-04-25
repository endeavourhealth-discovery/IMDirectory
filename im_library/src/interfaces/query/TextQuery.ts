import { Bool } from "../AutoGen";
export interface ITextQuery {
  key: string;
  display: string;
  data: any;
  parent: ITextQuery;
  type: string;
  bool: Bool;
  children: ITextQuery[];
}
