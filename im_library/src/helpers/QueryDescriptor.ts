import { Bool, Entailment, Operator, Property } from "../interfaces/AutoGen";
import { Match, OrderLimit, Node, Query } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef, resolveIri } from "./TTTransform";

const propertyDisplayMap = { concept: "of", ethnicity: "of", language: "of" } as any;

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

export function describeMatch(match: Match, index: number, bool: Bool, isPathMatch?: boolean) {
  let display = getDisplayFromMatch(match, isPathMatch);
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
  if (property.match) describeMatch(property.match, 0, "and", true);
  if (isObjectHasKeys(property, ["@id"])) {
    let display = getDisplayFromEntailment(property);
    display += getDisplayFromProperty(property);
    if (index && bool) display = getDisplayFromLogic(bool) + " " + display;
    property.description = display;
  }

  if (isArrayHasLength(property.property))
    for (const [index, nestedProperty] of property.property!.entries()) {
      describeProperty(nestedProperty, index, property.bool!);
    }
}

// getters
export function getDisplayFromMatch(match: Match, isPathMatch?: boolean) {
  let display = "";
  //display += getDisplayFromEntailment(match);
  display += getNameFromRef(match);
  if (match.orderBy) describeOrderByList(match.orderBy);
  if (match.inSet) display = "in '" + display + "'";
  if (isPathMatch) display += " with";
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
  if (!property.match) display += propertyName;
  if (propertyDisplayMap[propertyName]) display += " " + propertyDisplayMap[propertyName];
  if (property.is) display += getDisplayFromList(property, true);
  if (property.isNot) display += getDisplayFromList(property, false);
  if (property.operator) display = getDisplayFromOperator(propertyName, property);
  if (property.range) display = getDisplayFromRange(propertyName, property);
  if (property.null) display += " is null";
  return display;
}

export function describeOrderByList(orderByList: OrderLimit[]) {
  for (const orderBy of orderByList) {
    const generatedDesc = getDisplayFromOrderBy(orderBy);
    if (generatedDesc) orderBy.description = generatedDesc;
  }
}

export function getDisplayFromOrderBy(orderBy: OrderLimit) {
  let display = "";
  if (orderBy.variable) display += orderBy.variable + ".";
  const propertyName = getNameFromRef(orderBy);
  if (propertyDisplayMap[propertyName]) display += propertyName + " " + propertyDisplayMap[propertyName] + " ";
  else display += propertyName;
  if (propertyName.toLocaleLowerCase().includes("date")) {
    if ("descending" === orderBy.direction) {
      if (orderBy.limit === 1) display = "get latest by " + display;
      else display = "get latest " + orderBy.limit + " by " + display;
    } else if ("ascending" === orderBy.direction) {
      if (orderBy.limit === 1) display = "get earliest by " + display;
      else display = "get earliest " + orderBy.limit + " by " + display;
    }
  } else if (propertyName) {
    if ("descending" === orderBy.direction) {
      if (orderBy.limit === 1) display = "get highest by " + display;
      else display = "get highest " + orderBy.limit + " by " + display;
    } else if ("ascending" === orderBy.direction) {
      if (orderBy.limit === 1) display = "get lowest by " + display;
      else display = "get lowest " + orderBy.limit + " by " + display;
    }
  }

  return display ? "<div class='variable-line'>" + display + "</div>" : "";
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
  display += property.range?.from.value + " and " + property.range?.to.value;
  if (!propertyName.toLowerCase().includes("date")) display += " " + property.range?.to.unit;
  return display;
}

export function getDisplayFromOperator(propertyDisplay: string, property: Property) {
  let display = "";

  if (propertyDisplay.toLowerCase().includes("date")) {
    display += propertyDisplay + " " + getDisplayFromDateComparison(property);
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
    if (property.operator) display += getDisplayFromOperatorForDate(property.operator);
    display += getDisplayFromValueAndUnitForDate(property);
    if (property.relativeTo && "$referenceDate" !== property.relativeTo.parameter)
      display += " from " + (getDisplayFromNodeRef(property.relativeTo?.nodeRef) ?? getNameFromRef(property.relativeTo));
  } else {
    if (property.operator) display += getDisplayFromOperatorForDate(property.operator);
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
  if (property.value) display += property.value + " ";
  if (property.unit) display += property.unit;
  return display;
}

export function getDisplayFromOperatorForDate(operator: Operator) {
  switch (operator) {
    case "=":
      return "on ";
    case ">":
    case ">=":
      return "after ";
    case "<=":
      return "before ";

    default:
      return "on ";
  }
}

export function getDisplayFromList(property: Property, include: boolean) {
  let display = include ? " " : " not ";
  const nodes: Node[] = property.inSet ?? property.notInSet ?? [];
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

export function getDisplayFromEntailment(entailment: Entailment) {
  if (entailment.ancestorsOf) return "ancestors of ";
  if (entailment.descendantsOf) return "descendants of ";
  if (entailment.descendantsOrSelfOf) return "";
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
      pathList.push(propertyOrMatch.match.typeOf);
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
  // TODO: Set is now an array
  const iri = object["@id"] || (object["inSet"] && object["inSet"].length > 0 ? object["inSet"][0]["@id"] : null) || object["typeOf"]?.["@id"];
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
