import { Table } from "./Table";
import { ConditionList } from "./ConditionList";

export class Join extends ConditionList {
  public table: Table = {} as Table;
  public on: string = "";
  public joins: Join[] = [];
}
