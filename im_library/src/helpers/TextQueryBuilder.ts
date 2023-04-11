import { ITextQuery } from "../interfaces";
import { Element, Match, Path, Where, Property, OrderLimit } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildTextQuery(query: any) {
  const parentNode = { key: "1", children: [] as ITextQuery[] } as ITextQuery;
  buildRecursively(query, "query", parentNode);
  return parentNode.children;
}

function buildRecursively(query: any, type: string, parent: ITextQuery) {
  if ("match" === type) {
    addMatch(query, type, parent);
  } else if ("select" === type) {
    const selectParent = addItem("select", query, type, parent);
    addSelect(query, type, selectParent);
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

function buildDQInstance(parent: ITextQuery, label: string, type: string, data: any): ITextQuery {
  label = label === "or" ? "any of" : label;
  return {
    key: getKey(parent),
    display: label,
    type: type,
    data: data,
    parent: parent,
    bool: data.bool,
    children: []
  };
}

// adders
function addSelect(select: any, type: string, parent: ITextQuery) {
  if (isArrayHasLength(select)) {
    for (const selectItem of select) {
      addSelect(selectItem, type, parent);
    }
  } else {
    const label = getNameFromRef(select);
    const newParent = addItem(label, select, type, parent);

    if (isArrayHasLength(select.select)) {
      for (const matchItem of select.select) {
        addSelect(matchItem, type, newParent);
      }
    }
  }
}

function addMatch(match: any, type: string, parent: ITextQuery) {
  if (isArrayHasLength(match)) {
    for (const matchItem of match) {
      addMatch(matchItem, type, parent);
    }
  } else if (!isObjectHasKeys(match, ["match", "boolMatch"])) {
    const label = getMatchLabel(match);
    const matchParent = addItem(label, match, type, parent);
    if (!matchParent.display && match.description) matchParent.display = match.description;

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

function addMatchOrderBy(orderBy: any, type: string, parent: ITextQuery) {
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

function addMatchWhere(where: any, type: string, parent: ITextQuery) {
  if (isArrayHasLength(where)) {
    for (const whereItem of where) {
      addMatchWhere(whereItem, type, parent);
    }
  } else {
    if (!parent.display && where.node) parent.display += where.node;
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

function addComparison(where: any, type: string, parent: ITextQuery) {
  const label = getNameFromRef(where) + " " + getComparisonLabel(where);
  addItem(label, where, type, parent);
}

function addIn(where: any, parent: ITextQuery) {
  parent.display += "." + getNameFromRef(where);
  if (isArrayHasLength(where.in) && where.in.length === 1) {
    parent.display += ": " + getNameFromRef(where.in[0]);
  } else {
    for (const inItem of where.in as Element[]) {
      addItem(getNameFromRef(inItem), inItem, "in", parent);
    }
  }
}

function addRange(where: any, type: string, parent: ITextQuery) {
  const from = " from " + getComparisonLabel(where.range.from);
  const to = " to " + getComparisonLabel(where.range.from);
  const label = getNameFromRef(where) + " " + from + to;
  addItem(label, where, type, parent);
}

function addItem(label: string, query: any, type: string, parent: ITextQuery) {
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

function getKey(parent: ITextQuery) {
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
  } else if (isObjectHasKeys(ref, ["parameter"])) {
    name = ref.parameter;
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

export default { buildTextQuery };
