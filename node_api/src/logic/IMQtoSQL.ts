import { Match, Query, Where, Assignable, OrderLimit, Bool } from "@im-library/interfaces/AutoGen";
import { SqlQuery } from "@/model/sql/SqlQuery";
import { IMQSQL } from "@im-library/interfaces";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

function IMQtoSQL(definition: Query, baseId = ""): IMQSQL {
  if (!definition.typeOf) {
    throw new Error("Query must have a main (model) type");
  }

  if (!definition.match) {
    throw new Error("Query must have at least one match");
  }

  // try {
  const qry = SqlQuery.create(definition.typeOf["@id"]!, baseId);

  for (const match of definition.match) {
    convertMatchToQueryAndMerge(qry, match, match.exclude ? "OR" : "AND");
  }

  const result: IMQSQL = { sql: qry.toSql(), sets: qry.dependentSets, queries: new Map<string, { iri: string; alias: string; sql: string }>() };
  qry.dependentQueries.forEach(d => result.queries.set(d.iri, d));

  return result;
  // } catch (e) {
  //   if (e instanceof Error) return { error: e.toString() } as IMQSQL;
  //   else return { error: "Unknown Error" } as IMQSQL;
  // }
}

function convertMatchToQueryAndMerge(qry: SqlQuery, subMatch: Match, bool = "AND") {
  const subQry = convertMatchToQuery(qry, subMatch);
  qry.withs.push(...subQry.withs);
  subQry.withs = [];
  qry.withs.push(subQry.alias + " AS (" + subQry.toSql(2) + "\n)");

  const joiner = "OR" == bool ? "LEFT JOIN " : "JOIN ";
  if ("OR" == qry.whereBool) qry.wheres.push(subQry.alias + ".id IS NOT NULL");

  if (subQry.model == qry.model) {
    qry.joins.push(joiner + subQry.alias + " ON " + subQry.alias + ".id = " + qry.alias + ".id");
  } else {
    const rel = subQry.getRelationshipTo(qry.model);
    const relFrom = rel.fromField.includes("{alias}") ? rel.fromField.replaceAll("{alias}", subQry.alias) : subQry.alias + "." + rel.fromField;
    const relTo = rel.toField.includes("{alias}") ? rel.toField.replaceAll("{alias}", qry.alias) : qry.alias + "." + rel.toField;

    qry.joins.push(joiner + subQry.alias + " ON " + relFrom + " = " + relTo);
  }
}

function convertMatchToQuery(parent: SqlQuery, match: Match): SqlQuery {
  const qry = createMatchQuery(match, parent);

  convertMatch(match, qry);

  if (!match.then) {
    if (match.orderBy) wrapMatchPartition(qry, match.orderBy);

    return qry;
  } else {
    const thenQuery = convertMatchToQuery(qry, match.then);

    if (match.orderBy) wrapMatchPartition(qry, match.orderBy);

    if (isArrayHasLength(qry.withs)) {
      const tmp = qry.withs;
      qry.withs = [];
      thenQuery.withs.push(...tmp);
      thenQuery.withs.push(qry.alias + " AS /* cmtq 1 */ ( " + qry.toSql(2) + "\n)\n");
    } else thenQuery.withs.push(qry.alias + " AS /* cmtg 2 */ ( " + qry.toSql(2) + "\n)\n");

    return thenQuery;
  }
}

function createMatchQuery(match: Match, qry: SqlQuery) {
  if (match.typeOf?.["@id"] && match.typeOf["@id"] != qry.model) {
    return qry.subQuery(match.typeOf["@id"], match.variable);
  } else if (match.nodeRef && match.nodeRef != qry.model) {
    return qry.subQuery(match.nodeRef, match.variable);
  } else return qry.subQuery(qry.model, match.variable);
}

