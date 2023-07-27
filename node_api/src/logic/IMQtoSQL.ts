import { Match, Query, Property, Assignable } from "@im-library/interfaces/AutoGen";
import mapData from "./IMQtoSQL.json"
import { join } from "lodash";
import { SqlQuery } from "@/model/sql/SqlQuery";

export class IMQtoSQL {
  private aliasIndex = 0;
  private tableMap: any = {};
  private variable?: string = undefined;

  public convert(definition: Query) {
    if (!definition["@type"]) {
      console.error("Query must have a focus type")
      return;
    }

    if (!definition.match) {
      console.error("Query must have at least one match");
      return;
    }

    const focus = this.focusTable(definition["@type"]);

    const qry = this.convertMatches(focus, definition.match);

    console.log("================================================================")

    console.log(qry)

    console.log("================================================================")

    return this.queryToSql(focus, qry);
  }

  private focusTable(tableType: string) : any {
    console.log("=== SWITCHING FOCUS [" + tableType + "]===")

    if (!tableType.startsWith("http:"))
      tableType = "http://endhealth.info/im#" + tableType;

    const map = (mapData.typeTables as any)[tableType];

    if (!map) {
      console.log("Unmapped table " + tableType);
      return;
    }

    const table: any = { map: map };

    if (this.variable) {
      table.alias = this.variable;
      this.tableMap[this.variable] = table;
      this.variable = undefined;
    } else {
      table.alias = this.getAlias(table);
    }

    return table;
  }

  private convertMatches(focus: any, matches: Match[]) {
    const qry = new SqlQuery();

    for(const match of matches) {
      const subQry = this.convertMatch(focus, match);
      qry.withs.push(...subQry.withs)
      qry.joins.push(...subQry.joins)
      qry.wheres.push(...subQry.wheres)
    }

    return qry;
  }

  private convertMatch(focus: any, match: Match) {
    const qry = new SqlQuery();

    const matchFocus = (match["@type"]) ? this.focusTable(match["@type"]) : focus

    qry.alias = (match.variable) ? match.variable : this.getAlias(matchFocus);

    if (match["@set"]) {
      this.convertMatchSet(matchFocus, qry, match);
    } else if (match.bool) {
      if (match.match && match.match.length > 0)
        this.convertMatchBoolSubMatch(matchFocus, qry, match);
      else if (match.property && match.property.length > 0)
        this.convertMatchProperties(matchFocus, qry, match, match.bool);
      else {
        console.log("UNHANDLED BOOL MATCH PATTERN")
        console.log(match)
      }
    } else if (match.property && match.property.length > 0) {
      this.convertMatchProperties(matchFocus, qry, match);
    } else {
      console.log("UNHANDLE MATCH PATTERN")
      console.log(match)
    }

    if (match.orderBy) {
      qry.withs.push(qry.alias + "_part AS (<PARTITION LOGIC>)")
    }

    return qry;
  }

  private convertMatchSet(focus: any, qry: SqlQuery, match: Match) {
    qry.withs.push(qry.alias + " AS ( SELECT " + qry.alias + ".* FROM " + focus.map.table + " AS " + qry.alias + ") -- WHERE in query results " + match["@set"]);
    qry.joins.push("JOIN " + qry.alias + " ON " + qry.alias + ".id = " + focus.alias + ".id")
  }

  private convertMatchBoolSubMatch(focus: any, qry: SqlQuery, match: Match) {
    const joiner = ("OR" == match.bool.toUpperCase()) ? "\nLEFT JOIN " : "\nJOIN ";
    const wherer = ("OR" == match.bool.toUpperCase()) ? "IS NOT NULL" : undefined;

    let boolJoin = qry.alias + " AS ( SELECT " + qry.alias + ".* FROM " + focus.map.table + " AS " + qry.alias;
    let boolWhere = [];

    for (const subMatch of match.match) {
      const subQuery = this.convertMatch(focus, subMatch);

      qry.withs.push(...subQuery.withs);

      boolJoin += joiner + subQuery.alias + ".id = " + qry.alias + ".id"
      if (wherer)
        boolWhere.push(subQuery.alias + ".id " + wherer);
    }

    if (boolWhere.length > 0)
      boolJoin += "\nWHERE " + boolWhere.join("\n" + match.bool + " ");

    boolJoin += ")";

    qry.withs.push(boolJoin)
    qry.joins.push("JOIN " + qry.alias + " ON " + qry.alias + ".id = " + focus.alias + ".id");
  }

