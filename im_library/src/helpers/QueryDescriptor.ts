import { Bool, Operator, Property } from "../interfaces/AutoGen";
import { Match, OrderLimit, Node, Query } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef, resolveIri } from "./TTTransform";

const propertyDisplayMap = { concept: "of" } as any;

// descriptors
export function describeQuery(query: Query): Query {
  const describedQuery = { ...query };
  if (isArrayHasLength(describedQuery.match))
    for (const [index, match] of describedQuery.match!.entries()) {
      describeMatch(match, index, "and");
    }
  describedQuery.query;
  return describedQuery;
}

export function describeMatch(match: Match, index: number, bool: Bool) {
  let display = getDisplayFromMatch(match);
  if (match.exclude) display = getDisplayFromLogic("exclude") + " " + display;
  if (index && bool) display = getDisplayFromLogic(bool) + " " + display;
  match.description = display;

  if (isArrayHasLength(match.match))
    for (const [index, nestedMatch] of match.match!.entries()) {
      describeMatch(nestedMatch, index, match.bool!);
    }

  if (isArrayHasLength(match.property))
    for (const [index, property] of match.property!.entries()) {
      describeProperty(property, index, property.bool!);
    }
}

export function describeProperty(property: Property, index: number, bool: Bool) {
  if (property.match) getDisplayFromNestedProperties(property);
  if (isObjectHasKeys(property, ["@id"])) {
    let display = getDisplayFromProperty(property);
    if (index && bool) display = getDisplayFromLogic(bool) + " " + display;
    property.description = display;
  }

  if (isArrayHasLength(property.property))
    for (const [index, nestedProperty] of property.property!.entries()) {
      describeProperty(nestedProperty, index, property.bool!);
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

export function getDisplayFromProperty(property: Property, propertyPathDisplay?: string) {
  let display = "";
  const propertyName = getDisplayFromNodeRef(property.nodeRef) ?? getNameFromRef(property);
  if (propertyDisplayMap[propertyName]) display += propertyDisplayMap[propertyName];
  if (property.in) display += getDisplayFromList(property, true);
  if (property.notIn) display += getDisplayFromList(property, false);
  if (property.operator) display = getDisplayFromOperator(propertyName, property);
  if (property.range) display = getDisplayFromRange(propertyName, property);
  if (property.null) display += " is null";
  if (propertyPathDisplay) {
    const connectingString = propertyDisplayMap[propertyName] ? " " : "->";
    display = propertyPathDisplay + connectingString + display;
  }
  return display;
}

function getDisplayFromNestedProperties(property: Property) {
  const pathList: string[] = [property["@id"]!];
  const lastMatch: Match[] = [];
  getDisplayFromPathRecursively(property, pathList, lastMatch);
  const propertyPathDisplay = getPropertyPathDisplay(pathList);
  if (isArrayHasLength(lastMatch) && isArrayHasLength(lastMatch[0].property))
    for (const [index, nestedProperty] of lastMatch[0].property!.entries()) {
      let propertyDisplay = getDisplayFromProperty(nestedProperty, propertyPathDisplay);
      if (index && lastMatch[0].bool) propertyDisplay = lastMatch[0].bool + " " + propertyDisplay;
      nestedProperty.description = propertyDisplay;
    }
}

function getPropertyPathDisplay(pathList: string[]) {
  const pathDisplay = [];
  for (const [index, value] of pathList.entries()) {
    if (index % 2 === 0) {
      // TODO propertyDisplayMap check
      const valueToAdd = getNameFromRef({ "@id": value });
      pathDisplay.push(valueToAdd);
    }
  }
  return pathDisplay.join("->");
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
      return "<span style='color: red;'>exclude if</span> ";
    case "or":
      return "<span style='color: blue;'>or</span> ";
    case "and":
      return "<span style='color: orange;'>and</span> ";
    default:
      return "<span style='color: orange;'>and</span> ";
  }
}

export function getDisplayFromRange(propertyName: string, property: Property) {
  const propertyDisplay = propertyName;
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

function getDisplayFromPathRecursively(propertyOrMatch: any, pathList: string[], lastMatch: Match[]) {
  if (isObjectHasKeys(propertyOrMatch, ["property"]) && isArrayHasLength(propertyOrMatch.property)) {
    for (const nestedProperty of propertyOrMatch.property) {
      pathList.push(nestedProperty["@id"]);
      getDisplayFromPathRecursively(nestedProperty, pathList, lastMatch);
    }
  } else if (isObjectHasKeys(propertyOrMatch, ["match"])) {
    if (isLastMatch(propertyOrMatch.match)) {
      if (isArrayHasLength(lastMatch)) lastMatch.splice(0, 1, propertyOrMatch);
      else lastMatch.push(propertyOrMatch.match);
    } else {
      pathList.push(propertyOrMatch.match["@type"]);
      getDisplayFromPathRecursively(propertyOrMatch.match, pathList, lastMatch);
    }
  }
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
    if (resolvedIri)
      if (isArrayHasLength(unnamedObjects.resolvedIri)) unnamedObjects[resolvedIri].push(object);
      else unnamedObjects[resolvedIri] = [object];
  }
}

function isLastMatch(match: Match) {
  return isArrayHasLength(match.property) && match.property!.some(property => !isObjectHasKeys(property, ["match"]));
}

function hasNestedProperty(match: Match) {
  return isArrayHasLength(match.property) && match.property!.some(property => isObjectHasKeys(property, ["match"]));
}

export default { describeQuery, getUnnamedObjects };
