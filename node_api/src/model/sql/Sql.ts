import { Table } from "./Table";
import { Join } from "./Join";
import { ConditionList } from "./ConditionList";
import { SimpleCondition } from "./SimpleCondition";
import dataModelMap from "../../logic/dataModelMap.json";

export class Sql extends Join {
  public fields: string[] = [];
  public table: Table = {} as Table;
  public id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  public toSelect(): string {
    return "SELECT * FROM " + (<any>dataModelMap)[this.id].name;
  }

  public toCreate(): string {
    const table = (<any>dataModelMap)[this.id];
    if (!table) throw "Id not in data model map [" + this.id + "]";

    let result = "CREATE TABLE IF NOT EXISTS " + table.name + "\n" + "SELECT m." + this.table.fields.pk;

    for (let f = 0; f < this.fields.length; f++) {
      result += ", " + this.fields[f];
    }

    result += "\nFROM " + this.table.name + " " + this.table.alias;

    for (let j = 0; j < this.joins.length; j++) {
      const join: Join = this.joins[j];
      result += "\nJOIN " + join.table.name + " " + join.table.alias + " ON " + join.on;

      result += this.getConditions(join, "AND ");
    }

    result += this.getConditions(this, "WHERE ");

    return result;
  }

  public toDrop(): string {
    return "DROP TABLE IF EXISTS " + (<any>dataModelMap)[this.id].name;
  }

  public getTable(entityTypeId: string, alias: string): Table {
    if (!entityTypeId) throw "No entity type provided";

    if (!(<any>dataModelMap)[entityTypeId]) throw "Entity [" + entityTypeId + "] does not exist in map";

    const table = JSON.parse(JSON.stringify((<any>dataModelMap)[entityTypeId]));
    table.alias = alias;
    table.id = entityTypeId;

    return table;
  }

  public getField(table: Table, fieldId: string): string {
    if (!table.fields[fieldId]) throw "Table [" + table.name + "] does not contain field [" + fieldId + "]";

    return table.alias + "." + table.fields[fieldId];
  }

  public getJoin(parent: Table, relationshipId: string, childId: string, alias: string): Join {
    if (!parent.joins[relationshipId]) throw "Table [" + parent.name + "] does not have relationship [" + relationshipId + "]";

    if (!parent.joins[relationshipId][childId])
      throw "Table [" + parent.name + "] does not have relationship [" + relationshipId + "] to child table [" + childId + "]";

    const join: Join = new Join();
    join.table = this.getTable(childId, alias);
    join.on = parent.joins[relationshipId][childId];

    join.on = join.on.replace(/{child}/g, join.table.alias).replace(/{parent}/g, parent.alias);

    return join;
  }

  private getConditions(conditionList: ConditionList, initial: string = ""): string {
    if (!conditionList || conditionList.conditions.length == 0) return "";

    let result: string = "\n" + initial;

    if (conditionList && conditionList.conditions.length > 0) {
      for (let c = 0; c < conditionList.conditions.length; c++) {
        if (c > 0) result += "\n" + conditionList.operator + " ";

        if ((conditionList.conditions[c] as ConditionList).operator) {
          const cl: ConditionList = conditionList.conditions[c] as ConditionList;
          result += "(" + this.getConditions(cl) + ")";
        } else {
          const cond: SimpleCondition = conditionList.conditions[c] as SimpleCondition;
          result += cond.subject + " " + cond.predicate + " " + cond.object;
        }
      }
    }

    return result;
  }
}
