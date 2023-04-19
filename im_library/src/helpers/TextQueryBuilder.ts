import { ITextQuery } from "../interfaces";
import { Element, Match, Relationship, Where, Property, OrderLimit, Node } from "../interfaces/AutoGen";
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

export function getDisplayFromMatch(match: Match) {
  let display = "";
  if (match.exclude) display += "exclude ";
  display += getNameFromRef(match);
  if (match.path) display += getDisplayFromPath(match.path);
  if (match.where) {
    for (const [index, where] of match.where.entries()) {
      let whereDisplay = "";
      if (match.bool && index !== 0 && index !== match.where.length - 1) whereDisplay += " " + match.bool.toLocaleUpperCase() + " ";
      whereDisplay += getDisplayFromWhere(where);
      display += "." + getDisplayFromWhere(where);
    }
  }

  return display;
}

export function getDisplayFromWhere(where: Where) {
  let display = "";
  display += getNameFromRef(where);
  if (where.in) display += getDisplayFromList(where.in, true);
  if (where.notIn) display += getDisplayFromList(where.notIn, false);
  if (where.operator) display = getDisplayFromOperator(where);
  return display;
}

export function getDisplayFromOperator(where: Where) {
  const property = getNameFromRef(where);
  let display = "";
  if (where.variable) display += where.variable + ".";
  display += property + " ";
  display += where.operator + " ";
  if (where.relativeTo) {
    let relativeTo = "";
    if (where.relativeTo.variable) relativeTo += where.relativeTo.variable;
    if (relativeTo) relativeTo += ".";
    relativeTo += getNameFromRef(where.relativeTo);
    display += relativeTo;
  } else if (where.value) display += where.value;

  return display;
}

export function getDisplayFromList(nodes: Node[], include: boolean) {
  let display = "";
  if (nodes.length > 1) {
    display += include ? " in [" : " not in [";
    display += getDisplayFromEntailment(nodes[0]);
    display += getNameFromRef(nodes[0]);
    display += " and more...]";
  } else {
    display += include ? ": " : "!: ";
    display += getDisplayFromEntailment(nodes[0]);
    display += getNameFromRef(nodes[0]);
  }
  return display;
}

export function getDisplayFromEntailment(node: Node) {
  if (node.ancestorsOf) return ">";
  if (node.descendantsOf) return "<";
  if (node.descendantsOrSelfOf) return "<<";
  return "";
}

export function getDisplayFromPath(pathOrNode: Relationship | Node) {
  const displayObject = { display: "" };
  getDisplayFromPathRecursively(displayObject, "path", pathOrNode);
  return displayObject.display;
}

function getDisplayFromPathRecursively(displayObject: { display: string }, type: string, pathOrNode: any) {
  if (displayObject.display) displayObject.display += "node" === type ? "->" : ".";
  displayObject.display += getNameFromRef(pathOrNode);
  if (isObjectHasKeys(pathOrNode, ["node"])) getDisplayFromPathRecursively(displayObject, "node", pathOrNode.node);
  if (isObjectHasKeys(pathOrNode, ["path"])) getDisplayFromPathRecursively(displayObject, "path", pathOrNode.path);
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

function addMatch(match: Match[], type: string, parent: ITextQuery) {
  for (const matchItem of match) {
    const label = getDisplayFromMatch(matchItem);
    addItem(label, matchItem, type, parent);
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
      const label = "order by: " + orderByItem.variable;
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
    if (isObjectHasKeys(where, [" in"])) {
      parent.display += "in";
      // addIn(where, parent);
    }
    if (isObjectHasKeys(where, [" range"])) {
      parent.display += "range";

      // addRange(where, type, parent);
    }
    if (isObjectHasKeys(where, [" operator"])) {
      parent.display += "comparison";
      // addComparison(where, type, parent);
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
  let label: string = getName(match) || "";
  if (!label && match.path) {
    label = getLabelFromPath(label, match.path);
  }
  return label;
}

function getLabelFromPath(label: string, pathOrNode: any) {
  if (label) label += ".";
  label += getNameFromRef(pathOrNode);
  if (isObjectHasKeys(pathOrNode, ["path"])) getLabelFromPath(label, pathOrNode.path);
  if (isObjectHasKeys(pathOrNode, ["node"])) getLabelFromPath(label, pathOrNode.node);
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

  // if (ref.variable) name += "(as " + ref.variable + ")";

  return name;
}

function getComparisonLabel(where: Where) {
  let label = where.variable || "";
  if (label) label += "." + getName(where) + " ";
  else label += getName(where) + " ";
  if (where.operator) label += where.operator;
  if (where.relativeTo) label += " " + getLabelFromProperty(where.relativeTo);
  if (where.value) label += " " + where.value;
  if (where.unit) label += " (" + where.unit + ")";
  return label;
}

function getLabelFromProperty(property: Property) {
  return property.parameter || property.variable || getName(property);
}

// checkers
function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

export default { buildTextQuery };
