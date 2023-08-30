import { Table } from "@/model/sql/Table";
import mapData from "@/logic/IMQtoSQL.json";
import { Field } from "@/model/sql/Field";
import { Relationship } from "@/model/sql/Relationship";

export class SqlQuery {
  private static aliasIndex = 0;

  withs: string[] = [];
  selects: string[] = [];
  model: string = "";
  map: Table = {} as Table;
  alias: string = "";
  joins: string[] = [];
  whereBool: string = "AND";
  wheres: string[] = [];
  dependencies: string[] = [];

  constructor(model: string, variable?: string) {
    this.initialize(model, variable);
  }

  public initialize(model: string, variable?: string) {
    this.withs = [];
    this.selects = [];
    this.joins = [];
    this.whereBool = "AND";
    this.wheres = [];
    this.dependencies = [];

    this.model = model;
    this.map = this.getMap(model);
    this.alias = variable ?? this.getAlias(this.map.table);

    (mapData.typeTables as any)[this.alias] = { table: this.alias, fields: this.map.fields, relationships: this.map.relationships };
  }

  public toSql(indent: number = 0) {
    let sql = "";
    sql += this.generateWiths();
    sql += this.generateSelects();
    sql += this.generateFroms();
    sql += this.generateWheres();

    return sql.replaceAll("\n", "\n" + " ".repeat(indent));
  }

  private generateWiths() {
    let sql = "";

    if (this.withs && this.withs.length > 0) {
      sql += "WITH\n";
      sql += this.withs.join(",\n");
    }
    return sql;
  }

  private generateSelects() {
    let sql = "\nSELECT ";

    if (this.selects && this.selects.length > 0) sql += this.selects.join(", ");
    else sql += this.alias + ".*";

    return sql;
  }

  private generateFroms() {
    let sql = "\nFROM " + this.map.table + " AS " + this.alias;

    if (this.joins && this.joins.length > 0) sql += "\n" + this.joins.join("\n");
    return sql;
  }

  private generateWheres() {
    let sql = "";
    if (this.map.condition || (this.wheres && this.wheres.length > 0)) {
      sql += "\nWHERE ";

      if (this.map.condition) {
        sql += this.map.condition.replaceAll("{alias}", this.alias) + "\n";
        if (this.wheres && this.wheres.length > 0) {
          sql += "AND (\n";
        }
      }

      if (this.wheres && this.wheres.length > 0) {
        sql += this.wheres.join("\n" + this.whereBool + " ");
        if (this.map.condition) sql += ")\n";
      }
    }
    return sql;
  }

  public getFieldName(field: string, table?: string): string {
    const alias = table ?? this.alias;
    const fieldName = this.getField(field, table).field;

    if (fieldName.includes("{alias}")) return fieldName.replaceAll("{alias}", alias);
    else return alias + "." + fieldName;
  }

  public getFieldType(field: string, table?: string): string {
    return this.getField(field, table).type;
  }

  private getField(field: string, table?: string): Field {
    const map = table ? (mapData.typeTables as any)[table] : this.map;

    if (!map) throw new Error("Unknown table [" + table + "]");

    if (map.fields[field]) return map.fields[field];

    console.log("UNKNOWN FIELD [" + field + "]");
    console.log(JSON.stringify(map, null, 2));

    // Default to string field in JSON blob
    const fieldName = field.substring(field.indexOf("#") + 1);
    return {
      field: "(({alias}.json ->> '" + fieldName + "')::VARCHAR)",
      type: "string"
    } as Field;
  }

  public getRelationshipTo(targetModel: string): Relationship {
    if (this.map.relationships[targetModel]) return this.map.relationships[targetModel];

    throw new Error("Unknown relationship from [" + this.model + "] to [" + targetModel + "]");
  }

  public clone(alias: string): SqlQuery {
    const from = this.alias + ".";
    const to = alias + ".";
    const clone = new SqlQuery(this.model, alias);
    clone.withs.push(...this.withs);
    clone.selects.push(...this.selects.map(j => j.replaceAll(from, to)));
    clone.joins.push(...this.joins.map(j => j.replaceAll(from, to)));
    clone.wheres.push(...this.wheres.map(j => j.replaceAll(from, to)));
    clone.whereBool = this.whereBool;

    return clone;
  }

  private getMap(model: string): any {
    let map = (mapData.typeTables as any)[model];

    if (!map) {
      map = (mapData.typeTables as any)["http://endhealth.info/im#" + model];
    }

    if (map) {
      return map;
    } else {
      throw new Error("Unmapped table " + model);
    }
  }

  public getAlias(tableName: string) {
    return tableName + SqlQuery.aliasIndex++;
  }
}