function convertMatch(match: Match, qry: SqlQuery) {
  if (match.is) {
    convertMatchIs(qry, match);
  } else if (match.boolMatch) {
    if (match.match && match.match.length > 0) convertMatchBoolSubMatch(qry, match);
    else if (match.where && match.where.length > 0) convertMatchProperties(qry, match);
    else {
      throw new Error("UNHANDLED BOOL MATCH PATTERN\n" + JSON.stringify(match, null, 2));
    }
  } else if (match.where && match.where.length > 0) {
    convertMatchProperties(qry, match);
  } else if (match.match && match.match.length > 0) {
    // Assume bool match "AND"
    match.boolMatch = Bool.and;
    convertMatchBoolSubMatch(qry, match);
  } else if (match.variable && Object.keys(match).length == 1) {
    // TODO: Data fix
    console.error("VARIABLE-ONLY MATCH!!");
  } else {
    throw new Error("UNHANDLED MATCH PATTERN\n" + JSON.stringify(match, null, 2));
  }
}

function wrapMatchPartition(qry: SqlQuery, order: OrderLimit) {
  if (!order.property) throw new Error("ORDER MUST HAVE A FIELD SPECIFIED\n" + JSON.stringify(order, null, 2));

  const inner = qry.clone(qry.alias + "_inner");

  const innerSql = qry.alias + "_inner AS (" + inner.toSql(2) + ")";

  const partition = qry.subQuery(qry.alias + "_inner", qry.alias + "_part");
  const partField = "((json ->> 'patient')::UUID)";

  let o = [];

  const dir = order.property.direction?.toUpperCase().startsWith("DESC") ? "DESC" : "ASC";
  o.push(partition.getFieldName(order.property["@id"] as string) + " " + dir);

  partition.selects.push("*", "ROW_NUMBER() OVER (PARTITION BY " + partField + " ORDER BY " + o.join(", ") + ") AS rn");

  qry.initialize(qry.alias + "_part", qry.alias);
  qry.withs.push(innerSql);
  qry.withs.push(partition.alias + " AS (" + partition.toSql(2) + "\n)");
  qry.wheres.push("rn = 1");
}

function convertMatchIs(qry: SqlQuery, match: Match) {
  if (!match.is) throw new Error("MatchSet must have at least one element\n" + JSON.stringify(match, null, 2));
  const rsltTbl = qry.alias + "_rslt";
  qry.joins.push("JOIN query_result " + rsltTbl + " ON " + rsltTbl + ".id = " + qry.alias + ".id");
  qry.wheres.push(rsltTbl + ".iri = '" + match.is[0]["@id"] + "'");
  //
  // if (!match.inSet) throw new Error("MatchSet must have at least one element\n" + JSON.stringify(match, null, 2));
  // const rsltTbl = includeDependentQuery(qry, match.inSet[0]["@id"] as string);
  // qry.joins.push("JOIN " + rsltTbl + " ON " + rsltTbl + ".id = " + qry.alias + ".id");
}

function convertMatchBoolSubMatch(qry: SqlQuery, match: Match) {
  if (!match.boolMatch || !match.match) {
    throw new Error("INVALID MatchBoolSubMatch\n" + JSON.stringify(match, null, 2));
  }

  qry.whereBool = match.boolWhere ? match.boolWhere.toUpperCase() : "AND";

  // TODO: Boolean "OR" should be a union (more performant)
  // const joiner = "OR" == match.boolWhere?.toUpperCase() ? "LEFT JOIN " : "JOIN ";

  for (const subMatch of match.match) {
    convertMatchToQueryAndMerge(qry, subMatch, match.bool?.toUpperCase());
  }
}

function convertMatchProperties(qry: SqlQuery, match: Match) {
  if (!match.where) {
    throw new Error("INVALID MatchProperty\n" + JSON.stringify(match, null, 2));
  }

  for (const property of match.where) {
    convertMatchProperty(qry, property);
  }
}

