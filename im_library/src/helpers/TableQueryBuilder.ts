import { TableQuery } from "../interfaces/query/TableQuery";
import { TTAlias, Where } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildTableQuery(query: any) {
  const parentNode = { key: "1", children: [] as TableQuery[] } as TableQuery;
  buildRecursively(query, "query", parentNode);
  const children = joinFromWhere(parentNode.children[0]);
  return children;
}

function joinFromWhere(parentNode: TableQuery) {
  console.log(parentNode);
  if ("query" === parentNode.type) {
    const from = { ...parentNode };
    delete from.children;
    parentNode.children.unshift(from);
  }
  return parentNode.children;
}

function buildRecursively(query: any, type: string, parent: TableQuery) {
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

function buildDQInstance(parent: TableQuery, label: string, type?: string, data?: any): TableQuery {
  return {
    key: getKey(parent),
    label: label,
    parent: parent,
    type: type,
    data: data,
    bool: data?.bool,
    children: []
  };
}

// adders
function addObject(query: any, type: string, parent: TableQuery) {
  const label = query.description || query.name || query.bool || query.variable || getNameFromRef(query);
  let tableQuery;
  if (label && label !== "and") {
    tableQuery = buildDQInstance(parent, label, type, query);
    parent.children.push(tableQuery);
  }
  for (const key of Object.keys(query)) {
    if (!isPrimitiveType(query[key])) buildRecursively(query[key], tableQuery ? key : type, tableQuery ? tableQuery : parent);
  }
}

function addWhere(query: any, type: string, parent: TableQuery) {
  if (isAnd(query)) {
    for (const where of query.where) {
      buildRecursively(where, "where", parent);
    }
  } else if (isLeafWhere(query) && (isObjectHasKeys(query, ["@id"]) || isObjectHasKeys(query, ["id"]) || isObjectHasKeys(query, ["bool", "in"]))) {
    if (isObjectHasKeys(query, ["in"])) {
      addInClause(query.description, query, type, parent);
    } else if (isComparisonWhere(query)) {
      addItem(query.description, query, type, parent);
    } else if (isObjectHasKeys(query, ["notExist"])) {
      addItem(query.description, query, type, parent);
    } else if (isObjectHasKeys(query, ["range"])) {
      addItem(query.description, query, type, parent);
    } else {
      addObject(query, type, parent);
    }
  } else {
    addObject(query, type, parent);
  }
}

function addSelect(query: any, type: string, parent: TableQuery) {
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

function addInItems(label: string, query: any, type: string, parent: TableQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  for (const inItem of query.in) {
    addItem(inItem.name, inItem, "whereIn", child);
  }
}

function addItem(label: string, query: any, type: string, parent: TableQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  return child;
}

function addInClause(label: string, query: any, type: string, parent: TableQuery) {
  if (isArrayHasLength(query.in) && query.in.length > 1) {
    addInItems(label, query, type, parent);
  } else if (isObjectHasKeys(query.in[0], ["where"])) {
    const child = addItem(label, query, type, parent);
    addWhere(query.in[0].where, "where", child);
  } else {
    addItem(label, query, type, parent);
  }
}

// getters

function getKey(parent: TableQuery) {
  return parent.key + parent.children.length;
}

function getNameFromRef(ref: TTAlias) {
  if (isObjectHasKeys(ref, ["name"])) {
    return ref.name;
  } else if (isObjectHasKeys(ref, ["@id"])) {
    const splits = ref["@id"].split("#");
    return splits[1] || splits[0];
  }
  return "";
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

export default { buildTableQuery };
