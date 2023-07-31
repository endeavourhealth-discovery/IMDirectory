import { Match, Query, Property, Assignable, OrderLimit } from "@im-library/interfaces/AutoGen";
import { SqlQuery } from "@/model/sql/SqlQuery";

export class IMQtoSQL {

  public convert(definition: Query) {
    if (!definition["@type"]) {
      console.error("Query must have a main (model) type")
      return;
    }

    if (!definition.match) {
      console.error("Query must have at least one match");
      return;
    }

    const qry = new SqlQuery(definition["@type"]);

    const subQueries: SqlQuery[] = this.convertMatches(qry, definition.match);

    for(const subQry of subQueries) {
      qry.withs.push(...subQry.withs);
      subQry.withs = [];
      const subSql = subQry.toSql();
      qry.withs.push(subQry.alias + " AS (" + subSql + "\n)")
      qry.joins.push("JOIN " + subQry.alias + " ON " + subQry.alias + ".id = " + qry.alias + ".id -- SQ")
    }

/*    console.log("================================================================")
    console.log(qry)*/
    console.log("================================================================")

    return qry.toSql();
  }

  private convertMatches(qry: SqlQuery, matches: Match[]): SqlQuery[] {
    const result: SqlQuery[] = [];
    for(const match of matches) {
      const subQry = this.convertMatch(qry, match);
      result.push(subQry);
    }

    return result;
  }

  private convertMatch(qry: SqlQuery, match: Match): SqlQuery {

    if (match["@type"] && match["@type"] != qry.model) {
      qry = new SqlQuery(match["@type"], match.variable);
    } else
      qry = new SqlQuery(qry.model, match.variable);

    if (match["@set"]) {
      this.convertMatchSet(qry, match);
    } else if (match.bool) {
      if (match.match && match.match.length > 0)
        this.convertMatchBoolSubMatch(qry, match);
      else if (match.property && match.property.length > 0)
        this.convertMatchProperties(qry, match, match.bool);
      else {
        throw new Error("UNHANDLED BOOL MATCH PATTERN\n" + JSON.stringify(match, null, 2))
      }
    } else if (match.property && match.property.length > 0) {
      this.convertMatchProperties(qry, match);
    } else {
      throw new Error("UNHANDLED MATCH PATTERN\n" + JSON.stringify(match, null, 2))
    }

    if (match.orderBy) {
      if (match.orderBy.length == 1) {
        return this.wrapMatchPartition(qry, match, match.orderBy[0]);
      } else {
        throw new Error("MULTIPLE ORDER PARTITIONS NOT SUPPORTED\n" + JSON.stringify(match.orderBy, null, 2))
      }
    }

    return qry;
  }

  private wrapMatchPartition(qry: SqlQuery, match: Match, order: OrderLimit): SqlQuery {
    const p = new SqlQuery(qry.alias, qry.alias + "_part");
    const partField = "patient";

    p.selects.push("*", "ROW_NUMBER() OVER (PARTITION BY " + partField + " ORDER BY " + qry.getField(order["@id"]).field + " " + order.direction + ") AS rn");

    const l = new SqlQuery(p.alias, p.alias + "_limit");
    l.withs.push(qry.alias + " AS (" + qry.toSql() + ")")
    l.withs.push(p.alias + " AS (" + p.toSql() + ")");
    l.wheres.push("rn = 1")

    console.log("ORDER BY PARTITION");
    console.log(match.orderBy);

    return l;
  }

  private convertMatchSet(qry: SqlQuery, match: Match) {
    qry.wheres.push("1 = 1 -- in query results " + match["@set"])
  }

