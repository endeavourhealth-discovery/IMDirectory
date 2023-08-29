import { Match, Query, Property, Assignable, OrderLimit } from "@im-library/interfaces/AutoGen";
import { SqlQuery } from "@/model/sql/SqlQuery";

export class IMQtoSQL {
  public convert(definition: Query): string {
    if (!definition.typeOf) {
      throw new Error("Query must have a main (model) type");
    }

    if (!definition.match) {
      throw new Error("Query must have at least one match");
    }

    try {
      const qry = new SqlQuery(definition.typeOf["@id"]!);

      for (const match of definition.match) {
        const subQry = this.convertMatchToQuery(qry, match);
        qry.withs.push(...subQry.withs);
        subQry.withs = [];
        qry.withs.push(subQry.alias + " AS (" + subQry.toSql(2) + "\n)");

        const joiner = match.exclude ? "LEFT JOIN " : "JOIN ";
        if (match.exclude) qry.wheres.push(subQry.alias + ".id IS NULL");

        if (qry.model == subQry.model) {
          qry.joins.push(joiner + subQry.alias + " ON " + subQry.alias + ".id = " + qry.alias + ".id");
        } else {
          const rel = subQry.getRelationshipTo(qry.model);
          qry.joins.push(joiner + subQry.alias + " ON " + subQry.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField);
        }
      }
      return qry.toSql();
    } catch (e) {
      if (e instanceof Error) return e.toString();
      else return "Unknown Error";
    }
  }

  private convertMatchToQuery(parent: SqlQuery, match: Match): SqlQuery {
    const qry = this.createMatchQuery(match, parent);

    this.convertMatch(match, qry);

    if (match.orderBy) {
      if (match.orderBy.length == 1) {
        this.wrapMatchPartition(qry, match.orderBy[0]);
      } else {
        throw new Error("MULTIPLE ORDER PARTITIONS NOT SUPPORTED\n" + JSON.stringify(match.orderBy, null, 2));
      }
    }

    return qry;
  }

  private createMatchQuery(match: Match, qry: SqlQuery) {
    if (match.typeOf?.["@id"] && match.typeOf["@id"] != qry.model) {
      return new SqlQuery(match.typeOf["@id"], match.variable);
    } else if (match.nodeRef && match.nodeRef != qry.model) {
      return new SqlQuery(match.nodeRef, match.variable);
    } else return new SqlQuery(qry.model, match.variable);
  }

  private convertMatch(match: Match, qry: SqlQuery) {
    if (match.inSet) {
      this.convertMatchSet(qry, match);
    } else if (match.bool) {
      if (match.match && match.match.length > 0) this.convertMatchBoolSubMatch(qry, match);
      else if (match.property && match.property.length > 0) this.convertMatchProperties(qry, match);
      else {
        throw new Error("UNHANDLED BOOL MATCH PATTERN\n" + JSON.stringify(match, null, 2));
      }
    } else if (match.property && match.property.length > 0) {
      this.convertMatchProperties(qry, match);
    } else {
      throw new Error("UNHANDLED MATCH PATTERN\n" + JSON.stringify(match, null, 2));
    }
  }

  private wrapMatchPartition(qry: SqlQuery, order: OrderLimit) {
    if (!order["@id"]) throw new Error("ORDER MUST HAVE A FIELD SPECIFIED\n" + JSON.stringify(order, null, 2));

    const inner = qry.clone(qry.alias + "_inner");

    const innerSql = qry.alias + "_inner AS (" + inner.toSql(2) + ")";

    const partition = new SqlQuery(qry.alias + "_inner", qry.alias + "_part");
    const partField = "patient";

    const dir = order.direction?.toUpperCase().startsWith("DESC") ? "DESC" : "ASC";

    partition.selects.push("*", "ROW_NUMBER() OVER (PARTITION BY " + partField + " ORDER BY " + partition.getFieldName(order["@id"]) + " " + dir + ") AS rn");

    qry.initialize(qry.alias + "_part", qry.alias);
    qry.withs.push(innerSql);
    qry.withs.push(partition.alias + " AS (" + partition.toSql(2) + "\n)");
    qry.wheres.push("rn = 1");
  }

  private convertMatchSet(qry: SqlQuery, match: Match) {
    if (!match.inSet) throw new Error("MatchSet must have at least one element\n" + JSON.stringify(match, null, 2));
    const rsltTbl = qry.alias + "_rslt";
    qry.joins.push("JOIN query_result " + rsltTbl + " ON " + rsltTbl + ".id = " + qry.alias + ".id");
    qry.wheres.push(rsltTbl + ".iri = '" + match.inSet[0]["@id"] + "'");
  }

