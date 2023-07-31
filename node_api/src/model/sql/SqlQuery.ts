import { Table } from "@/model/sql/Table";
import mapData from "@/logic/IMQtoSQL.json";
import { Field } from "@/model/sql/Field";
import { Relationship } from "@/model/sql/Relationship";

export class SqlQuery {
  private static aliasIndex = 0;

  withs: string[] = []
  selects: string[] = []
  model: string;
  map: Table = {} as Table
  alias: string = ""
  joins: string[] = []
  whereBool: string = "AND"
  wheres: string[] = []

  constructor(model: string, variable?: string) {
    this.model = model;
    this.map = this.getMap(model);
    this.alias = variable ? variable : this.getAlias(this.map.table);

    (mapData.typeTables as any)[this.alias] = { table: this.alias, fields: this.map.fields, relationships: this.map.relationships };
    console.log("MAPPED " + this.alias)
  }

  public toSql() {

    let sql = "";

    if (this.withs && this.withs.length > 0) {
      sql += "WITH ";
      sql += this.withs.join(",\n")
    }

    sql += "\nSELECT ";

    if (this.selects && this.selects.length > 0)
      sql += this.selects.join(", ")
    else
      sql += this.alias + ".*"

    sql += "\nFROM " + this.map.table + " AS " + this.alias;

    if (this.joins && this.joins.length > 0)
      sql += "\n" + this.joins.join("\n")

    if (this.map.condition || (this.wheres && this.wheres.length > 0)) {
      sql += "\nWHERE ";

      if (this.map.condition) {
        sql += this.map.condition + "\n";
        if (this.wheres && this.wheres.length > 0) {
          sql += "AND (\n";
        }
      }

      if (this.wheres && this.wheres.length > 0) {
        sql += this.wheres.join("\n" + this.whereBool + " ")
        if (this.map.condition)
          sql += ")\n";
      }
    }

    return sql;
  }

  public getField(field: string): Field {
    if (this.map.fields[field])
      return this.map.fields[field]

    throw new Error("Unknown field [" + field + "] on table [" + this.model + "]");
  }

  public getRelationshipTo(targetModel: string): Relationship {
    if (this.map.relationships[targetModel])
      return this.map.relationships[targetModel]

    throw new Error("Unknown relationship from [" + this.model + "] to [" + targetModel + "]");
  }

  private getMap(model: string) : any {
    let map = (mapData.typeTables as any)[model];

    if (!map) {
      console.log("[" + model + "] not found, trying [http://endhealth.info/im#" + model + "]")
      map = (mapData.typeTables as any)["http://endhealth.info/im#" + model];
    }

    if (map) {
      return map;
    } else {
      console.log("MAPPING DATA")
      console.log(JSON.stringify(mapData, null, 2))
      throw new Error("Unmapped table " + model);
    }
  }

  private getAlias(tableName: string) {
    const prefix = tableName.substring(0,3);
    const alias = prefix + (SqlQuery.aliasIndex++);
    return alias;
  }
}

