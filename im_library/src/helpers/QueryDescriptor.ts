import { Bool, Entailment, Operator, OrderDirection, Property } from "../interfaces/AutoGen";
import { Match, OrderLimit, Node, Query } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef, resolveIri } from "./TTTransform";

const propertyDisplayMap: { path: any; then: any } = { path: { concept: "of", ethnicity: "of", language: "of" }, then: { concept: "is" } };

export type MatchType = "path" | "then";

// descriptors
export function describeQuery(query: Query): Query {
  const describedQuery = { ...query };

  if (isArrayHasLength(describedQuery.match))
    for (const [index, match] of describedQuery.match!.entries()) {
      describeMatch(match, index, "and");
    }
  else if (isArrayHasLength(describedQuery.property)) {
    for (const [index, prop] of describedQuery.property!.entries()) {
      describeProperty(prop, index, "and");
    }
  }
  return describedQuery;
}

export function describeMatch(match: Match, index: number, bool: Bool, matchType?: MatchType) {
  let display = getDisplayFromMatch(match, matchType);
  if (match.exclude) display = getDisplayFromLogic("exclude") + " " + display;
  if (index && bool) display = getDisplayFromLogic(bool) + " " + display;

  if (isArrayHasLength(match.match))
    for (const [index, nestedMatch] of match.match!.entries()) {
      describeMatch(nestedMatch, index, match.bool!, matchType);
    }

  if (isArrayHasLength(match.property))
    for (const [index, property] of match.property!.entries()) {
      describeProperty(property, index, property.bool!, matchType);
    }

  if (match.then) {
    describeMatch(match.then, 0, "and", "then");
  }

  match.description = display;
}

export function describeProperty(property: Property, index: number, bool: Bool, matchType?: MatchType) {
  if (property.match) describeMatch(property.match, 0, "and", "path");
  if (isObjectHasKeys(property, ["@id"])) {
    let display = getDisplayFromEntailment(property);
    display += getDisplayFromProperty(property, matchType);
    if (index && bool) display = getDisplayFromLogic(bool) + " " + display;
    property.description = display;
  }

  if (isArrayHasLength(property.property))
    for (const [index, nestedProperty] of property.property!.entries()) {
      describeProperty(nestedProperty, index, property.bool!, matchType);
    }
}

// getters
export function getDisplayFromMatch(match: Match, matchType?: MatchType) {
  let display = "";
  if (match.inSet) display = getDisplayFromInSet(match.inSet);
  else if (match.typeOf) display = getNameFromRef(match.typeOf);
  else if (match.instanceOf) display = "is instance of " + getNameFromRef(match.instanceOf);
  else if (!match.property && match["@id"] && match.name) display = match.name;

  if (match.orderBy) describeOrderByList(match.orderBy, matchType);
  if ("path" == matchType) display += " with";

  return display;
}

export function getDisplayFromInSet(inSet: Node[]) {
  let display = "in '";

  if (inSet.length === 1) {
    display += getDisplayFromEntailment(inSet[0]);
    display += getNameFromRef(inSet[0]);
  } else if (inSet.length <= 3) {
    display += "any of [";
    for (const [index, node] of inSet.entries()) {
      display += getDisplayFromEntailment(node);
      display += getNameFromRef(node);
      if (index !== inSet.length - 1) display += ", ";
    }
    display += "]";
  } else {
    display += "any of [";
    display += getDisplayFromEntailment(inSet[0]);
    display += getNameFromRef(inSet[0]);
    display += " and " + getDisplayFromNodeRef("more...") + "]";
  }
  return display + "'";
}

export function getDisplayFromPropertyList(matchDisplay: string, propertyList: Property[], matchType: MatchType) {
  const propertyDisplays = [];
  for (const propertyItem of propertyList) {
    if (matchDisplay && matchDisplay.slice(-1) !== ".") matchDisplay += ".";
    propertyDisplays.push(matchDisplay + getDisplayFromProperty(propertyItem, matchType));
  }

  return propertyDisplays;
}

