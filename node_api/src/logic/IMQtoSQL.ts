import { Match, Query, Property } from "@im-library/interfaces/AutoGen";
import mapData from "./IMQtoSQL.json"

export class IMQtoSQL {
  private aliasIndex = 0;
  private tableMap: any = {};
  private variable?: string = undefined;

  public convert(definition: Query) {
    if (!definition["@type"]) {
      console.error("Query must have a focus type")
      return;
    }

    const focus = this.focusTable(definition["@type"]);

    const qry = {
      withs: [],
      joins: [],
      wheres: []
    };

    if (definition.match)
      this.convertMatches(qry, focus, definition.match);

    console.log("================================================================")

    console.log(qry)

    console.log("================================================================")

    let sql = "WITH ";
    sql += qry.withs.join(",\n")

    sql += "\nSELECT " + focus.alias + ".id"
    sql += "\nFROM " + focus.map.table + " AS " + focus.alias;

    if (qry.joins && qry.joins.length > 0)
    sql += "\nLEFT JOIN " + qry.joins.join("\nLEFT JOIN ")

    if (qry.wheres && qry.wheres.length > 0)
      sql += "\nWHERE " + qry.wheres.join("\nAND ")

    return sql;
  }

  private focusTable(tableType: string) : any {

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

  private convertMatches(qry: any, focus: any, matches: Match[]) {
    for(const match of matches) {
      this.convertMatch(qry, focus, match);
    }
  }

  private convertMatch(qry: any, focus: any, match: Match) {
    if (match.variable)
      this.variable = match.variable;

    if (match.nodeRef)
      focus = this.tableMap[match.nodeRef];

    if (match.bool)
      this.convertBoolGroup(qry, focus, match);
    else if (match["@set"])
      this.convertSet(qry, focus, match);
    else if (match.property)
      this.convertProperties(qry, focus, match);
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
    if (!match.match && !match.property) {
      console.log("Empty bool group")
      return;
    }

    const grp = {
      withs: [],
      joins: [],
      wheres: []
    };

    if (match.match) {
      for (const subMatch of match.match) {
        this.convertMatch(grp, focus, subMatch);
      }
    }

    this.convertProperties(grp, focus, match);

    if (grp.wheres.length == 0 && grp.withs.length == 0 && grp.joins.length == 0) {
      console.log("Error converting bool group")
      console.log(match)
    }

    qry.withs.push(...grp.withs);
    qry.joins.push(...grp.joins);
    qry.wheres.push(
      "(" + grp.wheres.join(" " + match.bool + " ") + ")"
    )
  }

  private convertProperties(qry: any, focus: any, match: Match) {
    if (!match.property || match.property.length === 0)
      return;

    for(const prop of match.property) {
      this.convertProperty(qry, focus, prop)
    }
  }

  private convertProperty(qry: any, focus: any, property: Property) {
    if (property["@id"] && property.range) this.convertPropertyRange(qry, focus, property);
    else if (property["@id"] && property.in) this.convertPropertyIn(qry, focus, property);
    else if (property.relativeTo) this.convertPropertyRelative(qry, focus, property);
    else if (property['@id'] && property.value) this.convertPropertyValue(qry, focus, property);
    else if (property['@id'] && property.match) this.convertPropertySubmatch(qry, focus, property);
    else {
      console.log("Unrecognised PROPERTY pattern")
      console.log(property)
    }
  }

  private convertPropertyRange(qry: any, focus: any, property: Property) {
    if (!property.range || !property["@id"])
      return;

    const alias = this.getAlias(focus);

    const fieldName = this.getField(focus, property["@id"]);

    if ("age" == fieldName) {
      qry.withs.push(
        alias + " AS (SELECT id FROM " + focus.map.table + " WHERE date_of_birth BETWEEN (now() - INTERVAL '" + property.range.from.value + " " + property.range.from.unit + "') AND (now() - INTERVAL '" + property.range.to.value + " " + property.range.to.unit + "'))"
      )
    } else {
      qry.withs.push(
        alias + " AS (SELECT id FROM " + focus.map.table + " WHERE " + fieldName + " BETWEEN " + property.range.from.value + " AND " + property.range.to.value + ")"
      )
    }

    qry.joins.push(
      alias + " ON " + alias + ".id = " + focus.alias + ".id"
    )

    qry.wheres.push(
      alias + ".id IS NOT NULL"
    )
  }

  private convertPropertyIn(qry: any, focus: any, property: Property) {
    if (!property.in || property.in.length === 0)
      return;

    let inList = [];
    for(const i of property.in) {
      if (i["@id"]) inList.push(i["@id"])
      else if (i["@set"]) inList.push(i["@set"])
      else {
        console.log("Unrecognised IN pattern")
        console.log(i)
      }
    }

    // const alias = this.getAlias(focus);
    const alias = focus.alias;
    qry.withs.push(
      alias + " AS (SELECT id FROM " + focus.map.table + " WHERE " + this.getField(focus, property["@id"] as string) + " IN ('" + inList.join("', '") + "'))"
    )

/*    qry.joins.push(
      alias + " ON " + alias + ".id = " + focus.alias + ".id"
    )*/

    // TODO: reverse for exclusions
    qry.wheres.push(
      alias + ".id IS NOT NULL"
    )
  }

  private convertPropertyRelative(qry: any, focus: any, property: Property) {
    if (!property.relativeTo)
      return;

    if (property.relativeTo.nodeRef) {
      qry.wheres.push(
        focus.alias + "." + this.getField(focus, property['@id'] as string) + " " + property.operator + " " + property.relativeTo.nodeRef + "." + property.relativeTo["@id"]
      )
    } else if (property.relativeTo.parameter) {
      qry.wheres.push(
        focus.alias + "." + this.getField(focus, property['@id'] as string) + " " + property.operator + " " + property.relativeTo.parameter
      )
    } else {
      console.log("Unrecognised RELATIVE_TO condition")
      console.log(property.relativeTo);
    }
  }

  private convertPropertyValue(qry: any, focus: any, property: Property) {
    if (!property['@id'] && !property.value)
      return;

    qry.wheres.push(
      focus.alias + "." + this.getField(focus, property['@id'] as string) + " " + property.operator + " " + property.value
    )
  }

  private convertPropertySubmatch(qry: any, focus: any, property: Property) {
    const submatch = property.match;
    if (submatch && submatch["@type"]) {
      if (property.variable)
        this.variable = property.variable;

      const newFocus = this.focusTable(submatch["@type"]);

      // TODO: Map based join between table types
      qry.joins.push(newFocus.map.table + " AS " + newFocus.alias + " ON " + newFocus.alias + ".patient = " + focus.alias + ".id")

      focus = newFocus;

      this.convertMatch(qry, focus, submatch);
    } else {
      console.log("Urecognised property submatch")
      console.log(property)
    }
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
}
