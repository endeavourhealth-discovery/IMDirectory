import { Bool, Entailment, Operator, OrderDirection, Where, Return, ReturnProperty } from "../interfaces/AutoGen";
import { Match, OrderLimit, Node, Query } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef, resolveIri } from "./TTTransform";
import { IM } from "../vocabulary";

const propertyDisplayMap: { path: any; then: any } = { path: { concept: "is", ethnicity: "of", language: "of" }, then: { concept: "is" } };

export type MatchType = "path" | "then" | "";

// descriptors
export function describeQuery(query: Query, includeLogicDesc: boolean): Query {
  const describedQuery = { ...query };
  describe(describedQuery, includeLogicDesc);
  return describedQuery;
}

function describe(query: Query, includeLogicDesc: boolean) {
  if (isArrayHasLength(query.match)) {
    for (const [index, match] of query.match!.entries()) {
      describeMatch(match, index, includeLogicDesc, Bool.or);
    }
  }
  if (isArrayHasLength(query.where)) {
    for (const [index, prop] of query.where!.entries()) {
      describeProperty(prop, index, includeLogicDesc, Bool.and);
    }
  }
  if (isArrayHasLength(query.query)) {
    for (const subQuery of query.query!) {
      describe(subQuery, includeLogicDesc);
    }
  }
  if (isArrayHasLength(query.return)) {
    for (const returnItem of query.return!) {
      describeReturn(returnItem, []);
    }
  }
}

export function describeReturn(returnItem: Return, pathProperties: string[]) {
  if (isArrayHasLength(returnItem.property)) {
    for (const [index, property] of returnItem.property!.entries()) {
      describeReturnProperty(property, pathProperties);
    }
  }
}

export function describeReturnProperty(property: ReturnProperty, pathProperties: string[]) {
  if (isObjectHasKeys(property, ["return"])) {
    pathProperties.push(getNameFromRef(property));
    describeReturn(property.return!, pathProperties);
  } else {
    const pathString = pathProperties.join(" ");
    const propertyDesc = getNameFromRef(property);
    property.description = pathString ? pathString + " -> " + propertyDesc : propertyDesc;
  }
}

export function describeMatch(match: Match, index: number, includeLogicDesc: boolean, bool?: Bool, matchType?: MatchType) {
  let display = getDisplayFromMatch(match, includeLogicDesc, matchType);

  if (includeLogicDesc && match.exclude && matchType !== "then") display = getDisplayFromLogic("exclude") + " " + display;
  if (includeLogicDesc && index && bool) display = getDisplayFromLogic(bool) + " " + display;

  if (isArrayHasLength(match.match)) {
    if (matchType === "then") matchType = "";
    for (const [index, nestedMatch] of match.match!.entries()) {
      describeMatch(nestedMatch, index, includeLogicDesc, match.boolMatch!, matchType);
    }
  }

  if (isArrayHasLength(match.where)) {
    if (matchType === "then") matchType = "";
    for (const [index, property] of match.where!.entries()) {
      describeProperty(property, index, includeLogicDesc, property.boolWhere!, matchType);
    }
  }

  if (match.then) {
    describeMatch(match.then, 0, includeLogicDesc, Bool.and, "then");
  }
  match.description = display;
  if (!match.name) {
    match.name = display;
  }
}

export function describeProperty(property: Where, index: number, includeLogicDesc: boolean, bool?: Bool, matchType?: MatchType) {
  if (property.match) describeMatch(property.match, 0, includeLogicDesc, Bool.and, "path");
  if (isObjectHasKeys(property, ["@id"])) {
    let display = getDisplayFromProperty(property, matchType);
    if (includeLogicDesc) {
      if (index && bool) {
        display = getDisplayFromLogic(bool) + " " + display;
      } else if (!index && bool) {
        display = getDisplayFromLogic(Bool.and) + " " + display;
      }
    }
    property.description = display;
  }

  if (isArrayHasLength(property.where))
    for (const [index, nestedProperty] of property.where!.entries()) {
      describeProperty(nestedProperty, index, includeLogicDesc, property.boolWhere!, matchType);
    }
}

// getters
export function getDisplayFromMatch(match: Match, includeLogicDesc: boolean, matchType?: MatchType) {
  let display = "";
  if (includeLogicDesc) {
    if (matchType === "then") {
      display = "then";
      display += " " + getDisplayFromLogic(match.exclude ? "exclude" : "include");
    }
  }

  if (match.typeOf) {
    display = getNameFromRef(match.typeOf);
    display += getDisplaySuffixFromEntailment(match.typeOf);
  } else if (isArrayHasLength(match.instanceOf)) {
    for (const [index, instanceOf] of match.instanceOf!.entries()) {
      display += (display != "" ? " or " : "") + (instanceOf.memberOf ? "is member of " : "is  ") + getNameFromRef(instanceOf);
      display += getDisplaySuffixFromEntailment(instanceOf);
    }
  } else if (!match.where && match["@id"] && match.name) {
    display += getDisplaySuffixFromEntailment(match as any);
  }

  if (match.orderBy) describeOrderByList(match.orderBy, matchType);
  if ("path" === matchType) display += " with";

  return display;
}

