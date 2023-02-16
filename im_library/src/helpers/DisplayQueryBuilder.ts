import { Where } from "../models/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

interface DisplayQuery {
  key: string;
  label: string;
  data: any;
  type: string;
  children: DisplayQuery[];
  icon?: string;
  style?: any;
  styleClass?: string;
  selectable?: boolean;
  leaf?: boolean;
  expandedIcon?: string;
  collapsedIcon?: string;
  [key: string]: any;
}

export function buildDisplayQuery(query: any) {
  const parentNode = { key: "1", children: [] as DisplayQuery[] } as DisplayQuery;
  buildRecursively(query, "query", parentNode);
  return parentNode.children;
}

function buildRecursively(query: any, type: string, parent: DisplayQuery) {
  if ("where" === type || "with" === type) {
    addWhere(query, type, parent);
  } else if (isObjectHasKeys(query)) {
    addObject(query, type, parent);
  } else if (isArrayHasLength(query)) {
    for (const nested of query) {
      buildRecursively(nested, type, parent);
    }
  }
}

// adders
function addObject(query: any, type: string, parent: DisplayQuery) {
  const label = query.name || query.id || query.bool || query.description;
  let displayQuery;
  if (label) {
    displayQuery = createDisplayQuery(parent, label, type, query);
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
  } else if (isLeafWhere(query)) {
    if (isObjectHasKeys(query, ["id", "in", "latest", "count"])) {
      if (isArrayHasLength(query.in) && query.in.length > 1) {
        const label = "Latest " + query.id + " from";
        addInItems(label, query, type, parent);
      } else {
        const label = "Latest " + query.id + ": " + query.in[0].name;
        addItem(label, query, type, parent);
      }
    } else if (isObjectHasKeys(query, ["id", "in"])) {
      if (isArrayHasLength(query.in) && query.in.length > 1) {
        const label = query.id + " from";
        addInItems(label, query, type, parent);
      } else {
        const label = query.id + ": " + query.in[0].name;
        addItem(label, query, type, parent);
      }
    } else if (hasBool(query, "not") && isObjectHasKeys(query, ["bool", "in"])) {
      if (isArrayHasLength(query.in) && query.in.length > 1) {
        const label = "Not from";
        addInItems(label, query, type, parent);
      } else {
        const label = `Not from ${query.in[0].name}`;
        addItem(label, query, type, parent);
      }
    } else if (isObjectHasKeys(query, ["id", "operator", "unit", "value", "relativeTo"])) {
      const label = `${query.id} ${query.operator} ${query.relativeTo} by ${query.value} ${query.unit}`;
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["id", "operator", "unit", "value"])) {
      const label = `${query.id} ${query.operator} ${query.value} ${query.unit}`;
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["id", "operator", "value"])) {
      const label = `${query.id} ${query.operator} ${query.value}`;
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["id", "operator", "relativeTo"])) {
      const label = `${query.id} ${query.operator} ${query.relativeTo}`;
      addItem(label, query, type, parent);
    } else if (isObjectHasKeys(query, ["id", "notExist"])) {
      const label = `${query.id} does not exist`;
      addItem(label, query, type, parent);
    } else {
      addObject(query, type, parent);
    }
  } else {
    addObject(query, type, parent);
  }
}

function addInItems(label: string, query: any, type: string, parent: DisplayQuery) {
  const child = createDisplayQuery(parent, label, type, query);
  parent.children.push(child);
  for (const inItem of query.in) {
    addItem(inItem.name, query, type, child);
  }
}

function addItem(label: string, query: any, type: string, parent: DisplayQuery) {
  const child = createDisplayQuery(parent, label, type, query);
  parent.children.push(child);
}

// builder
function createDisplayQuery(parent: DisplayQuery, label: string, type?: string, data?: any): DisplayQuery {
  label = label === "or" ? "any of" : label;
  return {
    key: getKey(parent),
    label: label,
    type: type,
    data: data,
    children: []
  };
}

function getKey(parent: DisplayQuery) {
  return parent.key + parent.children.length;
}

// checks
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

export default { buildDisplayQuery };