  private convertMatchProperties(focus: any, qry: SqlQuery, match: Match, bool = "AND") {
    let w = qry.alias + " AS ( SELECT " + qry.alias + ".* FROM " + focus.map.table + " AS " + qry.alias;

    const conditions = [];
    for(const property of match.property) {
      conditions.push(this.convertMatchProperty(focus, qry, match, property))
    }

    if (conditions.length > 0)
      w += " WHERE " + conditions.join(" " + bool + " ")

    w += ")";

    qry.withs.push(w);
  }

  private convertMatchProperty(focus: any, qry: SqlQuery, match: Match, property: Property) {
    if (property.range) {
      return this.convertMatchPropertyRange(property);
    } else if (property.match) {
      return this.convertMatchPropertySubMatch(focus, qry, property);
    } else if (property.in) {
      return this.convertMatchPropertyIn(qry, property);
    } else if (property.relativeTo) {
      return this.convertMatchPropertyRelative(qry, property);
    } else {
      console.log("UNHANDLED PROPERTY PATTERN");
      console.log(property);
      return "<UNHANDLED>"
    }
  }

  private convertMatchPropertyRange(property: Property) {
    const ranges: string[] = [];
    if (property.range.from)
      ranges.push(property["@id"] + " " + this.convertMatchPropertyRangeNode(property.range.from))

    if (property.range.to)
      ranges.push(property["@id"] + " " + this.convertMatchPropertyRangeNode(property.range.to))

    return ranges.join("\nAND ")
  }

  private convertMatchPropertyRangeNode(range: Assignable) {
    return range.operator + " " + range.value + (range.unit ? " " + range.unit : "");
  }

  private convertMatchPropertySubMatch(focus: any, qry: SqlQuery, property: Property) {
    console.log("SUBSELECT")
    console.log(JSON.stringify(property.match, null, 2))

    if (!property.match.variable)
      property.match.variable = qry.alias + "_sub1";

    const m = this.convertMatch(focus, property.match);
    console.log("SUBSELECT MATCH")
    console.log(m);

    qry.withs.push(...m.withs)
    qry.joins.push("JOIN " + qry.alias + " ON " + qry.alias + ".id = " + focus.alias + ".id")

    return "JOIN " +m.alias + " ON " + qry.alias + "." + property["@id"] + " = " + m.alias + ".id";
  }

  private convertMatchPropertyIn(qry: SqlQuery, property: Property) {
    const inList = [];

    for (const pIn of property.in) {
      if (pIn["@id"])
        inList.push(pIn['@id'])
      else {
        console.log("UNHANDLED 'IN' ENTRY")
        console.log(pIn)
      }
    }

    return qry.alias + "." + property["@id"] + " IN ('" + inList.join("', '") + "')";
  }

  private convertMatchPropertyRelative(qry: SqlQuery, property: Property) {
    // Different comparison based on type
    return qry.alias + "." + property["@id"] + " " + property.operator + " (" + property.relativeTo.parameter + " " + property.value + " " + property.unit +")";
  }

  private getAlias(table: any) {
    const prefix = table.map.table.substring(0,3);
    const alias = prefix + (this.aliasIndex++);
    this.tableMap[alias] = table;
    return alias;
  }

  private getField(table: any, field: string) {
    if (table.map.fields[field])
      return table.map.fields[field]

    console.log("Unknown field [" + field + "] on table [" + table.map.table + "]");
    return "<UNKNOWN>";
  }

  private queryToSql(focus: any, qry: SqlQuery) {

    let sql = "";

    if (qry.withs) {
      sql += "WITH ";
      sql += qry.withs.join(",\n")
    }

    sql += "\nSELECT " + focus.alias + ".id"
    sql += "\nFROM " + focus.map.table + " AS " + focus.alias;

    if (qry.joins && qry.joins.length > 0)
      sql += "\n" + qry.joins.join("\n")

    if (qry.wheres && qry.wheres.length > 0)
      sql += "\nWHERE " + qry.wheres.join("\nAND ")

    return sql;
  }
}
