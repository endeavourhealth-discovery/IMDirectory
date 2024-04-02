import { Table } from "@/model/sql/Table";
import mapData from "@/logic/IMQtoSQL.json";
import { Field } from "@/model/sql/Field";
import { Relationship } from "@/model/sql/Relationship";

export class SqlQuery {
  private static aliasIndex = 0;

  public static create(model: string, baseId = "", variable?: string): SqlQuery {
    this.aliasIndex = 0;
    let result: SqlQuery = new SqlQuery(baseId);
    result.initialize(model, variable);
    return result;
  }

  baseId: string;
  withs: string[] = [];
  selects: string[] = [];
  model: string = "";
  map: Table = {} as Table;
  alias: string = "";
  joins: string[] = [];
  whereBool: string = "AND";
  wheres: string[] = [];
  dependentSets: string[] = [];
  dependentQueries: { iri: string; alias: string; sql: string }[] = [];

  constructor(baseId: string) {
    this.baseId = baseId;
  }

  public subQuery(model: string, variable?: string): SqlQuery {
    let result: SqlQuery = new SqlQuery(this.baseId);
    result.initialize(model, variable);

    result.dependentSets = this.dependentSets;
    result.dependentQueries = this.dependentQueries;
    return result;
  }

  public initialize(model: string, variable?: string) {
    this.withs = [];
    this.selects = [];
    this.joins = [];
    this.whereBool = "AND";
    this.wheres = [];

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
      // sql += "WITH\n";
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
    const fieldData = this.getField(field, table);

    if (!fieldData) throw new Error("Field " + field + " not found");

    const fieldName = fieldData.field;

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

    const fieldName = field.substring(field.indexOf("#") + 1);

    console.log("UNKNOWN FIELD [" + field + "] on table [" + map.table + "], defaulting to [" + "(({alias}.json ->> '" + fieldName + "')::VARCHAR)]");

    // Default to string field in JSON blob
    return {
      field: "(({alias}.json ->> '" + fieldName + "')::VARCHAR)",
      type: "string"
    } as Field;
  }

  public getRelationshipTo(targetModel: string): Relationship {
    if (this.map.relationships && this.map.relationships[targetModel]) return this.map.relationships[targetModel];

    throw new Error("Unknown relationship from [" + this.model + "] to [" + targetModel + "]");
  }

  public clone(alias: string): SqlQuery {
    const from = this.alias + ".";
    const to = alias + ".";
    const clone = this.subQuery(this.model, alias);
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

  public addDependentSet(iri: string) {
    if (!this.dependentSets.includes(iri)) this.dependentSets.push(iri);
  }

  /*
  public dependentQuery(iri: string) {
    const idx = this.dependentQueries.findIndex(i => i.iri == iri);

    if (idx > -1) {
      const alias = this.dependentQueries[idx].alias;
      this.dependentQueries.push(this.dependentQueries.splice(idx, 1)[0]);
      return alias;
    } else {
      const alias = "Q_" + this.baseId + "_" + SqlQuery.aliasIndex++;
      this.dependentQueries.push({ iri: iri, alias: alias, sql: "" });
      return alias;
    }
  }
*/
}
