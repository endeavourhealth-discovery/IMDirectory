import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import mapData from "./IMQtoSQL.json"

export class IMQtoSQL {
  private aliasIndex = 0;
  private tableMap: any = {};
  public convert(definition: Query) {
    if (!definition.match || definition.match.length <= 0 || !definition.match[0]["@type"]) {
      console.error("Query must have a match list, the first of which must be a focus type")
      return;
    }

    const focus = this.focusTable(definition.match[0]["@type"]);

    const qry = {
      withs: [],
      joins: [],
      wheres: []
    };

    console.log(JSON.stringify(definition, null, 2))

    this.convertMatches(qry, focus, definition.match.slice(1));

    console.log("================================================================")

    console.log(qry)

    console.log("================================================================")

    let sql = "WITH ";
    sql += qry.withs.join(",\n")

    sql += "\nSELECT t0.id"
    sql += "\nFROM " + focus.map.table + " AS " + focus.alias;

    if (qry.joins && qry.joins.length > 0)
    sql += "\nLEFT JOIN " + qry.joins.join("\nLEFT JOIN ")

    if (qry.wheres && qry.wheres.length > 0)
      sql += "\nWHERE " + qry.wheres.join("\nAND ")

    return sql;
  }

  private focusTable(tableType: string) : any {

    const map = (mapData.typeTables as any)[tableType];

    if (!map) {
      console.log("Unmapped table " + tableType);
      return;
    }

    const table: any = { map: map };
    table.alias = this.getAlias(table);

    return table;
  }

  private convertMatches(qry: any, focus: any, matches: Match[]) {
    for(const match of matches) {
      this.convertMatch(qry, focus, match);
    }
  }

  private convertMatch(qry: any, focus: any, match: Match) {
    if (match.path && match.path['@id'] && match.path.node && match.path.node['@type']) {
      const newFocus = this.focusTable(match.path.node['@type'])
      // TODO: Map based join between table types
      qry.joins.push(newFocus.map.table + " AS " + newFocus.alias + " ON " + newFocus.alias + ".patient = " + focus.alias + ".id")
      focus = newFocus;
    } else if (match.nodeRef) {
      console.log("SWITCH FOCUS TO " + match.nodeRef)
    }

    if (match["@set"]) this.convertSet(qry, focus, match)
    else if (match.boolMatch) this.convertBoolGroup(qry, focus, match)
    else if (match.where) this.convertWheres(qry, focus, match)
    else {
      console.log("Unrecognised MATCH pattern")
      console.log(match);
    }
  }

  private convertSet(qry: any, focus: any, match: Match) {
    const alias = this.getAlias(focus);
    qry.withs.push(
      alias + " AS (SELECT id FROM set_member WHERE set = '" + match["@set"] + "')"
    );

    qry.joins.push(
      alias + " ON " + alias + ".id = " + focus.alias + ".id"
    )

    qry.wheres.push(
      alias + ".id IS NOT NULL"
    )
  }

  private convertBoolGroup(qry:any, focus: any, match: Match) {
    if (!match.match)
      return;

    const grp = {
      withs: [],
      joins: [],
      wheres: []
    };

    for(const subMatch of match.match) {
      this.convertMatch(grp, focus, subMatch);
    }

    qry.withs.push(...grp.withs);
    qry.joins.push(...grp.joins);
    qry.wheres.push(
      "(" + grp.wheres.join(" " + match.boolMatch + " ") + ")"
    )
  }

  private convertWheres(qry: any, focus: any, match: Match) {
    if (!match.where || match.where.length === 0)
      return;

    for(const w of match.where) {
      this.convertWhere(qry, focus, w)
    }
  }

  private convertWhere(qry: any, focus: any, where: Where) {
    if (where["@id"] && where.range) this.convertWhereRange(qry, focus, where);
    else if (where["@id"] && where.in) this.convertWhereIn(qry, focus, where);
    else if (where.relativeTo) this.convertWhereRelative(qry, focus, where);
    else if (where['@id'] && where.value) this.convertWhereValue(qry, focus, where);
    else {
      console.log("Unrecognised WHERE pattern")
      console.log(where)
    }
  }

  private convertWhereRange(qry: any, focus: any, where: Where) {
    if (!where.range || !where["@id"])
      return;

    const alias = this.getAlias(focus);

    const fieldName = this.getField(focus, where["@id"]);

    if ("age" == fieldName) {
      qry.withs.push(
        alias + " AS (SELECT id FROM " + focus.map.table + " WHERE date_of_birth BETWEEN (now() - INTERVAL '" + where.range.from.value + " " + where.range.from.unit + "') AND (now() - INTERVAL '" + where.range.to.value + " " + where.range.to.unit + "'))"
      )
    } else {
      qry.withs.push(
        alias + " AS (SELECT id FROM " + focus.map.table + " WHERE " + fieldName + " BETWEEN " + where.range.from.value + " AND " + where.range.to.value + ")"
      )
    }

    qry.joins.push(
      alias + " ON " + alias + ".id = " + focus.alias + ".id"
    )

    qry.wheres.push(
      alias + ".id IS NOT NULL"
    )
  }

  private convertWhereIn(qry: any, focus: any, where: Where) {
    if (!where.in || where.in.length === 0)
      return;

    let inList = [];
    for(const i of where.in) {
      if (i["@id"]) inList.push(i["@id"])
      else if (i["@set"]) inList.push(i["@set"])
      else {
        console.log("Unrecognised IN pattern")
        console.log(i)
      }
    }

    const alias = this.getAlias(focus);
    qry.withs.push(
      alias + " AS (SELECT id FROM " + focus.map.table + " WHERE " + this.getField(focus, where["@id"] as string) + " IN ('" + inList.join("', '") + "'))"
    )

    qry.joins.push(
      alias + " ON " + alias + ".id = " + focus.alias + ".id"
    )

    // TODO: reverse for exclusions
    qry.wheres.push(
      alias + ".id IS NOT NULL"
    )
  }

  private convertWhereRelative(qry: any, focus: any, where: Where) {
    if (!where.relativeTo)
      return;

    if (where.relativeTo.nodeRef) {
      qry.wheres.push(
        focus.alias + "." + this.getField(focus, where['@id'] as string) + " " + where.operator + " " + where.relativeTo.nodeRef + "." + where.relativeTo["@id"]
      )
    } else if (where.relativeTo.parameter) {
      qry.wheres.push(
        focus.alias + "." + this.getField(focus, where['@id'] as string) + " " + where.operator + " " + where.relativeTo.parameter
      )
    } else {
      console.log("Unrecognised RELATIVE_TO condition")
      console.log(where.relativeTo);
    }
  }

  private convertWhereValue(qry: any, focus: any, where: Where) {
    if (!where['@id'] && !where.value)
      return;

    qry.wheres.push(
      focus.alias + "." + this.getField(focus, where['@id'] as string) + " " + where.operator + " " + where.value
    )
  }

  private getAlias(table: any) {
    const alias = "t" + (this.aliasIndex++);
    this.tableMap[alias] = table;
    return alias;
  }

  private getField(table: any, field: string) {
    if (table.map.fields[field])
      return table.map.fields[field]

    console.log("Unknown field [" + field + "] on table [" + table.map.table + "]");
    return "<UNKNOWN>";
  }
}