  private convertMatchBoolSubMatch(qry: SqlQuery, match: Match) {
    if (!match.bool || !match.match) {
      throw new Error("INVALID MatchBoolSubMatch\n" + JSON.stringify(match, null, 2));
    }

    qry.whereBool = match.bool ? match.bool.toUpperCase() : "AND";

    const joiner = "OR" == match.bool.toUpperCase() ? "LEFT JOIN " : "JOIN ";

    for (const subMatch of match.match) {
      const subQuery = this.convertMatchToQuery(qry, subMatch);

      qry.withs.push(...subQuery.withs);

      subQuery.withs = [];
      qry.withs.push(subQuery.alias + " AS (" + subQuery.toSql(2) + "\n)");

      if (subQuery.model == qry.model) qry.joins.push(joiner + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id");
      else {
        const rel = subQuery.getRelationshipTo(qry.model);
        qry.joins.push(joiner + subQuery.alias + " ON " + subQuery.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField);
      }

      if ("OR" == qry.whereBool) qry.wheres.push(subQuery.alias + ".id IS NOT NULL");
    }
  }

  private convertMatchProperties(qry: SqlQuery, match: Match) {
    if (!match.property) {
      throw new Error("INVALID MatchProperty\n" + JSON.stringify(match, null, 2));
    }

    for (const property of match.property) {
      this.convertMatchProperty(qry, property);
    }
  }

  private convertMatchProperty(qry: SqlQuery, property: Property) {
    if (property.is) {
      this.convertMatchPropertyIs(qry, property);
    } else if (property.range) {
      this.convertMatchPropertyRange(qry, property);
    } else if (property.match) {
      this.convertMatchPropertySubMatch(qry, property);
    } else if (property.inSet) {
      this.convertMatchPropertyInSet(qry, property);
    } else if (property.relativeTo) {
      this.convertMatchPropertyRelative(qry, property);
    } else if (property.value) {
      this.convertMatchPropertyValue(qry, property);
    } else {
      throw new Error("UNHANDLED PROPERTY PATTERN\n" + JSON.stringify(property, null, 2));
    }
  }

  private convertMatchPropertyIs(qry: SqlQuery, property: Property) {
    if (!property.is) {
      throw new Error("INVALID MatchPropertyIs\n" + JSON.stringify(property, null, 2));
    }

    const direct: string[] = [];
    const ancestors: string[] = [];
    const descendants: string[] = [];
    const descendantsSelf: string[] = [];

    for (const pIs of property.is) {
      if (pIs["@id"]) {
        if (pIs.ancestorsOf) ancestors.push(pIs["@id"]);
        else if (pIs.descendantsOf) descendants.push(pIs["@id"]);
        else if (pIs.descendantsOrSelfOf) descendantsSelf.push(pIs["@id"]);
        else direct.push(pIs["@id"]);
      } else {
        throw new Error("UNHANDLED 'IN' ENTRY\n" + JSON.stringify(pIs, null, 2));
      }
    }

    if (direct.length > 0) {
      let where = qry.getFieldName(property["@id"]!);

      if (direct.length == 1) where += " = '" + direct[0] + "'\n";
      else where += " IN ('" + direct.join("', '") + "')\n";

      qry.wheres.push(where);
    }

    if (descendants.length > 0) {
      qry.joins.push("JOIN tct ON tct.child = " + qry.getFieldName(property["@id"]!));
      qry.wheres.push(descendants.length == 1 ? "tct.iri = '" + descendants[0] + "'" : "tct.iri IN ('" + descendants.join("', '") + "') AND tct.level > 0");
    }

    if (descendantsSelf.length > 0) {
      qry.joins.push("JOIN tct ON tct.child = " + qry.getFieldName(property["@id"]!));
      qry.wheres.push(descendantsSelf.length == 1 ? "tct.iri = '" + descendantsSelf[0] + "'" : "tct.iri IN ('" + descendantsSelf.join("', '") + "')");
    }

    if (ancestors.length > 0) {
      qry.joins.push("JOIN tct ON tct.iri = " + qry.getFieldName(property["@id"]!));
      qry.wheres.push(ancestors.length == 1 ? "tct.child = '" + ancestors[0] + "'" : "tct.chilf IN ('" + ancestors.join("', '") + "') AND tct.level > 0");
    }
  }

  private convertMatchPropertyRange(qry: SqlQuery, property: Property) {
    if (!property.range) {
      throw new Error("INVALID MatchPropertyRange\n" + JSON.stringify(property, null, 2));
    }

    if ("date" == qry.getFieldType(property["@id"] as string)) {
      if (property.range.from) qry.wheres.push(this.convertMatchPropertyRangeNode(property.range.from) + " " + qry.getFieldName(property["@id"] as string));

      if (property.range.to) qry.wheres.push(this.convertMatchPropertyRangeNode(property.range.to) + " " + qry.getFieldName(property["@id"] as string));
    } else {
      throw new Error("UNHANDLED PROPERTY FIELD TYPE\n" + JSON.stringify(property, null, 2));
    }
  }

  private convertMatchPropertyRangeNode(range: Assignable): string {
    return "(now() - INTERVAL '" + range.value + (range.unit ? " " + range.unit : "") + "') " + range.operator;
  }

  private convertMatchPropertySubMatch(qry: SqlQuery, property: Property) {
    if (!property.match) {
      throw new Error("INVALID MatchPropertySubMatch\n" + JSON.stringify(property, null, 2));
    }

    if (!property.match.variable) property.match.variable = qry.getAlias(qry.alias + "_sub");

    const subQuery = this.convertMatchToQuery(qry, property.match);

    qry.withs.push(...subQuery.withs);
    subQuery.withs = [];
    qry.withs.push(subQuery.alias + " AS (" + subQuery.toSql(2) + "\n)");

    if (qry.model == subQuery.model) qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id");
    else {
      const rel = subQuery.getRelationshipTo(qry.model);
      qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField);
    }
  }

