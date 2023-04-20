import { ITextQuery } from "../interfaces";
import { Match, Relationship, Where, Property, OrderLimit, Node } from "../interfaces/AutoGen";
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
    const label = getNameFromRef(select);
    const newParent = addItem(label, select, type, parent);

    if (isArrayHasLength(select.select)) {
      for (const matchItem of select.select) {
        addSelect(matchItem, type, newParent);
      }
    }
  }
}

function addMatch(match: Match[], type: string, parent: ITextQuery) {
  for (const [index, matchItem] of match.entries()) {
    const isNestedMatch = "match" === parent.type;
    let label = "";
    if (isNestedMatch && index !== 0) label += getDisplayFromLogic(parent.data.boolMatch) + " ";
    label += getDisplayFromMatch(matchItem);
    const matchParent = addItem(label, matchItem, type, parent);
    if (matchItem.boolMatch) {
      addMatch(matchItem.match, type, matchParent);
    }
  }
}

function addItem(label: string, query: any, type: string, parent: ITextQuery) {
  const child = buildDQInstance(parent, label, type, query);
  parent.children.push(child);
  return child;
}

// getters
function getKey(parent: ITextQuery) {
  return parent.key + parent.children.length;
}

export function getDisplayFromMatch(match: Match) {
  if (match.boolMatch) return getDisplayFromLogic("and");
  let display = "";
  if (match.exclude) display += getDisplayFromLogic("exclude");
  display += getNameFromRef(match);
  if (match.path) display += getDisplayFromPath(match.path);
  if (match.where) {
    let whereDisplay = "";
    const whereDisplays = getDisplayFromWhereList(display, match.where);
    for (let [index, value] of whereDisplays.entries()) {
      if (match.bool && index !== 0) whereDisplay += " " + getDisplayFromLogic(match.bool);
      whereDisplay += value;
    }
    display = whereDisplay;
  }

  return display;
}

export function getDisplayFromWhereList(matchDisplay: string, where: Where[]) {
  const whereDisplays = [];
  for (const whereItem of where) {
    if (matchDisplay && matchDisplay.slice(-1) !== ".") matchDisplay += ".";
    whereDisplays.push(matchDisplay + getDisplayFromWhere(whereItem));
  }

  return whereDisplays;
}

export function getDisplayFromWhere(where: Where) {
  let display = "";
  display += getNameFromRef(where);
  if (where.in) display += getDisplayFromList(where.in, true);
  if (where.notIn) display += getDisplayFromList(where.notIn, false);
  if (where.operator) display = getDisplayFromOperator(where);
  if (where.range) display = getDisplayFromRange(where);

  return display;
}

export function getDisplayFromLogic(title: string) {
  switch (title) {
    case "exclude":
      return "<span style='color: red;'>exclude</span> ";
    case "or":
      return "<span style='color: blue;'>or</span> ";
    case "and":
      return "<span style='color: orange;'>and</span> ";
    default:
      return "<span style='color: orange;'>and</span> ";
  }
}

export function getDisplayFromRange(where: Where) {
  const property = getNameFromRef(where);
  let display = property;
  display += " from " + where.range.from.operator + " " + where.range.from.value;
  display += " to " + where.range.to.operator + " " + where.range.to.value;
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
  }
  if (where.value) {
    if (where.relativeTo) display += " by ";
    display += where.value;
  }
  if (where.unit) display += " " + where.unit;
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
  if (node.ancestorsOf) return "&gt;";
  if (node.descendantsOf) return "&lt;";
  if (node.descendantsOrSelfOf) return "&lt;&lt;";
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

// checkers
function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

export default { buildTextQuery };
