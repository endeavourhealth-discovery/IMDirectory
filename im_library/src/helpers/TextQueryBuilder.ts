import { ITextQuery } from "../interfaces";
import { Element, Match, Path, Where, Property, OrderLimit } from "../interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";

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
    const label = getName(select);
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
  } else {
    let label = parent?.data?.boolMatch || "";
    if (label) label += " ";
    label += getMatchLabel(match);
    const matchParent = addItem(label, match, type, parent);
    if (!matchParent.display) console.log(match);
    if (isObjectHasKeys(match, ["where"])) {
      addMatchWhere(match.where, "where", matchParent);
    }

    if (isArrayHasLength(match.match)) {
      const boolParent = addItem(match.boolMatch, match, type, parent);
      for (const matchItem of match.match) {
        addMatch(matchItem, type, boolParent);
      }
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
  const label = getComparisonLabel(where);
  addItem(label, where, type, parent);
}

function addIn(where: any, parent: ITextQuery) {
  parent.display += "." + getName(where);
  if (isArrayHasLength(where.in) && where.in.length === 1) {
    parent.display += " = " + getName(where.in[0]);
  } else {
    parent.display += " in ";
    for (const inItem of where.in as Element[]) {
      addItem(getName(inItem), inItem, "in", parent);
    }
  }
}

function addRange(where: any, type: string, parent: ITextQuery) {
  const from = " from " + getComparisonLabel(where.range.from);
  const to = " to " + getComparisonLabel(where.range.from);
  const label = getName(where) + " " + from + to;
  addItem(label, where, type, parent);
}

function addItem(label: string, query: any, type: string, parent: ITextQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  return child;
}

// getters
function getMatchLabel(match: Match) {
  let label: string = getName(match) || match.boolMatch || "";
  if (!label && match.path) {
    for (const [index, value] of (match.path as Element[]).entries()) {
      if (index % 2 != 0) label += getName(value) + ".";
      else label += getName(value) + ":";
    }
    label = label.substring(0, label.length - 1);
  }
  return label;
}

function getKey(parent: ITextQuery) {
  return parent.key + parent.children.length;
}

function getName(ref: any) {
  let name = getNameFromRef(ref);
  if (isObjectHasKeys(ref, ["parameter"])) {
    name = ref.parameter;
  }

  if (ref.variable) name += "(as " + ref.variable + ")";

  return name;
}

function getComparisonLabel(where: Where) {
  console.log(where);
  let label = where.node || "";
  if (label) label += "." + getName(where) + " ";
  else label += getName(where) + " ";
  if (where.operator) label += where.operator;
  if (where.relativeTo) label += " " + getLabelFromProperty(where.relativeTo);
  if (where.value) label += " " + where.value;
  if (where.unit) label += " (" + where.unit + ")";
  return label;
}

function getLabelFromProperty(property: Property) {
  return property.parameter || property.node || getName(property);
}

// checkers
function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

export default { buildTextQuery };
