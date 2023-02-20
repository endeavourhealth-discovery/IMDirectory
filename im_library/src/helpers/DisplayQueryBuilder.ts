import { DisplayQuery } from "../interfaces";
import { TTAlias, Where } from "../models/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildDisplayQuery(query: any) {
  const parentNode = { key: "1", children: [] as DisplayQuery[] } as DisplayQuery;
  buildRecursively(query, "query", parentNode);
  return parentNode.children;
}

function buildRecursively(query: any, type: string, parent: DisplayQuery) {
  if ("where" === type || "with" === type) {
    addWhere(query, type, parent);
  } else if ("select" === type) {
    addSelect(query, type, parent);
  } else if (isObjectHasKeys(query)) {
    addObject(query, type, parent);
  } else if (isArrayHasLength(query)) {
    for (const nested of query) {
      buildRecursively(nested, type, parent);
    }
  }
}

function buildDQInstance(parent: DisplayQuery, label: string, type?: string, data?: any): DisplayQuery {
  label = label === "or" ? "any of" : label;
  return {
    key: getKey(parent),
    label: label,
    type: type,
    data: data,
    children: []
  };
}

// adders
function addObject(query: any, type: string, parent: DisplayQuery) {
  const label = query.name || query.id || query.bool || query.description || query.variable || getNameFromRef(query);
  let displayQuery;
  if (label && label !== "and") {
    displayQuery = buildDQInstance(parent, label, type, query);
    parent.children.push(displayQuery);
  }
  for (const key of Object.keys(query)) {
    if (!isPrimitiveType(query[key])) buildRecursively(query[key], displayQuery ? key : type, displayQuery ? displayQuery : parent);
  }
}

function addWhere(query: any, type: string, parent: DisplayQuery) {
  if (isAnd(query)) {
    for (const where of query.where) {
      buildRecursively(where, "where", parent);
    }
  } else if (isLeafWhere(query) && (isObjectHasKeys(query, ["@id"]) || isObjectHasKeys(query, ["id"]) || isObjectHasKeys(query, ["bool", "in"]))) {
    const id = query.id || query["@id"];
    if (isObjectHasKeys(query, ["in"])) {
      addInClause(id, query, type, parent);
    } else if (isComparisonWhere(query)) {
      const label = id + " " + getComparisonLabel(query);
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["notExist"])) {
      const label = `${id} does not exist`;
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["range"])) {
      const from = " from " + getComparisonLabel(query.range.from);
      const to = " to " + getComparisonLabel(query.range.from);
      const label = id + " " + from + to;
      addItem(label, query, type, parent);
    } else {
      addObject(query, type, parent);
    }
  } else {
    addObject(query, type, parent);
  }
}

function addSelect(query: any, type: string, parent: DisplayQuery) {
  if (isArrayHasLength(query)) {
    const child = buildDQInstance(parent, type, type, query);
    parent.children.push(child);
    for (const item of query) {
      buildRecursively(item, type, child);
    }
  } else {
    const label = getNameFromRef(query);
    const child = addItem(label, query, type, parent);
    if (isObjectHasKeys(query, ["where"])) {
      buildRecursively(query.where, "where", child);
    }
    if (isObjectHasKeys(query, ["with"])) {
      buildRecursively(query.with, "with", child);
    }
  }
}

function addInItems(label: string, query: any, type: string, parent: DisplayQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  for (const inItem of query.in) {
    addItem(inItem.name, query, type, child);
  }
}

function addItem(label: string, query: any, type: string, parent: DisplayQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  return child;
}

function addInClause(id: string, query: any, type: string, parent: DisplayQuery) {
  let label = getInLabel(id, query, type, parent);
  if (isArrayHasLength(query.in) && query.in.length > 1) {
    label += query.valueLabel ? ": " + query.valueLabel + " (expand to see more...)" : " from";
    addInItems(label, query, type, parent);
  } else {
    label += ": " + (query.valueLabel || query.in[0].name);
    addItem(label, query, type, parent);
  }
}

// getters
function getInLabel(id: string, query: any, type: string, parent: DisplayQuery) {
  let label = "";
  if (isObjectHasKeys(query, ["in", "latest", "count"])) label += "Latest " + id;
  else if (hasBool(query, "not") && isObjectHasKeys(query, ["bool", "in"])) label += "Not from";
  else label += id;

  return label;
}

function getKey(parent: DisplayQuery) {
  return parent.key + parent.children.length;
}

function getNameFromRef(ref: TTAlias) {
  if (isObjectHasKeys(ref, ["name"])) {
    return ref.name;
  } else if (isObjectHasKeys(ref, ["@id"])) {
    const splits = ref["@id"].split("#");
    return splits[1] || splits[0];
  } else if (isObjectHasKeys(ref, ["id"])) {
    return ref.id;
  }
  return "";
}

function getComparisonLabel(query: any) {
  let label = "";
  if (query.operator) label += query.operator;
  if (query.relativeTo) label += " " + query.relativeTo;
  if (query.value) label += " " + query.value;
  if (query.unit) label += " (" + query.unit + ")";
  return label;
}

// checkers
function hasBool(where: any, value?: string) {
  if (value) return isObjectHasKeys(where, ["bool"]) && value === where.bool;
  return isObjectHasKeys(where, ["bool"]);
}

function isAnd(where: Where) {
  return hasBool(where, "and") && isArrayHasLength(where.where);
}

function isLeafWhere(where: any) {
  return !isArrayHasLength(where) && !isObjectHasKeys(where, ["where", "with"]);
}

function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

function isComparisonWhere(where: Where) {
  return (
    isObjectHasKeys(where, ["operator", "unit", "value", "relativeTo"]) ||
    isObjectHasKeys(where, ["operator", "unit", "value"]) ||
    isObjectHasKeys(where, ["operator", "value"]) ||
    isObjectHasKeys(where, ["operator", "relativeTo"])
  );
}

export default { buildDisplayQuery };
