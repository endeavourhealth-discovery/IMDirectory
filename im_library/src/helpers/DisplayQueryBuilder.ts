import { DisplayQuery } from "../interfaces";
import { Element, Match, Path, Where, Property, OrderLimit } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildDisplayQuery(query: any) {
  const parentNode = { key: "1", children: [] as DisplayQuery[] } as DisplayQuery;
  buildRecursively(query, "query", parentNode);
  return parentNode.children;
}

function buildRecursively(query: any, type: string, parent: DisplayQuery) {
  if ("match" === type) {
    addMatch(query, type, parent);
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
function addMatch(match: any, type: string, parent: DisplayQuery) {
  if (isArrayHasLength(match)) {
    for (const matchItem of match) {
      addMatch(matchItem, type, parent);
    }
  } else if (!isObjectHasKeys(match, ["match", "boolMatch"])) {
    const label = getMatchLabel(match);
    const matchParent = addItem(label, match, type, parent);
    if (!matchParent.label && match.description) matchParent.label = match.description;

    if (isObjectHasKeys(match, ["where"])) {
      addMatchWhere(match.where, "where", matchParent);
    }
    if (isObjectHasKeys(match, ["orderBy"])) {
      addMatchOrderBy(match.orderBy, "orderBy", matchParent);
    }
  } else if (isArrayHasLength(match.match)) {
    const boolParent = addItem(match.boolMatch, match, type, parent);
    for (const matchItem of match.match) {
      addMatch(matchItem, type, boolParent);
    }
  }
}

function addMatchOrderBy(orderBy: any, type: string, parent: DisplayQuery) {
  if (isArrayHasLength(orderBy)) {
    for (const orderByItem of orderBy) {
      addMatchOrderBy(orderByItem, type, parent);
    }
  } else {
    const orderByItem: OrderLimit = orderBy;
    if (isObjectHasKeys(orderByItem, ["@id", "direction", "limit"]) && 1 === orderByItem.limit) {
      const label = "order by: " + orderByItem.node;
      addItem(label, orderBy, type, parent);
    }
  }
}

function addMatchWhere(where: any, type: string, parent: DisplayQuery) {
  if (isArrayHasLength(where)) {
    for (const whereItem of where) {
      addMatchWhere(whereItem, type, parent);
    }
  } else {
    if (!parent.label && where.node) parent.label += where.node;
    if (isObjectHasKeys(where, ["in"])) {
      addIn(where, parent);
    }
    if (isObjectHasKeys(where, ["range"])) {
      addRange(where, type, parent);
    }
    if (isObjectHasKeys(where, ["operator"])) {
      addComparison(where, type, parent);
    }
  }
}

function addComparison(where: any, type: string, parent: DisplayQuery) {
  const label = getNameFromRef(where) + " " + getComparisonLabel(where);
  addItem(label, where, type, parent);
}

function addIn(where: any, parent: DisplayQuery) {
  parent.label += "." + getNameFromRef(where);
  if (isArrayHasLength(where.in) && where.in.length === 1) {
    parent.label += ": " + getNameFromRef(where.in[0]);
  } else {
    for (const inItem of where.in as Element[]) {
      addItem(getNameFromRef(inItem), inItem, "in", parent);
    }
  }
}

function addRange(where: any, type: string, parent: DisplayQuery) {
  const from = " from " + getComparisonLabel(where.range.from);
  const to = " to " + getComparisonLabel(where.range.from);
  const label = getNameFromRef(where) + " " + from + to;
  addItem(label, where, type, parent);
}

function addItem(label: string, query: any, type: string, parent: DisplayQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  return child;
}

// getters
function getMatchLabel(match: Match) {
  let label: string = getNameFromRef(match);
  if (!label && match.path) {
    for (const path of match.path as Element[]) {
      label += getNameFromRef(path) + ".";
    }
    label = label.substring(0, label.length - 1);
  }
  return label;
}

function getKey(parent: DisplayQuery) {
  return parent.key + parent.children.length;
}

function getNameFromRef(ref: any) {
  let name = "";
  if (isObjectHasKeys(ref, ["name"])) {
    name = ref.name;
  } else if (isObjectHasKeys(ref, ["@id"])) {
    const splits = ref["@id"].split("#");
    name = splits[1] || splits[0];
  } else if (isObjectHasKeys(ref, ["@set"])) {
    const splits = ref["@set"].split("#");
    name = splits[1] || splits[0];
  } else if (isObjectHasKeys(ref, ["@type"])) {
    const splits = ref["@type"].split("#");
    name = splits[1] || splits[0];
  }

  if (ref.variable) name += "(as " + ref.variable + ")";
  return name;
}

function getComparisonLabel(query: any) {
  let label = "";
  if (query.operator) label += query.operator;
  if (query.relativeTo) label += " " + getLabelFromProperty(query.relativeTo);
  if (query.value) label += " " + query.value;
  if (query.unit) label += " (" + query.unit + ")";
  return label;
}

function getLabelFromProperty(property: Property) {
  return property.parameter || property.node || getNameFromRef(property);
}

// checkers
function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

export default { buildDisplayQuery };
