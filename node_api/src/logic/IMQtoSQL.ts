import { Match, Query, Property, Assignable } from "@im-library/interfaces/AutoGen";
import mapData from "./IMQtoSQL.json"
import { SqlQuery } from "@/model/sql/SqlQuery";
import { Table } from "@/model/sql/Table";

export class IMQtoSQL {
  private aliasIndex = 0;
  private tableMap: any = {};

  public convert(definition: Query) {
    if (!definition["@type"]) {
      console.error("Query must have a focus type")
      return;
    }

    if (!definition.match) {
      console.error("Query must have at least one match");
      return;
    }

    const focus: Table = this.focusTable(definition["@type"]);

    const subQueries: SqlQuery[] = this.convertMatches(focus, definition.match);

    const qry = new SqlQuery();
    qry.alias = focus.alias;
    qry.from = focus.map.table + " AS " + qry.alias

    for(const subQry of subQueries) {
      qry.withs.push(...subQry.withs);
      subQry.withs = [];
      const subSql = this.queryToSql(subQry);
      qry.withs.push(subQry.alias + " AS (" + subSql + "\n)")
      qry.joins.push("JOIN " + subQry.alias + " ON " + subQry.alias + ".id = " + qry.alias + ".id")
    }

    console.log("================================================================")
    console.log(qry)
    console.log("================================================================")

    return this.queryToSql(qry);
  }

  private focusTable(tableType: string) : Table {
    console.log("=== SWITCHING FOCUS TO [" + tableType + "]===")

    if (!tableType.startsWith("http:"))
      tableType = "http://endhealth.info/im#" + tableType;

    const map = (mapData.typeTables as any)[tableType];

    if (!map) {
      throw new Error("Unmapped table " + tableType);
    }

    const table: Table = { map: map } as Table;
    table.alias = this.getAlias(table);

    return table;
  }

  private convertMatches(focus: Table, matches: Match[]): SqlQuery[] {
    const result: SqlQuery[] = [];
    for(const match of matches) {
      const subQry = this.convertMatch(focus, match);
      result.push(subQry);
    }

    return result;
  }

  private convertMatch(focus: Table, match: Match): SqlQuery {

    const matchFocus = (match["@type"]) ? this.focusTable(match["@type"]) : focus

    const qry:SqlQuery = new SqlQuery();
    qry.alias = (match.variable) ? match.variable : this.getAlias(matchFocus);
    qry.from = focus.map.table + " AS " + qry.alias

    if (match["@set"]) {
      this.convertMatchSet(qry, match);
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

/*    if (match.orderBy) {
      qry.withs.push(qry.alias + "_part AS (<PARTITION LOGIC>)")
    }*/

    return qry;
  }

  private convertMatchSet(qry: SqlQuery, match: Match) {
    qry.selects.push(qry.alias + ".*");
    qry.wheres.push("-- in query results " + match["@set"])
  }

  private convertMatchBoolSubMatch(focus: Table, qry: SqlQuery, match: Match) {
    if (!match.bool || !match.match) {
      console.log("INVALID MatchBoolSubMatch")
      return;
    }

    qry.whereBool = match.bool ? match.bool : "AND";

    const joiner = ("OR" == match.bool.toUpperCase()) ? "LEFT JOIN " : "JOIN ";
    const wherer = ("OR" == match.bool.toUpperCase()) ? "IS NOT NULL" : undefined;

    let boolJoin = [];
    let boolWhere = [];

    for (const subMatch of match.match) {
      const subQuery = this.convertMatch(focus, subMatch);

      qry.withs.push(...subQuery.withs);

      boolJoin.push(joiner + subQuery.alias + ".id = " + qry.alias + ".id")
      if (wherer)
        boolWhere.push(subQuery.alias + ".id " + wherer);
    }

    qry.joins.push(...boolJoin);
    qry.wheres.push(...boolWhere);
  }

  private convertMatchProperties(focus: Table, qry: SqlQuery, match: Match, bool = "AND") {
    if (!match.property) {
      console.log("INVALID MatchProperty")
      return;
    }

    let w = qry.alias + " AS ( SELECT " + qry.alias + ".* FROM " + focus.map.table + " AS " + qry.alias;

    const conditions = [];
    for(const property of match.property) {
      conditions.push(this.convertMatchProperty(focus, qry, property))
    }

    if (conditions.length > 0)
      w += " WHERE " + conditions.join(" " + bool + " ")

    w += ")";

    qry.withs.push(w);
  }

  private convertMatchProperty(focus: Table, qry: SqlQuery, property: Property) {
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
    if (!property.range) {
      console.log("INVALID MatchPropertyRange")
      return;
    }

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

  private convertMatchPropertySubMatch(focus: Table, qry: SqlQuery, property: Property) {
    if (!property.match) {
      console.log("INVALID MatchPropertySubMatch")
      return;
    }

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
    if (!property.in) {
      console.log("INVALID MatchPropertyIn")
      return;
    }

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
    if (!property.relativeTo) {
      console.log("INVALID MatchPropertyRelative")
      return;
    }

    // Different comparison based on type
    return qry.alias + "." + property["@id"] + " " + property.operator + " (" + property.relativeTo.parameter + " " + property.value + " " + property.unit +")";
  }

  private getAlias(table: any) {
    const prefix = table.map.table.substring(0,3);
    const alias = prefix + (this.aliasIndex++);
    this.tableMap[alias] = table;
    return alias;
  }

/*  private getField(table: any, field: string) {
    if (table.map.fields[field])
      return table.map.fields[field]

    console.log("Unknown field [" + field + "] on table [" + table.map.table + "]");
    return "<UNKNOWN>";
  }*/

  private queryToSql(qry: SqlQuery) {

    let sql = "";

    if (qry.withs && qry.withs.length > 0) {
      sql += "WITH ";
      sql += qry.withs.join(",\n")
    }

    sql += "\nSELECT ";

    if (qry.selects && qry.selects.length > 0)
      sql += qry.selects.join(", ")
    else
      sql += qry.alias + ".id"

    sql += "\nFROM " + qry.from;

    if (qry.joins && qry.joins.length > 0)
      sql += "\n" + qry.joins.join("\n")

    if (qry.wheres && qry.wheres.length > 0)
      sql += "\nWHERE " + qry.wheres.join("\n" + qry.whereBool + " ")

    return sql;
  }
}
