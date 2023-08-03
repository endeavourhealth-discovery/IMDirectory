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
      qry.withs.push(subQry.alias + " AS (" + subQry.toSql(2) + "\n)")
      qry.joins.push("JOIN " + subQry.alias + " ON " + subQry.alias + ".id = " + qry.alias + ".id")
    }

/*
    console.log("================================================================")
    console.log(qry)
    console.log("================================================================")
*/

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
    } else if (match.nodeRef && match.nodeRef != qry.model) {
      qry = new SqlQuery(match.nodeRef, match.variable);
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
        this.wrapMatchPartition(qry, match, match.orderBy[0]);
      } else {
        throw new Error("MULTIPLE ORDER PARTITIONS NOT SUPPORTED\n" + JSON.stringify(match.orderBy, null, 2))
      }
    }

    return qry;
  }

  private wrapMatchPartition(qry: SqlQuery, match: Match, order: OrderLimit) {
    const inner = qry.clone(qry.alias + "_inner")

    const innerSql = qry.alias + "_inner AS (" + inner.toSql(2) + ")";

    const partition = new SqlQuery(qry.alias + "_inner", qry.alias + "_part");
    const partField = "patient";

    const dir = order.direction.toUpperCase().startsWith("DESC") ? "DESC" : "ASC";

    partition.selects.push("*", "ROW_NUMBER() OVER (PARTITION BY " + partField + " ORDER BY " + partition.getFieldName(order["@id"]) + " " + dir + ") AS rn");

    qry.initialize(qry.alias + "_part", qry.alias);
    qry.withs.push(innerSql)
    qry.withs.push(partition.alias + " AS (" + partition.toSql(2) + "\n)");
    qry.wheres.push("rn = 1")
  }

  private convertMatchSet(qry: SqlQuery, match: Match) {
    // JOIN qry_results ON qry = match[@set] AND id = qry.id
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
      qry.withs.push(subQuery.alias + " AS (" + subQuery.toSql(2) + "\n)")

      // TODO: Differing qry/subqry types (rel joins)
      if (subQuery.model == qry.model)
        qry.joins.push(joiner + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id")
      else {
        const rel = subQuery.getRelationshipTo(qry.model)
        qry.joins.push(joiner + subQuery.alias + " ON " + subQuery.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField)
      }

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
    } else if (property.value) {
      this.convertMatchPropertyValue(qry, property);
    } else {
      throw new Error("UNHANDLED PROPERTY PATTERN\n" + JSON.stringify(property, null, 2))
    }
  }

  private convertMatchPropertyRange(qry: SqlQuery, property: Property) {
    if (!property.range) {
      throw new Error("INVALID MatchPropertyRange\n" + JSON.stringify(property, null, 2))
    }

    // const f = qry.getField(property["@id"] as string);

    if ("date" == qry.getFieldType(property["@id"] as string)) {
      if (property.range.from)
        qry.wheres.push(this.convertMatchPropertyRangeNode(property.range.from) + " " + qry.getFieldName(property["@id"] as string))

      if (property.range.to)
        qry.wheres.push(this.convertMatchPropertyRangeNode(property.range.to) + " " + qry.getFieldName(property["@id"] as string))
    } else {
      throw new Error("UNHANDLED PROPERTY FIELD TYPE\n" + JSON.stringify(property, null, 2))
    }
  }

  private convertMatchPropertyRangeNode(range: Assignable): string {
    return "(now() - INTERVAL '" + range.value + (range.unit ? " " + range.unit : "") + "') " + range.operator;
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
    qry.withs.push(subQuery.alias + " AS (" + subQuery.toSql(2) + "\n)")

    if (qry.model == subQuery.model)
      qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id")
    else {
      const rel = subQuery.getRelationshipTo(qry.model);
      qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField)
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
      else if(pIn['@set'])
        inList.push("SET [" + pIn['@set'] +"]")
      else {
        throw new Error("UNHANDLED 'IN' ENTRY\n" + JSON.stringify(pIn, null, 2))
      }
    }

    // OPTIMIZATION
    // TODO: Correct SET handling
    if (inList.length == 1)
      qry.wheres.push(qry.getFieldName(property["@id"]) + " = '" + inList.join("', '") + "'");
    else
      qry.wheres.push(qry.getFieldName(property["@id"]) + " IN ('" + inList.join("', '") + "')");
  }

  private convertMatchPropertyRelative(qry: SqlQuery, property: Property) {
    if (!property["@id"] || !property.relativeTo) {
      throw new Error("INVALID MatchPropertyRelative\n" + JSON.stringify(property, null, 2))
    }

    // Different comparison based on type (date/number/string)
    // const f = qry.getField(property["@id"]);
    if (property.relativeTo.parameter)
      qry.wheres.push(qry.getFieldName(property["@id"]) + " " + property.operator + " " + this.convertMatchPropertyRelativeTo(qry, property, property.relativeTo.parameter));
    else if (property.relativeTo.nodeRef) {
      // Include implied join on noderef
      qry.joins.push("JOIN " + property.relativeTo.nodeRef + " ON " + property.relativeTo.nodeRef + ".id = " + qry.alias + ".id")
      qry.wheres.push(qry.getFieldName(property["@id"]) + " " + property.operator + " " + this.convertMatchPropertyRelativeTo(qry, property, qry.getFieldName(property.relativeTo?.["@id"] as string, property.relativeTo.nodeRef)));
    } else {
      throw new Error("UNHANDLED RELATIVE COMPARISON\n" + JSON.stringify(property, null, 2));
    }
  }

  private convertMatchPropertyRelativeTo(qry: SqlQuery, property: Property, field:String) {
    if ("date" == qry.getFieldType(property["@id"] as string))
      if (property.value)
        return "(" + field + " + INTERVAL '" + property.value + " " + property.unit + "')";
      else
        return field;
    else {
      throw new Error("UNHANDLED RELATIVE TYPE\n" + JSON.stringify(property, null, 2));
    }
  }

  private convertMatchPropertyValue(qry: SqlQuery, property: Property) {
    if (!property["@id"] || !property.value) {
      throw new Error("INVALID MatchPropertyValue\n" + JSON.stringify(property, null, 2))
    }

    qry.wheres.push(qry.getFieldName(property["@id"]) + " " + property.operator + " " + property.value);
  }
}
