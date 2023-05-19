import { Operator } from "../interfaces/AutoGen";
import { Match, Path, Where, Property, OrderLimit, Node, Query } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";

const propertyDropList = ["observation", "concept", "numericValue"];

export function describeQuery(query: Query): Query {
  const describedQuery = { ...query };
  generateRecursively(describedQuery, "query");
  return describedQuery;
}

function generateRecursively(query: any, type: string) {
  if ("match" === type) {
    describeMatch(query, type);
  } else if (isObjectHasKeys(query)) {
    for (const key of Object.keys(query)) {
      if (!isPrimitiveType(query[key])) generateRecursively(query[key], key);
    }
  } else if (isArrayHasLength(query)) {
    for (const nested of query) {
      generateRecursively(nested, type);
    }
  }
}

// descriptors
function describeMatch(match: Match[], type: string) {
  for (const [index, matchItem] of match.entries()) {
    matchItem.description = getDisplayFromMatch(matchItem);
    if (isObjectHasKeys(matchItem, ["boolMatch"])) {
      describeMatch(matchItem.match, type);
    }
    if (isArrayHasLength(matchItem.where)) {
      describeWhere(matchItem.where, type);
    }
  }
}

function describeWhere(where: Where[], type: string) {
  for (const [index, whereItem] of where.entries()) {
    whereItem.description = getDisplayFromWhere(whereItem);
    if (isObjectHasKeys(whereItem, ["bool"])) {
      describeWhere(whereItem.where, type);
    }
  }
}

// getters
export function getDisplayFromMatch(match: Match) {
  let display = "";
  display += getDisplayFromEntailment(match);
  display += getNameFromRef(match);
  if (match["@set"]) display = "in '" + display + "'";
  if (match.path) display += getDisplayFromPath(match.path);
  if (match.orderBy) display += " " + getDisplayFromOrderByList(match.orderBy);
  return display;
}

export function getDisplayFromWhereList(matchDisplay: string, where: Where[]) {
  const whereDisplays = [];
  for (const whereItem of where) {
    if (matchDisplay && matchDisplay.slice(-1) !== ".") matchDisplay += ".";
    whereDisplays.push(matchDisplay + getDisplayFromWhere(whereItem));
  }

  return whereDisplays;
}

export function getDisplayFromWhere(where: Where) {
  if (where.valueLabel && !where.in && !where.notIn) return where.valueLabel;
  let display = "";
  const propertyName = getDisplayFromNodeRef(where.nodeRef) ?? getNameFromRef(where);
  if (!propertyDropList.includes(propertyName)) display += propertyName;
  if (where.in) display += " " + (where.valueLabel ?? getDisplayFromList(where.in, true));
  if (where.notIn) display += "not " + (where.valueLabel ?? getDisplayFromList(where.notIn, false));
  if (where.operator) display = getDisplayFromOperator(propertyName, where);
  if (where.range) display = getDisplayFromRange(propertyName, where);
  if (where.null) display += " is null";
  return display;
}

export function getDisplayFromOrderByList(orderByList: OrderLimit[]) {
  let display = "ordered by ";
  if (orderByList.length === 1) display += getDisplayFromOrderBy(orderByList[0]);
  else {
    display += "[";
    for (const [index, orderBy] of orderByList.entries()) {
      display += getDisplayFromOrderBy(orderBy);
      if (index !== orderByList.length - 1) display += ",";
    }
    display += "]";
  }

  return display;
}

export function getDisplayFromOrderBy(orderBy: OrderLimit) {
  let display = "";
  if (orderBy.variable) display += orderBy.variable + ".";
  display += getNameFromRef(orderBy);
  if (orderBy.limit === 1) {
    if ("descending" === orderBy.direction) display = "latest " + display;
    if ("ascending" === orderBy.direction) display = "earliest " + display;
  } else if (orderBy.direction) display = orderBy.direction + " " + display;
  return display;
}

export function getDisplayFromLogic(title: string) {
  switch (title) {
    case "exclude":
      return "<span style='color: red;'>exclude</span> ";
    case "or":
      return "<span style='color: blue;'>or</span> ";
    case "and":
      return "<span style='color: orange;'>and</span> ";
    default:
      return "<span style='color: orange;'>and</span> ";
  }
}

export function getDisplayFromRange(propertyName: string, where: Where) {
  const property = " " + propertyName;
  let display = property + " between ";
  display += where.range.from.value + " and " + where.range.to.value + " " + where.range.to.unit;
  return display;
}