export function getDisplayFromProperty(property: Property, matchType?: MatchType) {
  let display = "";
  const propertyName = getDisplayFromNodeRef(property.nodeRef) ?? getNameFromRef(property);
  if (!property.match) display += propertyName;

  if (matchType && propertyDisplayMap?.[matchType]?.[propertyName]) display += " " + propertyDisplayMap[matchType][propertyName];

  if (property.is) display += getDisplayFromList(property, true, property.is);
  if (property.isNot) display += getDisplayFromList(property, false, property.isNot);
  if (property.inSet) display += getDisplayFromList(property, true, property.inSet);
  if (property.notInSet) display += getDisplayFromList(property, false, property.notInSet);
  if (property.operator) display = getDisplayFromOperator(propertyName, property);
  if (property.range) display = getDisplayFromRange(propertyName, property);
  if (property.isNull) display += " is null";
  return display;
}

export function describeOrderByList(orderLimit: OrderLimit, matchType?: MatchType) {
  if (orderLimit?.property && orderLimit.property.length > 0) {
    let desc = [];
    for (const ob of orderLimit.property) {
      desc.push(getDisplayFromOrderBy(ob, matchType));
    }

    if (desc.length > 0) {
      orderLimit.description =
        "<div class='variable-line'>order by " + desc.join(" then by ") + ", keep " + (orderLimit.limit === 1 ? "first" : orderLimit.limit) + "</div>";
    }
  }
}

function getDisplayFromOrderBy(orderDirection: OrderDirection, matchType?: MatchType) {
  let display = "";
  if (orderDirection.variable) display += orderDirection.variable + ".";
  const propertyName = getNameFromRef(orderDirection);
  if (matchType && propertyDisplayMap?.[matchType]?.[propertyName]) display += propertyName + " " + propertyDisplayMap[matchType][propertyName] + " ";
  else display += propertyName;
  if (propertyName.toLocaleLowerCase().includes("date")) {
    if ("descending" === orderDirection.direction) {
      display = "latest " + display;
    } else if ("ascending" === orderDirection.direction) {
      display = "earliest " + display;
    }
  } else if (propertyName) {
    if ("descending" === orderDirection.direction) {
      display = "highest " + display;
    } else if ("ascending" === orderDirection.direction) {
      display = "lowest " + display;
    }
  }

  return display;
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
    if (property.value.includes("-") && property.operator === ">=") display += "within the last ";
    else if (property.operator) display += getDisplayFromOperatorForDate(property.operator);
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
  return "<span class='variable-line'> label as <span class='variable'>" + nodeRef + "</span></span> ";
}

export function getDisplayFromValueAndUnitForDate(property: Property) {
  let display = "";
  if (property.value) display += property.value.replace("-", "") + " ";
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

export function getDisplayFromList(property: Property, include: boolean, nodes: Node[]) {
  let display = include ? " " : " not ";
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
  let iri = "";
  if (isObjectHasKeys(object, ["@id"])) iri = object["@id"];
  else if (isObjectHasKeys(object.typeOf, ["@id"])) iri = object["typeOf"]?.["@id"];
  else if (isArrayHasLength(object.inSet)) {
    if (object.inSet.length === 1) iri = object["inSet"][0]["@id"];
    else if (object.inSet.length > 1) {
      for (const inSetItem of object.inSet) {
        addUnnamedObject(unnamedObjects, inSetItem);
      }
    }
  }

  if (iri && !isObjectHasKeys(object, ["name"])) {
    const resolvedIri = resolveIri(iri);
    if (resolvedIri)
      if (isArrayHasLength(unnamedObjects[resolvedIri])) unnamedObjects[resolvedIri].push(object);
      else unnamedObjects[resolvedIri] = [object];
  }
}

export default { describeQuery, getUnnamedObjects };
