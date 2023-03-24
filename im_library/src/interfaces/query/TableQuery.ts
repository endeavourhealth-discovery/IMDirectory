import { Bool } from "../../interfaces/AutoGen";
export interface TableQuery {
  key: string;
  label: string;
  type: string;
  bool: Bool;
  data: any;
  parent: TableQuery;
  children: TableQuery[];
}
