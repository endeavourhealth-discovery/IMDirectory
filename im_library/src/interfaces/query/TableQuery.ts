import { Bool } from "../../models/AutoGen";
export interface TableQuery {
  label: string;
  bool: Bool;
  data: any;
  parent: TableQuery;
  children: TableQuery[];
}