export function getDisplayFromOperator(property: string, where: Where) {
  let display = "";

  if (property.toLowerCase().includes("date")) {
    display += getDisplayFromDateComparison(where);
  } else {
    if (where.variable) display += where.variable + ".";
    display += property + " ";
    display += where.operator + " ";
    if (where.relativeTo) {
      let relativeTo = "";
      if (where.relativeTo.parameter) relativeTo += where.relativeTo.parameter;
      if (relativeTo) relativeTo += ".";
      relativeTo += getNameFromRef(where.relativeTo);
      display += relativeTo;
    }
    if (where.value) {
      if (where.relativeTo) display += " by ";
      display += where.value;
    }
    if (where.unit) display += " " + where.unit;
  }

  return display;
}

export function getDisplayFromDateComparison(where: Where) {
  let display = "";
  if (where.value) {
    if (where.operator) display += getDisplayFromOperatorForDate(where.operator, true);
    display += getDisplayFromValueAndUnitForDate(where);
    if (where.relativeTo) display += " from " + (getDisplayFromNodeRef(where.relativeTo.nodeRef) ?? getNameFromRef(where.relativeTo));
  } else {
    if (where.operator) display += getDisplayFromOperatorForDate(where.operator, false);
    if (where.relativeTo) display += getDisplayFromNodeRef(where.relativeTo.nodeRef) ?? getNameFromRef(where.relativeTo);
  }

  return display;
}

export function getDisplayFromNodeRef(nodeRef: string) {
  if (!nodeRef) return undefined;
  return "<span class='variable'>" + nodeRef + "</span> ";
}

export function getDisplayFromValueAndUnitForDate(where: Where) {
  let display = "";
  if (where.value && where.value.includes("-")) display += "last " + where.value.replaceAll("-", "") + " ";
  if (where.unit) display += where.unit;
  return display;
}

export function getDisplayFromOperatorForDate(operator: Operator, withValue: boolean) {
  switch (operator) {
    case "=":
      return withValue ? "on " : "on the same date as ";
    case ">=":
      return withValue ? "within the " : "after ";
    case ">":
      return withValue ? "in the " : "after ";
    case "<=":
      return withValue ? "within the " : "before ";

    default:
      return "on ";
  }
}

export function getDisplayFromList(nodes: Node[], include: boolean) {
  let display = "";
  if (nodes.length === 1) {
    display += getDisplayFromEntailment(nodes[0]);
    display += getNameFromRef(nodes[0]);
  } else if (nodes.length <= 3) {
    display += include ? "a value of [" : " without a value of [";
    for (const [index, node] of nodes.entries()) {
      display += getDisplayFromEntailment(node);
      display += getNameFromRef(node);
      if (index !== nodes.length - 1) display += ", ";
    }
    display += "]";
  } else {
    display += include ? "a value of [" : " without a value of [";
    display += getDisplayFromEntailment(nodes[0]);
    display += getNameFromRef(nodes[0]);
    display += " and more...]";
  }
  return display;
}

export function getDisplayFromEntailment(node: Node) {
  if (node.ancestorsOf) return "ancestors of ";
  if (node.descendantsOf) return "descendants of ";
  if (node.descendantsOrSelfOf) return "";
  return "";
}

export function getDisplayFromPath(pathOrNode: Path | Node) {
  const displayObject = { display: "" };
  getDisplayFromPathRecursively(displayObject, "path", pathOrNode);
  return displayObject.display;
}

function getDisplayFromPathRecursively(displayObject: { display: string }, type: string, pathOrNode: any) {
  if ("node" !== type && !propertyDropList.includes(getNameFromRef(pathOrNode))) {
    if (displayObject.display) displayObject.display += ".";
    displayObject.display += getNameFromRef(pathOrNode);
  }
  if (isObjectHasKeys(pathOrNode, ["node"])) getDisplayFromPathRecursively(displayObject, "node", pathOrNode.node);
  if (isObjectHasKeys(pathOrNode, ["path"])) getDisplayFromPathRecursively(displayObject, "path", pathOrNode.path);
  if (isObjectHasKeys(pathOrNode, ["variable"])) displayObject.display = "(" + displayObject.display + " as " + pathOrNode.variable + ")";
}

// checkers
function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

export default { describeQuery };
