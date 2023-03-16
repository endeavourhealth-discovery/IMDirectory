import { TableQuery } from "../interfaces/query/TableQuery";
import { TTAlias, Where } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildTableQuery(query: any) {
  const parentNode = { key: "1", children: [] as TableQuery[] } as TableQuery;
  buildRecursively(query, "query", parentNode);
  return parentNode.children;
}

function buildRecursively(query: any, type: string, parent: TableQuery) {
  if ("from" === type) {
    addFrom(query, type, parent);
  } else if ("where" === type || "with" === type) {
    addWhere(query, type, parent);
  } else if ("select" === type) {
    addSelect(query, type, parent);
  } else if (isObjectHasKeys(query)) {
    for (const key of Object.keys(query)) {
      if (!isPrimitiveType(query[key])) buildRecursively(query[key], key, parent);
    }
  } else if (isArrayHasLength(query)) {
    for (const nested of query) {
      buildRecursively(nested, type, parent);
    }
  }
}

function buildDQInstance(parent: TableQuery, label: string, type: string, data: any): TableQuery {
  return {
    key: getKey(parent),
    label: label,
    parent: parent,
    type: type,
    data: data,
    bool: data.bool,
    children: []
  };
}

// adders
function addObject(query: any, type: string, parent: TableQuery) {
  console.log(query["@id"]);
  const label = query.description || query.name || query.bool || query.variable || getNameFromRef(query) || query["@id"];
  console.log(label);
  let tableQuery;
  if (label && label !== "and") {
    tableQuery = buildDQInstance(parent, label, type, query);
    parent.children.push(tableQuery);
  }
  for (const key of Object.keys(query)) {
    if (!isPrimitiveType(query[key])) buildRecursively(query[key], tableQuery ? key : type, tableQuery ? tableQuery : parent);
  }
}

function addFrom(query: any, type: string, parent: TableQuery) {
  const label = query.name || query["@id"];
  addItem(label, query, type, parent);
  if (isObjectHasKeys(query, ["where"])) {
    buildRecursively(query.where, "where", parent);
  }
}

function addWhere(query: any, type: string, parent: TableQuery) {
  if (isLeafWhere(query) && (isObjectHasKeys(query, ["@id"]) || isObjectHasKeys(query, ["id"]) || isObjectHasKeys(query, ["bool", "in"]))) {
    const label = query.description || query["@id"];
    if (isObjectHasKeys(query, ["in"])) {
      addInClause(label, query, type, parent);
    } else if (isComparisonWhere(query)) {
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["notExist"])) {
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["range"])) {
      addItem(label, query, type, parent);
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
  const inParent = addItem(label, query, type, parent);
  for (const inItem of query.in) {
    if (isObjectHasKeys(inItem, ["where"])) {
      addWhere(inItem, "where", inParent);
    }
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
