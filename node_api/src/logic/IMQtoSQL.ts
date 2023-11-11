import { Match, Query, Property, Assignable, OrderLimit } from "@im-library/interfaces/AutoGen";
import { SqlQuery } from "@/model/sql/SqlQuery";

function IMQtoSQL(definition: Query): string {
  if (!definition.typeOf) {
    console.log(definition);
    throw new Error("Query must have a main (model) type");
  }

  if (!definition.match) {
    console.log(definition);
    throw new Error("Query must have at least one match");
  }

  try {
    const qry = SqlQuery.create(definition.typeOf["@id"]!);

    for (const match of definition.match) {
      const subQry = convertMatchToQuery(qry, match);
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

function convertMatchToQuery(parent: SqlQuery, match: Match): SqlQuery {
  const qry = createMatchQuery(match, parent);

  convertMatch(match, qry);

  if (match.orderBy) {
    wrapMatchPartition(qry, match.orderBy);
  }

  return qry;
}

function createMatchQuery(match: Match, qry: SqlQuery) {
  if (match.typeOf?.["@id"] && match.typeOf["@id"] != qry.model) {
    return qry.subQuery(match.typeOf["@id"], match.variable);
  } else if (match.nodeRef && match.nodeRef != qry.model) {
    return qry.subQuery(match.nodeRef, match.variable);
  } else return qry.subQuery(qry.model, match.variable);
}

function convertMatch(match: Match, qry: SqlQuery) {
  if (match.inSet) {
    convertMatchSet(qry, match);
  } else if (match.bool) {
    if (match.match && match.match.length > 0) convertMatchBoolSubMatch(qry, match);
    else if (match.property && match.property.length > 0) convertMatchProperties(qry, match);
    else {
      throw new Error("UNHANDLED BOOL MATCH PATTERN\n" + JSON.stringify(match, null, 2));
    }
  } else if (match.property && match.property.length > 0) {
    convertMatchProperties(qry, match);
  } else if (match.match && match.match.length > 0) {
    // Assume bool match "AND"
    match.bool = "and";
    convertMatchBoolSubMatch(qry, match);
  } else {
    throw new Error("UNHANDLED MATCH PATTERN\n" + JSON.stringify(match, null, 2));
  }
}

function wrapMatchPartition(qry: SqlQuery, order: OrderLimit) {
  if (!order.property || order.property.length == 0) throw new Error("ORDER MUST HAVE A FIELD SPECIFIED\n" + JSON.stringify(order, null, 2));

  const inner = qry.clone(qry.alias + "_inner");

  const innerSql = qry.alias + "_inner AS (" + inner.toSql(2) + ")";

  const partition = qry.subQuery(qry.alias + "_inner", qry.alias + "_part");
  const partField = "patient";

  let o = [];

  for (const p of order.property) {
    const dir = p.direction?.toUpperCase().startsWith("DESC") ? "DESC" : "ASC";
    o.push(partition.getFieldName(p["@id"] as string) + " " + dir);
  }

  partition.selects.push("*", "ROW_NUMBER() OVER (PARTITION BY " + partField + " ORDER BY " + o.join(", ") + ") AS rn");

  qry.initialize(qry.alias + "_part", qry.alias);
  qry.withs.push(innerSql);
  qry.withs.push(partition.alias + " AS (" + partition.toSql(2) + "\n)");
  qry.wheres.push("rn = 1");
}

function convertMatchSet(qry: SqlQuery, match: Match) {
  if (!match.inSet) throw new Error("MatchSet must have at least one element\n" + JSON.stringify(match, null, 2));
  const rsltTbl = qry.alias + "_rslt";
  qry.joins.push("JOIN query_result " + rsltTbl + " ON " + rsltTbl + ".id = " + qry.alias + ".id");
  qry.wheres.push(rsltTbl + ".iri = '" + match.inSet[0]["@id"] + "'");
}

function convertMatchBoolSubMatch(qry: SqlQuery, match: Match) {
  if (!match.bool || !match.match) {
    throw new Error("INVALID MatchBoolSubMatch\n" + JSON.stringify(match, null, 2));
  }

  qry.whereBool = match.bool ? match.bool.toUpperCase() : "AND";

  // TODO: Boolean "OR" should be a union (more performant)
  const joiner = "OR" == match.bool.toUpperCase() ? "LEFT JOIN " : "JOIN ";

  for (const subMatch of match.match) {
    const subQuery = convertMatchToQuery(qry, subMatch);

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

function convertMatchProperties(qry: SqlQuery, match: Match) {
  if (!match.property) {
    throw new Error("INVALID MatchProperty\n" + JSON.stringify(match, null, 2));
  }

  for (const property of match.property) {
    convertMatchProperty(qry, property);
  }
}

function convertMatchProperty(qry: SqlQuery, property: Property) {
  if (property.is) {
    convertMatchPropertyIs(qry, property, property.is);
  } else if (property.isNot) {
    convertMatchPropertyIs(qry, property, property.isNot, true);
  } else if (property.range) {
    convertMatchPropertyRange(qry, property);
  } else if (property.match) {
    convertMatchPropertySubMatch(qry, property);
  } else if (property.inSet) {
    convertMatchPropertyInSet(qry, property);
  } else if (property.relativeTo) {
    convertMatchPropertyRelative(qry, property);
  } else if (property.value) {
    convertMatchPropertyValue(qry, property);
  } else if (property.bool) {
    convertMatchPropertyBool(qry, property);
  } else if (property.isNull) {
    convertMatchPropertyNull(qry, property);
  } else {
    throw new Error("UNHANDLED PROPERTY PATTERN\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyIs(qry: SqlQuery, property: Property, list: any[], inverse = false) {
  if (!list) {
    throw new Error("INVALID MatchPropertyIs\n" + JSON.stringify(property, null, 2));
  }

  const direct: string[] = [];
  const ancestors: string[] = [];
  const descendants: string[] = [];
  const descendantsSelf: string[] = [];

  for (const pIs of list) {
    if (pIs["@id"]) {
      if (pIs.ancestorsOf) ancestors.push(pIs["@id"]);
      else if (pIs.descendantsOf) descendants.push(pIs["@id"]);
      else if (pIs.descendantsOrSelfOf) descendantsSelf.push(pIs["@id"]);
      else direct.push(pIs["@id"]);
    } else {
      throw new Error("UNHANDLED 'IN'/'NOT IN' ENTRY\n" + JSON.stringify(pIs, null, 2));
    }
  }

  if (direct.length > 0) {
    let where = qry.getFieldName(property["@id"]!);

    if (direct.length == 1) where += (inverse ? " <> '" : " = '") + direct[0] + "'\n";
    else where += (inverse ? " NOT IN ('" : " IN ('") + direct.join("',\n'") + "')\n";

    qry.wheres.push(where);
  }

  const tct = "tct_" + qry.joins.length;
  if (descendants.length > 0) {
    qry.joins.push("JOIN tct AS " + tct + " ON " + tct + ".child = " + qry.getFieldName(property["@id"]!));
    qry.wheres.push(
      descendants.length == 1 ? tct + ".iri = '" + descendants[0] + "'" : tct + ".iri IN ('" + descendants.join("',\n'") + "') AND " + tct + ".level > 0"
    );
  } else if (descendantsSelf.length > 0) {
    qry.joins.push("JOIN tct AS " + tct + " ON " + tct + ".child = " + qry.getFieldName(property["@id"]!));
    qry.wheres.push(descendantsSelf.length == 1 ? tct + ".iri = '" + descendantsSelf[0] + "'" : tct + ".iri IN ('" + descendantsSelf.join("',\n'") + "')");
  } else if (ancestors.length > 0) {
    qry.joins.push("JOIN tct AS " + tct + " ON " + tct + ".iri = " + qry.getFieldName(property["@id"]!));
    qry.wheres.push(
      ancestors.length == 1 ? tct + ".child = '" + ancestors[0] + "'" : tct + ".child IN ('" + ancestors.join("',\n'") + "') AND " + tct + ".level > 0"
    );
  }
}

function convertMatchPropertyRange(qry: SqlQuery, property: Property) {
  if (!property.range) {
    throw new Error("INVALID MatchPropertyRange\n" + JSON.stringify(property, null, 2));
  }

  const fieldType = qry.getFieldType(property["@id"] as string);

  if ("date" == fieldType) {
    if (property.range.from) qry.wheres.push(convertMatchPropertyDateRangeNode(qry.getFieldName(property["@id"] as string), property.range.from));
    if (property.range.to) qry.wheres.push(convertMatchPropertyDateRangeNode(qry.getFieldName(property["@id"] as string), property.range.to));
  } else if ("number" == fieldType) {
    if (property.range.from) qry.wheres.push(convertMatchPropertyNumberRangeNode(qry.getFieldName(property["@id"] as string), property.range.from));
    if (property.range.to) qry.wheres.push(convertMatchPropertyNumberRangeNode(qry.getFieldName(property["@id"] as string), property.range.to));
  } else {
    throw new Error("UNHANDLED PROPERTY FIELD TYPE (" + fieldType + ")\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyNumberRangeNode(fieldName: string, range: Assignable): string {
  if (range.unit) return fieldName + " " + range.operator + " " + range.value + " -- CONVERT " + range.unit;
  else return fieldName + " " + range.operator + " " + range.value;
}

function convertMatchPropertyDateRangeNode(fieldName: string, range: Assignable): string {
  return "(now() - INTERVAL '" + range.value + (range.unit ? " " + range.unit : "") + "') " + range.operator + " " + fieldName;
}

function convertMatchPropertySubMatch(qry: SqlQuery, property: Property) {
  if (!property.match) {
    throw new Error("INVALID MatchPropertySubMatch\n" + JSON.stringify(property, null, 2));
  }

  if (!property.match.variable) property.match.variable = qry.getAlias(qry.alias + "_sub");

  const subQuery = convertMatchToQuery(qry, property.match);

  qry.withs.push(...subQuery.withs);
  subQuery.withs = [];
  qry.withs.push(subQuery.alias + " AS (" + subQuery.toSql(2) + "\n)");

  if (qry.model == subQuery.model) qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + ".id = " + qry.alias + ".id");
  else {
    const rel = subQuery.getRelationshipTo(qry.model);
    qry.joins.push("JOIN " + subQuery.alias + " ON " + subQuery.alias + "." + rel.fromField + " = " + qry.alias + "." + rel.toField);
  }
}

function convertMatchPropertyInSet(qry: SqlQuery, property: Property) {
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

  if (inList.length == 1) qry.wheres.push(mmbrTbl + ".iri = '" + inList.join("',\n'") + "'");
  else qry.wheres.push(mmbrTbl + ".iri IN ('" + inList.join("',\n'") + "')");
}

function convertMatchPropertyRelative(qry: SqlQuery, property: Property) {
  if (!property["@id"] || !property.relativeTo) {
    throw new Error("INVALID MatchPropertyRelative\n" + JSON.stringify(property, null, 2));
  }

  if (property.relativeTo.parameter)
    qry.wheres.push(
      qry.getFieldName(property["@id"]) + " " + property.operator + " " + convertMatchPropertyRelativeTo(qry, property, property.relativeTo.parameter)
    );
  else if (property.relativeTo.nodeRef) {
    // Include implied join on noderef
    qry.joins.push("JOIN " + property.relativeTo.nodeRef + " ON " + property.relativeTo.nodeRef + ".id = " + qry.alias + ".id");
    qry.wheres.push(
      qry.getFieldName(property["@id"]) +
        " " +
        property.operator +
        " " +
        convertMatchPropertyRelativeTo(qry, property, qry.getFieldName(property.relativeTo?.["@id"] as string, property.relativeTo.nodeRef))
    );
  } else {
    throw new Error("UNHANDLED RELATIVE COMPARISON\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyRelativeTo(qry: SqlQuery, property: Property, field: string) {
  const fieldType = qry.getFieldType(property["@id"] as string);
  if ("date" == fieldType)
    if (property.value) return "(" + field + " + INTERVAL '" + property.value + " " + property.unit + "')";
    else return field;
  else {
    throw new Error("UNHANDLED RELATIVE TYPE (" + fieldType + ")\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyValue(qry: SqlQuery, property: Property) {
  if (!property["@id"] || !property.value) {
    throw new Error("INVALID MatchPropertyValue\n" + JSON.stringify(property, null, 2));
  }

  let where =
    "date" == qry.getFieldType(property["@id"])
      ? convertMatchPropertyDateRangeNode(qry.getFieldName(property["@id"]), property)
      : qry.getFieldName(property["@id"]) + " " + property.operator + " " + property.value;

  if (property.unit) where += " -- CONVERT " + property.unit + "\n";

  // TODO: TCT
  if (property.ancestorsOf || property.descendantsOf || property.descendantsOrSelfOf) {
    where += " -- TCT\n";
  }

  qry.wheres.push(where);
}

function convertMatchPropertyBool(qry: SqlQuery, property: Property) {
  if (!property.bool) {
    throw new Error("INVALID MatchPropertyBool\n" + JSON.stringify(property, null, 2));
  }

  if (property.property) {
    const subQuery = qry.subQuery(qry.model, qry.alias);
    for (const p of property.property) {
      convertMatchProperty(subQuery, p);
    }
    qry.wheres.push("(" + subQuery.wheres.join(" " + property.bool.toUpperCase() + " ") + ")");
  } else {
    throw new Error("Property BOOL should only contain property conditions");
  }
}

function convertMatchPropertyNull(qry: SqlQuery, property: Property) {
  if (!property["@id"]) {
    throw new Error("INVALID MatchPropertyNull\n" + JSON.stringify(property, null, 2));
  }

  qry.wheres.push(qry.getFieldName(property["@id"]) + " IS NULL");
}

export default IMQtoSQL;