function convertMatchProperty(qry: SqlQuery, property: Where) {
  if (property.is) {
    convertMatchPropertyIs(qry, property, property.is);
  } else if (property.isNot) {
    convertMatchPropertyIs(qry, property, property.isNot, true);
  } else if (property.range) {
    convertMatchPropertyRange(qry, property);
  } else if (property.match) {
    convertMatchPropertySubMatch(qry, property);
  } else if (property.is) {
    convertMatchPropertyInSet(qry, property);
  } else if (property.relativeTo) {
    convertMatchPropertyRelative(qry, property);
  } else if (property.value) {
    convertMatchPropertyValue(qry, property);
  } else if (property.boolWhere) {
    convertMatchPropertyBool(qry, property);
  } else if (property.isNull) {
    convertMatchPropertyNull(qry, property);
  } else {
    throw new Error("UNHANDLED PROPERTY PATTERN\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyIs(qry: SqlQuery, property: Where, list: any[], inverse = false) {
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
    } else if (pIs.parameter) {
      direct.push("{{ PARAM: " + pIs.parameter + "}}");
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

function convertMatchPropertyRange(qry: SqlQuery, property: Where) {
  if (!property.range) {
    throw new Error("INVALID MatchPropertyRange\n" + JSON.stringify(property, null, 2));
  }

  const fieldType = qry.getFieldType(property["@id"] as string);
  const fieldJoin = qry.getFieldJoin(property["@id"] as string);

  if (fieldJoin) {
    console.log("*********************** FIELD JOIN ***************************");
    qry.wheres.push(fieldJoin);
  }

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
  if (range.unit) return fieldName + " " + getOperator(range.operator, range.value) + " -- CONVERT " + range.unit;
  else return fieldName + " " + getOperator(range.operator, range.value);
}

function convertMatchPropertyDateRangeNode(fieldName: string, range: Assignable): string {
  if ("DATE" == range.unit) return "'" + range.value + "' " + getOperator(range.operator, fieldName);
  else return "(now() - INTERVAL '" + range.value + (range.unit ? " " + range.unit : "") + "') " + getOperator(range.operator, fieldName);
}

function convertMatchPropertySubMatch(qry: SqlQuery, property: Where) {
  if (!property.match) {
    throw new Error("INVALID MatchPropertySubMatch\n" + JSON.stringify(property, null, 2));
  }

  if (!property.match.variable) property.match.variable = qry.getAlias(qry.alias + "_sub");

  convertMatchToQueryAndMerge(qry, property.match);
}

function convertMatchPropertyInSet(qry: SqlQuery, property: Where) {
  if (!property["@id"]) throw new Error("INVALID PROPERTY\n" + JSON.stringify(property, null, 2));

  if (!property.is) {
    throw new Error("INVALID MatchPropertyIn\n" + JSON.stringify(property, null, 2));
  }

  const inList: string[] = [];

  for (const pIn of property.is) {
    if (pIn["@id"]) {
      inList.push(pIn["@id"]);
      qry.addDependentSet(pIn["@id"]);
    } else {
      throw new Error("UNHANDLED 'IN' ENTRY\n" + JSON.stringify(pIn, null, 2));
    }
  }

  const mmbrAlias = qry.alias + "_mmbr";

  qry.joins.push("JOIN set_member " + mmbrAlias + " ON " + mmbrAlias + ".member = " + qry.getFieldName(property["@id"]));

  if (inList.length == 1) qry.wheres.push(mmbrAlias + ".iri = '" + inList.join("',\n'") + "'");
  else qry.wheres.push(mmbrAlias + ".iri IN ('" + inList.join("',\n'") + "')");
}

function convertMatchPropertyRelative(qry: SqlQuery, property: Where) {
  if (!property["@id"] || !property.relativeTo) {
    throw new Error("INVALID MatchPropertyRelative\n" + JSON.stringify(property, null, 2));
  }

  if (property.relativeTo.parameter)
    qry.wheres.push(
      qry.getFieldName(property["@id"]) + " " + getOperator(property.operator, convertMatchPropertyRelativeTo(qry, property, property.relativeTo.parameter))
    );
  else if (property.relativeTo.nodeRef) {
    // Include implied join on noderef
    qry.joins.push("JOIN " + property.relativeTo.nodeRef + " ON " + property.relativeTo.nodeRef + ".id = " + qry.alias + ".id");
    qry.wheres.push(
      qry.getFieldName(property["@id"]) +
        " " +
        getOperator(
          property.operator,
          convertMatchPropertyRelativeTo(qry, property, qry.getFieldName(property.relativeTo?.["@id"] as string, property.relativeTo.nodeRef))
        )
    );
  } else {
    throw new Error("UNHANDLED RELATIVE COMPARISON\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyRelativeTo(qry: SqlQuery, property: Where, field: string) {
  const fieldType = qry.getFieldType(property["@id"] as string);
  if ("date" == fieldType || "$referenceDate" == field)
    if (property.value) return "(" + field + " + INTERVAL '" + property.value + " " + property.unit + "')";
    else return field;
  else {
    throw new Error("UNHANDLED RELATIVE TYPE (" + fieldType + ")\n" + JSON.stringify(property, null, 2));
  }
}

function convertMatchPropertyValue(qry: SqlQuery, property: Where) {
  if (!property["@id"] || !property.value) {
    throw new Error("INVALID MatchPropertyValue\n" + JSON.stringify(property, null, 2));
  }

  const join = qry.getFieldJoin(property["@id"]);
  if (join) qry.joins.push(join.replaceAll("{{alias}}", qry.alias));

  let where =
    "date" == qry.getFieldType(property["@id"])
      ? convertMatchPropertyDateRangeNode(qry.getFieldName(property["@id"]), property)
      : qry.getFieldName(property["@id"]) + " " + getOperator(property.operator, property.value);

  if (property.unit) where += " -- CONVERT " + property.unit + "\n";

  // TODO: TCT
  if (property.ancestorsOf || property.descendantsOf || property.descendantsOrSelfOf) {
    where += " -- TCT\n";
  }

  qry.wheres.push(where);
}

function convertMatchPropertyBool(qry: SqlQuery, property: Where) {
  if (!property.boolWhere) {
    throw new Error("INVALID MatchPropertyBool\n" + JSON.stringify(property, null, 2));
  }

  if (property.where) {
    const subQuery = qry.subQuery(qry.model, qry.alias);
    for (const p of property.where) {
      convertMatchProperty(subQuery, p);
    }

    qry.withs.push(...subQuery.withs);
    qry.joins.push(...subQuery.joins);
    qry.wheres.push("(" + subQuery.wheres.join(" " + property.boolWhere?.toUpperCase() + " ") + ")");
  } else {
    throw new Error("Property BOOL should only contain property conditions");
  }
}

function convertMatchPropertyNull(qry: SqlQuery, property: Where) {
  if (!property["@id"]) {
    throw new Error("INVALID MatchPropertyNull\n" + JSON.stringify(property, null, 2));
  }

  qry.wheres.push(qry.getFieldName(property["@id"]) + " IS NULL");
}

function getOperator(operator: string | undefined, value: string | undefined) {
  if (!operator) throw new Error("OPERATOR UNDEFINED");
  if (!value) throw new Error("OPERATOR VALUE UNDEFINED");

  if (["<", "<=", "=", ">=", ">"].includes(operator)) return operator + " " + value;
  if ("startsWith" === operator) return "LIKE '" + value + "%'";

  throw new Error("UNHANDLED operator [" + operator + "]");
}

function includeDependentQuery(qry: SqlQuery, iri: string) {
  const idx = qry.dependentQueries.findIndex(i => i.iri == iri);

  if (idx > -1) {
    const alias = qry.dependentQueries[idx].alias;
    qry.dependentQueries.push(qry.dependentQueries.splice(idx, 1)[0]);
    return alias;
  } else {
    const alias = qry.getAlias("Q_" + qry.baseId + "_");
    qry.dependentQueries.push({ iri: iri, alias: alias, sql: "" });

    return alias;
  }
}

export default IMQtoSQL;