  private convertMatchPropertyInSet(qry: SqlQuery, property: Property) {
    if (!property["@id"]) throw new Error("INVALID PROPERTY\n" + JSON.stringify(property, null, 2));

    if (!property.inSet) {
      throw new Error("INVALID MatchPropertyIn\n" + JSON.stringify(property, null, 2));
    }

    const inList = [];

    for (const pIn of property.inSet) {
      if (pIn["@id"]) inList.push(pIn["@id"]);
      else {
        throw new Error("UNHANDLED 'IN' ENTRY\n" + JSON.stringify(pIn, null, 2));
      }
    }

    // OPTIMIZATION
    const mmbrTbl = qry.alias + "_mmbr";

    qry.joins.push("JOIN set_member " + mmbrTbl + " ON " + mmbrTbl + ".member = " + qry.getFieldName(property["@id"]));

    if (inList.length == 1) qry.wheres.push(mmbrTbl + ".iri = '" + inList.join("', '") + "'");
    else qry.wheres.push(mmbrTbl + ".iri IN ('" + inList.join("', '") + "')");
  }

  private convertMatchPropertyRelative(qry: SqlQuery, property: Property) {
    if (!property["@id"] || !property.relativeTo) {
      throw new Error("INVALID MatchPropertyRelative\n" + JSON.stringify(property, null, 2));
    }

    if (property.relativeTo.parameter)
      qry.wheres.push(
        qry.getFieldName(property["@id"]) + " " + property.operator + " " + this.convertMatchPropertyRelativeTo(qry, property, property.relativeTo.parameter)
      );
    else if (property.relativeTo.nodeRef) {
      // Include implied join on noderef
      qry.joins.push("JOIN " + property.relativeTo.nodeRef + " ON " + property.relativeTo.nodeRef + ".id = " + qry.alias + ".id");
      qry.wheres.push(
        qry.getFieldName(property["@id"]) +
          " " +
          property.operator +
          " " +
          this.convertMatchPropertyRelativeTo(qry, property, qry.getFieldName(property.relativeTo?.["@id"] as string, property.relativeTo.nodeRef))
      );
    } else {
      throw new Error("UNHANDLED RELATIVE COMPARISON\n" + JSON.stringify(property, null, 2));
    }
  }

  private convertMatchPropertyRelativeTo(qry: SqlQuery, property: Property, field: string) {
    if ("date" == qry.getFieldType(property["@id"] as string))
      if (property.value) return "(" + field + " + INTERVAL '" + property.value + " " + property.unit + "')";
      else return field;
    else {
      throw new Error("UNHANDLED RELATIVE TYPE\n" + JSON.stringify(property, null, 2));
    }
  }

  private convertMatchPropertyValue(qry: SqlQuery, property: Property) {
    if (!property["@id"] || !property.value) {
      throw new Error("INVALID MatchPropertyValue\n" + JSON.stringify(property, null, 2));
    }

    let where =
      "date" == qry.getFieldType(property["@id"])
        ? this.convertMatchPropertyRangeNode(property) + " " + qry.getFieldName(property["@id"])
        : qry.getFieldName(property["@id"]) + " " + property.operator + " " + property.value;

    // TODO: TCT
    if (property.ancestorsOf || property.descendantsOf || property.descendantsOrSelfOf) {
      where += " -- TCT\n";
    }

    qry.wheres.push(where);
  }
}