export function getDisplayFromIs(_is: Node[]) {
  let display = "in '";

  if (_is.length === 1) {
    display += getDisplayFromEntailment(_is[0]);
    display += getNameFromRef(_is[0]);
  } else if (_is.length <= 3) {
    display += "any of [";
    for (const [index, node] of _is.entries()) {
      display += getDisplayFromEntailment(node);
      display += getNameFromRef(node);
      if (index !== _is.length - 1) display += ", ";
    }
    display += "]";
  } else {
    display += "any of [";
    display += getDisplayFromEntailment(_is[0]);
    display += getNameFromRef(_is[0]);
    display += " and " + getDisplayFromNodeRef("more...") + "]";
  }
  return display + "'";
}

export function getDisplayFromPropertyList(matchDisplay: string, propertyList: Where[], matchType: MatchType) {
  const propertyDisplays = [];
  for (const propertyItem of propertyList) {
    if (matchDisplay && matchDisplay.slice(-1) !== ".") matchDisplay += ".";
    propertyDisplays.push(matchDisplay + getDisplayFromProperty(propertyItem, matchType));
  }

  return propertyDisplays;
}

export function getDisplayFromProperty(property: Where, matchType?: MatchType) {
  let display = "";
  const propertyName = getDisplayFromNodeRef(property.nodeRef) ?? getNameFromRef(property);
  if (!property.match) display += propertyName;

  if (property.isNull) display += " is not recorded";
  else if (property.isNotNull) display += " is recorded";
  else {
    if (matchType && propertyDisplayMap?.[matchType]?.[propertyName]) display += " " + propertyDisplayMap[matchType][propertyName];
    display += getDisplaySuffixFromEntailment(property);

    if (isPropertyValueList(property)) {
      if (property.valueLabel) {
        const totalNumberOfNodes = getNumberOfListItems(property);
        if (totalNumberOfNodes === 1) display += " " + property.valueLabel;
        else display += " " + getDisplayFromNodeRef(property.valueLabel);
      } else {
        if (property.is) display += " " + getDisplayFromList(true, property.is);
      }
    }
    if (property.operator) display = getDisplayFromOperator(propertyName, property);
    if (property.range) display = getDisplayFromRange(propertyName, property);
  }
  return display;
}

export function describeOrderByList(orderLimit: OrderLimit, matchType?: MatchType) {
  if (orderLimit?.property) {
    const desc = getDisplayFromOrderBy(orderLimit.property, matchType, orderLimit.limit);

    orderLimit.description = "<div class='variable-line'>get " + desc + "</div>";
  }
}

function isPropertyValueList(property: Where) {
  return isArrayHasLength(property.is);
}

export function getNumberOfListItems(property: Where) {
  let totalNumberOfNodes = 0;
  if (isArrayHasLength(property.is)) totalNumberOfNodes += property.is!.length;
  return totalNumberOfNodes;
}

function getDisplayFromOrderBy(orderDirection: OrderDirection, matchType?: MatchType, count = 0) {
  let display = "";
  const limit = count > 1 ? " " + count + " " : " ";

  if (orderDirection.variable) display += orderDirection.variable + ".";

  const propertyName = getNameFromRef(orderDirection);

  if (matchType && propertyDisplayMap?.[matchType]?.[propertyName]) display += propertyName + " " + propertyDisplayMap[matchType][propertyName] + " ";
  else display += propertyName;

  // Shortcut for effectiveDate and Value
  if (IM.EFFECTIVE_DATE === orderDirection["@id"] || IM.VALUE === orderDirection["@id"]) display = "";
  else display = "by " + display;

  if (propertyName.toLocaleLowerCase().includes("date")) {
    if ("descending" === orderDirection.direction) {
      display = "latest" + limit + display;
    } else if ("ascending" === orderDirection.direction) {
      display = "earliest" + limit + display;
    }
  } else if (propertyName) {
    if ("descending" === orderDirection.direction) {
      display = "highest" + limit + display;
    } else if ("ascending" === orderDirection.direction) {
      display = "lowest" + limit + display;
    }
  }

  return display.trim();
}

export function getDisplayFromLogic(title: string) {
  switch (title) {
    case "include":
      return "<span style='color: green;'>include if</span> ";
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

export function getDisplayFromRange(propertyName: string, property: Where) {
  const propertyDisplay = propertyName;
  let display = propertyDisplay + " between ";
  display += property.range?.from.value + " and " + property.range?.to.value;
  if (!propertyName.toLowerCase().includes("date") && property.range?.to.unit) display += " " + property.range?.to.unit;
  return display;
}

export function getDisplayFromOperator(propertyDisplay: string, property: Where) {
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

export function getDisplayFromDateComparison(property: Where) {
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

export function getDisplayFromValueAndUnitForDate(property: Where) {
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

export function getDisplayFromList(include: boolean, nodes: Node[]) {
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
    display += " and " + getDisplayFromNodeRef("more...") + "]";
  }
  return display;
}

export function getDisplaySuffixFromEntailment(entailment: Entailment) {
  if (entailment.ancestorsOf) return " (ancestors only)";
  if (entailment.descendantsOf) return " (excluding subtypes)";
  return "";
}

export function getDisplayFromEntailment(entailment: Entailment) {
  if (entailment.ancestorsOf) return "ancestors ";
  if (entailment.descendantsOf) return "subtypes ";
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
  else if (isArrayHasLength(object.instanceOf)) {
    if (object.instanceOf.length === 1) iri = object.instanceOf[0]["@id"];
    else if (object.instanceOf.length > 1) {
      for (const item of object.instanceOf) {
        addUnnamedObject(unnamedObjects, item);
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
