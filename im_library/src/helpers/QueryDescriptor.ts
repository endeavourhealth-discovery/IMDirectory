import { Operator, Property } from "../interfaces/AutoGen";
import { Match, OrderLimit, Node, Query } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef, resolveIri } from "./TTTransform";

const propertyDisplayMap = { concept: "of" } as any;

export function describeQuery(query: Query): Query {
  const describedQuery = { ...query };
  generateRecursively(describedQuery, "query");
  return describedQuery;
}

function generateRecursively(query: any, type: string) {
  if ("match" === type) {
    describeMatch(query);
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
export function describeMatch(match: Match[]) {
  for (const [index, matchItem] of match.entries()) {
    matchItem.description = getDisplayFromMatch(matchItem);
    if (isObjectHasKeys(matchItem, ["boolMatch"])) {
      describeMatch(matchItem.match!);
    }
    if (isArrayHasLength(matchItem.property)) {
      describeProperty(matchItem.property!);
    }
  }
}

export function describeProperty(property: Property[]) {
  for (const [index, propertyItem] of property.entries()) {
    propertyItem.description = getDisplayFromProperty(propertyItem);
    if (isObjectHasKeys(propertyItem, ["bool"])) {
      describeProperty(propertyItem.property!);
    }

    if (isObjectHasKeys(propertyItem, ["match"])) {
      describeMatch([propertyItem.match!]);
    }
  }
}

// getters
export function getDisplayFromMatch(match: Match) {
  let display = "";
  display += getDisplayFromEntailment(match);
  display += getNameFromRef(match);
  if (match.orderBy) describeOrderByList(match.orderBy);
  if (match["@set"]) display = "in '" + display + "'";
  return display;
}

export function getDisplayFromPropertyList(matchDisplay: string, propertyList: Property[]) {
  const propertyDisplays = [];
  for (const propertyItem of propertyList) {
    if (matchDisplay && matchDisplay.slice(-1) !== ".") matchDisplay += ".";
    propertyDisplays.push(matchDisplay + getDisplayFromProperty(propertyItem));
  }

  return propertyDisplays;
}

export function getDisplayFromProperty(property: Property) {
  let display = "";
  const propertyName = getDisplayFromNodeRef(property.nodeRef) ?? getNameFromRef(property);
  if (propertyDisplayMap[propertyName]) display += " " + propertyDisplayMap[propertyName];
  if (property.in) display += " " + getDisplayFromList(property, true);
  if (property.notIn) display += getDisplayFromList(property, false);
  if (property.operator) display = getDisplayFromOperator(propertyName, property);
  if (property.range) display = getDisplayFromRange(propertyName, property);
  if (property.null) display += " is null";
  return display;
}

export function describeOrderByList(orderByList: OrderLimit[]) {
  for (const orderBy of orderByList) {
    orderBy.description = getDisplayFromOrderBy(orderBy);
  }
}

export function getDisplayFromOrderBy(orderBy: OrderLimit) {
  let display = "";
  if (orderBy.variable) display += orderBy.variable + ".";
  const propertyName = getNameFromRef(orderBy);
  if (propertyDisplayMap[propertyName]) display += propertyDisplayMap[propertyName] + " ";
  if (orderBy.limit === 1) {
    if ("descending" === orderBy.direction) display = "get latest" + display;
    if ("ascending" === orderBy.direction) display = "get earliest" + display;
  } else if (orderBy.direction) display = orderBy.direction + " " + display;
  return "<div class='variable-line'>" + display + "</div>";
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

export function getDisplayFromRange(propertyName: string, property: Property) {
  const propertyDisplay = " " + propertyName;
  let display = propertyDisplay + " between ";
  display += property.range?.from.value + " and " + property.range?.to.value + " " + property.range?.to.unit;
  return display;
}

export function getDisplayFromOperator(propertyDisplay: string, property: Property) {
  let display = "";

  if (propertyDisplay.toLowerCase().includes("date")) {
    display += getDisplayFromDateComparison(property);
  } else {
    if (property.variable) display += property.variable + ".";
    display += propertyDisplay + " ";
    display += property.operator + " ";
    if (property.relativeTo) {
      let relativeTo = property.relativeTo.parameter ? property.relativeTo.parameter + "." : "";
      relativeTo += getNameFromRef(property.relativeTo);
      display += relativeTo;
    }
    if (property.value) {
      if (property.relativeTo) display += " by ";
      display += property.value;
    }
    if (property.unit) display += " " + property.unit;
  }

  return display;
}

export function getDisplayFromDateComparison(property: Property) {
  let display = "";
  if (property.value) {
    if (property.operator) display += getDisplayFromOperatorForDate(property.operator, true);
    display += getDisplayFromValueAndUnitForDate(property);
    if (property.relativeTo && "$referenceDate" !== property.relativeTo.parameter)
      display += " from " + (getDisplayFromNodeRef(property.relativeTo?.nodeRef) ?? getNameFromRef(property.relativeTo));
  } else {
    if (property.operator) display += getDisplayFromOperatorForDate(property.operator, false);
    if (property.relativeTo) display += getDisplayFromNodeRef(property.relativeTo?.nodeRef) ?? getNameFromRef(property.relativeTo);
  }

  return display;
}

export function getDisplayFromNodeRef(nodeRef: string | undefined) {
  if (!nodeRef) return undefined;
  return "<span class='node-ref'>" + nodeRef + "</span> ";
}

export function getDisplayFromVariable(nodeRef: string | undefined) {
  if (!nodeRef) return undefined;
  return "<span class='variable-line'> keep as <span class='variable'>" + nodeRef + "</span></span> ";
}

export function getDisplayFromValueAndUnitForDate(property: Property) {
  let display = "";
  if (property.value) display += "last " + property.value.replaceAll("-", "") + " ";
  if (property.unit) display += property.unit;
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

export function getDisplayFromList(property: Property, include: boolean) {
  let display = include ? " " : " not ";
  const nodes: Node[] = property.in ?? property.notIn ?? [];
  if (property.valueLabel) {
    if (nodes.length === 1) display += property.valueLabel;
    else display += getDisplayFromNodeRef(property.valueLabel);
    return display;
  }

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
    display += " and " + getDisplayFromNodeRef("more...") + "]";
  }
  return display;
}

export function getDisplayFromEntailment(node: Node) {
  if (node.ancestorsOf) return "ancestors of ";
  if (node.descendantsOf) return "descendants of ";
  if (node.descendantsOrSelfOf) return "";
  return "";
}

function getDisplayFromPathRecursively(displayObject: { display: string }, type: string, pathOrNode: any) {
  if ("node" !== type && !propertyDisplayMap[getNameFromRef(pathOrNode)]) {
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

// get unnamed nested objects
export function getUnnamedObjects(object: any) {
  const unnamedObjects = {} as { [x: string]: any[] };
  recursivelyAddUnnamedObjects(unnamedObjects, object);
  return unnamedObjects;
}

function recursivelyAddUnnamedObjects(unnamedObjects: { [x: string]: any[] }, object: any) {
  if (isArrayHasLength(object)) {
    for (const value of object) {
      recursivelyAddUnnamedObjects(unnamedObjects, value);
    }
  } else if (isObjectHasKeys(object)) {
    if (!isObjectHasKeys(object, ["name"])) {
      addUnnamedObject(unnamedObjects, object);
    }

    for (const key of Object.keys(object)) {
      recursivelyAddUnnamedObjects(unnamedObjects, object[key]);
    }
  }
}

function addUnnamedObject(unnamedObjects: { [x: string]: any[] }, object: any) {
  const iri = object["@id"] || object["@set"] || object["@type"];
  if (iri && !isObjectHasKeys(object, ["name"])) {
    const resolvedIri = resolveIri(iri);
    if (isArrayHasLength(unnamedObjects.resolvedIri)) unnamedObjects[resolvedIri].push(object);
    else unnamedObjects[resolvedIri] = [object];
  }
}

export default { describeQuery, getUnnamedObjects };