  private convertMatchBoolSubMatch(qry: SqlQuery, match: Match) {
    if (!match.bool || !match.match) {
      throw new Error("INVALID MatchBoolSubMatch\n" + JSON.stringify(match, null, 2))
    }

    qry.whereBool = match.bool ? match.bool.toUpperCase() : "AND";

    const joiner = ("OR" == match.bool.toUpperCase()) ? "LEFT JOIN " : "JOIN ";

    for (const subMatch of match.match) {
      const subQuery = this.convertMatch(qry, subMatch);

      qry.withs.push(...subQuery.withs);

      subQuery.withs = [];
      const subSql = subQuery.toSql();
      qry.withs.push(subQuery.alias + " AS (" + subSql + "\n)")
      qry.joins.push(joiner + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id -- MBSM")

      if ("OR" == qry.whereBool)
        qry.wheres.push(subQuery.alias + ".id IS NOT NULL")
    }
  }

  private convertMatchProperties(qry: SqlQuery, match: Match, bool = "AND") {
    if (!match.property) {
      throw new Error("INVALID MatchProperty\n" + JSON.stringify(match, null, 2))
    }

    for(const property of match.property) {
      this.convertMatchProperty(qry, property)
    }
  }

  private convertMatchProperty(qry: SqlQuery, property: Property) {
    if (property.range) {
      this.convertMatchPropertyRange(qry, property);
    } else if (property.match) {
      this.convertMatchPropertySubMatch(qry, property);
    } else if (property.in) {
      this.convertMatchPropertyIn(qry, property);
    } else if (property.relativeTo) {
      this.convertMatchPropertyRelative(qry, property);
    } else {
      throw new Error("UNHANDLED PROPERTY PATTERN\n" + JSON.stringify(property, null, 2))
    }
  }

  private convertMatchPropertyRange(qry: SqlQuery, property: Property) {
    if (!property.range) {
      throw new Error("INVALID MatchPropertyRange\n" + JSON.stringify(property, null, 2))
    }

    const f = qry.getField(property["@id"] as string);

    if ("date" == f.type) {
      if (property.range.from)
        qry.wheres.push(this.convertMatchPropertyRangeNode(property.range.from) + " " + qry.alias + "." + f.field)

      if (property.range.to)
        qry.wheres.push(this.convertMatchPropertyRangeNode(property.range.to) + " " + qry.alias + "." + f.field)
    } else {
      throw new Error("UNHANDLED PROPERTY FIELD TYPE\n" + JSON.stringify(property, null, 2))
    }
  }

  private convertMatchPropertyRangeNode(range: Assignable): string {
    return "(now() - INTERVAL '" + range.value + (range.unit ? " " + range.unit : "") + "') " + range.operator + " ";
  }

  private convertMatchPropertySubMatch(qry: SqlQuery, property: Property) {
    if (!property.match) {
      throw new Error("INVALID MatchPropertySubMatch\n" + JSON.stringify(property, null, 2))
    }

    if (!property.match.variable)
      property.match.variable = qry.alias + "_sub1";

    const subQuery = this.convertMatch(qry, property.match);

    qry.withs.push(...subQuery.withs)
    subQuery.withs = [];
    const subSql = subQuery.toSql();
    qry.withs.push(subQuery.alias + " AS (" + subSql + "\n)")

    if (qry.model == subQuery.model)
      qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id -- MPSM ==")
    else {
      const rel = subQuery.getRelationshipTo(qry.model);
      qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField + " -- MPSM !=")
    }
  }

  private convertMatchPropertyIn(qry: SqlQuery, property: Property) {
    if (!property["@id"])
      throw new Error("INVALID PROPERTY\n" + JSON.stringify(property, null, 2))

    if (!property.in) {
      throw new Error("INVALID MatchPropertyIn\n" + JSON.stringify(property, null, 2))
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

    // OPTIMIZATION
    if (inList.length == 1)
      qry.wheres.push(qry.alias + "." + qry.getField(property["@id"]).field + " = '" + inList.join("', '") + "'");
    else
      qry.wheres.push(qry.alias + "." + qry.getField(property["@id"]).field + " IN ('" + inList.join("', '") + "')");
  }

  private convertMatchPropertyRelative(qry: SqlQuery, property: Property) {
    if (!property["@id"] || !property.relativeTo) {
      throw new Error("INVALID MatchPropertyRelative\n" + JSON.stringify(property, null, 2))
    }

    // Different comparison based on type (date/number/string)
    const f = qry.getField(property["@id"]);

    if ("date" == f.type)
      qry.wheres.push(qry.alias + "." + f.field + " " + property.operator + " (" + property.relativeTo.parameter + " + INTERVAL '" + property.value + " " + property.unit +"')");
    else {
      throw new Error("UNHANDLED RELATIVE TYPE\n" + JSON.stringify(property, null, 2))
    }
  }
}
